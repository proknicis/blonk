import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from "@/lib/db";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !token.startsWith('admin_')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminId = token.split('_')[1];

        const rows = await db.query(
            'SELECT id, name, email, plan FROM "User" WHERE id = $1 AND plan = \'SuperAdmin\' LIMIT 1',
            [adminId]
        ) as any[];

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminUser = rows[0];

        return NextResponse.json({
            user: {
                id: adminUser.id,
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.plan
            }
        });
    } catch (error) {
        console.error('Admin session validation error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
