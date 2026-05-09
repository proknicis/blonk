import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const dbUrl = process.env.DATABASE_URL ? 'DEFINED' : 'UNDEFINED';
        const authSecret = process.env.NEXTAUTH_SECRET ? 'DEFINED' : 'UNDEFINED';
        
        let session;
        try {
            session = await getServerSession(authOptions);
        } catch (sessionError: any) {
            return NextResponse.json({ 
                error: 'Session Fetch Failure', 
                details: sessionError.message,
                env: { dbUrl, authSecret }
            }, { status: 500 });
        }

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized', env: { dbUrl, authSecret } }, { status: 401 });
        }

        const email = session.user.email.toLowerCase();
        
        let rows;
        try {
            rows = await db.query('SELECT id, name, email, role, "firmName", industry, plan, tier, "onboardingStatus", "lastSeen", "lastActivity" FROM "User" WHERE email = $1', [email]);
        } catch (dbError: any) {
            return NextResponse.json({ 
                error: 'Database Query Failure', 
                details: dbError.message,
                env: { dbUrl, authSecret },
                email: email
            }, { status: 500 });
        }

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
