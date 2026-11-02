import { db } from "@/lib/db";

export interface DeployParams {
    teamId: string;
    blueprintId: string;
    aiEmployeeId?: string | null;
}

export async function deployWorkflow({ teamId, blueprintId, aiEmployeeId }: DeployParams) {
    // 1. Fetch template/blueprint
    const [template] = await db.query(
        'SELECT * FROM "WorkflowTemplate" WHERE id = $1 LIMIT 1',
        [blueprintId]
    ) as any[];

    if (!template) {
        throw new Error("Workflow template not found");
    }

    // 2. Fetch customer team and server details
    const [clientTeam] = await db.query(
        'SELECT t.id, t."serverId", n.url, n.api_key, n.name as "serverName" FROM "Team" t LEFT JOIN "ClusterNode" n ON t."serverId" = n.id WHERE t.id = $1 LIMIT 1',
        [teamId]
    ) as any[];

    if (!clientTeam) {
        throw new Error("Client workspace not found");
    }

    if (!clientTeam.serverId || !clientTeam.url) {
        throw new Error("This customer has no dedicated server node provisioned.");
    }

    // 3. Remove global API key fallback
    const apiKey = clientTeam.api_key;
    if (!apiKey) {
        throw new Error("This customer's server has no API key configured. Cannot deploy.");
    }

    // 4. Resolve template source schema
    let workflowSchema: any = null;

    if (template.template_source) {
        try {
            workflowSchema = JSON.parse(template.template_source);
        } catch (e: any) {
            throw new Error(`Failed to parse template JSON source: ${e.message}`);
        }
    } else if (template.n8n_master_workflow_id) {
        // Option B: clone from Master n8n workflow definition
        const masterUrl = process.env.N8N_API_URL || 'http://localhost:3000/api/v1';
        const masterKey = process.env.N8N_API_KEY;
        const getUrl = `${masterUrl.replace(/\/+$/, '')}/workflows/${template.n8n_master_workflow_id}`;
        
        let masterRes;
        try {
            masterRes = await fetch(getUrl, {
                headers: masterKey ? { "X-N8N-API-KEY": masterKey } : {}
            });
        } catch (err: any) {
            throw new Error(`Could not contact the master n8n server: ${err.message}. Deployment aborted.`);
        }

        if (!masterRes.ok) {
            const errText = await masterRes.text();
            throw new Error(`Could not retrieve the master workflow template. Master n8n server returned status ${masterRes.status}: ${errText}. Deployment aborted.`);
        }

        try {
            const masterData = await masterRes.json();
            workflowSchema = {
                name: masterData.name || template.name,
                nodes: masterData.nodes || [],
                connections: masterData.connections || {}
            };
        } catch (err: any) {
            throw new Error(`Failed to parse master workflow response: ${err.message}`);
        }
    }

    if (!workflowSchema) {
        throw new Error("Could not retrieve the master workflow template. Deployment aborted.");
    }

    // Ensure schema has required properties
    workflowSchema.name = `${template.name} - ${clientTeam.id.slice(0, 6)}`;
    workflowSchema.active = true;

    const nodeUrl = clientTeam.url.replace(/\/+$/, '');

    // 5. Clean up old active deployment for (teamId, aiEmployeeId) if exists
    if (aiEmployeeId) {
        const activeDeployments = await db.query(
            'SELECT * FROM "CustomerWorkflowDeployment" WHERE "teamId" = $1 AND "aiEmployeeId" = $2 AND status = \'active\'',
            [teamId, aiEmployeeId]
        ) as any[];

        for (const dep of activeDeployments) {
            if (dep.n8nWorkflowId && dep.n8nWorkflowId !== 'FAILED_API_ERROR') {
                try {
                    // Try to delete old workflow
                    const deleteRes = await fetch(`${nodeUrl}/api/v1/workflows/${dep.n8nWorkflowId}`, {
                        method: "DELETE",
                        headers: { "X-N8N-API-KEY": apiKey },
                        signal: AbortSignal.timeout(5000)
                    });
                    console.log(`[Provisioner] Deleted old workflow ${dep.n8nWorkflowId} from client n8n. Status: ${deleteRes.status}`);
                } catch (delErr) {
                    console.error(`[Provisioner] Failed to delete old workflow ${dep.n8nWorkflowId} from client n8n:`, delErr);
                }
            }
            // Mark as replaced in our database
            await db.execute(
                'UPDATE "CustomerWorkflowDeployment" SET status = \'replaced\' WHERE id = $1',
                [dep.id]
            );
        }
    }

    // 6. Deploy new workflow via POST /api/v1/workflows
    let createdWorkflow;
    try {
        const n8nRes = await fetch(`${nodeUrl}/api/v1/workflows`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-N8N-API-KEY": apiKey
            },
            body: JSON.stringify(workflowSchema),
            signal: AbortSignal.timeout(10000)
        });

        if (!n8nRes.ok) {
            const errBody = await n8nRes.text();
            throw new Error(`Customer n8n server returned status ${n8nRes.status}: ${errBody}`);
        }

        createdWorkflow = await n8nRes.json();
    } catch (n8nErr: any) {
        console.error("[Provisioner] Deploy to n8n server failed:", n8nErr);
        throw new Error(`Customer n8n server is unreachable or rejected the template schema: ${n8nErr.message}`);
    }

    const actualN8nId = String(createdWorkflow.id);

    // 7. Activate the workflow via POST /api/v1/workflows/{id}/activate
    try {
        const activateRes = await fetch(`${nodeUrl}/api/v1/workflows/${actualN8nId}/activate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-N8N-API-KEY": apiKey
            },
            signal: AbortSignal.timeout(5000)
        });
        console.log(`[Provisioner] Activated workflow ${actualN8nId}. Status: ${activateRes.status}`);
    } catch (actErr) {
        console.error(`[Provisioner] Failed to activate workflow ${actualN8nId}:`, actErr);
    }

    return {
        n8nWorkflowId: actualN8nId,
        serverId: clientTeam.serverId
    };
}
