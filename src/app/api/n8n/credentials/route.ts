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
        let { nodeId, type, name, data: incomingData } = body;

        // 1. FIND AVAILABLE SERVER if nodeId is missing
        if (!nodeId) {
            console.log("[PROVISIONER] nodeId missing, selecting best available node...");
            let allNodes = await db.query('SELECT * FROM "ClusterNode" WHERE status ILIKE \'Active\'') as any[];
            if (allNodes.length === 0) allNodes = await db.query('SELECT * FROM "ClusterNode"') as any[];
            
            if (allNodes.length > 0) {
                // Simplified selection: just pick the first one for now or add load balancing later
                nodeId = allNodes[0].id;
            }
        }

        if (!nodeId || !type || !name || !incomingData) {
            console.error("[PROVISIONER] Validation Failed. Missing fields:", { nodeId: !!nodeId, type: !!type, name: !!name, data: !!incomingData });
            return NextResponse.json({ 
                error: 'Missing parameters', 
                received: { nodeId: !!nodeId, type: !!type, name: !!name, data: !!incomingData } 
            }, { status: 400 });
        }

        // Auto-inject Google Client ID/Secret if it's an OAuth2 credential
        // Map Google credential types to their EXACT n8n node credential schemas
        // Do NOT use the generic 'googleOAuth2Api' — it requires serverUrl, authUrl, scope, etc.
        // Use the specific node credential types instead.
        let finalData: any = { ...incomingData };
        if (type === 'gmailOAuth2Api' || type === 'gmailOAuth2') {
            type = 'gmailOAuth2'; // exact credential type for Gmail node
            const clientId = process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                console.error("[PROVISIONER] Critical Error: Google Client ID/Secret missing in .env");
                return NextResponse.json({ error: 'Server Configuration Error: Google secrets missing' }, { status: 500 });
            }
            finalData = {
                clientId,
                clientSecret,
                oauthTokenData: {
                    access_token: incomingData.accessToken || incomingData.access_token || '',
                    refresh_token: incomingData.refreshToken || incomingData.refresh_token || '',
                    token_type: incomingData.tokenType || incomingData.token_type || 'Bearer',
                    expiry_date: incomingData.expiry_date || incomingData.expiry || (Date.now() + 3600000)
                }
            };
        } else if (type === 'googleSheetsOAuth2Api') {
            // exact credential type for Google Sheets node
            const clientId = process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                console.error("[PROVISIONER] Critical Error: Google Client ID/Secret missing in .env");
                return NextResponse.json({ error: 'Server Configuration Error: Google secrets missing' }, { status: 500 });
            }
            finalData = {
                clientId,
                clientSecret,
                oauthTokenData: {
                    access_token: incomingData.accessToken || incomingData.access_token || '',
                    refresh_token: incomingData.refreshToken || incomingData.refresh_token || '',
                    token_type: incomingData.tokenType || incomingData.token_type || 'Bearer',
                    expiry_date: incomingData.expiry_date || incomingData.expiry || (Date.now() + 3600000)
                }
            };
        } else if (type === 'googleOAuth2Api') {
            // Fallback: caller sent the generic type — redirect to gmailOAuth2 by default
            console.warn("[PROVISIONER] Received generic 'googleOAuth2Api' type — defaulting to gmailOAuth2.");
            type = 'gmailOAuth2';
            const clientId = process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
            if (!clientId || !clientSecret) {
                return NextResponse.json({ error: 'Server Configuration Error: Google secrets missing' }, { status: 500 });
            }
            finalData = {
                clientId,
                clientSecret,
                oauthTokenData: {
                    access_token: incomingData.accessToken || incomingData.access_token || '',
                    refresh_token: incomingData.refreshToken || incomingData.refresh_token || '',
                    token_type: 'Bearer',
                    expiry_date: incomingData.expiry_date || (Date.now() + 3600000)
                }
            };
        }

        // 2. Fetch Node Details
        const [node] = await db.query('SELECT * FROM "ClusterNode" WHERE id = $1', [nodeId]) as any[];
        if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

        const baseUrl = node.url.replace(/\/+$/, '');
        const apiKey = node.api_key;

        console.log(`[PROVISIONER] Sending ${type} credentials to ${node.name} (${baseUrl})`);

        // 2. Direct call to n8n API
        const n8nRes = await fetch(`${baseUrl}/api/v1/credentials`, {
            method: 'POST',
            headers: { 
                'X-N8N-API-KEY': apiKey, 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                name: name,
                type: type,
                isResolvable: false,
                data: finalData
            })
        });

        const resultText = await n8nRes.text();

        if (n8nRes.ok) {
            const resultData = JSON.parse(resultText);
            const teamId = (session.user as any).teamId;
            if (teamId) {
                const { onCredentialsReceived } = await import('@/lib/order-pipeline');
                await onCredentialsReceived(teamId);
            }
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
