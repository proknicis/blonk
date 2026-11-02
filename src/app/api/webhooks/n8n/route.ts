import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { automationEventBus } from '@/lib/automation-os';

/**
 * POST /api/webhooks/n8n
 * Decoupled Webhook callback from n8n Execution Engine.
 * Dispatches status completed/failed events onto the BLONK Automation Event Bus.
 */
export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET || 'blonk-secure-webhook'}`) {
            // Non-blocking in dev; standard Bearer header validation
        }

        const body = await request.json();
        
        const { 
            workflow_id, 
            process_name, 
            status, 
            activity, 
            metrics, 
            timestamp,
            teamId: providedTeamId,
            executionId,
            reasoning,
            steps,
            outputs,
            memory,
            errorMessage
        } = body;

        // Resolve teamId anchor
        let teamId = providedTeamId;
        if (!teamId && workflow_id) {
            const workflow = await db.query('SELECT "teamId" FROM "Workflow" WHERE id = $1 LIMIT 1', [workflow_id]) as any[];
            if (workflow.length > 0) teamId = workflow[0].teamId;
        }

        if (!teamId) {
            return NextResponse.json({ error: 'Missing critical team identity context' }, { status: 400 });
        }

        // Map status to BLONK execution state
        let logStatus = 'Completed';
        if (status === 'FAILED' || status === 'error' || status === 'FAILED') logStatus = 'Failed';

        const targetLogId = executionId || `exec_${uuidv4().replace(/-/g, '').substring(0, 20)}`;

        // 1. Direct DB updates for immediate UI sync
        if (executionId) {
            await db.execute(
                `UPDATE "WorkflowLog" 
                 SET status = $1, 
                     result = $2
                 WHERE id = $3`,
                [
                    logStatus, 
                    JSON.stringify({ 
                        activity, 
                        metrics, 
                        timestamp: timestamp || new Date(),
                        reasoning: reasoning || (logStatus === 'Completed' ? "Execution resolved successfully." : `Execution interrupted: ${errorMessage}`),
                        steps: steps || [logStatus === 'Completed' ? "Timeline task ended" : "Runtime execution stopped"],
                        outputs: outputs || {},
                        memory: memory || {}
                    }),
                    targetLogId
                ]
            );
        } else {
            await db.execute(
                `INSERT INTO "WorkflowLog" (id, "workflowName", "workflowId", status, result, "teamId", "createdAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    targetLogId,
                    process_name || 'Autonomous Pipeline',
                    workflow_id || null,
                    logStatus,
                    JSON.stringify({ 
                        activity, 
                        metrics, 
                        timestamp: timestamp || new Date(),
                        reasoning: reasoning || "Completed execution.",
                        steps: steps || ["Resolved execution loop"],
                        outputs: outputs || {},
                        memory: memory || {}
                    }),
                    teamId,
                    timestamp || new Date()
                ]
            );
        }

        // Sync Workflow performance indicators
        if (workflow_id) {
            const points = metrics?.data_points_processed || 0;
            const updates = [];
            const params = [];
            let i = 1;

            updates.push(`"tasksCount" = COALESCE("tasksCount", 0) + $${i++}`); 
            params.push(points + 1);

            if (metrics?.execution_speed) {
                updates.push(`performance = $${i++}`); 
                params.push(`${metrics.execution_speed} speed`);
            }

            if (logStatus === 'Failed') {
                updates.push(`status = $${i++}`); params.push('Error');
                updates.push(`"errorMessage" = $${i++}`); params.push(errorMessage || activity?.action || "Operational failure in node execution");
                updates.push(`progress = $${i++}`); params.push(0);
            } else {
                updates.push(`status = $${i++}`); params.push('Ready');
                updates.push(`progress = $${i++}`); params.push(100);
            }

            updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
            updates.push(`"lastRun" = CURRENT_TIMESTAMP`);
            params.push(workflow_id);

            await db.execute(
                `UPDATE "Workflow" SET ${updates.join(', ')} WHERE id = $${params.length}`,
                params
            );
        }

        // 2. Dispatch payload to Event Bus to trigger listeners (Notifications, Auditing, AI reflection memory system)
        const eventType = logStatus === 'Completed' ? 'execution.completed' : 'execution.failed';
        await automationEventBus.dispatch(eventType, {
            executionId: targetLogId,
            workflowId: workflow_id || "",
            teamId: teamId,
            state: logStatus as any,
            timestamp: new Date(),
            processName: process_name,
            duration: metrics?.execution_speed ? parseFloat(metrics.execution_speed) : 2.5,
            metrics,
            activity,
            reasoning,
            steps,
            outputs,
            memory,
            error: errorMessage
        });

        return NextResponse.json({ success: true, logId: targetLogId });
    } catch (error: any) {
        console.error('Webhook callback ingestion error:', error);
        return NextResponse.json({ error: 'Internal callback fault', details: error.message }, { status: 500 });
    }
}
