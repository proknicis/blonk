import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute('SELECT id, name, email, firmName, role, createdAt FROM User ORDER BY createdAt DESC');
        await connection.end();
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

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute(
            'UPDATE User SET role = ? WHERE id = ?',
            [role, id]
        );
        await connection.end();

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

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute('DELETE FROM User WHERE id = ? AND role != "SuperAdmin"', [id]);
        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
