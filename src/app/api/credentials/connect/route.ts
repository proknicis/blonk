import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
import { syncCredentialToN8n } from "@/lib/n8n-credentials";

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

// Helper to validate credentials against target API
async function validateCredentials(provider: string, data: any): Promise<void> {
    const p = provider.toLowerCase();

    switch (p) {
        case 'openai': {
            const key = data.apiKey || data.api_key;
            if (!key) throw new Error('OpenAI API Key is required');
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${key}` }
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Invalid OpenAI API Key (HTTP ${res.status}): ${text || 'Authentication Failed'}`);
            }
            break;
        }
        case 'telegram': {
            const token = data.botToken || data.accessToken || data.token;
            if (!token) throw new Error('Telegram Bot Token is required');
            const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
            if (!res.ok) {
                throw new Error(`Invalid Telegram Bot Token (HTTP ${res.status})`);
            }
            break;
        }
        case 'discord': {
            if (data.webhookUrl) {
                const res = await fetch(data.webhookUrl, { method: 'GET' }); // Discord webhooks support GET request to view webhook details
                if (!res.ok) {
                    throw new Error(`Invalid Discord Webhook URL (HTTP ${res.status})`);
                }
            } else {
                const token = data.botToken || data.token;
                if (!token) throw new Error('Discord Bot Token or Webhook URL is required');
                const res = await fetch('https://discord.com/api/v10/users/@me', {
                    headers: { 'Authorization': `Bot ${token}` }
                });
                if (!res.ok) {
                    throw new Error(`Invalid Discord Bot Token (HTTP ${res.status})`);
                }
            }
            break;
        }
        case 'slack': {
            const token = data.botToken || data.token || data.accessToken || data.appToken;
            if (!token) throw new Error('Slack Bot Token is required');
            const res = await fetch('https://slack.com/api/auth.test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!res.ok) {
                throw new Error(`Slack API Request Failed (HTTP ${res.status})`);
            }
            const slackData = await res.json();
            if (!slackData.ok) {
                throw new Error(`Invalid Slack Token: ${slackData.error}`);
            }
            break;
        }
        case 'stripe': {
            const key = data.secretKey || data.apiKey || data.token;
            if (!key) throw new Error('Stripe Secret Key is required');
            const res = await fetch('https://api.stripe.com/v1/balance', {
                headers: { 'Authorization': `Bearer ${key}` }
            });
            if (!res.ok) {
                throw new Error(`Invalid Stripe Secret Key (HTTP ${res.status})`);
            }
            break;
        }
        case 'gmail':
        case 'google-sheets':
        case 'googlesheets': {
            const token = data.accessToken;
            if (!token) throw new Error('Google OAuth access token is required for validation');
            const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
            if (!res.ok) {
                throw new Error(`Invalid Google Access Token (HTTP ${res.status})`);
            }
            break;
        }
        case 'github': {
            const token = data.accessToken || data.token || data.personalAccessToken;
            if (!token) throw new Error('GitHub Access Token is required');
            const res = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'User-Agent': 'BLONK-SaaS-Automation'
                }
            });
            if (!res.ok) {
                throw new Error(`Invalid GitHub Access Token (HTTP ${res.status})`);
            }
            break;
        }
        case 'openrouter': {
            const key = data.apiKey || data.api_key;
            if (!key) throw new Error('OpenRouter API Key is required');
            const res = await fetch('https://openrouter.ai/api/v1/models', {
                headers: { 'Authorization': `Bearer ${key}` }
            });
            if (!res.ok) {
                throw new Error(`Invalid OpenRouter API Key (HTTP ${res.status})`);
            }
            break;
        }
        case 'twilio': {
            const accountSid = data.accountSid;
            const authToken = data.authToken;
            if (!accountSid || !authToken) throw new Error('Twilio Account SID and Auth Token are required');
            const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
            const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
                headers: { 'Authorization': `Basic ${basicAuth}` }
            });
            if (!res.ok) {
                throw new Error(`Invalid Twilio Credentials (HTTP ${res.status})`);
            }
            break;
        }
        default:
            // Custom provider - no auto validation, passes through
            break;
    }
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
        const { provider, data } = body;

        if (!provider || !data) {
            return NextResponse.json({ error: 'Provider and connection data are required' }, { status: 400 });
        }

        // Get fresh teamId for the user
        const userRows = await db.query('SELECT "teamId" FROM "User" WHERE id = $1 LIMIT 1', [userId]);
        const teamId = userRows[0]?.teamId || '';

        // Inject Google Client ID/Secret if missing for google services
        const p = provider.toLowerCase();
        if (p === 'gmail' || p === 'google-sheets' || p === 'googlesheets') {
            if (!data.clientId) {
                data.clientId = process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
            }
            if (!data.clientSecret) {
                data.clientSecret = process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
            }
        }

        // 1. Validate credentials with the target service API
        try {
            await validateCredentials(provider, data);
        } catch (validationErr: any) {
            console.warn(`[API_CREDENTIALS_CONNECT] Validation failed for ${provider}:`, validationErr.message);
            return NextResponse.json({ error: `Connection validation failed: ${validationErr.message}` }, { status: 400 });
        }

        // 2. Encrypt credentials data
        const encryptedText = encrypt(JSON.stringify(data));

        // 3. Find if there is an existing credential for this user/provider
        const existing = await db.query(
            'SELECT id, "n8n_credential_id" FROM "credentials" WHERE "user_id" = $1 AND provider = $2 LIMIT 1',
            [userId, provider]
        );

        const existingCred = existing[0];
        const n8nCredentialId = existingCred?.n8n_credential_id || null;

        // 4. Sync to n8n server
        let finalN8nCredentialId: string | null = null;
        let syncStatus = 'Connected';
        let syncErrorMessage: string | null = null;
        try {
            finalN8nCredentialId = await syncCredentialToN8n(teamId, provider, data, n8nCredentialId);
        } catch (n8nErr: any) {
            console.error(`[API_CREDENTIALS_CONNECT] n8n sync failed:`, n8nErr);
            syncStatus = 'Error';
            syncErrorMessage = n8nErr.message;
        }

        // 5. Store/Update in Database
        await db.execute(
            `INSERT INTO "credentials" ("user_id", provider, "encrypted_data", status, "n8n_credential_id", "updated_at")
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT ("user_id", provider)
             DO UPDATE SET 
                 "encrypted_data" = EXCLUDED.encrypted_data,
                 status = EXCLUDED.status,
                 "n8n_credential_id" = EXCLUDED.n8n_credential_id,
                 "updated_at" = NOW()`,
            [userId, provider, encryptedText, syncStatus, finalN8nCredentialId]
        );

        // 6. Always try to advance workflows that were waiting for credentials
        //    (even if n8n sync failed, the cred is saved locally so workflow can progress)
        if (teamId) {
            try {
                const { advanceWorkflowsAwaitingCredentials } = await import('@/lib/workflow-provision');
                await advanceWorkflowsAwaitingCredentials(teamId);
            } catch (e) {
                console.warn('[API_CREDENTIALS_CONNECT] Non-fatal: Could not advance workflows:', e);
            }
        }

        if (syncStatus === 'Error') {
            return NextResponse.json({ 
                success: false, 
                provider, 
                status: 'Error', 
                error: `Saved locally, but failed to sync to n8n server: ${syncErrorMessage}`
            });
        }

        return NextResponse.json({ 
            success: true, 
            provider, 
            status: 'Connected', 
            n8nCredentialId: finalN8nCredentialId 
        });

    } catch (error: any) {
        console.error('[API_CREDENTIALS_CONNECT] Fatal Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to connect credential' }, { status: 500 });
    }
}
