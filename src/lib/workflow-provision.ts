import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { WORKFLOW_STATUS } from "@/lib/workflow-lifecycle";
import { normalizeRequirements, getRequirementName } from "@/lib/workflow-lifecycle";

export async function ensureWorkflowSchema() {
    await db.execute('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "templateId" UUID');
    await db.execute('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "teamId" UUID');
    await db.execute('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0');
}
import { PROVISIONING_STATUS, ProvisioningStatus, isValidProvisioningTransition } from "@/lib/provisioning-lifecycle";

export async function transitionTeamProvisioningStatus(teamId: string, toStatus: ProvisioningStatus): Promise<boolean> {
    const [team] = await db.query(
        'SELECT "provisioningStatus" FROM "Team" WHERE id = $1 LIMIT 1',
        [teamId]
    ) as any[];

    const currentStatus = (team?.provisioningStatus || PROVISIONING_STATUS.UNASSIGNED) as ProvisioningStatus;

    if (!isValidProvisioningTransition(currentStatus, toStatus)) {
        console.warn(`[Provisioning Lifecycle] Invalid state transition: ${currentStatus} -> ${toStatus} for Team ${teamId}`);
        try {
            await db.execute(
                `INSERT INTO "Event" ("userId", "eventType", "metadata", "source") 
                 VALUES ($1, $2, $3, $4)`,
                [
                    null,
                    'invalid_provision_transition',
                    JSON.stringify({
                        teamId,
                        title: 'Invalid State Transition Warning',
                        description: `Attempted invalid transition from ${currentStatus} to ${toStatus}.`,
                        ip_address: '127.0.0.1',
                        user_agent: 'BLONK System Guard'
                    }),
                    'audit_log'
                ]
            );
        } catch (e) {
            console.error("Audit log insertion failed:", e);
        }
    }

    await db.execute(
        'UPDATE "Team" SET "provisioningStatus" = $1 WHERE id = $2',
        [toStatus, teamId]
    );
    return true;
}

export async function allocateNodeForTeam(teamId: string): Promise<any | null> {
    // 1. Check if the Team/Workspace already has a server assigned
    const [team] = await db.query(
        'SELECT "serverId" FROM "Team" WHERE id = $1 LIMIT 1',
        [teamId]
    ) as any[];

    if (team?.serverId) {
        const [node] = await db.query(
            'SELECT * FROM "ClusterNode" WHERE id = $1 LIMIT 1',
            [team.serverId]
        ) as any[];
        if (node) return node;
    }

    // 2. Load-balanced query to find active, assignable server with the lowest assigned workspace count
    const assignableNodes = await db.query(`
        SELECT n.*, 
               (SELECT COUNT(*) FROM "Team" t WHERE t."serverId" = n.id) as assigned_workspaces
        FROM "ClusterNode" n
        WHERE n.status = 'Active' AND n.is_assignable = true
        ORDER BY assigned_workspaces ASC, n."createdAt" ASC
        LIMIT 1
    `) as any[];

    let targetNode = assignableNodes[0] || null;

    if (targetNode) {
        // Persist the assignment on the Team (Workspace)
        await db.execute(
            `UPDATE "Team" SET 
                "serverId" = $1, 
                "assignedAt" = CURRENT_TIMESTAMP 
             WHERE id = $2`,
            [targetNode.id, teamId]
        );
        await transitionTeamProvisioningStatus(teamId, PROVISIONING_STATUS.RESERVED);

        // Update ClusterNode for legacy backward compatibility
        await db.execute(
            'UPDATE "ClusterNode" SET "teamId" = $1 WHERE id = $2 AND "teamId" IS NULL',
            [teamId, targetNode.id]
        );

        return { ...targetNode, teamId };
    }

    // No Capacity Fallback: set status to QUEUED
    await db.execute(
        `UPDATE "Team" SET 
            "serverId" = NULL, 
            "assignedAt" = NULL 
         WHERE id = $1`,
        [teamId]
    );
    await transitionTeamProvisioningStatus(teamId, PROVISIONING_STATUS.QUEUED);

    // Log a system audit event about exhaustion
    try {
        await db.execute(
            `INSERT INTO "Event" ("userId", "eventType", "metadata", "source") 
             VALUES ($1, $2, $3, $4)`,
            [
                null,
                'infra_capacity_exhausted',
                JSON.stringify({
                    teamId,
                    title: 'Server Capacity Exhausted',
                    description: 'No active, assignable server nodes are available. Workspace placed in provisioning queue.',
                    ip_address: '127.0.0.1',
                    user_agent: 'BLONK System Allocator'
                }),
                'audit_log'
            ]
        );
    } catch (e) {
        console.error("Audit log insertion failed:", e);
    }

    return null;
}

export async function bindNodeToTeam(nodeId: string, teamId: string) {
    await db.execute(
        `UPDATE "Team" SET 
            "serverId" = $1, 
            "assignedAt" = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [nodeId, teamId]
    );
    await transitionTeamProvisioningStatus(teamId, PROVISIONING_STATUS.READY);
    await db.execute('UPDATE "ClusterNode" SET "teamId" = $1 WHERE id = $2', [teamId, nodeId]);
}

export async function getTeamCredentialServices(teamId: string): Promise<Set<string>> {
    const services = new Set<string>();

    // 1. Fetch from new credentials table for all users in the team
    try {
        const credRows = await db.query(
            `SELECT c.provider 
             FROM "credentials" c
             JOIN "User" u ON u.id = c."user_id"
             WHERE u."teamId" = $1`,
            [teamId]
        ) as any[];

        for (const row of credRows) {
            const name = String(row.provider || "").trim().toLowerCase();
            if (name) {
                services.add(name);
                // Handle naming variation aliases
                if (name === 'google-sheets') services.add('googlesheets');
                if (name === 'googlesheets') services.add('google-sheets');
                if (name === 'gmail' || name === 'google-sheets' || name === 'googlesheets' || name === 'google') {
                    services.add('google');
                    services.add('google_auth');
                    services.add('google-auth');
                    services.add('google_creds');
                    services.add('google-creds');
                    services.add('gmail');
                }
            }
        }
    } catch (e) {
        console.error("[getTeamCredentialServices] Error querying credentials table:", e);
    }

    // 2. Fetch from legacy OperationalSetting for backward compatibility
    try {
        const settings = await db.query(
            'SELECT value FROM "OperationalSetting" WHERE ("teamId" = $1 OR "teamId" IS NULL) AND key LIKE \'apikey_%\'',
            [teamId]
        ) as any[];

        for (const row of settings) {
            try {
                const parsed = JSON.parse(row.value);
                const name = String(parsed.service || parsed.label || "").trim().toLowerCase();
                if (name) {
                    services.add(name);
                    if (name === 'google-sheets') services.add('googlesheets');
                    if (name === 'googlesheets') services.add('google-sheets');
                    if (name === 'gmail' || name === 'google-sheets' || name === 'googlesheets' || name === 'google') {
                        services.add('google');
                        services.add('google_auth');
                        services.add('google-auth');
                        services.add('google_creds');
                        services.add('google-creds');
                        services.add('gmail');
                    }
                }
            } catch {
                /* ignore */
            }
        }
    } catch (e) {
        console.error("[getTeamCredentialServices] Error querying OperationalSetting:", e);
    }

    return services;
}

export async function areTemplateCredentialsComplete(teamId: string, requirements: unknown): Promise<boolean> {
    const reqs = normalizeRequirements(requirements);
    if (reqs.length === 0) return true;

    const connected = await getTeamCredentialServices(teamId);
    return reqs.every((req) => {
        const name = getRequirementName(req);
        if (!name) return true;
        return connected.has(name) || [...connected].some((c) => c.includes(name) || name.includes(c));
    });
}

export async function advanceWorkflowsAwaitingCredentials(teamId: string) {
    const workflows = await db.query(
        `SELECT w.id, w."templateId", wt.requirements
         FROM "Workflow" w
         LEFT JOIN "WorkflowTemplate" wt ON wt.id = w."templateId"
         WHERE w."teamId" = $1 AND w.status IN ('Awaiting_Credentials', 'Provisioned')`,
        [teamId]
    ) as any[];

    for (const wf of workflows) {
        const complete = await areTemplateCredentialsComplete(teamId, wf.requirements);
        if (complete) {
            await db.execute(
                'UPDATE "Workflow" SET status = $1, progress = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $3',
                [WORKFLOW_STATUS.AWAITING_ADMIN_SETUP, 70, wf.id]
            );
            await db.execute(
                'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
                [
                    uuidv4(),
                    teamId,
                    "Credentials received",
                    "Your integrations are connected. Our team is configuring your workflow.",
                ]
            );
        }
    }
}

export async function createWorkflowOrder(params: {
    teamId: string;
    templateId: string;
    name: string;
    sector?: string;
    requestedBy?: string;
    inputs?: Record<string, unknown>;
    status?: string;
    serverId?: string | null;
    progress?: number;
}) {
    await ensureWorkflowSchema();

    const workflowId = uuidv4();
    const status = params.status || WORKFLOW_STATUS.ORDERED;
    const progress = params.progress ?? (status === WORKFLOW_STATUS.ORDERED ? 15 : 30);

    await db.execute(
        `INSERT INTO "Workflow" (
            id, "teamId", "templateId", name, sector, status, performance,
            "tasksCount", inputs, "requestedBy", "serverId", "n8nWorkflowId", "n8nWebhookUrl", progress
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
            workflowId,
            params.teamId,
            params.templateId,
            params.name,
            params.sector || "General",
            status,
            "0",
            0,
            JSON.stringify(params.inputs || {}),
            params.requestedBy || null,
            params.serverId || null,
            null,
            null,
            progress,
        ]
    );

    return workflowId;
}

export async function updateWorkflowStatus(
    workflowId: string,
    status: string,
    extras?: { serverId?: string; progress?: number; errorMessage?: string | null }
) {
    const sets = ["status = $1", '"updatedAt" = CURRENT_TIMESTAMP'];
    const params: any[] = [status];
    let i = 2;

    if (extras?.serverId !== undefined) {
        sets.push(`"serverId" = $${i++}`);
        params.push(extras.serverId);
    }
    if (extras?.progress !== undefined) {
        sets.push(`progress = $${i++}`);
        params.push(extras.progress);
    }
    if (extras?.errorMessage !== undefined) {
        sets.push(`"errorMessage" = $${i++}`);
        params.push(extras.errorMessage);
    }

    params.push(workflowId);
    await db.execute(`UPDATE "Workflow" SET ${sets.join(", ")} WHERE id = $${i}`, params);
}

export async function findWorkflowForTemplateTeam(teamId: string, templateId: string) {
    const rows = await db.query(
        'SELECT * FROM "Workflow" WHERE "teamId" = $1 AND "templateId" = $2 ORDER BY "createdAt" DESC LIMIT 1',
        [teamId, templateId]
    ) as any[];
    return rows[0] || null;
}

export async function provisionWorkflowAfterOrder(params: {
    teamId: string;
    templateId: string;
    name: string;
    sector?: string;
    requestedBy?: string;
    inputs?: Record<string, unknown>;
    paid?: boolean;
}) {
    const existing = await findWorkflowForTemplateTeam(params.teamId, params.templateId);
    if (existing && ![WORKFLOW_STATUS.FAILED, WORKFLOW_STATUS.ERROR].includes(existing.status)) {
        return { workflowId: existing.id, existing: true, node: null };
    }

    const workflowId =
        existing?.id ||
        (await createWorkflowOrder({
            teamId: params.teamId,
            templateId: params.templateId,
            name: params.name,
            sector: params.sector,
            requestedBy: params.requestedBy,
            inputs: params.inputs,
            status: params.paid ? WORKFLOW_STATUS.ORDERED : WORKFLOW_STATUS.PROVISIONING,
            progress: params.paid ? 15 : 25,
        }));

    await updateWorkflowStatus(workflowId, WORKFLOW_STATUS.PROVISIONING, { progress: 35 });

    const node = await allocateNodeForTeam(params.teamId);

    if (!node) {
        await updateWorkflowStatus(workflowId, WORKFLOW_STATUS.PROVISIONING, {
            progress: 40,
            errorMessage: "Waiting for dedicated server capacity. Our team will assign a node shortly.",
        });
        return { workflowId, existing: false, node: null, awaitingServer: true };
    }

    await updateWorkflowStatus(workflowId, WORKFLOW_STATUS.AWAITING_CREDENTIALS, {
        serverId: node.id,
        progress: 50,
        errorMessage: null,
    });

    await db.execute(
        'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
        [
            uuidv4(),
            params.teamId,
            "Server ready",
            `Your dedicated node is ready. Add credentials in Connections to continue setup for "${params.name}".`,
        ]
    );

    return { workflowId, existing: false, node, awaitingServer: false };
}
