import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        // Migrated from legacy mysql2 to sovereign PostgreSQL
        // Renamed executedAt to createdAt as per the refined Postgres schema
        const rows = await db.query(
            'SELECT *, "createdAt" as "executedAt" FROM "WorkflowLog" ORDER BY "createdAt" DESC LIMIT 20'
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
