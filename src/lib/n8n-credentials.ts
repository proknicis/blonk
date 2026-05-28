import { db } from "@/lib/db";

interface N8nNodeConfig {
    url: string;
    apiKey: string;
}

/**
 * Fetches the active n8n ClusterNode for a specific team,
 * or falls back to system defaults.
 */
export async function getN8nNodeForTeam(teamId: string): Promise<N8nNodeConfig> {
    try {
        // 1. If teamId is specified, check if there's a custom active node for this team
        if (teamId) {
            const nodes = await db.query(
                'SELECT * FROM "ClusterNode" WHERE "teamId" = $1 AND status = \'Active\' LIMIT 1',
                [teamId]
            ) as any[];
            
            if (nodes.length > 0) {
                return {
                    url: nodes[0].url.replace(/\/+$/, ''),
                    apiKey: nodes[0].api_key || nodes[0].apiKey || ''
                };
            }
        }
    } catch (e) {
        console.error("[N8N_NODE_RESOLVER] Error finding team node in DB:", e);
    }

    // 2. Fallback: get the oldest active node from the database
    try {
        const defaultNodes = await db.query(
            'SELECT * FROM "ClusterNode" WHERE status = \'Active\' ORDER BY "createdAt" ASC LIMIT 1'
        ) as any[];
        
        if (defaultNodes.length > 0) {
            return {
                url: defaultNodes[0].url.replace(/\/+$/, ''),
                apiKey: defaultNodes[0].api_key || defaultNodes[0].apiKey || ''
            };
        }
    } catch (e) {
        console.error("[N8N_NODE_RESOLVER] Error finding default node in DB:", e);
    }

    // 3. Absolute fallback: use env variables
    return {
        url: (process.env.N8N_URL || 'http://localhost:5678').replace(/\/+$/, ''),
        apiKey: process.env.N8N_API_KEY || ''
    };
}

/**
 * Maps BLONK credential provider IDs and raw client data into n8n API credential types and schemas.
 */
export function mapProviderToN8nSchema(provider: string, rawData: any): { type: string; data: any } {
    const p = provider.toLowerCase();
    
    switch (p) {
        case 'openai':
            return {
                type: 'openAiApi',
                data: { apiKey: rawData.apiKey || rawData.api_key }
            };
        case 'telegram':
            // n8n Telegram node uses telegramApi (token)
            return {
                type: 'telegramApi',
                data: { accessToken: rawData.botToken || rawData.accessToken || rawData.token }
            };
        case 'discord':
            if (rawData.webhookUrl) {
                return {
                    type: 'discordWebhookApi',
                    data: { webhookUrl: rawData.webhookUrl }
                };
            }
            return {
                type: 'discordBotApi',
                data: { token: rawData.botToken || rawData.token }
            };
        case 'slack':
            if (rawData.accessToken) {
                // OAuth credentials
                return {
                    type: 'slackOAuth2Api',
                    data: { oauthToken: rawData.accessToken }
                };
            }
            return {
                type: 'slackApi',
                data: { token: rawData.botToken || rawData.token || rawData.appToken }
            };
        case 'stripe':
            return {
                type: 'stripeApi',
                data: { apiKey: rawData.secretKey || rawData.apiKey || rawData.token }
            };
        case 'gmail':
            return {
                type: 'gmailOAuth2Api',
                data: {
                    clientId: rawData.clientId,
                    clientSecret: rawData.clientSecret,
                    refreshToken: rawData.refreshToken
                }
            };
        case 'google-sheets':
        case 'googlesheets':
            return {
                type: 'googleSheetsOAuth2Api',
                data: {
                    clientId: rawData.clientId,
                    clientSecret: rawData.clientSecret,
                    refreshToken: rawData.refreshToken
                }
            };
        case 'github':
            if (rawData.accessToken) {
                return {
                    type: 'githubOAuth2Api',
                    data: { oauthToken: rawData.accessToken }
                };
            }
            return {
                type: 'githubApi',
                data: { accessToken: rawData.token || rawData.personalAccessToken }
            };
        case 'openrouter':
            return {
                type: 'openRouterApi',
                data: { apiKey: rawData.apiKey || rawData.api_key }
            };
        case 'twilio':
            return {
                type: 'twilioApi',
                data: {
                    accountSid: rawData.accountSid,
                    authToken: rawData.authToken
                }
            };
        default:
            // Custom fallback
            return {
                type: `${p}Api`,
                data: rawData
            };
    }
}

/**
 * Synchronizes credential connection data to the team's n8n server.
 * Creates a new credential or updates an existing one if n8nCredentialId is provided.
 */
export async function syncCredentialToN8n(
    teamId: string,
    provider: string,
    rawData: any,
    n8nCredentialId?: string | null
): Promise<string> {
    const node = await getN8nNodeForTeam(teamId);
    if (!node.apiKey) {
        throw new Error(`Sovereign n8n node not configured with an API key.`);
    }

    const { type, data } = mapProviderToN8nSchema(provider, rawData);
    const credentialName = `BLONK_${provider.toUpperCase()}_CREDENTIAL`;

    let url = `${node.url}/api/v1/credentials`;
    let method = 'POST';
    
    const body: any = {
        name: credentialName,
        type: type,
        data: data
    };

    if (n8nCredentialId) {
        url = `${node.url}/api/v1/credentials/${n8nCredentialId}`;
        method = 'PUT';
        // Remove type on PUT updates if n8n API complains, but typically name and data are standard
        delete body.type;
    }

    console.log(`[n8n-sync] Sending ${method} request to n8n node at ${url}...`);

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': node.apiKey
        },
        body: JSON.stringify(body),
        cache: 'no-store'
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`[n8n-sync] n8n responded with error:`, errorText);
        throw new Error(`n8n synchronization failed: HTTP ${res.status} - ${errorText}`);
    }

    const responseData = await res.json();
    return responseData.id;
}

/**
 * Deletes a credential from the team's n8n server.
 */
export async function deleteCredentialFromN8n(teamId: string, n8nCredentialId: string): Promise<void> {
    const node = await getN8nNodeForTeam(teamId);
    if (!node.apiKey || !n8nCredentialId) return;

    const url = `${node.url}/api/v1/credentials/${n8nCredentialId}`;
    
    console.log(`[n8n-sync] Deleting credential ${n8nCredentialId} from n8n node...`);
    
    try {
        const res = await fetch(url, {
            method: 'DELETE',
            headers: {
                'X-N8N-API-KEY': node.apiKey
            },
            cache: 'no-store'
        });

        if (!res.ok && res.status !== 404) {
            const errText = await res.text();
            console.warn(`[n8n-sync] Delete warning from n8n:`, errText);
        }
    } catch (e) {
        console.error(`[n8n-sync] Connection error deleting credential from n8n:`, e);
    }
}
