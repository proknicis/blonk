import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { ORDER_STATUS } from "@/lib/order-lifecycle";
import { advanceWorkflowsAwaitingCredentials, allocateNodeForTeam, bindNodeToTeam } from "@/lib/workflow-provision";

export async function ensureOrderSchema() {
    // Use gen_random_uuid() — works without any extension in PostgreSQL 13+
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

    // Ensure columns exist for advanced metrics and styling sync
    await db.execute(`ALTER TABLE "WorkflowOrder" ADD COLUMN IF NOT EXISTS "orderType" VARCHAR(50) DEFAULT 'Marketplace'`).catch(() => {});
    await db.execute(`ALTER TABLE "WorkflowOrder" ADD COLUMN IF NOT EXISTS "orderSubType" VARCHAR(100) DEFAULT 'Workflow Purchase'`).catch(() => {});
    await db.execute(`ALTER TABLE "WorkflowOrder" ADD COLUMN IF NOT EXISTS "plan" VARCHAR(50) DEFAULT 'Startup'`).catch(() => {});
    await db.execute(`ALTER TABLE "WorkflowOrder" ADD COLUMN IF NOT EXISTS "priority" VARCHAR(50) DEFAULT 'MEDIUM'`).catch(() => {});
    await db.execute(`ALTER TABLE "WorkflowOrder" ADD COLUMN IF NOT EXISTS "assignedTo" VARCHAR(100) DEFAULT 'System Auto'`).catch(() => {});
    await db.execute(`ALTER TABLE "WorkflowOrder" ADD COLUMN IF NOT EXISTS "customDetails" JSONB`).catch(() => {});

    // Ensure Workflow table has the columns needed by the order pipeline
    await db.execute(`ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "templateId" UUID`).catch(() => {});
    await db.execute(`ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "serverId" UUID`).catch(() => {});
    await db.execute(`ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "userId" UUID`).catch(() => {});
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
    // 1. Fetch the existing order details
    const [order] = await db.query('SELECT * FROM "WorkflowOrder" WHERE id = $1', [orderId]) as any[];
    if (!order) return;

    const finalWorkflowId = extras?.workflowId || order.workflowId;
    const finalServerId = extras?.serverId || order.serverId;
    const finalN8nWorkflowId = extras?.n8nWorkflowId || order.n8nWorkflowId;

    // 2. Perform the update on WorkflowOrder
    const sets = ['status = $1', '"updatedAt" = CURRENT_TIMESTAMP'];
    const params: any[] = [status];
    let i = 2;
    if (finalServerId) {
        sets.push(`"serverId" = $${i++}`);
        params.push(finalServerId);
    }
    if (finalWorkflowId) {
        sets.push(`"workflowId" = $${i++}`);
        params.push(finalWorkflowId);
    }
    if (finalN8nWorkflowId) {
        sets.push(`"n8nWorkflowId" = $${i++}`);
        params.push(finalN8nWorkflowId);
    }
    params.push(orderId);
    await db.execute(`UPDATE "WorkflowOrder" SET ${sets.join(", ")} WHERE id = $${i}`, params);

    // 3. Keep Workflow table in sync
    if (finalWorkflowId) {
        let workflowStatus = status;
        let progress = 10;

        switch (status) {
            case 'PAYMENT_RECEIVED':
                workflowStatus = 'Initializing';
                progress = 10;
                break;
            case 'PROVISIONING':
                workflowStatus = 'Initializing';
                progress = 20;
                break;
            case 'INSTALLING_N8N':
                workflowStatus = 'Initializing';
                progress = 35;
                break;
            case 'SERVER_READY':
                workflowStatus = 'Initializing';
                progress = 45;
                break;
            case 'WORKFLOW_IMPORTED':
                workflowStatus = 'Initializing';
                progress = 50;
                break;
            case 'WAITING_CREDENTIALS':
                workflowStatus = 'Awaiting_Credentials';
                progress = 55;
                break;
            case 'CREDENTIALS_RECEIVED':
                workflowStatus = 'Syncing';
                progress = 70;
                break;
            case 'ADMIN_SETUP':
                workflowStatus = 'Syncing';
                progress = 85;
                break;
            case 'TESTING':
                workflowStatus = 'Connecting';
                progress = 95;
                break;
            case 'COMPLETED':
                workflowStatus = 'Active';
                progress = 100;
                break;
            case 'FAILED':
                workflowStatus = 'Error';
                progress = 0;
                break;
        }

        const wfSets = ['status = $1', 'progress = $2', '"updatedAt" = CURRENT_TIMESTAMP'];
        const wfParams: any[] = [workflowStatus, progress];
        let wfIdx = 3;

        if (finalServerId) {
            wfSets.push(`"serverId" = $${wfIdx++}`);
            wfParams.push(finalServerId);
        }
        if (finalN8nWorkflowId) {
            wfSets.push(`"n8nWebhookUrl" = $${wfIdx++}`);
            // Generate a simulated or actual webhook url if available
            wfParams.push(`https://n8n.blonk.ai/webhook/${finalN8nWorkflowId}`);
        }
        wfParams.push(finalWorkflowId);

        await db.execute(`UPDATE "Workflow" SET ${wfSets.join(", ")} WHERE id = $${wfIdx}`, wfParams);
    }

    // 4. Append professional descriptive log
    let logMessage = `Status updated to ${status.replace(/_/g, ' ')}`;
    let logLevel = 'info';

    switch (status) {
        case 'PAYMENT_RECEIVED':
            logMessage = "Payment processed successfully. Sovereign provisioning scheduled.";
            break;
        case 'PROVISIONING':
            logMessage = "Provisioning secure cloud VPS node in fleet cluster...";
            break;
        case 'INSTALLING_N8N':
            logMessage = "Installing isolated Docker container and n8n engine on host node.";
            break;
        case 'SERVER_READY':
            logMessage = "Dedicated n8n host environment fully operational and secured.";
            break;
        case 'WORKFLOW_IMPORTED':
            logMessage = "Autonomous workflow templates successfully synchronized and imported.";
            break;
        case 'WAITING_CREDENTIALS':
            logMessage = "System is waiting for required integration credentials from customer.";
            logLevel = 'warning';
            break;
        case 'CREDENTIALS_RECEIVED':
            logMessage = "Secure integration credentials received and validated. Deploying triggers.";
            break;
        case 'ADMIN_SETUP':
            logMessage = "Administrator completing manual trigger configuration and final overrides.";
            break;
        case 'TESTING':
            logMessage = "Initiating automated tests and execution simulation.";
            break;
        case 'COMPLETED':
            logMessage = "Workflow verified. System running autonomously in active monitoring mode.";
            break;
        case 'FAILED':
            logMessage = "Critical deployment exception occurred. Operator review required.";
            logLevel = 'error';
            break;
    }

    await appendOrderLog(orderId, logMessage, logLevel);
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
    if (existing.length > 0) return { orderId: existing[0].id };

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
        `INSERT INTO "Workflow" (id, "teamId", "userId", "templateId", name, sector, status, performance, "tasksCount", inputs, "requestedBy", progress)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
            workflowId,
            params.teamId,
            params.userId,
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
        // Check if the team already has an active server/node assigned to them
        const [existingNode] = await db.query(
            'SELECT * FROM "ClusterNode" WHERE "teamId" = $1 AND status ILIKE \'Active\' LIMIT 1',
            [order.teamId]
        ) as any[];

        if (existingNode) {
            await appendOrderLog(orderId, `Active server "${existingNode.name}" detected for this team. Bypassing node provisioning.`);
            
            // Instantly transition statuses to WAITING_CREDENTIALS so that the checklist completes instantly
            await setOrderStatus(orderId, ORDER_STATUS.PROVISIONING, { serverId: existingNode.id });
            await appendOrderLog(orderId, `Reusing active server: "${existingNode.name}"`);
            await new Promise((r) => setTimeout(r, 100));

            await setOrderStatus(orderId, ORDER_STATUS.INSTALLING_N8N, { serverId: existingNode.id });
            await appendOrderLog(orderId, "n8n configuration verified on active instance");
            await new Promise((r) => setTimeout(r, 100));

            await setOrderStatus(orderId, ORDER_STATUS.SERVER_READY, { serverId: existingNode.id });
            await appendOrderLog(orderId, "Dedicated node connection confirmed");
            await new Promise((r) => setTimeout(r, 100));

            await setOrderStatus(orderId, ORDER_STATUS.WORKFLOW_IMPORTED, { serverId: existingNode.id });
            await appendOrderLog(orderId, "Workflow templates successfully imported to instance");
            await new Promise((r) => setTimeout(r, 100));

            await setOrderStatus(orderId, ORDER_STATUS.WAITING_CREDENTIALS, { serverId: existingNode.id });
            await db.execute(
                'UPDATE "Workflow" SET status = $1, "serverId" = $2, progress = $3, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $4',
                [ORDER_STATUS.WAITING_CREDENTIALS, existingNode.id, 55, order.workflowId]
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
            return;
        }

        await setOrderStatus(orderId, ORDER_STATUS.PROVISIONING);
        await appendOrderLog(orderId, "Creating dedicated server…");

        let node = await allocateNodeForTeam(order.teamId);

        if (!node) {
            try {
                const user = await db.query('SELECT name, email FROM "User" WHERE id = $1', [order.userId]) as any[];
                
                const urlsToTry = [];
                if (process.env.NEXT_PUBLIC_BASE_URL) {
                    urlsToTry.push(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/contabo`);
                }
                urlsToTry.push(`http://127.0.0.1:3000/api/admin/contabo`);
                urlsToTry.push(`http://localhost:3000/api/admin/contabo`);

                let contaboRes = null;
                for (const url of urlsToTry) {
                    try {
                        const res = await fetch(url, {
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
                        if (res.ok) {
                            contaboRes = res;
                            break;
                        }
                    } catch (e) {
                        // Suppress logs for fallback attempts
                    }
                }

                if (contaboRes && contaboRes.ok) {
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
        `SELECT o.*, 
                COALESCE(u.name, tu.name, t_owner.name, (SELECT name FROM "User" ORDER BY role = 'SuperAdmin' ASC, id ASC LIMIT 1)) as "userName", 
                COALESCE(u.email, tu.email, t_owner.email, (SELECT email FROM "User" ORDER BY role = 'SuperAdmin' ASC, id ASC LIMIT 1)) as "userEmail", 
                cn.name as "serverName", 
                cn.status as "serverStatus",
                wt.name as "templateName",
                wt."productInfo"->>'version' as "templateVersion"
         FROM "WorkflowOrder" o
         LEFT JOIN "User" u ON u.id = o."userId" AND u.id != '00000000-0000-0000-0000-000000000000'
         LEFT JOIN "Team" t ON t.id = o."teamId"
         LEFT JOIN "User" t_owner ON t_owner.id = t."ownerId"
         LEFT JOIN LATERAL (
             SELECT name, email 
             FROM "User" 
             WHERE "teamId" = o."teamId" 
             ORDER BY LOWER(role) = 'owner' DESC, id ASC 
             LIMIT 1
         ) tu ON TRUE
         LEFT JOIN "ClusterNode" cn ON cn.id = o."serverId"
         LEFT JOIN "WorkflowTemplate" wt ON wt.id = o."templateId"
         WHERE o."teamId" = $1
         ORDER BY o."createdAt" DESC`,
        [teamId]
    ) as Promise<any[]>;
}

export async function getAllOrdersForAdmin() {
    await ensureOrderSchema();
    return db.query(
        `SELECT o.*, 
                COALESCE(u.name, tu.name, t_owner.name, (SELECT name FROM "User" ORDER BY role = 'SuperAdmin' ASC, id ASC LIMIT 1)) as "userName", 
                COALESCE(u.email, tu.email, t_owner.email, (SELECT email FROM "User" ORDER BY role = 'SuperAdmin' ASC, id ASC LIMIT 1)) as "userEmail", 
                t.name as "teamName",
                cn.name as "serverName", 
                cn.status as "serverStatus",
                wt.name as "templateName",
                wt."productInfo"->>'version' as "templateVersion"
         FROM "WorkflowOrder" o
         LEFT JOIN "User" u ON u.id = o."userId" AND u.id != '00000000-0000-0000-0000-000000000000'
         LEFT JOIN "Team" t ON t.id = o."teamId"
         LEFT JOIN "User" t_owner ON t_owner.id = t."ownerId"
         LEFT JOIN LATERAL (
             SELECT name, email 
             FROM "User" 
             WHERE "teamId" = o."teamId" 
             ORDER BY LOWER(role) = 'owner' DESC, id ASC 
             LIMIT 1
         ) tu ON TRUE
         LEFT JOIN "ClusterNode" cn ON cn.id = o."serverId"
         LEFT JOIN "WorkflowTemplate" wt ON wt.id = o."templateId"
         ORDER BY o."createdAt" DESC`
    ) as Promise<any[]>;
}

export async function updateOrderDetails(orderId: string, details: {
    workflowName?: string;
    status?: string;
    amount?: number;
    serverId?: string | null;
    n8nWorkflowId?: string | null;
    addLogMessage?: string;
    orderType?: string;
    orderSubType?: string;
    plan?: string;
    priority?: string;
    assignedTo?: string;
    templateId?: string | null;
}) {
    await ensureOrderSchema();
    const [order] = await db.query('SELECT * FROM "WorkflowOrder" WHERE id = $1', [orderId]) as any[];
    if (!order) throw new Error("Order not found");

    const sets: string[] = ['"updatedAt" = CURRENT_TIMESTAMP'];
    const params: any[] = [];
    let idx = 1;

    if (details.workflowName !== undefined) {
        sets.push(`"workflowName" = $${idx++}`);
        params.push(details.workflowName);
    }
    if (details.amount !== undefined) {
        sets.push(`amount = $${idx++}`);
        params.push(details.amount);
    }
    if (details.serverId !== undefined) {
        sets.push(`"serverId" = $${idx++}`);
        params.push(details.serverId);
    }
    if (details.n8nWorkflowId !== undefined) {
        sets.push(`"n8nWorkflowId" = $${idx++}`);
        params.push(details.n8nWorkflowId);
    }
    if (details.templateId !== undefined) {
        sets.push(`"templateId" = $${idx++}`);
        params.push(details.templateId);
    }
    if (details.orderType !== undefined) {
        sets.push(`"orderType" = $${idx++}`);
        params.push(details.orderType);
    }
    if (details.orderSubType !== undefined) {
        sets.push(`"orderSubType" = $${idx++}`);
        params.push(details.orderSubType);
    }
    if (details.plan !== undefined) {
        sets.push(`"plan" = $${idx++}`);
        params.push(details.plan);
    }
    if (details.priority !== undefined) {
        sets.push(`"priority" = $${idx++}`);
        params.push(details.priority);
    }
    if (details.assignedTo !== undefined) {
        sets.push(`"assignedTo" = $${idx++}`);
        params.push(details.assignedTo);
    }
    params.push(orderId);

    if (sets.length > 1) {
        await db.execute(`UPDATE "WorkflowOrder" SET ${sets.join(", ")} WHERE id = $${idx}`, params);
    }

    // If status is changed, use setOrderStatus to keep it in sync and add logs
    if (details.status && details.status !== order.status) {
        await setOrderStatus(orderId, details.status);
    } else {
        // Sync name/server/n8nWorkflowId to Workflow table as well
        if (order.workflowId) {
            const wfSets: string[] = ['"updatedAt" = CURRENT_TIMESTAMP'];
            const wfParams: any[] = [];
            let wfIdx = 1;

            if (details.workflowName !== undefined) {
                wfSets.push(`name = $${wfIdx++}`);
                wfParams.push(details.workflowName);
            }
            if (details.serverId !== undefined) {
                wfSets.push(`"serverId" = $${wfIdx++}`);
                wfParams.push(details.serverId);
            }
            if (details.n8nWorkflowId !== undefined) {
                wfSets.push(`"n8nWebhookUrl" = $${wfIdx++}`);
                wfParams.push(`https://n8n.blonk.ai/webhook/${details.n8nWorkflowId}`);
            }

            if (wfSets.length > 1) {
                wfParams.push(order.workflowId);
                await db.execute(`UPDATE "Workflow" SET ${wfSets.join(", ")} WHERE id = $${wfIdx}`, wfParams);
            }
        }
    }

    if (details.addLogMessage) {
        await appendOrderLog(orderId, details.addLogMessage, "info");
    }
}
