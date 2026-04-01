import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const rows = await db.query('SELECT * FROM "OperationalSetting"');

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

        // PostgreSQL uses ON CONFLICT for upserts
        await db.execute(
            'INSERT INTO "OperationalSetting" (id, key, value) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $4',
            [uuidv4(), key, value, value]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
