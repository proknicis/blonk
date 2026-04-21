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
        const { teamId, workflowName, status, result, errorMessage, progress } = body;

        if (!teamId || !workflowName || !status) {
            return NextResponse.json({ error: 'Missing required payload parameters (teamId, workflowName, status)' }, { status: 400 });
        }

        const logId = uuidv4();

        // 1. Insert into WorkflowLog
        await db.execute(
            'INSERT INTO "WorkflowLog" (id, "workflowName", status, result, "teamId", "createdAt") VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)',
            [logId, workflowName, status, result ? JSON.stringify(result) : '{}', teamId]
        );

        // 2. Try to update the associated Workflow progress/status if it exists
        // Workflows are tracked by teamId and name.
        const workflowRows = await db.query(
            'SELECT id FROM "Workflow" WHERE "teamId" = $1 AND name = $2 LIMIT 1',
            [teamId, workflowName]
        ) as any[];

        if (workflowRows.length > 0) {
            const workflowId = workflowRows[0].id;
            const updates = [];
            const params = [];
            let i = 1;

            if (status === 'error') {
                updates.push(`status = $${i++}`); params.push('Error');
                updates.push(`"errorMessage" = $${i++}`); params.push(errorMessage || (result ? JSON.stringify(result) : 'Unknown operational fault'));
                updates.push(`progress = $${i++}`); params.push(0);
            } else if (status === 'success') {
                updates.push(`status = $${i++}`); params.push('Ready');
                updates.push(`progress = $${i++}`); params.push(100);
            } else if (status === 'active') {
                updates.push(`status = $${i++}`); params.push('Active');
                if (progress !== undefined) {
                    updates.push(`progress = $${i++}`); params.push(progress);
                } else {
                    updates.push(`progress = $${i++}`); params.push(50);
                }
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
