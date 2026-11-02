import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Fetch User profile from DB
        const [userDb] = await db.query(
            'SELECT id, name, email, "jobTitle", "firmName", industry, "teamId", "onboardingStatus" FROM "User" WHERE id = $1 LIMIT 1',
            [userId]
        ) as any[];

        let teamId = userDb?.teamId || (session.user as any).teamId;

        if (!teamId) {
            const [ownedTeam] = await db.query(
                'SELECT id FROM "Team" WHERE "ownerId" = $1 LIMIT 1',
                [userId]
            ) as any[];
            if (ownedTeam) teamId = ownedTeam.id;
        }

        let companyProfile: any = null;
        if (teamId) {
            const [profile] = await db.query(
                'SELECT * FROM "CompanyProfile" WHERE "teamId" = $1 LIMIT 1',
                [teamId]
            ) as any[];
            companyProfile = profile;
        }

        return NextResponse.json({
            user: {
                fullName: userDb?.name || session.user.name || "",
                email: userDb?.email || session.user.email || "",
                jobTitle: userDb?.jobTitle || ""
            },
            company: {
                companyName: companyProfile?.companyName || userDb?.firmName || "",
                website: companyProfile?.website || "",
                industry: companyProfile?.industry || userDb?.industry || "",
                companySize: companyProfile?.employees || "",
                country: companyProfile?.countries || ""
            },
            primaryBrain: companyProfile?.primaryBrain || "",
            onboardingStatus: userDb?.onboardingStatus || "PENDING"
        });
    } catch (error: any) {
        console.error("Setup GET error:", error);
        return NextResponse.json({ error: "Failed to fetch setup data", details: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;

        // Query DB directly for team linked to user
        const [userDb] = await db.query(
            'SELECT "teamId" FROM "User" WHERE id = $1 LIMIT 1',
            [userId]
        ) as any[];

        let teamId = userDb?.teamId || (session.user as any).teamId;

        if (!teamId) {
            const [ownedTeam] = await db.query(
                'SELECT id FROM "Team" WHERE "ownerId" = $1 LIMIT 1',
                [userId]
            ) as any[];
            if (ownedTeam) {
                teamId = ownedTeam.id;
            }
        }

        const body = await req.json();
        const {
            fullName,
            jobTitle,
            companyName,
            website,
            industry,
            companySize,
            country,
            primaryBrain
        } = body;

        const resolvedFirmName = companyName || body.firmName || "Sovereign Firm";
        const resolvedIndustry = industry || "Technology";
        const resolvedPrimaryBrain = primaryBrain || "Finance & Accounting";

        // 1. Update User Profile with Account & Company details
        await db.query(
            `UPDATE "User" SET 
                name = COALESCE(NULLIF($1, ''), name),
                "jobTitle" = $2,
                "firmName" = $3, 
                industry = $4, 
                "onboardingStatus" = 'COMPLETED',
                "activationStatus" = 'ACTIVATED',
                "activationStartedAt" = CURRENT_TIMESTAMP,
                "lastActive" = CURRENT_TIMESTAMP
             WHERE id = $5`,
            [fullName || session.user.name || '', jobTitle || '', resolvedFirmName, resolvedIndustry, userId]
        );

        // 2. Create or Update Team
        if (!teamId) {
            const finalTeamName = resolvedFirmName ? `${resolvedFirmName} Command Node` : `${session.user.name || 'Admin'}'s Command Node`;
            const teamRes = await db.query(`
                INSERT INTO "Team" (name, "firmName", "ownerId") 
                VALUES ($1, $2, $3)
                ON CONFLICT ("ownerId") 
                DO UPDATE SET 
                    name = EXCLUDED.name,
                    "firmName" = EXCLUDED."firmName"
                RETURNING id
            `, [finalTeamName, resolvedFirmName, userId]) as any[];
            teamId = teamRes[0].id;
        } else {
            await db.execute(
                `UPDATE "Team" SET "firmName" = $1, name = $2 WHERE id = $3`,
                [resolvedFirmName, `${resolvedFirmName} Command Node`, teamId]
            );
        }

        // Link User to Team
        if (teamId) {
            await db.execute(
                'UPDATE "User" SET "teamId" = $1 WHERE id = $2', 
                [teamId, userId]
            );

            // 3. Upsert CompanyProfile with real company & primary brain settings
            const existingProfiles = await db.query(
                'SELECT id FROM "CompanyProfile" WHERE "teamId" = $1 LIMIT 1',
                [teamId]
            ) as any[];

            if (existingProfiles.length > 0) {
                await db.execute(
                    `UPDATE "CompanyProfile" SET 
                        "companyName" = $1,
                        website = $2,
                        industry = $3,
                        employees = $4,
                        countries = $5,
                        "primaryBrain" = $6,
                        "updatedAt" = CURRENT_TIMESTAMP
                     WHERE "teamId" = $7`,
                    [
                        resolvedFirmName,
                        website || '',
                        resolvedIndustry,
                        companySize || '1-10',
                        country || '',
                        resolvedPrimaryBrain,
                        teamId
                    ]
                );
            } else {
                await db.execute(
                    `INSERT INTO "CompanyProfile" 
                        ("teamId", "companyName", website, industry, employees, countries, "primaryBrain", languages, "workingHours", timezone, currencies) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'English', '09:00 - 18:00', 'UTC', 'EUR (€)')`,
                    [
                        teamId,
                        resolvedFirmName,
                        website || '',
                        resolvedIndustry,
                        companySize || '1-10',
                        country || '',
                        resolvedPrimaryBrain
                    ]
                );
            }

            // 4. Seed domain-specific Brain Rules for selected Primary Brain
            const DOMAIN_RULES: Record<string, string[]> = {
                "Finance & Accounting": [
                    "Always ask human approval for invoice amounts above €1,000",
                    "Finance AI cannot permanently delete financial records",
                    "Reconciliation statements must match bank ledger timestamps"
                ],
                "Sales & Inbound Leads": [
                    "Always score and route inbound leads within 5 minutes",
                    "Never send automated emails to enterprise prospects without CRM validation",
                    "Notify team in Slack when qualified deal value exceeds €5,000"
                ],
                "HR & Internal Operations": [
                    "Restrict employee contract visibility to authorized operations admins",
                    "Generate NDA compliance tasks prior to workspace invite delivery",
                    "Log all permission adjustments directly to the sovereign audit ledger"
                ],
                "Customer Support Triaging": [
                    "Escalate critical severity tickets if unresolved within 15 minutes",
                    "Support AI addresses customer queries in their native language",
                    "Require agent sign-off before dispatching refund confirmations"
                ],
                "Marketing & Competitor Alerts": [
                    "Marketing AI cannot publish live campaigns without manual sign-off",
                    "Dispatch daily competitor intelligence briefings every morning at 09:00",
                    "Flag competitor pricing changes exceeding a 10% threshold"
                ]
            };

            const selectedRules = DOMAIN_RULES[resolvedPrimaryBrain] || DOMAIN_RULES["Finance & Accounting"];
            for (const ruleText of selectedRules) {
                const existingRule = await db.query(
                    'SELECT id FROM "BrainRule" WHERE "teamId" = $1 AND text = $2 LIMIT 1',
                    [teamId, ruleText]
                ) as any[];
                if (existingRule.length === 0) {
                    await db.execute(
                        `INSERT INTO "BrainRule" ("teamId", text, active, priority, scope)
                         VALUES ($1, $2, true, 'High', 'Global')`,
                        [teamId, ruleText]
                    );
                }
            }

            // Allocate server node dynamically
            try {
                const { allocateNodeForTeam } = await import("@/lib/workflow-provision");
                await allocateNodeForTeam(teamId);
            } catch (infraErr) {
                console.error("Non-fatal: Failed to allocate infrastructure server:", infraErr);
            }

            // Log telemetry event
            try {
                const { logAudit } = await import("@/lib/audit");
                await logAudit(userId, 'setup_completed', resolvedFirmName, {
                    industry: resolvedIndustry,
                    companySize: companySize || '1-10',
                    primaryBrain: resolvedPrimaryBrain,
                    country: country || ''
                });
            } catch (auditErr) {
                console.error("Non-fatal: Failed to log audit:", auditErr);
            }
        }

        return NextResponse.json({
            success: true,
            teamId,
            primaryBrain: resolvedPrimaryBrain
        });
    } catch (error: any) {
        console.error("Setup completion error:", error);
        return NextResponse.json({ error: "Failed to complete setup", details: error.message }, { status: 500 });
    }
}
