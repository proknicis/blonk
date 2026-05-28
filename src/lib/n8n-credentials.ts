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
            return {
                type: 'slackOAuth2Api',
                data: { oauthToken: rawData.accessToken || rawData.botToken || rawData.token || rawData.appToken }
            };
        case 'stripe':
            return {
                type: 'stripeApi',
                data: { apiKey: rawData.secretKey || rawData.apiKey || rawData.token }
            };
        case 'gmail':
        case 'google':
        case 'google_auth':
        case 'google-auth':
        case 'google_creds':
        case 'google-creds':
            return {
                type: 'gmailOAuth2',
                data: {
                    // n8n gmailOAuth2 schema: clientId, clientSecret, oauthTokenData
                    clientId: rawData.clientId || process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
                    clientSecret: rawData.clientSecret || process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
                    oauthTokenData: {
                        access_token: rawData.accessToken || rawData.access_token || '',
                        refresh_token: rawData.refreshToken || rawData.refresh_token || '',
                        token_type: rawData.tokenType || rawData.token_type || 'Bearer',
                        expiry_date: rawData.expiry_date || rawData.expiry || (Date.now() + 3600000)
                    }
                }
            };
        case 'google-sheets':
        case 'googlesheets':
            return {
                type: 'googleSheetsOAuth2Api',
                data: {
                    // n8n googleSheetsOAuth2Api schema: clientId, clientSecret, oauthTokenData
                    clientId: rawData.clientId || process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '',
                    clientSecret: rawData.clientSecret || process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '',
                    oauthTokenData: {
                        access_token: rawData.accessToken || rawData.access_token || '',
                        refresh_token: rawData.refreshToken || rawData.refresh_token || '',
                        token_type: rawData.tokenType || rawData.token_type || 'Bearer',
                        expiry_date: rawData.expiry_date || rawData.expiry || (Date.now() + 3600000)
                    }
                }
            };
        case 'github':
            return {
                type: 'githubApi',
                data: { 
                    accessToken: rawData.accessToken || rawData.token || rawData.personalAccessToken,
                    user: rawData.user || rawData.username || ""
                }
            };
        case 'openrouter':
            return {
                type: 'openAiApi',
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
 * Fetches all active n8n ClusterNodes for a specific team,
 * including servers assigned to their workflows or orders.
 */
export async function getN8nNodesForTeam(teamId: string): Promise<Array<{ id: string; name: string; url: string; apiKey: string }>> {
    const resolvedNodes: Array<{ id: string; name: string; url: string; apiKey: string }> = [];
    
    try {
        // Query distinct servers from Workflow, WorkflowOrder, and direct Team assignment
        const dbNodes = await db.query(
            `SELECT DISTINCT cn.id, cn.name, cn.url, cn.api_key 
             FROM "ClusterNode" cn
             WHERE cn.status = 'Active' AND (
                 cn."teamId" = $1 OR 
                 cn.id IN (SELECT DISTINCT "serverId" FROM "Workflow" WHERE "teamId" = $1 AND "serverId" IS NOT NULL) OR
                 cn.id IN (SELECT DISTINCT "serverId" FROM "WorkflowOrder" WHERE "teamId" = $1 AND "serverId" IS NOT NULL)
             )`,
            [teamId]
        ) as any[];

        for (const node of dbNodes) {
            resolvedNodes.push({
                id: node.id,
                name: node.name || 'Sovereign Node',
                url: node.url.replace(/\/+$/, ''),
                apiKey: node.api_key || node.apiKey || ''
            });
        }
    } catch (e) {
        console.error("[N8N_NODE_RESOLVER] Error finding nodes for team:", e);
    }

    // Fallback: Check if there's any active node at all in DB first (so DB changes override env)
    if (resolvedNodes.length === 0) {
        try {
            const defaultNodes = await db.query(
                'SELECT * FROM "ClusterNode" WHERE status = \'Active\' ORDER BY "createdAt" ASC LIMIT 1'
            ) as any[];
            if (defaultNodes.length > 0) {
                resolvedNodes.push({
                    id: defaultNodes[0].id,
                    name: defaultNodes[0].name || 'Sovereign Node',
                    url: defaultNodes[0].url.replace(/\/+$/, ''),
                    apiKey: defaultNodes[0].api_key || defaultNodes[0].apiKey || ''
                });
            }
        } catch (err) {
            console.error("[N8N_NODE_RESOLVER] Fallback database nodes fetch failed:", err);
        }
    }

    // Secondary Fallback: If still no active nodes resolved from DB, check environment N8N_API_KEY
    if (resolvedNodes.length === 0) {
        if (process.env.N8N_API_KEY) {
            resolvedNodes.push({
                id: 'env-default',
                name: 'Environment Default Node',
                url: (process.env.N8N_URL || 'https://n8n.manadavana.lv').replace(/\/+$/, ''),
                apiKey: process.env.N8N_API_KEY
            });
        }
    }

    // Absolute fallback to localhost if entirely missing
    if (resolvedNodes.length === 0) {
        resolvedNodes.push({
            id: 'localhost',
            name: 'Localhost Fallback',
            url: 'http://localhost:5678',
            apiKey: ''
        });
    }

    return resolvedNodes;
}

/**
 * Synchronizes credential connection data to the team's n8n servers.
 * Creates a new credential or updates an existing one on all servers.
 */
export async function syncCredentialToN8n(
    teamId: string,
    provider: string,
    rawData: any,
    n8nCredentialId?: string | null
): Promise<string> {
    const nodes = await getN8nNodesForTeam(teamId);
    if (nodes.length === 0) {
        throw new Error("No active server nodes are assigned to your team. Please assign a server to your workflows before connecting integrations.");
    }
    let lastCredentialId = '';
    const syncedIds: string[] = [];

    const { type, data } = mapProviderToN8nSchema(provider, rawData);
    const credentialName = `BLONK_${provider.toUpperCase()}_CREDENTIAL`;

    for (const node of nodes) {
        if (!node.apiKey) {
            console.warn(`[n8n-sync] Node ${node.name} has no API key configured. Skipping.`);
            continue;
        }

        try {
            // 1. Check if credential already exists by name on this server
            let existingId: string | null = null;
            const listUrl = `${node.url}/api/v1/credentials`;
            
            const listRes = await fetch(listUrl, {
                headers: {
                    'X-N8N-API-KEY': node.apiKey
                },
                cache: 'no-store'
            });

            if (listRes.ok) {
                const listData = await listRes.json();
                const creds = listData.data || listData || [];
                const found = creds.find((c: any) => c.name === credentialName && c.type === type);
                if (found) {
                    existingId = found.id;
                }
            }

            // 2. Determine URL and Method
            let url = `${node.url}/api/v1/credentials`;
            let method = 'POST';
            const body: any = {
                name: credentialName,
                type: type,
                data: data
            };

            if (existingId) {
                url = `${node.url}/api/v1/credentials/${existingId}`;
                method = 'PUT';
                delete body.type; // PUT in n8n does not take type
            }

            console.log(`[n8n-sync] Syncing to node ${node.name} (${node.url}) using ${method}...`);

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
                const errText = await res.text();
                throw new Error(`Node ${node.name} failed: HTTP ${res.status} - ${errText}`);
            }

            const resData = await res.json();
            const returnedId = resData.id || existingId;
            if (returnedId) {
                syncedIds.push(returnedId);
                lastCredentialId = returnedId;
            }
        } catch (err: any) {
            console.error(`[n8n-sync] Failed to sync to node ${node.name}:`, err.message);
            // If there's only one node, we throw. If there are multiple, we log and continue
            if (nodes.length === 1) {
                throw err;
            }
        }
    }

    if (syncedIds.length === 0 && nodes.length > 0) {
        throw new Error(`Failed to sync to any n8n server node.`);
    }

    return lastCredentialId;
}

/**
 * Deletes a credential from the team's n8n servers.
 */
export async function deleteCredentialFromN8n(teamId: string, n8nCredentialId: string, provider?: string): Promise<void> {
    const nodes = await getN8nNodesForTeam(teamId);
    const credentialName = provider ? `BLONK_${provider.toUpperCase()}_CREDENTIAL` : null;

    for (const node of nodes) {
        if (!node.apiKey) continue;

        try {
            let targetId: string | null = n8nCredentialId;

            // If we have a provider, look up the server-specific ID by name
            if (credentialName) {
                const listUrl = `${node.url}/api/v1/credentials`;
                const listRes = await fetch(listUrl, {
                    headers: { 'X-N8N-API-KEY': node.apiKey },
                    cache: 'no-store'
                });

                if (listRes.ok) {
                    const listData = await listRes.json();
                    const creds = listData.data || listData || [];
                    const found = creds.find((c: any) => c.name === credentialName);
                    if (found) {
                        targetId = found.id;
                    } else {
                        targetId = null; // not found on this server
                    }
                }
            }

            if (targetId) {
                const url = `${node.url}/api/v1/credentials/${targetId}`;
                console.log(`[n8n-sync] Deleting credential ${targetId} from node ${node.name}...`);
                const res = await fetch(url, {
                    method: 'DELETE',
                    headers: {
                        'X-N8N-API-KEY': node.apiKey
                    },
                    cache: 'no-store'
                });

                if (!res.ok && res.status !== 404) {
                    const errText = await res.text();
                    console.warn(`[n8n-sync] Delete warning from n8n node ${node.name}:`, errText);
                }
            }
        } catch (e: any) {
            console.error(`[n8n-sync] Connection error deleting credential from n8n node ${node.name}:`, e.message);
        }
    }
}
