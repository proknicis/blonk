import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        // 1. Get User Plan from sovereign PostgreSQL
        const users = await db.query('SELECT plan FROM "User" LIMIT 1');
        
        // 2. Get Ledger Transactions (Invoices) from the sovereign vault
        const invoices = await db.query('SELECT * FROM "Transaction" ORDER BY "createdAt" DESC');

        return NextResponse.json({
            plan: users[0]?.plan || 'Starter',
            invoices: invoices || []
        });
    } catch (error) {
        console.error('Error fetching billing data:', error);
        return NextResponse.json({ error: 'Failed to fetch billing data' }, { status: 500 });
    }
}
