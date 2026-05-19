import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureOrderSchema, setOrderStatus, appendOrderLog } from "@/lib/order-pipeline";
import { ORDER_STATUS } from "@/lib/order-lifecycle";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        await ensureOrderSchema();
        const rows = await db.query(
            `SELECT o.*, u.name as "userName", u.email as "userEmail", t.name as "teamName",
                    cn.name as "serverName", cn.status as "serverStatus"
             FROM "WorkflowOrder" o
             LEFT JOIN "User" u ON u.id = o."userId"
             LEFT JOIN "Team" t ON t.id = o."teamId"
             LEFT JOIN "ClusterNode" cn ON cn.id = o."serverId"
             ORDER BY o."createdAt" DESC`
        );
        return NextResponse.json(rows || []);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await ensureOrderSchema();
        const body = await request.json();
        const { orderId, status, logMessage, n8nWorkflowId } = body;

        if (!orderId || !status) {
            return NextResponse.json({ error: "orderId and status required" }, { status: 400 });
        }

        const [order] = await db.query('SELECT * FROM "WorkflowOrder" WHERE id = $1', [orderId]) as any[];
        if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

        await setOrderStatus(orderId, status, { n8nWorkflowId });

        if (logMessage) await appendOrderLog(orderId, logMessage);

        if (order.workflowId) {
            const progress =
                status === ORDER_STATUS.TESTING ? 90 :
                status === ORDER_STATUS.COMPLETED ? 100 :
                status === ORDER_STATUS.ADMIN_SETUP ? 80 : 75;
            await db.execute(
                'UPDATE "Workflow" SET status = $1, progress = $2, "n8nWorkflowId" = COALESCE($3, "n8nWorkflowId"), "updatedAt" = CURRENT_TIMESTAMP WHERE id = $4',
                [status, progress, n8nWorkflowId || null, order.workflowId]
            );
        }

        if (status === ORDER_STATUS.TESTING && !logMessage) {
            await appendOrderLog(orderId, "Testing Discord Bot");
            await appendOrderLog(orderId, "Validating OpenAI responses");
            await appendOrderLog(orderId, "Final checks");
        }

        if (status === ORDER_STATUS.COMPLETED) {
            await appendOrderLog(orderId, "Workflow completed — ready for production");
            await db.execute(
                'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
                [uuidv4(), order.teamId, "Workflow ready", `Your workflow "${order.workflowName}" is ready.`]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
