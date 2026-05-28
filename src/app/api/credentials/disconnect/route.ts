import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { deleteCredentialFromN8n } from "@/lib/n8n-credentials";

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
}

export async function POST(request: Request) {
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

        const body = await request.json();
        const { provider } = body;

        if (!provider) {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }

        // Get user's fresh teamId
        const userRows = await db.query('SELECT "teamId" FROM "User" WHERE id = $1 LIMIT 1', [userId]);
        const teamId = userRows[0]?.teamId || '';

        // Query the database for existing credential record
        const rows = await db.query(
            'SELECT id, "n8n_credential_id" FROM "credentials" WHERE "user_id" = $1 AND provider = $2 LIMIT 1',
            [userId, provider]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Credential connection not found' }, { status: 404 });
        }

        const n8nCredentialId = rows[0].n8n_credential_id;

        // Delete from n8n instance if mapped
        if (n8nCredentialId) {
            try {
                await deleteCredentialFromN8n(teamId, n8nCredentialId);
            } catch (n8nErr: any) {
                console.warn(`[API_CREDENTIALS_DISCONNECT] Failed to delete from n8n server, continuing database delete:`, n8nErr.message);
            }
        }

        // Delete from DB
        await db.execute(
            'DELETE FROM "credentials" WHERE "user_id" = $1 AND provider = $2',
            [userId, provider]
        );

        return NextResponse.json({ success: true, message: `Disconnected provider ${provider}` });
    } catch (error: any) {
        console.error('[API_CREDENTIALS_DISCONNECT] Fatal Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to disconnect credential' }, { status: 500 });
    }
}
