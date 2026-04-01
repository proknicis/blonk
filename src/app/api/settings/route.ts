import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        const rows = await db.query('SELECT * FROM "User" LIMIT 1');
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

        // In Postgres we can simplify the UPDATE of a singleton if needed, 
        // but let's keep it similar to the original logic
        await db.execute(
            'UPDATE "User" SET "firmName" = $1, email = $2, name = $3 WHERE id = (SELECT id FROM "User" LIMIT 1)',
            [firmName, email, name]
        );

        const rows = await db.query('SELECT * FROM "User" LIMIT 1');
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
