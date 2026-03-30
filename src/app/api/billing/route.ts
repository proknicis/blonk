import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        
        // 1. Get User Plan
        const [user]: any = await connection.execute('SELECT plan FROM User LIMIT 1');
        
        // 2. Get Invoices
        const [invoices] = await connection.execute('SELECT * FROM Invoice ORDER BY date DESC');

        await connection.end();

        return NextResponse.json({
            plan: user[0]?.plan || 'Starter',
            invoices
        });
    } catch (error) {
        console.error('Error fetching billing data:', error);
        return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
    }
}
