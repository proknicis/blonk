import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute(
            'SELECT * FROM WorkflowLog ORDER BY executedAt DESC LIMIT 20'
        );
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
