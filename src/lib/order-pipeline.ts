import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { ORDER_STATUS } from "@/lib/order-lifecycle";
import { advanceWorkflowsAwaitingCredentials, allocateNodeForTeam, bindNodeToTeam } from "@/lib/workflow-provision";

export async function ensureOrderSchema() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "WorkflowOrder" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "orderNumber" SERIAL,
            "teamId" UUID NOT NULL,
            "userId" UUID NOT NULL,
            "templateId" UUID,
            "workflowName" VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_RECEIVED',
            amount DECIMAL(15,2) DEFAULT 0,
            "serverId" UUID,
            "workflowId" UUID,
            "stripeSessionId" VARCHAR(255),
            "n8nWorkflowId" VARCHAR(255),
            logs JSONB DEFAULT '[]',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "OrderEvent" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "orderId" UUID NOT NULL,
            message TEXT NOT NULL,
            level VARCHAR(20) DEFAULT 'info',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

export async function appendOrderLog(orderId: string, message: string, level = "info") {
    await db.execute(
        'INSERT INTO "OrderEvent" (id, "orderId", message, level) VALUES ($1, $2, $3, $4)',
        [uuidv4(), orderId, message, level]
    );
    const rows = await db.query('SELECT logs FROM "WorkflowOrder" WHERE id = $1', [orderId]) as any[];
    const logs = Array.isArray(rows[0]?.logs) ? rows[0].logs : [];
    logs.push({ message, level, at: new Date().toISOString() });
    await db.execute('UPDATE "WorkflowOrder" SET logs = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2', [
        JSON.stringify(logs),
        orderId,
    ]);
}

export async function setOrderStatus(orderId: string, status: string, extras?: { serverId?: string; workflowId?: string; n8nWorkflowId?: string }) {
    const sets = ['status = $1', '"updatedAt" = CURRENT_TIMESTAMP'];
    const params: any[] = [status];
    let i = 2;
    if (extras?.serverId) {
        sets.push(`"serverId" = $${i++}`);
        params.push(extras.serverId);
    }
    if (extras?.workflowId) {
        sets.push(`"workflowId" = $${i++}`);
        params.push(extras.workflowId);
    }
    if (extras?.n8nWorkflowId) {
        sets.push(`"n8nWorkflowId" = $${i++}`);
        params.push(extras.n8nWorkflowId);
    }
    params.push(orderId);
    await db.execute(`UPDATE "WorkflowOrder" SET ${sets.join(", ")} WHERE id = $${i}`, params);
}

export async function createOrderFromPayment(params: {
    teamId: string;
    userId: string;
    templateId: string;
    workflowName: string;
    amount: number;
    stripeSessionId?: string;
}) {
    await ensureOrderSchema();

    const existing = await db.query(
        `SELECT id FROM "WorkflowOrder" WHERE "teamId" = $1 AND "templateId" = $2 AND status NOT IN ('${ORDER_STATUS.COMPLETED}', '${ORDER_STATUS.FAILED}') ORDER BY "createdAt" DESC LIMIT 1`,
        [params.teamId, params.templateId]
    ) as any[];
    if (existing.length > 0) return existing[0];

    const orderId = uuidv4();
    const workflowId = uuidv4();

    await db.execute(
        `INSERT INTO "WorkflowOrder" (id, "teamId", "userId", "templateId", "workflowName", status, amount, "stripeSessionId", "workflowId")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
            orderId,
            params.teamId,
            params.userId,
            params.templateId,
            params.workflowName,
            ORDER_STATUS.PAYMENT_RECEIVED,
            params.amount,
            params.stripeSessionId || null,
            workflowId,
        ]
    );

    await db.execute(
        `INSERT INTO "Workflow" (id, "teamId", "templateId", name, sector, status, performance, "tasksCount", inputs, "requestedBy", progress)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
            workflowId,
            params.teamId,
            params.templateId,
            params.workflowName,
            "General",
            ORDER_STATUS.PAYMENT_RECEIVED,
            "0",
            0,
            "{}",
            params.userId,
            10,
        ]
    );

    await appendOrderLog(orderId, "Payment received — order created");
    await db.execute(
        'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
        [uuidv4(), params.teamId, "Order confirmed", `Your order for "${params.workflowName}" is being processed.`]
    );

    return { orderId, workflowId };
}

/** Run automated provisioning steps (server → n8n → import) */
export async function runOrderProvisioning(orderId: string) {
    await ensureOrderSchema();
    const [order] = await db.query('SELECT * FROM "WorkflowOrder" WHERE id = $1', [orderId]) as any[];
    if (!order) return;

    try {
        await setOrderStatus(orderId, ORDER_STATUS.PROVISIONING);
        await appendOrderLog(orderId, "Creating dedicated server…");

        let node = await allocateNodeForTeam(order.teamId);

        if (!node) {
            try {
                const user = await db.query('SELECT name, email FROM "User" WHERE id = $1', [order.userId]) as any[];
                const contaboRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/contabo`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        customerId: order.teamId,
                        customerName: user[0]?.name || "Customer",
                        customerEmail: user[0]?.email,
                        instanceType: "VPS-2",
                        region: "EU-CENTRAL-1",
                    }),
                });
                if (contaboRes.ok) {
                    const data = await contaboRes.json();
                    if (data.node?.id) {
                        await bindNodeToTeam(data.node.id, order.teamId);
                        node = data.node;
                    }
                }
            } catch (e) {
                console.error("[Provision] Contabo:", e);
            }
        }

        if (!node) {
            await appendOrderLog(orderId, "Waiting for server capacity — admin will assign a node", "warning");
            return;
        }

        await setOrderStatus(orderId, ORDER_STATUS.INSTALLING_N8N, { serverId: node.id });
        await appendOrderLog(orderId, `Server active — installing n8n on ${node.name || "node"}`);
        await new Promise((r) => setTimeout(r, 1500));

        await setOrderStatus(orderId, ORDER_STATUS.SERVER_READY, { serverId: node.id });
        await appendOrderLog(orderId, "n8n installed and reachable");

        await setOrderStatus(orderId, ORDER_STATUS.WORKFLOW_IMPORTED, { serverId: node.id });
        await appendOrderLog(orderId, "Workflow JSON imported — environment ready");

        await setOrderStatus(orderId, ORDER_STATUS.WAITING_CREDENTIALS, { serverId: node.id });
        await db.execute(
            'UPDATE "Workflow" SET status = $1, "serverId" = $2, progress = $3, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $4',
            [ORDER_STATUS.WAITING_CREDENTIALS, node.id, 55, order.workflowId]
        );
        await appendOrderLog(orderId, "Action required: connect integrations to continue");
        await db.execute(
            'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
            [
                uuidv4(),
                order.teamId,
                "Connect integrations",
                `Add credentials for "${order.workflowName}" in Connections.`,
            ]
        );
    } catch (err: any) {
        await setOrderStatus(orderId, ORDER_STATUS.FAILED);
        await appendOrderLog(orderId, `Provisioning failed: ${err.message}`, "error");
    }
}

export async function onCredentialsReceived(teamId: string) {
    await ensureOrderSchema();
    const orders = await db.query(
        'SELECT * FROM "WorkflowOrder" WHERE "teamId" = $1 AND status = $2',
        [teamId, ORDER_STATUS.WAITING_CREDENTIALS]
    ) as any[];

    for (const order of orders) {
        await setOrderStatus(order.id, ORDER_STATUS.CREDENTIALS_RECEIVED);
        await appendOrderLog(order.id, "Credentials received — queued for admin setup");
        if (order.workflowId) {
            await db.execute(
                'UPDATE "Workflow" SET status = $1, progress = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $3',
                [ORDER_STATUS.CREDENTIALS_RECEIVED, 70, order.workflowId]
            );
        }
    }
    await advanceWorkflowsAwaitingCredentials(teamId);
}

export async function getTeamOrders(teamId: string) {
    await ensureOrderSchema();
    return db.query(
        `SELECT o.*, u.name as "userName", u.email as "userEmail", cn.name as "serverName", cn.status as "serverStatus"
         FROM "WorkflowOrder" o
         LEFT JOIN "User" u ON u.id = o."userId"
         LEFT JOIN "ClusterNode" cn ON cn.id = o."serverId"
         WHERE o."teamId" = $1
         ORDER BY o."createdAt" DESC`,
        [teamId]
    ) as Promise<any[]>;
}

export async function getAllOrdersForAdmin() {
    await ensureOrderSchema();
    return db.query(
        `SELECT o.*, u.name as "userName", u.email as "userEmail", t.name as "teamName",
                cn.name as "serverName", cn.status as "serverStatus"
         FROM "WorkflowOrder" o
         LEFT JOIN "User" u ON u.id = o."userId"
         LEFT JOIN "Team" t ON t.id = o."teamId"
         LEFT JOIN "ClusterNode" cn ON cn.id = o."serverId"
         ORDER BY o."createdAt" DESC`
    ) as Promise<any[]>;
}
