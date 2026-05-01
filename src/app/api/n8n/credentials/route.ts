import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        console.log("[PROVISIONER] Received Request Body:", body);
        const { nodeId, type, name, data: incomingData } = body;

        if (!nodeId || !type || !name || !incomingData) {
            console.error("[PROVISIONER] Validation Failed. Missing fields:", { nodeId: !!nodeId, type: !!type, name: !!name, data: !!incomingData });
            return NextResponse.json({ 
                error: 'Missing parameters', 
                received: { nodeId: !!nodeId, type: !!type, name: !!name, data: !!incomingData } 
            }, { status: 400 });
        }

        // Auto-inject Google Client ID/Secret if it's an OAuth2 credential
        const data = { ...incomingData };
        if (type === 'gmailOAuth2Api' || type === 'googleSheetsOAuth2Api') {
            if (!data.clientId) data.clientId = process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
            if (!data.clientSecret) data.clientSecret = process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
            if (!data.authUrl) data.authUrl = "https://accounts.google.com/o/oauth2/v2/auth";
            if (!data.accessTokenUrl) data.accessTokenUrl = "https://oauth2.googleapis.com/token";
        }

        // 1. Fetch Node Details
        const [node] = await db.query('SELECT * FROM "ClusterNode" WHERE id = $1', [nodeId]) as any[];
        if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

        const baseUrl = node.url.replace(/\/+$/, '');
        const apiKey = node.api_key;

        console.log(`[PROVISIONER] Sending ${type} credentials to ${node.name} (${baseUrl})`);

        // 2. Direct call to n8n API (Following the official sample)
        const n8nRes = await fetch(`${baseUrl}/api/v1/credentials`, {
            method: 'POST',
            headers: { 
                'X-N8N-API-KEY': apiKey, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                name: name,
                type: type,
                data: data
            })
        });

        const resultText = await n8nRes.text();

        if (n8nRes.ok) {
            const resultData = JSON.parse(resultText);
            return NextResponse.json({ 
                success: true, 
                credentialId: resultData.id,
                message: 'Credentials successfully provisioned to n8n loop.'
            });
        } else {
            console.error(`[PROVISIONER] n8n Error:`, resultText);
            return NextResponse.json({ 
                error: 'n8n Provisioning Failed', 
                details: resultText 
            }, { status: n8nRes.status });
        }

    } catch (error: any) {
        console.error('[PROVISIONER] Internal Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
