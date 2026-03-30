import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    return NextResponse.json({
        message: "BLONK Loop Webhook is Active.",
        status: "Listening",
        note: "This endpoint expects POST requests from n8n. If you see this in your browser, it means the connection through ngrok is working perfectly!"
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Flexible key mapping
        const workflow = body.workflow || body.workflowName || body.name || "Unknown Loop";
        const status = body.status || body.state || "received";
        const result = body.result ? (typeof body.result === 'object' ? JSON.stringify(body.result) : body.result) : JSON.stringify(body);

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);

        // 1. Log the execution (Store the whole body in result if result was empty)
        await connection.execute(
            'INSERT INTO WorkflowLog (id, workflowName, status, result) VALUES (UUID(), ?, ?, ?)',
            [workflow, status, result]
        );

        // 2. Update the main workflow stats
        const normalizedStatus = status.toLowerCase();
        await connection.execute(
            'UPDATE Workflow SET status = ?, lastRun = CURRENT_TIMESTAMP WHERE name = ?',
            [status, workflow]
        );

        if (normalizedStatus === 'success' || normalizedStatus === 'completed') {
            await connection.execute(
                'UPDATE Workflow SET tasksCount = tasksCount + 1 WHERE name = ?',
                [workflow]
            );
        }

        // 3. Create a notification
        await connection.execute(
            'INSERT INTO Notification (id, title, message) VALUES (UUID(), ?, ?)',
            [`Data Received: ${workflow}`, `Status: ${status.toUpperCase()}`]
        );

        await connection.end();

        return NextResponse.json({ success: true, message: "Packet received and logged" });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
}
