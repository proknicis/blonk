import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('teamId');

        if (!teamId) {
            return NextResponse.json({ error: "Missing teamId query parameter" }, { status: 400 });
        }

        // Fetch installed brains for this team
        const installed = await db.query(`
            SELECT cb.*, 
                   bt.name as template_name, 
                   bt.description as template_description,
                   bt.version as latest_version,
                   bt.category as template_category
            FROM "CustomerBrain" cb
            JOIN "BrainTemplate" bt ON cb."brainTemplateId" = bt.id
            WHERE cb."teamId" = $1
            ORDER BY cb."installedAt" DESC
        `, [teamId]);

        return NextResponse.json(installed);
    } catch (err: any) {
        console.error("GET customer brains error:", err);
        return NextResponse.json({ error: err.message || "Failed to load customer brains" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { teamId, brainTemplateId, employeeName: reqName, employeeType: reqType } = body;

        if (!teamId || !brainTemplateId) {
            return NextResponse.json({ error: "Missing teamId or brainTemplateId" }, { status: 400 });
        }

        // 1. Check if already installed
        const [existing] = await db.query(
            'SELECT * FROM "CustomerBrain" WHERE "teamId" = $1 AND "brainTemplateId" = $2',
            [teamId, brainTemplateId]
        ) as any[];

        if (existing) {
            return NextResponse.json({ success: true, message: "Automation template already installed.", customerBrainId: existing.id });
        }

        // Get brain template details
        const [template] = await db.query(
            'SELECT * FROM "BrainTemplate" WHERE id = $1',
            [brainTemplateId]
        ) as any[];

        if (!template) {
            return NextResponse.json({ error: "Automation template not found" }, { status: 404 });
        }

        // --- Execute 6-Step Installation Sequence ---

        // Step 1: Insert into CustomerBrain (installation record)
        const customerBrainId = uuidv4();
        await db.execute(`
            INSERT INTO "CustomerBrain" (id, "teamId", "brainTemplateId", status, "installedVersion")
            VALUES ($1, $2, $3, 'Installed', $4)
        `, [customerBrainId, teamId, brainTemplateId, template.version]);

        // Step 2: Register brain deployment (BrainDeployment)
        const deploymentId = uuidv4();
        await db.execute(`
            INSERT INTO "BrainDeployment" (id, "teamId", "brainTemplateId", "deploymentStatus", "n8nServer", "executionMode")
            VALUES ($1, $2, $3, 'Active', 'n8n-main-node-1', 'Standard')
        `, [deploymentId, teamId, brainTemplateId]);

        // Step 3 & 4: Auto-create associated AI Employee & assign permissions
        const employeeId = uuidv4();
        const employeeType = reqType || (template.name.toLowerCase().includes("finance") ? "Finance Assistant" : template.name.toLowerCase().includes("support") ? "Customer Support" : template.name.toLowerCase().includes("sales") ? "Sales Assistant" : "Operations Assistant");
        const employeeName = reqName || (employeeType === "Finance Assistant" ? "Finance AI" : employeeType === "Customer Support" ? "Support AI" : employeeType === "Sales Assistant" ? "Sales AI" : "Operations AI");
        let defaultPermissions = {};

        if (employeeType.toLowerCase().includes("finance")) {
            defaultPermissions = {
                "Invoices": true,
                "Stripe": true,
                "Bank": true,
                "Accounting": true,
                "HR Files": false,
                "Contracts": false
            };
        } else if (employeeType.toLowerCase().includes("support") || employeeType.toLowerCase().includes("customer")) {
            defaultPermissions = {
                "Knowledge Base": true,
                "Gmail": true,
                "Tickets": true,
                "Finance": false
            };
        } else if (employeeType.toLowerCase().includes("sales") || employeeType.toLowerCase().includes("client")) {
            defaultPermissions = {
                "CRM": true,
                "Calendar": true,
                "Quotes": true
            };
        }

        // Insert AIEmployee if it doesn't already exist for this team
        const [existingEmp] = await db.query(
            'SELECT id FROM "AIEmployee" WHERE "teamId" = $1 AND type = $2',
            [teamId, employeeType]
        ) as any[];

        let activeEmpId = existingEmp?.id;
        if (!existingEmp) {
            await db.execute(`
                INSERT INTO "AIEmployee" (id, name, type, "teamId", permissions)
                VALUES ($1, $2, $3, $4, $5)
            `, [employeeId, employeeName, employeeType, teamId, JSON.stringify(defaultPermissions)]);
            activeEmpId = employeeId;
        }

        // Step 5: Register workflow IDs on old tables if template.mainWorkflowId is set
        if (template.mainWorkflowId && activeEmpId) {
            // Find Server ID to bind
            const [teamNode] = await db.query('SELECT "serverId" FROM "Team" WHERE id = $1 LIMIT 1', [teamId]) as any[];
            const serverId = teamNode?.serverId || null;

            await db.execute(`
                INSERT INTO "CustomerWorkflowDeployment" (id, "teamId", "blueprintId", "serverId", "n8nWorkflowId", "aiEmployeeId", status)
                VALUES ($1, $2, $3, $4, $5, $6, 'active')
                ON CONFLICT DO NOTHING
            `, [uuidv4(), teamId, template.id, serverId, template.mainWorkflowId, activeEmpId]);
        }

        // Step 6: Sync notification back to Company Brain
        await db.execute(`
            INSERT INTO "Notification" (id, title, message, "teamId")
            VALUES ($1, $2, $3, $4)
        `, [
            uuidv4(),
            "AI Employee Hired",
            `AI Employee "${employeeName}" has been successfully hired. Deployed automation package "${template.name} v${template.version}".`,
            teamId
        ]);

        // Audit log
        try {
            const { logAudit } = await import("@/lib/audit");
            await logAudit('00000000-0000-0000-0000-000000000000', 'admin_change', `Hired AI Employee ${employeeName} with automation ${template.name} for team ${teamId}`, { teamId, brainTemplateId });
        } catch {}

        return NextResponse.json({
            success: true,
            customerBrainId,
            employeeName,
            employeeType
        });
    } catch (err: any) {
        console.error("POST install customer brain error:", err);
        return NextResponse.json({ error: err.message || "Failed to install brain template" }, { status: 500 });
    }
}
