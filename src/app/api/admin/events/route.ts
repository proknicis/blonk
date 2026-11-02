import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !token.startsWith('admin_')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminId = token.split('_')[1];
        const [user] = await db.query('SELECT plan FROM "User" WHERE id = $1 LIMIT 1', [adminId]) as any[];
        
        const isAdmin = user && user.plan === 'SuperAdmin';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const rows = await db.query(`
            SELECT e.*, u.email as "userEmail", u.name as "userName"
            FROM "Event" e
            LEFT JOIN "User" u ON e."userId" = u.id
            ORDER BY e."createdAt" DESC
            LIMIT 100
        `);

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Error fetching audit events:', error);
        return NextResponse.json({ error: 'Failed', details: error.message }, { status: 500 });
    }
}
