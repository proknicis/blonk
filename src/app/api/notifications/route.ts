import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute('SELECT * FROM Notification ORDER BY createdAt DESC');
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute('DELETE FROM Notification');
        await connection.end();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error clearing notifications:', error);
        return NextResponse.json({ error: 'Failed to clear notifications' }, { status: 500 });
    }
}
