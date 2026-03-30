import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);

        // Fetch marketplace templates (only published ones)
        const [templates] = await connection.execute('SELECT * FROM WorkflowTemplate WHERE status = "Published" OR status IS NULL');

        // Fetch active/pending workflows for the current user (firm)
        const [activeWorkflows] = await connection.execute('SELECT name FROM Workflow');

        await connection.end();

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

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);

        // [BACKEND LIMIT ENFORCEMENT]
        const [existing]: any = await connection.execute('SELECT COUNT(*) as count FROM Workflow');
        if (existing[0].count >= 1) {
            await connection.end();
            return NextResponse.json(
                { error: 'Operational capacity exhausted. Professional Tier required.' }, 
                { status: 403 }
            );
        }

        // When a user adds a workflow from the marketplace, it starts as 'Pending'
        // and has NO webhook URL until the admin configures it.
        await connection.execute(
            'INSERT INTO Workflow (id, name, sector, status, performance, tasksCount, inputs, requestedBy) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
            [name, sector, 'Pending', performance || '0', 0, JSON.stringify(inputs || {}), 'Nikolass']
        );

        await connection.execute(
            'INSERT INTO Notification (id, title, message) VALUES (UUID(), ?, ?)',
            ['Workflow Requested', `You have requested "${name}". An admin will configure the backend loop shortly.`]
        );

        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error requesting workflow:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
