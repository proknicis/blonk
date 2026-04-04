import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const emailRef = session.user.email.toLowerCase();
        const rows = await db.query(
            'SELECT * FROM "Report" WHERE LOWER("requestedBy") = LOWER($1) ORDER BY "createdAt" DESC',
            [emailRef]
        );
        return NextResponse.json(rows || []);
    } catch (error) {
        console.error('Error fetching reports:', error);
        return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { title, type, status, result } = body;
        const emailRef = session.user.email.toLowerCase();

        const reportId = uuidv4();
        await db.execute(
            'INSERT INTO "Report" (id, title, type, status, result, "requestedBy") VALUES ($1, $2, $3, $4, $5, $6)',
            [reportId, title, type, status || 'Published', result, emailRef]
        );

        return NextResponse.json({ id: reportId, success: true });
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
