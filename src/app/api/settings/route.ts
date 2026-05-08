import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const email = session.user.email.toLowerCase();

        const rows = await db.query('SELECT id, name, email, role, "firmName", industry, plan, tier, "onboardingStatus", "lastSeen", "lastActivity" FROM "User" WHERE email = $1', [email]);
        return NextResponse.json(rows[0] || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { firmName, email, name } = body;

        await db.execute(
            'UPDATE "User" SET "firmName" = $1, email = $2, name = $3 WHERE email = $4',
            [firmName, email, name, session.user.email.toLowerCase()]
        );

        const rows = await db.query('SELECT * FROM "User" WHERE email = $1', [email.toLowerCase()]);
        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
