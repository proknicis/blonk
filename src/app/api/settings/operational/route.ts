import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute('SELECT * FROM OperationalSetting');
        await connection.end();

        // Convert to keyed object
        const settings = (rows as any[]).reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching operational settings:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { key, value } = body;

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute(
            'INSERT INTO OperationalSetting (id, \`key\`, value) VALUES (UUID(), ?, ?) ON DUPLICATE KEY UPDATE value = ?',
            [key, value, value]
        );
        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
