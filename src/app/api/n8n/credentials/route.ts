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
        // Map to exact n8n schema
        let finalData: any = { ...incomingData };
        if (type === 'gmailOAuth2Api' || type === 'googleSheetsOAuth2Api' || type === 'googleOAuth2Api') {
            type = 'googleOAuth2Api'; // Always use the core type that n8n respects
            
            finalData = {
                serverUrl: "", // Required by n8n schema validator
                clientId: process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
                scope: incomingData.scope || "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/drive.file",
                sendAdditionalBodyProperties: false, // Required by n8n schema
                additionalBodyProperties: {}, // Required by n8n schema
                oauthTokenData: {
                    access_token: incomingData.accessToken || incomingData.access_token,
                    refresh_token: incomingData.refreshToken || incomingData.refresh_token,
                    token_type: incomingData.tokenType || incomingData.token_type || "Bearer",
                    expiry_date: incomingData.expiry || incomingData.expiry_date || Date.now() + 3600000 // Ensure valid expiry
                }
            };
            
            if (!finalData.clientId || !finalData.clientSecret) {
                console.error("[PROVISIONER] Critical Error: Google Client ID/Secret missing in .env");
                return NextResponse.json({ error: 'Server Configuration Error: Google secrets missing' }, { status: 500 });
            }
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
