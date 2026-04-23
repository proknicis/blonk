import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * PATCH /api/workflows/run
 * Body: { workflowId: string, action: 'start' | 'end' }
 * Persists the user-triggered run state to the DB so it survives page refreshes.
 */
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (session.user as any).teamId;
    if (!teamId) {
        return NextResponse.json({ error: "Missing team context" }, { status: 400 });
    }

    try {
        const { workflowId, action } = await req.json();

        if (!workflowId || !action) {
            return NextResponse.json({ error: "Missing workflowId or action" }, { status: 400 });
        }

        // 1. Fetch Workflow & Server details
        const wfResult = await db.query(`
            SELECT w.*, s.url as "serverUrl"
            FROM "Workflow" w
            LEFT JOIN "ClusterNode" s ON w."serverId" = s.id
            WHERE w.id = $1 AND w."teamId" = $2
        `, [workflowId, teamId]) as any[];

        if (!wfResult.length) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        const workflow = wfResult[0];
        
        // 2. Trigger n8n Control Webhook if configured
        let n8nSuccess = false;
        if (workflow.serverUrl && workflow.n8nWorkflowId) {
            try {
                const baseUrl = workflow.serverUrl.replace(/\/+$/, '');
                // Standard control pattern: https://server.com/webhook/workflow-control?action=start&id=XYZ
                const controlAction = action === 'start' ? 'start' : 'end';
                const controlUrl = `${baseUrl}/webhook/workflow-control?action=${controlAction}&id=${workflow.n8nWorkflowId}`;
                
                const n8nRes = await fetch(controlUrl, { 
                    method: 'GET',
                    signal: AbortSignal.timeout(10000)
                });
                
                if (n8nRes.ok) {
                    n8nSuccess = true;
                }
            } catch (err) {
                console.error("[WORKFLOW_RUN] n8n handshake failed:", err);
            }
        }

        // Map action → status value
        const newStatus = action === 'start' ? 'Active' : 'Passive';

        // 3. Update DB
        await db.execute(
            `UPDATE "Workflow" SET status = $1, "updatedAt" = CURRENT_TIMESTAMP
             WHERE id = $2 AND "teamId" = $3`,
            [newStatus, workflowId, teamId]
        );

        return NextResponse.json({ 
            success: true, 
            status: newStatus,
            n8nSynced: n8nSuccess 
        });
    } catch (error: any) {
        console.error("[WORKFLOW_RUN_PATCH] Error:", error.message);
        return NextResponse.json({ error: "Failed to persist run state" }, { status: 500 });
    }
}
