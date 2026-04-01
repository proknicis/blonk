import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        // Fetch marketplace templates (only published ones)
        // PostgreSQL uses single quotes for string literals
        const templates = await db.query('SELECT * FROM "WorkflowTemplate" WHERE status = \'Published\' OR status IS NULL');

        // Fetch active/pending workflows for the current user (firm)
        const activeWorkflows = await db.query('SELECT name FROM "Workflow"');

        return NextResponse.json({
            templates,
            activeWorkflows: (activeWorkflows as any[]).map(w => w.name)
        });
    } catch (error) {
        console.error('Error fetching marketplace data:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, sector, performance, inputs } = body;

        // [BACKEND LIMIT ENFORCEMENT]
        const existing = await db.query('SELECT COUNT(*) as count FROM "Workflow"');
        if (Number(existing[0].count) >= 1) {
            return NextResponse.json(
                { error: 'Operational capacity exhausted. Professional Tier required.' }, 
                { status: 403 }
            );
        }

        // Use JS generated UUID for Postgres insertion consistency
        const workflowId = uuidv4();
        const notificationId = uuidv4();

        // PostgreSQL uses $1, $2 for placeholders
        await db.execute(
            'INSERT INTO "Workflow" (id, name, sector, status, performance, "tasksCount", inputs, "requestedBy") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [workflowId, name, sector, 'Pending', performance || '0', 0, JSON.stringify(inputs || {}), 'Nikolass']
        );

        await db.execute(
            'INSERT INTO "Notification" (id, title, message) VALUES ($1, $2, $3)',
            [notificationId, 'Workflow Requested', `You have requested "${name}". An admin will configure the backend loop shortly.`]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error requesting workflow:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
