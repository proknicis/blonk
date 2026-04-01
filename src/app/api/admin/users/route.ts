import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        const rows = await db.query('SELECT id, name, email, "firmName", "updatedAt" as "createdAt" FROM "User" ORDER BY "updatedAt" DESC');
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, role } = body;

        // In Postgres we use double quotes for identifiers and $ placeholders
        await db.execute(
            'UPDATE "User" SET plan = $1 WHERE id = $2',
            [role, id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // PostgreSQL uses single quotes for strings
        await db.execute('DELETE FROM "User" WHERE id = $1 AND plan != \'SuperAdmin\'', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
