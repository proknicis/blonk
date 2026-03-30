import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows]: any = await connection.execute('SELECT * FROM User LIMIT 1');
        await connection.end();
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { firmName, email, name } = body;

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute(
            'UPDATE User SET firmName = ?, email = ?, name = ? WHERE id = (SELECT id FROM (SELECT id FROM User LIMIT 1) as t)',
            [firmName, email, name]
        );

        const [updatedUser]: any = await connection.execute('SELECT * FROM User LIMIT 1');
        await connection.end();

        return NextResponse.json(updatedUser[0]);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
