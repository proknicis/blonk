import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
        const rows = await db.query('SELECT * FROM "Report" ORDER BY "createdAt" DESC');
        return NextResponse.json(rows || []);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, type, date, size, content } = body;

        const reportId = uuidv4();
        await db.execute(
            'INSERT INTO "Report" (id, name, type, date, size, content) VALUES ($1, $2, $3, $4, $5, $6)',
            [reportId, name, type, date, size, content]
        );

        const rows = await db.query('SELECT * FROM "Report" WHERE id = $1', [reportId]);

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
