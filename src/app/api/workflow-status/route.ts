import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

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

        // High-precision ID matching (multi-tenant safe)
        const workflowId = body.workflowId || body.id;
        const workflowName = body.workflow || body.workflowName || body.name || "Unknown Loop";
        const status = body.status || body.state || "received";
        const result = body.result ? (typeof body.result === 'object' ? JSON.stringify(body.result) : body.result) : JSON.stringify(body);

        // 1. Log the execution with ID link if available
        await db.execute(
            'INSERT INTO "WorkflowLog" (id, "workflowName", "workflowId", status, result) VALUES ($1, $2, $3, $4, $5)',
            [uuidv4(), workflowName, workflowId || null, status, result]
        );

        // 2. Update the main workflow stats
        if (workflowId) {
            await db.execute(
                'UPDATE "Workflow" SET status = $1, "lastRun" = CURRENT_TIMESTAMP WHERE id = $2',
                [status, workflowId]
            );
        } else {
            // Fallback to name (less secure in multi-tenant environments)
            await db.execute(
                'UPDATE "Workflow" SET status = $1, "lastRun" = CURRENT_TIMESTAMP WHERE name = $2',
                [status, workflowName]
            );
        }

        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'success' || normalizedStatus === 'completed') {
            if (workflowId) {
                await db.execute('UPDATE "Workflow" SET "tasksCount" = "tasksCount" + 1 WHERE id = $1', [workflowId]);
            } else {
                await db.execute('UPDATE "Workflow" SET "tasksCount" = "tasksCount" + 1 WHERE name = $1', [workflowName]);
            }
        }

        // 3. Create a notification
        await db.execute(
            'INSERT INTO "Notification" (id, title, message) VALUES ($1, $2, $3)',
            [uuidv4(), `Loop Updated: ${workflowName}`, `Status changed to ${status.toUpperCase()}`]
        );

        return NextResponse.json({ success: true, message: "Packet received and logged" });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
}
