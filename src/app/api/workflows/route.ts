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

        // 1. FIND AVAILABLE SERVER
        const nodes = await db.query(`
            SELECT n.*, (SELECT COUNT(*) FROM "Workflow" w WHERE w."serverId" = n.id) as assigned_count
            FROM "ClusterNode" n
            WHERE n.status = 'Active'
            ORDER BY assigned_count ASC
        `) as any[];

        const availableNode = nodes.find(n => n.assigned_count < (n.max_workflows || 100));

        if (!availableNode) {
            return NextResponse.json({ 
                error: 'Global Capacity Exhausted', 
                details: 'All sovereign nodes are currently at maximum load. Contact engineering for cluster expansion.' 
            }, { status: 503 });
        }

        let n8nWorkflowId = null;
        let n8nWebhookUrl = null;

        // 2. FETCH TEMPLATE JSON
        if (templateId) {
            const [template] = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [templateId]) as any[];
            if (template && template.workflow) {
                try {
                    const baseUrl = availableNode.url.replace(/\/+$/, '');
                    const apiKey = availableNode.api_key;

                    // 2a. Handle Credentials (GMAIL Example)
                    // If the user provided credentials in inputs, we should create them in n8n first
                    // For now, let's look for 'google_creds' or similar in inputs
                    let credentialId = null;
                    if (inputs && (inputs.google_creds || inputs.gmail_api_key)) {
                        // Example: Create Gmail OAuth2 credentials
                        const credRes = await fetch(`${baseUrl}/api/v1/credentials`, {
                            method: 'POST',
                            headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                name: `Marketplace-Gmail-${teamId}`,
                                type: 'googleSheetsOAuth2Api', // Or gmailOAuth2Api
                                data: {
                                    // This mapping depends on what the user actually sends
                                    clientId: inputs.clientId || process.env.GOOGLE_CLIENT_ID,
                                    clientSecret: inputs.clientSecret || process.env.GOOGLE_CLIENT_SECRET,
                                    // ... other fields
                                }
                            })
                        });
                        if (credRes.ok) {
                            const credData = await credRes.json();
                            credentialId = credData.id;
                        }
                    }

                    // 2b. Deploy Workflow to n8n
                    const workflowJson = JSON.parse(template.workflow);
                    
                    // Inject credentialId if we created one
                    if (credentialId && workflowJson.nodes) {
                        workflowJson.nodes = workflowJson.nodes.map((node: any) => {
                            if (node.type === 'n8n-nodes-base.googleSheets' || node.type === 'n8n-nodes-base.gmail') {
                                return { ...node, credentials: { ...node.credentials, googleSheetsOAuth2Api: { id: credentialId } } };
                            }
                            return node;
                        });
                    }

                    const deployRes = await fetch(`${baseUrl}/api/v1/workflows`, {
                        method: 'POST',
                        headers: { 'X-N8N-API-KEY': apiKey, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: `${name} (${teamId})`,
                            nodes: workflowJson.nodes,
                            connections: workflowJson.connections,
                            active: true,
                            settings: workflowJson.settings
                        })
                    });

                    if (deployRes.ok) {
                        const deployData = await deployRes.json();
                        n8nWorkflowId = deployData.id;
                        // n8n v1 doesn't return webhook URL directly in create, might need to find it from nodes
                        const webhookNode = deployData.nodes?.find((n: any) => n.type?.includes('Webhook'));
                        if (webhookNode) {
                            n8nWebhookUrl = `${baseUrl}/webhook/${deployData.id}/${webhookNode.parameters?.path || 'webhook'}`;
                        }
                    }
                } catch (e) {
                    console.error("Failed to auto-deploy to n8n:", e);
                }
            }
        }

        // 3. REGISTER IN LOCAL LEDGER
        await db.execute(
            'INSERT INTO "Workflow" (id, "teamId", name, sector, status, performance, "tasksCount", inputs, "requestedBy", "serverId", "n8nWorkflowId", "n8nWebhookUrl") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
            [
                workflowId, 
                teamId, 
                name, 
                sector, 
                n8nWorkflowId ? 'Active' : 'Pending', 
                performance || '0', 
                0, 
                JSON.stringify(inputs || {}), 
                session.user.email?.toLowerCase(),
                availableNode.id,
                n8nWorkflowId,
                n8nWebhookUrl
            ]
        );

        await db.execute(
            'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
            [notificationId, teamId, 'Workflow Initialized', `Sovereign loop "${name}" has been provisioned on Node ${availableNode.name.substring(0,8)}.`]
        );

        return NextResponse.json({ success: true, id: workflowId, serverName: availableNode.name });
    } catch (error) {
        console.error('Error requesting workflow:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
