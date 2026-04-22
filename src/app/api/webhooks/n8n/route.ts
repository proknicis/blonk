import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        // Authenticate webhook (in production, use a secure token/header from n8n)
        const authHeader = request.headers.get('authorization');
        if (!authHeader || authHeader !== `Bearer ${process.env.N8N_WEBHOOK_SECRET || 'blonk-secure-webhook'}`) {
            // Uncomment to enforce security when secrets are set
            // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        // Handling the new rich JSON structure from n8n
        const { 
            workflow_id, 
            process_name, 
            status, 
            activity, 
            metrics, 
            timestamp,
            teamId: providedTeamId 
        } = body;

        // If teamId is missing, we attempt to find it via workflow_id or use a fallback for testing
        let teamId = providedTeamId;
        if (!teamId && workflow_id) {
            const workflow = await db.query('SELECT "teamId" FROM "Workflow" WHERE id = $1 LIMIT 1', [workflow_id]) as any[];
            if (workflow.length > 0) teamId = workflow[0].teamId;
        }

        if (!teamId || !process_name || !status) {
            return NextResponse.json({ error: 'Missing critical identity parameters (teamId/workflow_id, process_name, status)' }, { status: 400 });
        }

        const logId = uuidv4();

        // 1. Insert into WorkflowLog with rich metadata
        await db.execute(
            'INSERT INTO "WorkflowLog" (id, "workflowName", status, result, "teamId", "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
            [
                logId, 
                process_name, 
                status === 'COMPLETED' ? 'success' : 'active', 
                JSON.stringify({ activity, metrics, timestamp }), 
                teamId,
                timestamp || new Date()
            ]
        );

        // 2. Try to update the associated Workflow progress/status if it exists
        // Identify specifically by workflow_id for maximum precision
        const workflowRows = await db.query(
            'SELECT id FROM "Workflow" WHERE id = $1 LIMIT 1',
            [workflow_id]
        ) as any[];

        if (workflowRows.length > 0) {
            const workflowId = workflowRows[0].id;
            const points = metrics?.data_points_processed || 0;
            const updates = [];
            const params = [];
            let i = 1;

            // Increment the total yield (Autonomous Yield) - Uses COALESCE to prevent NULL errors
            updates.push(`"tasksCount" = COALESCE("tasksCount", 0) + $${i++}`); params.push(points);

            if (status === 'error' || status === 'FAILED') {
                updates.push(`status = $${i++}`); params.push('Error');
                updates.push(`"errorMessage" = $${i++}`); params.push(activity?.action || "Operational failure in node execution");
                updates.push(`progress = $${i++}`); params.push(0);
            } else if (status === 'success' || status === 'COMPLETED') {
                updates.push(`status = $${i++}`); params.push('Ready');
                updates.push(`progress = $${i++}`); params.push(100);
            } else if (status === 'active' || status === 'RUNNING') {
                updates.push(`status = $${i++}`); params.push('Active');
                updates.push(`progress = $${i++}`); params.push(50);
            }

            if (updates.length > 0) {
                updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
                updates.push(`"lastRun" = CURRENT_TIMESTAMP`);
                params.push(workflowId);
                
                await db.execute(
                    `UPDATE "Workflow" SET ${updates.join(', ')} WHERE id = $${params.length}`,
                    params
                );
            }
        }

        return NextResponse.json({ success: true, logId });
    } catch (error: any) {
        console.error('Webhook ingestion error:', error);
        return NextResponse.json({ error: 'Internal webhook fault', details: error.message }, { status: 500 });
    }
}
