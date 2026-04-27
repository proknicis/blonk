import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

/**
 * ADMIN Support Inbox API
 * 
 * Secure route for administrators to manage support tickets.
 */

async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token || !token.startsWith('admin_')) return null;

    const adminId = token.split('_')[1];

    try {
        const rows = await db.query(
            'SELECT id, name, email, plan FROM "User" WHERE id = $1 AND plan = \'SuperAdmin\' LIMIT 1',
            [adminId]
        ) as any[];
        return rows[0] || null;
    } catch {
        return null;
    }
}

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
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { ticketId, message, status } = body;

        if (!ticketId) {
            return NextResponse.json({ error: 'ticketId required' }, { status: 400 });
        }

        // Update ticket status if provided
        if (status) {
            await db.execute(
                `UPDATE "support_tickets" SET status = $1, "updatedAt" = NOW() WHERE id = $2`,
                [status, ticketId]
            );
        }

        // Add admin reply message if provided
        if (message) {
            const msgId = uuidv4();
            await db.execute(
                `INSERT INTO "support_messages" (id, "ticketId", "senderId", "senderRole", "senderName", content)
                 VALUES ($1, $2, $3, 'admin', $4, $5)`,
                [msgId, ticketId, admin.id, admin.name || 'Admin', message]
            );
            await db.execute(
                `UPDATE "support_tickets" SET "updatedAt" = NOW() WHERE id = $1`,
                [ticketId]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Admin Support POST Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await ensureTable();
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get('ticketId');

        if (ticketId) {
            const messages = await db.query(
                `SELECT * FROM "support_messages" WHERE "ticketId" = $1 ORDER BY "createdAt" ASC`,
                [ticketId]
            );
            return NextResponse.json({ messages });
        }

        // All tickets with latest message preview
        const tickets = await db.query(`
            SELECT 
                t.*,
                (SELECT content FROM "support_messages" WHERE "ticketId" = t.id ORDER BY "createdAt" DESC LIMIT 1) as "lastMessage",
                (SELECT "senderRole" FROM "support_messages" WHERE "ticketId" = t.id ORDER BY "createdAt" DESC LIMIT 1) as "lastSenderRole",
                (SELECT COUNT(*) FROM "support_messages" WHERE "ticketId" = t.id)::int as "messageCount"
            FROM "support_tickets" t
            ORDER BY 
                CASE WHEN t.status = 'open' THEN 0 ELSE 1 END,
                t."updatedAt" DESC
            LIMIT 100
        `);

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('[Admin Support GET Error]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
