import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let teamId = searchParams.get('teamId');

        // Fallback to session if no teamId is provided in query string (useful for dashboard preview)
        if (!teamId) {
            const session = await getServerSession(authOptions);
            teamId = (session?.user as any)?.teamId;
        }

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team or workspace context was provided.' }, { status: 401 });
        }

        // Auto-migrate: ensure businessGoals exists in CompanyProfile
        await db.execute('ALTER TABLE "CompanyProfile" ADD COLUMN IF NOT EXISTS "businessGoals" TEXT DEFAULT \'\'');
        // Auto-migrate: ensure permissions exists in AIEmployee
        await db.execute('ALTER TABLE "AIEmployee" ADD COLUMN IF NOT EXISTS "permissions" JSONB DEFAULT \'{}\'');
        // Auto-migrate: ensure teamId exists in BrainMemory
        await db.execute('ALTER TABLE "BrainMemory" ADD COLUMN IF NOT EXISTS "teamId" UUID');

        // Extract employeeId from search parameters
        const employeeId = searchParams.get('employeeId');

        // 1. Fetch Company Profile
        let profile = null;
        const profileRows = await db.query(
            `SELECT * FROM "CompanyProfile" WHERE "teamId" = $1`,
            [teamId]
        );
        if (profileRows.length > 0) {
            profile = profileRows[0];
        } else {
            // Provision empty fallback
            await db.execute(
                `INSERT INTO "CompanyProfile" ("teamId", "companyName") VALUES ($1, $2)`,
                [teamId, "Blonk SIA"]
            );
            const refetched = await db.query(
                `SELECT * FROM "CompanyProfile" WHERE "teamId" = $1`,
                [teamId]
            );
            profile = refetched[0] || null;
        }

        // 2. Fetch Active Rules
        const rules = await db.query(
            `SELECT text FROM "BrainRule" WHERE "teamId" = $1 AND active = true ORDER BY "createdAt" ASC`,
            [teamId]
        );
        const ruleTexts = rules.map(r => r.text);

        // 3. Fetch AI Employees and their permissions
        const employees = await db.query(
            `SELECT id, name, type, permissions FROM "AIEmployee" WHERE "teamId" = $1 ORDER BY name ASC`,
            [teamId]
        );

        // Build permissions lookup map
        const permissionsMap: Record<string, any> = {};
        for (const emp of employees) {
            const perms = typeof emp.permissions === 'string' 
                ? JSON.parse(emp.permissions) 
                : emp.permissions || {};
            permissionsMap[emp.name || emp.type] = perms;
        }

        // 4. Fetch Approved Knowledge
        const documents = await db.query(
            `SELECT id, name, category, size, status, "mimeType" 
             FROM "BrainDocument" 
             WHERE "teamId" = $1 AND status = 'Indexed' 
             ORDER BY "createdAt" DESC`,
            [teamId]
        );

        // 5. Fetch Connected Credentials / Integrations
        const credentials = await db.query(
            `SELECT id, provider, status, "updated_at" 
             FROM "credentials" 
             WHERE "user_id" IN (SELECT id FROM "User" WHERE "teamId" = $1)
             ORDER BY provider ASC`,
            [teamId]
        );

        const connectedApps = credentials.map(c => c.provider);

        // 6. Fetch Corporate Memory Reflection items
        const memories = await db.query(
            `SELECT bm.type, bm.summary, bm.confidence, bm."createdAt"
             FROM "BrainMemory" bm
             LEFT JOIN "AIEmployee" e ON bm."employeeId" = e.id
             WHERE bm."teamId" = $1 OR e."teamId" = $1
             ORDER BY bm."createdAt" DESC LIMIT 15`,
            [teamId]
        );

        // 7. Fetch Installed Automations
        const installedAutomations = await db.query(
            `SELECT cb.id, cb."installedVersion", bt.name, bt.category, bt."mainWorkflowId"
             FROM "CustomerBrain" cb
             JOIN "BrainTemplate" bt ON cb."brainTemplateId" = bt.id
             WHERE cb."teamId" = $1`,
            [teamId]
        );

        // 8. Fetch specific requesting employee info if employeeId is passed
        let requestingEmployee = null;
        if (employeeId) {
            const empRows = await db.query(
                `SELECT id, name, type, permissions FROM "AIEmployee" WHERE id = $1 AND "teamId" = $2`,
                [employeeId, teamId]
            );
            if (empRows.length > 0) {
                const emp = empRows[0];
                requestingEmployee = {
                    id: emp.id,
                    name: emp.name,
                    type: emp.type,
                    permissions: typeof emp.permissions === 'string' ? JSON.parse(emp.permissions) : emp.permissions || {}
                };
            }
        }

        // 9. Fetch Workspace/Team details
        const teamRows = await db.query(
            `SELECT id, name, "firmName" FROM "Team" WHERE id = $1`,
            [teamId]
        );
        const team = teamRows[0] || { id: teamId, name: "Sovereign Blonk Workspace", firmName: "Blonk SIA" };

        const goals = profile?.businessGoals 
            ? profile.businessGoals.split('\n').map((g: string) => g.trim()).filter(Boolean) 
            : [];

        return NextResponse.json({
            company: {
                companyName: profile?.companyName || "Blonk SIA",
                industry: profile?.industry || "",
                employees: profile?.employees || "1",
                countries: profile?.countries || "",
                languages: profile?.languages || "",
                workingHours: profile?.workingHours || "09:00 - 18:00",
                timezone: profile?.timezone || "UTC",
                vatCode: profile?.vatCode || "",
                currencies: profile?.currencies || "EUR (€)",
                departments: profile?.departments || ""
            },
            knowledge: documents,
            rules: ruleTexts,
            permissions: permissionsMap,
            connectedApps: connectedApps,
            credentials: credentials.map(c => ({
                provider: c.provider,
                status: c.status
            })),
            employee: requestingEmployee,
            assignedAutomations: installedAutomations.map(ia => ({
                id: ia.id,
                name: ia.name,
                category: ia.category,
                version: ia.installedVersion,
                mainWorkflowId: ia.mainWorkflowId
            })),
            memory: memories.map(m => ({
                type: m.type,
                summary: m.summary,
                confidence: m.confidence
            })),
            goals: goals,
            workspace: {
                id: team.id,
                name: team.name,
                firmName: team.firmName
            }
        });
    } catch (error: any) {
        console.error('[GET Company Brain Runtime Context API Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
