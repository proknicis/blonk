import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

/**
 * Admin Support API
 * POST — Admin replies to a ticket or updates its status
 * GET  — List all tickets with latest message preview (admin only)
 */

async function verifyAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;

    try {
        const rows = await db.query(
            'SELECT id, email, name FROM "AdminUser" WHERE token = $1 LIMIT 1',
            [token]
        );
        return rows[0] || null;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
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
            await db.execute(
                `INSERT INTO "support_messages" ("ticketId", "senderId", "senderRole", "senderName", content)
                 VALUES ($1, $2, 'admin', $3, $4)`,
                [ticketId, admin.id, admin.name || 'Admin', message]
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
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get('ticketId');

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
