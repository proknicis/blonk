import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { decrypt } from "@/lib/encryption";

// Validation helper (identical to connect route validator)
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
                const res = await fetch(data.webhookUrl, { method: 'GET' });
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
            break;
    }
}

export async function POST(request: Request) {
    try {
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

        // Query DB for existing encrypted data
        const rows = await db.query(
            'SELECT id, "encrypted_data" FROM "credentials" WHERE "user_id" = $1 AND provider = $2 LIMIT 1',
            [userId, provider]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Credential not connected yet' }, { status: 404 });
        }

        const encryptedData = rows[0].encrypted_data;
        let decryptedData: any;
        
        try {
            decryptedData = JSON.parse(decrypt(encryptedData));
        } catch (decryptErr) {
            console.error('[API_CREDENTIALS_TEST] Decryption failed:', decryptErr);
            await db.execute(
                'UPDATE "credentials" SET status = $1, "updated_at" = NOW() WHERE "user_id" = $2 AND provider = $3',
                ['Error', userId, provider]
            );
            return NextResponse.json({ status: 'Error', error: 'Decryption key mismatch or corrupted credential data' });
        }

        // Test connectivity
        try {
            await validateCredentials(provider, decryptedData);
            
            // Update to Connected
            await db.execute(
                'UPDATE "credentials" SET status = $1, "updated_at" = NOW() WHERE "user_id" = $2 AND provider = $3',
                ['Connected', userId, provider]
            );

            return NextResponse.json({ success: true, status: 'Connected' });
        } catch (validationErr: any) {
            // Update to Error
            await db.execute(
                'UPDATE "credentials" SET status = $1, "updated_at" = NOW() WHERE "user_id" = $2 AND provider = $3',
                ['Error', userId, provider]
            );

            return NextResponse.json({ 
                success: false, 
                status: 'Error', 
                error: validationErr.message || 'Connectivity health check failed' 
            });
        }

    } catch (error: any) {
        console.error('[API_CREDENTIALS_TEST] Fatal Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to test credentials' }, { status: 500 });
    }
}
