import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { logAudit } from '@/lib/audit';
import { runOrderProvisioning } from '@/lib/order-pipeline';

/**
 * Support Ticket System API
 * 
 * POST — Create a new support ticket (user escalation from AI chat)
 * GET  — List support tickets (admin: all open, user: own tickets)
 */

// Ensure the support_tickets table exists
async function ensureTable() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "support_tickets" (
            id TEXT PRIMARY KEY,
            "userId" TEXT NOT NULL,
            "userEmail" TEXT NOT NULL,
            "userName" TEXT DEFAULT 'User',
            subject TEXT NOT NULL,
            status TEXT DEFAULT 'open',
            priority TEXT DEFAULT 'normal',
            "createdAt" TIMESTAMPTZ DEFAULT NOW(),
            "updatedAt" TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "support_messages" (
            id TEXT PRIMARY KEY,
            "ticketId" TEXT NOT NULL REFERENCES "support_tickets"(id) ON DELETE CASCADE,
            "senderId" TEXT NOT NULL,
            "senderRole" TEXT NOT NULL DEFAULT 'user',
            "senderName" TEXT DEFAULT 'User',
            content TEXT NOT NULL,
            "createdAt" TIMESTAMPTZ DEFAULT NOW()
        )
    `);
}

export async function POST(req: Request) {
    try {
        await ensureTable();
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { subject, message, ticketId, senderRole } = body;
        const user = session.user as any;

        // If ticketId is provided, this is a reply to an existing ticket
        if (ticketId) {
            const role = senderRole || 'user';
            const msgId = uuidv4();
            await db.execute(
                `INSERT INTO "support_messages" (id, "ticketId", "senderId", "senderRole", "senderName", content)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [msgId, ticketId, user.id, role, user.name || user.email, message]
            );
            await db.execute(
                `UPDATE "support_tickets" SET status = 'waiting_for_admin', "updatedAt" = NOW() WHERE id = $1`,
                [ticketId]
            );
            return NextResponse.json({ success: true });
        }

        // Create a new ticket
        const newTicketId = uuidv4();
        await db.execute(
            `INSERT INTO "support_tickets" (id, "userId", "userEmail", "userName", subject)
             VALUES ($1, $2, $3, $4, $5)`,
            [newTicketId, user.id, user.email, user.name || 'User', subject || 'Support Request']
        );

        // Add the first message
        if (message) {
            const msgId = uuidv4();
            await db.execute(
                `INSERT INTO "support_messages" (id, "ticketId", "senderId", "senderRole", "senderName", content)
                 VALUES ($1, $2, $3, 'user', $4, $5)`,
                [msgId, newTicketId, user.id, user.name || user.email, message]
            );
        }

        // If it is a custom workflow request, create the order in addition to the ticket
        if (body.isCustomWorkflowRequest && body.customForm) {
            const { customForm } = body;
            let teamId = user.teamId;
            if (!teamId) {
                const teamRows = await db.query('SELECT id FROM "Team" WHERE "ownerId" = $1 LIMIT 1', [user.id]) as any[];
                if (teamRows.length > 0) {
                    teamId = teamRows[0].id;
                } else {
                    const anyTeamRow = await db.query('SELECT "teamId" FROM "User" WHERE id = $1 LIMIT 1', [user.id]) as any[];
                    if (anyTeamRow.length > 0 && anyTeamRow[0].teamId) {
                        teamId = anyTeamRow[0].teamId;
                    }
                }
            }

            if (teamId) {
                const userId = user.id;
                const orderId = uuidv4();
                const workflowId = uuidv4();
                const priority = (customForm.urgency || 'normal').toUpperCase();

                // Insert into WorkflowOrder
                await db.execute(
                    `INSERT INTO "WorkflowOrder" (id, "teamId", "userId", "templateId", "workflowName", status, amount, "stripeSessionId", "workflowId", "orderType", "orderSubType", plan, priority, "assignedTo")
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
                    [
                        orderId,
                        teamId,
                        userId,
                        null,
                        customForm.name,
                        'PAYMENT_RECEIVED',
                        0,
                        'custom_request_' + Date.now(),
                        workflowId,
                        'Custom Request',
                        'Custom Build',
                        'Custom',
                        priority,
                        'System Auto'
                    ]
                );

                // Insert into Workflow
                await db.execute(
                    `INSERT INTO "Workflow" (id, "teamId", "userId", name, sector, status, performance, "tasksCount", inputs, "requestedBy", progress)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [
                        workflowId,
                        teamId,
                        userId,
                        customForm.name,
                        customForm.category || 'General',
                        'PAYMENT_RECEIVED',
                        "0",
                        0,
                        "{}",
                        userId,
                        10,
                    ]
                );

                // Insert initial log
                const initialLog = [{ message: "Custom workflow request submitted.", level: "info", at: new Date().toISOString() }];
                await db.execute(
                    `UPDATE "WorkflowOrder" SET logs = $1 WHERE id = $2`,
                    [JSON.stringify(initialLog), orderId]
                );

                await db.execute(
                    `INSERT INTO "OrderEvent" (id, "orderId", message, level) VALUES ($1, $2, $3, $4)`,
                    [uuidv4(), orderId, "Custom workflow request submitted.", "info"]
                );

                // Insert Notification
                await db.execute(
                    'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
                    [uuidv4(), teamId, "Custom request received", `Your request for "${customForm.name}" has been received and queued.`]
                );

                // Trigger provisioning asynchronously
                runOrderProvisioning(orderId).catch(console.error);
            }
        }

        await logAudit(user.id, 'ticket_created', `Support Ticket: ${subject || 'Support Request'}`, { ticketId: newTicketId });

        return NextResponse.json({ ticketId: newTicketId, success: true });

    } catch (error) {
        console.error('[Support API Error]', error);
        return NextResponse.json({ error: 'Internal server error', detail: String(error) }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await ensureTable();
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = session.user as any;
        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get('ticketId');
        const isAdmin = searchParams.get('admin') === 'true';

        // Single ticket with messages
        if (ticketId) {
            const ticket = await db.query(
                `SELECT * FROM "support_tickets" WHERE id = $1`,
                [ticketId]
            );
            const messages = await db.query(
                `SELECT * FROM "support_messages" WHERE "ticketId" = $1 ORDER BY "createdAt" ASC`,
                [ticketId]
            );
            return NextResponse.json({ ticket: ticket[0] || null, messages });
        }

        // List tickets
        if (isAdmin) {
            const tickets = await db.query(
                `SELECT * FROM "support_tickets" ORDER BY "updatedAt" DESC LIMIT 50`
            );
            return NextResponse.json(tickets);
        } else {
            const tickets = await db.query(
                `SELECT * FROM "support_tickets" WHERE "userId" = $1 ORDER BY "updatedAt" DESC LIMIT 50`,
                [user.id]
            );
            return NextResponse.json(tickets);
        }

    } catch (error) {
        console.error('[Support GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
