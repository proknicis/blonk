import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

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
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
            id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
            await db.execute(
                `INSERT INTO "support_messages" ("ticketId", "senderId", "senderRole", "senderName", content)
                 VALUES ($1, $2, $3, $4, $5)`,
                [ticketId, user.id, role, user.name || user.email, message]
            );
            await db.execute(
                `UPDATE "support_tickets" SET "updatedAt" = NOW() WHERE id = $1`,
                [ticketId]
            );
            return NextResponse.json({ success: true });
        }

        // Create a new ticket
        const ticketRows = await db.query(
            `INSERT INTO "support_tickets" (id, "userId", "userEmail", "userName", subject)
             VALUES (gen_random_uuid()::text, $1, $2, $3, $4) RETURNING id`,
            [user.id, user.email, user.name || 'User', subject || 'Support Request']
        );

        const newTicketId = ticketRows[0]?.id;

        // Add the first message
        if (message && newTicketId) {
            await db.execute(
                `INSERT INTO "support_messages" ("ticketId", "senderId", "senderRole", "senderName", content)
                 VALUES ($1, $2, 'user', $3, $4)`,
                [newTicketId, user.id, user.name || user.email, message]
            );
        }

        return NextResponse.json({ ticketId: newTicketId, success: true });

    } catch (error) {
        console.error('[Support API Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
                `SELECT * FROM "support_tickets" WHERE "userId" = $1 ORDER BY "updatedAt" DESC LIMIT 20`,
                [user.id]
            );
            return NextResponse.json(tickets);
        }

    } catch (error) {
        console.error('[Support GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
