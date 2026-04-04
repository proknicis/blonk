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
        const performance = body.performance || "0";
        const result = body.result ? (typeof body.result === 'object' ? JSON.stringify(body.result) : body.result) : JSON.stringify(body);

        // 1. Log the execution with ID link if available
        await db.execute(
            'INSERT INTO "WorkflowLog" (id, "workflowName", "workflowId", status, result) VALUES ($1, $2, $3, $4, $5)',
            [uuidv4(), workflowName, workflowId || null, status, result]
        );

        // 2. Update the main workflow stats using high-precision query
        // We use CURRENT_TIMESTAMP to ensure the standby check always has fresh server time
        const isSuccess = status.toLowerCase() === 'success' || status.toLowerCase() === 'completed';

        if (workflowId) {
            await db.query(`
                UPDATE "Workflow" 
                SET status = $1, 
                    performance = $2, 
                    "tasksCount" = "tasksCount" + $3, 
                    "lastRun" = CURRENT_TIMESTAMP 
                WHERE id = $4
            `, [status, performance, isSuccess ? 1 : 0, workflowId]);
        } else if (workflowName !== "Unknown Loop") {
            await db.query(`
                UPDATE "Workflow" 
                SET status = $1, 
                    performance = $2, 
                    "tasksCount" = "tasksCount" + $3, 
                    "lastRun" = CURRENT_TIMESTAMP 
                WHERE name = $4
            `, [status, performance, isSuccess ? 1 : 0, workflowName]);
        }

        // 3. Create a notification
        await db.execute(
            'INSERT INTO "Notification" (id, title, message) VALUES ($1, $2, $3)',
            [uuidv4(), `Loop Sync: ${workflowName}`, `Operation ${status.toUpperCase()} finalized.`]
        );

        return NextResponse.json({ success: true, message: "Packet received and fleet metrics updated" });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'System error during fleet sync' }, { status: 500 });
    }
}
