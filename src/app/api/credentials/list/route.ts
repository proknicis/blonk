import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function ensureSchema() {
    try {
        await db.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    } catch (e) {
        console.warn("Could not create uuid-ossp extension:", e);
    }
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "credentials" (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "user_id" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
            provider VARCHAR(50) NOT NULL,
            "encrypted_data" TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'Connected',
            "n8n_credential_id" VARCHAR(255),
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT unique_user_provider UNIQUE ("user_id", provider)
        )
    `);
    // Heal nodes stuck in Pending status
    await db.execute(`UPDATE "ClusterNode" SET status = 'Active' WHERE status = 'Pending'`).catch(() => {});
}

export async function GET() {
    try {
        await ensureSchema();
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
