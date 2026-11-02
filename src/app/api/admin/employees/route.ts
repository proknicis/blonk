import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { getAdminSession } from "@/lib/admin-auth";
import { deployWorkflow } from "@/lib/workflow-deployer";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('teamId');
        
        if (!teamId) {
            return NextResponse.json({ error: "Missing teamId query parameter" }, { status: 400 });
        }

        const employees = await db.query(`
            SELECT 
                e.id, 
                e.name, 
                e.type, 
                e."teamId", 
                e."activeWorkflowId" as "activeTemplateId",
                COALESCE(cwa.status, 'active') as "status"
            FROM "AIEmployee" e
            LEFT JOIN "CustomerWorkflowAssignment" cwa ON cwa."aiEmployeeId" = e.id AND cwa."teamId" = e."teamId"
            WHERE e."teamId" = $1
            ORDER BY e.name ASC
        `, [teamId]);

        return NextResponse.json(employees);
    } catch (err: any) {
        console.error("GET employees error:", err);
        return NextResponse.json({ error: err.message || "Failed to load employees" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, teamId, employeeId, name, type, workflowTemplateId, status } = body;

        if (!teamId) {
            return NextResponse.json({ error: "Missing teamId" }, { status: 400 });
        }

        if (action === "CREATE") {
            if (!name || !type) {
                return NextResponse.json({ error: "Missing name or type for AI Employee" }, { status: 400 });
            }

            // Create new AI Employee
            const [newEmp] = await db.query(`
                INSERT INTO "AIEmployee" (name, type, "teamId", "activeWorkflowId")
                VALUES ($1, $2, $3, $4)
                RETURNING id, name, type, "teamId", "activeWorkflowId"
            `, [name, type, teamId, workflowTemplateId || null]) as any[];

            if (workflowTemplateId && newEmp) {
                // Set default customer workflow assignment
                await db.execute(`
                    INSERT INTO "CustomerWorkflowAssignment" ("teamId", "aiEmployeeId", "workflowTemplateId", status)
                    VALUES ($1, $2, $3, 'active')
                    ON CONFLICT ("teamId", "aiEmployeeId", "workflowTemplateId") DO UPDATE SET status = 'active'
                `, [teamId, newEmp.id, workflowTemplateId]);
            }

            await logAudit(teamId, 'admin_change', `Created AI Employee ${name} (${type})`, { teamId, employeeId: newEmp.id });

            return NextResponse.json({ success: true, employee: newEmp });
        }

        if (action === "UPDATE_ASSIGNMENT") {
            if (!employeeId) {
                return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
            }

            // Get current active template to clean up if changed
            const [emp] = await db.query('SELECT "activeWorkflowId" FROM "AIEmployee" WHERE id = $1 LIMIT 1', [employeeId]) as any[];
            
            await db.execute(`
                UPDATE "AIEmployee" 
                SET "activeWorkflowId" = $1 
                WHERE id = $2 AND "teamId" = $3
            `, [workflowTemplateId || null, employeeId, teamId]);

            if (workflowTemplateId) {
                // Delete previous assignments for this specific employee to ensure one active mapping
                await db.execute(`
                    DELETE FROM "CustomerWorkflowAssignment" 
                    WHERE "teamId" = $1 AND "aiEmployeeId" = $2
                `, [teamId, employeeId]);

                // Insert new assignment
                await db.execute(`
                    INSERT INTO "CustomerWorkflowAssignment" ("teamId", "aiEmployeeId", "workflowTemplateId", status)
                    VALUES ($1, $2, $3, $4)
                `, [teamId, employeeId, workflowTemplateId, status || 'active']);

                // Deploy using the shared deployWorkflow utility
                try {
                    const result = await deployWorkflow({
                        teamId,
                        blueprintId: workflowTemplateId,
                        aiEmployeeId: employeeId
                    });

                    // Insert successful deployment record
                    await db.execute(`
                        INSERT INTO "CustomerWorkflowDeployment" ("teamId", "blueprintId", "serverId", "n8nWorkflowId", "aiEmployeeId", status)
                        VALUES ($1, $2, $3, $4, $5, 'active')
                    `, [teamId, workflowTemplateId, result.serverId, result.n8nWorkflowId, employeeId]);

                } catch (deployErr: any) {
                    console.error("[Provisioner] Deployment failed:", deployErr);

                    // Fetch server ID for tracking if possible
                    const [clientTeam] = await db.query(
                        'SELECT "serverId" FROM "Team" WHERE id = $1 LIMIT 1',
                        [teamId]
                    ) as any[];

                    if (clientTeam?.serverId) {
                        await db.execute(`
                            INSERT INTO "CustomerWorkflowDeployment" ("teamId", "blueprintId", "serverId", "n8nWorkflowId", "aiEmployeeId", status)
                            VALUES ($1, $2, $3, 'FAILED_API_ERROR', $4, 'failed')
                        `, [teamId, workflowTemplateId, clientTeam.serverId, employeeId]);
                    }

                    return NextResponse.json({
                        error: deployErr.message || "Workflow deployment failed."
                    }, { status: 502 });
                }
            }

            await logAudit(teamId, 'admin_change', `Updated AI Employee assignment`, { employeeId, workflowTemplateId, status });
            return NextResponse.json({ success: true });
        }

        if (action === "DELETE") {
            if (!employeeId) {
                return NextResponse.json({ error: "Missing employeeId" }, { status: 400 });
            }

            // Delete assignments first
            await db.execute(`DELETE FROM "CustomerWorkflowAssignment" WHERE "teamId" = $1 AND "aiEmployeeId" = $2`, [teamId, employeeId]);
            // Delete AI Employee
            await db.execute(`DELETE FROM "AIEmployee" WHERE id = $1 AND "teamId" = $2`, [employeeId, teamId]);

            await logAudit(teamId, 'admin_change', `Deleted AI Employee`, { employeeId });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (err: any) {
        console.error("POST employees error:", err);
        return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
    }
}
