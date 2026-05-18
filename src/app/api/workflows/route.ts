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

        // 1. STRICT TENANT ISOLATION: 1 SERVER = 1 CUSTOMER (TEAM)
        // Check if this team already has an active dedicated server assigned
        let [assignedNode] = await db.query('SELECT * FROM "ClusterNode" WHERE "teamId" = $1 AND status ILIKE \'Active\'', [teamId]) as any[];

        if (!assignedNode) {
            // Fallback: If no Active assigned node, check for any assigned node regardless of status
            const [anyAssignedNode] = await db.query('SELECT * FROM "ClusterNode" WHERE "teamId" = $1', [teamId]) as any[];
            if (anyAssignedNode) {
                assignedNode = anyAssignedNode;
            }
        }

        let availableNode = assignedNode;

        if (!availableNode) {
            // No node is currently assigned to this team. Let's find an unassigned Active node
            const unassignedNodes = await db.query('SELECT * FROM "ClusterNode" WHERE "teamId" IS NULL AND status ILIKE \'Active\' ORDER BY "createdAt" ASC') as any[];
            
            if (unassignedNodes.length > 0) {
                // Dynamically bind the oldest unassigned Active node to this team
                const targetNode = unassignedNodes[0];
                await db.execute('UPDATE "ClusterNode" SET "teamId" = $1 WHERE id = $2', [teamId, targetNode.id]);
                availableNode = { ...targetNode, teamId };
                console.log(`[Tenant Isolation] Dynamic Allocation: Dedicated Server "${targetNode.name}" (${targetNode.id}) dynamically bound to customer team ${teamId}.`);
            } else {
                // Check if there is any unassigned node at all (e.g. Pending/Degraded)
                const anyUnassigned = await db.query('SELECT * FROM "ClusterNode" WHERE "teamId" IS NULL ORDER BY "createdAt" ASC') as any[];
                if (anyUnassigned.length > 0) {
                    const targetNode = anyUnassigned[0];
                    await db.execute('UPDATE "ClusterNode" SET "teamId" = $1 WHERE id = $2', [teamId, targetNode.id]);
                    availableNode = { ...targetNode, teamId };
                    console.log(`[Tenant Isolation] Dynamic Allocation (Fallback): Non-Active Server "${targetNode.name}" (${targetNode.id}) bound to customer team ${teamId}.`);
                }
            }
        }

        if (!availableNode) {
            console.error(`[Tenant Isolation] CRITICAL CONFIGURATION FAULT: No unassigned dedicated sovereign servers found for team ${teamId}.`);
            return NextResponse.json({ 
                error: 'Security & Isolation Lock', 
                details: 'To comply with our strict Security & Isolation standards, every customer requires a dedicated, single-tenant sovereign server. Currently, all active clusters are occupied. Please contact your Blonk Platform Owner to provision a dedicated sovereign server for your firm.'
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
                                        type: 'googleOAuth2Api', 
                                        isResolvable: false,
                                        data: {
                                            serverUrl: "",
                                            clientId: process.env.N8N_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID,
                                            clientSecret: process.env.N8N_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET,
                                            scope: inputs.authData?.scope || "https://www.googleapis.com/auth/gmail.send",
                                            sendAdditionalBodyProperties: false,
                                            additionalBodyProperties: {},
                                            oauthTokenData: {
                                                access_token: inputs.authData?.access_token,
                                                refresh_token: inputs.authData?.refresh_token,
                                                token_type: inputs.authData?.token_type || "Bearer",
                                                expiry_date: inputs.authData?.expiry_date || (Date.now() + 3600000)
                                            }
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
