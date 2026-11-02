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

        // Fetch logs
        const rows = await db.query(`
            SELECT l.id, l."workflowName", l.status, l.result, l."createdAt" as "executedAt", l."workflowId", l."teamId"
            FROM "WorkflowLog" l
            ORDER BY l."createdAt" DESC
            LIMIT 100
        `);

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed', details: error.message }, { status: 500 });
    }
}
