import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        const rows = await db.query(`
            SELECT 
                w."id", 
                w."name", 
                w."sector", 
                w."status", 
                w."n8nWebhookUrl", 
                w."inputs", 
                w."requestedBy",
                w."progress",
                w."errorMessage",
                w."createdAt",
                w."updatedAt",
                COALESCE(u."plan", 'Starter')  AS "userTier",
                COALESCE(u."email", '')         AS "userEmail",
                COUNT(w2.id)                    AS "workflowCount"
            FROM "Workflow" w
            LEFT JOIN "User" u   ON u."id" = w."userId"
            LEFT JOIN "Workflow" w2 ON w2."userId" = w."userId"
            GROUP BY w."id", u."plan", u."email"
            ORDER BY w."updatedAt" DESC
        `);
        
        console.log(`[INSTITUTIONAL_ADMIN_API] Successfully synchronized ${rows?.length || 0} nodes from the fleet registry.`);
        
        return NextResponse.json(rows || []);
    } catch (error: any) {
        console.error('[INSTITUTIONAL_ADMIN_API] Registry Fetch Failure:', error.message);
        return NextResponse.json({ 
            error: 'Fleet Synchronization Failure', 
            details: error.message 
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, n8nWebhookUrl, status, progress, errorMessage } = body;

        const updates: string[] = [];
        const params: any[] = [];
        let i = 1;

        if (n8nWebhookUrl !== undefined) {
            updates.push(`"n8nWebhookUrl" = $${i++}`);
            params.push(n8nWebhookUrl);
            // If webhook is provided and no status is explicitly set, default to Syncing
            if (status === undefined) {
                updates.push(`status = $${i++}`);
                params.push('Syncing');
            }
        }

        if (status !== undefined) {
            updates.push(`status = $${i++}`);
            params.push(status);
        }

        if (progress !== undefined) {
            updates.push(`progress = $${i++}`);
            params.push(progress);
        }

        if (errorMessage !== undefined) {
            updates.push(`"errorMessage" = $${i++}`);
            params.push(errorMessage);
        }

        // Always update the timestamp on modification
        updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);

        if (updates.length > 0) {
            params.push(id);
            await db.execute(
                `UPDATE "Workflow" SET ${updates.join(', ')} WHERE id = $${params.length}`,
                params
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating workflow:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        await db.execute('DELETE FROM "Workflow" WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting workflow instance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
