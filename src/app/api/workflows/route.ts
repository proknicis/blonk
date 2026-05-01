import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const teamId = (session.user as any).teamId;
        if (!teamId) return NextResponse.json({ error: 'Missing Team Anchor' }, { status: 400 });

        // Fetch marketplace templates (Published or Live)
        const templates = await db.query('SELECT * FROM "WorkflowTemplate" WHERE status IN (\'Published\', \'Live\') OR status IS NULL');

        // Fetch active/pending workflows for the current firm unit (team)
        const activeWorkflows = await db.query('SELECT name FROM "Workflow" WHERE "teamId" = $1', [teamId]);

        return NextResponse.json({
            templates,
            activeWorkflows: (activeWorkflows as any[]).map(w => w.name)
        });
    } catch (error) {
        console.error('Error fetching marketplace data:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const teamId = (session.user as any).teamId;
        if (!teamId) return NextResponse.json({ error: 'Missing Team Anchor' }, { status: 400 });

        const body = await request.json();
        const { name, sector, performance, inputs, templateId } = body;

        const workflowId = uuidv4();
        const notificationId = uuidv4();

        // 1. FIND AVAILABLE SERVER (Fail-safe logic)
        let allNodes = await db.query('SELECT * FROM "ClusterNode" WHERE status ILIKE \'Active\'') as any[];
        
        // If no 'Active' nodes found, fallback to ANY node as a last resort
        if (allNodes.length === 0) {
            console.warn("[Orchestrator] No 'Active' nodes found. Falling back to all registry nodes.");
            allNodes = await db.query('SELECT * FROM "ClusterNode"') as any[];
        }

        const allWorkflows = await db.query('SELECT "serverId" FROM "Workflow"') as any[];

        // Calculate load in-memory for maximum reliability
        const nodeLoadMap: Record<string, number> = {};
        allWorkflows.forEach(w => {
            if (w.serverId) nodeLoadMap[w.serverId] = (nodeLoadMap[w.serverId] || 0) + 1;
        });

        const nodesWithLoad = allNodes.map(n => ({
            ...n,
            assigned_count: nodeLoadMap[n.id] || 0
        })).sort((a, b) => a.assigned_count - b.assigned_count);

        // Pick the node with most space, fallback to 100 capacity if not set
        const availableNode = nodesWithLoad.find(n => n.assigned_count < (n.max_workflows || 100)) || nodesWithLoad[0];

        if (!availableNode) {
            console.error("[Orchestrator] CRITICAL FAILURE: Node registry is empty.");
            return NextResponse.json({ 
                error: 'Infrastructure Missing', 
                details: 'No sovereign nodes found in the registry. Please add at least one node in Fleet Control.'
            }, { status: 503 });
        }

        let n8nWorkflowId = null;
        let n8nWebhookUrl = null;
        let credentialStatus = 'Skipped';
        let deploymentStatus = 'Pending';

        // 2. FETCH TEMPLATE JSON
        if (templateId) {
            const [template] = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [templateId]) as any[];
            if (template && template.workflow) {
                try {
                    const baseUrl = availableNode.url.replace(/\/+$/, '');
                    const apiKey = availableNode.api_key;

                    // 2a. Handle Credentials (GMAIL Example)
                    let credentialId = null;
                    if (inputs && inputs.google_creds === 'CONNECTED' && inputs.authData) {
                        // Create Gmail OAuth2 credentials in n8n
                        const credRes = await fetch(`${baseUrl}/api/v1/credentials`, {
                            method: 'POST',
                            headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        name: `Marketplace-Gmail-${teamId}-${Date.now()}`,
                                        type: 'gmailOAuth2Api', 
                                        isResolvable: false,
                                        data: {
                                            clientId: process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
                                            clientSecret: process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
                                            authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
                                            accessTokenUrl: "https://oauth2.googleapis.com/token",
                                            accessToken: inputs.authData?.access_token,
                                            refreshToken: inputs.authData?.refresh_token,
                                            expiry: inputs.authData?.expiry_date,
                                            scope: inputs.authData?.scope,
                                            tokenType: inputs.authData?.token_type
                                        }
                                    })
                        });
                        if (credRes.ok) {
                            const credData = await credRes.json();
                            credentialId = credData.id;
                            credentialStatus = 'Success';
                            console.log(`[Orchestrator] Credential created: ${credentialId}`);
                        } else {
                            const errorText = await credRes.text();
                            credentialStatus = `Failed: ${errorText.substring(0, 50)}`;
                            console.error("[Orchestrator] n8n Credential Error:", errorText);
                        }
                    }

                    // 2b. Standalone Credential Provisioning (Following n8n v1 API sample)
                    // At this point, we have credentialId if the creation was successful
                    // We STOP here and do NOT create a workflow.
                } catch (e: any) {
                    credentialStatus = `Provisioning Error: ${e.message}`;
                }
            }
        }

        // 3. REGISTER IN LOCAL LEDGER (Keep record for dashboard visibility)
        await db.execute(
            'INSERT INTO "Workflow" (id, "teamId", name, sector, status, performance, "tasksCount", inputs, "requestedBy", "serverId", "n8nWorkflowId", "n8nWebhookUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [workflowId, teamId, name, sector, 'Provisioned', '0', 0, JSON.stringify(inputs || {}), session.user.email?.toLowerCase(), availableNode.id, null, null]
        );

        await db.execute(
            'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
            [notificationId, teamId, 'Workflow Initialized', `Sovereign loop "${name}" has been provisioned on Node ${availableNode.name.substring(0,8)}.`]
        );

        return NextResponse.json({ 
            success: true, 
            id: workflowId, 
            orchestration: {
                server: availableNode.name,
                serverUrl: availableNode.url,
                credentialStatus,
                deploymentStatus: 'Skipped (As Requested)',
                n8nWorkflowId: null
            }
        });
    } catch (error) {
        console.error('Error requesting workflow:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
