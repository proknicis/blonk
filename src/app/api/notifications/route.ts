import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        const rows = await db.query('SELECT * FROM "Notification" ORDER BY "createdAt" DESC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await db.execute('DELETE FROM "Notification"');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
    }
}
