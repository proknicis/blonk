import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
        }

        const rows = await db.query(
            'SELECT id, provider, status, "n8n_credential_id", "created_at", "updated_at" FROM "credentials" WHERE "user_id" = $1 ORDER BY provider ASC',
            [userId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[API_CREDENTIALS_LIST] Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to list credentials' }, { status: 500 });
    }
}
