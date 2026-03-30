import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute('SELECT * FROM Report ORDER BY createdAt DESC');
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, date, size, content } = body;

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute(
            'INSERT INTO Report (id, name, type, date, size, content) VALUES (UUID(), ?, ?, ?, ?, ?)',
            [name, type, date, size, content]
        );

        const [newReport] = await connection.execute('SELECT * FROM Report ORDER BY createdAt DESC LIMIT 1') as any[];
        await connection.end();

        return NextResponse.json(newReport[0]);
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
    }
}
