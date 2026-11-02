import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { AgentOrchestrator, executionQueue } from "@/lib/automation-os";

/**
 * PATCH /api/workflows/run
 * Body: { workflowId: string, action: 'start' | 'end' }
 * Sovereign Decoupled Permission checks and Orchestration triggering
 */
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (session.user as any).teamId;
    if (!teamId) {
        return NextResponse.json({ error: "Missing team context" }, { status: 400 });
    }

    try {
        const { workflowId, action } = await req.json();

        if (!workflowId || !action) {
            return NextResponse.json({ error: "Missing workflowId or action" }, { status: 400 });
        }

        // 1. Fetch Workflow details along with template info
        const wfResult = await db.query(`
            SELECT w.*, s.url as "serverUrl", wt.requirements as "templateRequirements"
            FROM "Workflow" w
            LEFT JOIN "ClusterNode" s ON w."serverId" = s.id
            LEFT JOIN "WorkflowTemplate" wt ON w."templateId" = wt.id
            WHERE w.id = $1 AND w."teamId" = $2
        `, [workflowId, teamId]) as any[];

        if (!wfResult.length) {
            return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
        }

        const workflow = wfResult[0];

        if (action === 'end') {
            await db.execute(
                `UPDATE "Workflow" SET status = 'Passive', "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1`,
                [workflowId]
            );
            return NextResponse.json({ success: true, status: 'Passive' });
        }

        // 2. Perform credential resolution via AgentOrchestrator
        const { aiEmployees, brainPermissions, credentialsRef } = await AgentOrchestrator.resolvePlan(workflowId, teamId);

        // Fetch required providers to check validation before starting
        const reqs = workflow.templateRequirements 
            ? (typeof workflow.templateRequirements === 'string' ? JSON.parse(workflow.templateRequirements) : workflow.templateRequirements)
            : [];
        const requiredProviders = Array.isArray(reqs) ? reqs.map((r: any) => r.name || r.service) : [];

        const connectedCreds = await db.query(`
            SELECT provider FROM "credentials" 
            WHERE "user_id" IN (SELECT id FROM "User" WHERE "teamId" = $1)
        `, [teamId]) as any[];

        const connectedProviders = new Set(connectedCreds.map(c => c.provider.toLowerCase()));
        const missingProviders = requiredProviders.filter(p => !connectedProviders.has(p.toLowerCase()));

        if (missingProviders.length > 0) {
            return NextResponse.json({ 
                error: `Permission Check FAILED: Missing credentials for: ${missingProviders.join(", ")}`,
                code: 'CREDENTIALS_REQUIRED',
                missing: missingProviders
            }, { status: 403 });
        }

        const logId = `exec_${uuidv4().replace(/-/g, '').substring(0, 20)}`;

        // 3. Create initial log trace in Running status
        await db.execute(
            `INSERT INTO "WorkflowLog" (id, "workflowName", "workflowId", status, result, "teamId", "createdAt") 
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
            [
                logId, 
                workflow.name, 
                workflowId, 
                'Running', 
                JSON.stringify({
                    reasoning: `Orchestrator dispatched run ${logId}. Selected subagents: ${aiEmployees.join(", ")}.`,
                    steps: [
                        `Started: Dispatching plan ${logId}.`,
                        `Planning: Mapping Brain scopes: ${brainPermissions.join(", ")}.`,
                        `Vault: Exposing credentials references safely.`
                    ],
                    timestamp: new Date().toISOString()
                }),
                teamId
            ]
        );

        // 4. Trigger n8n Execution Engine
        let n8nSuccess = false;
        if (workflow.serverUrl && workflow.n8nWebhookUrl) {
            try {
                const triggerUrl = workflow.n8nWebhookUrl;
                const callbackUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks/n8n`;

                const n8nPayload = {
                    workflowId: workflowId,
                    executionId: logId,
                    teamId: teamId,
                    scopedPermissions: brainPermissions,
                    aiEmployees: aiEmployees,
                    credentialTokens: credentialsRef, // Vault Reference Tokens instead of IDs/keys!
                    callbackUrl: callbackUrl
                };

                const n8nRes = await fetch(triggerUrl, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(n8nPayload),
                    signal: AbortSignal.timeout(10000)
                });
                
                if (n8nRes.ok) {
                    n8nSuccess = true;
                }
            } catch (err) {
                console.error("[WORKFLOW_RUN] n8n handshake failed:", err);
            }
        }

        // 5. Update DB State and Queue worker task
        await db.execute(
            `UPDATE "Workflow" SET status = 'Active', "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1`,
            [workflowId]
        );

        await executionQueue.push({
            executionId: logId,
            workflowId: workflowId,
            teamId: teamId,
            state: 'Running',
            timestamp: new Date()
        });

        return NextResponse.json({ 
            success: true, 
            status: 'Active',
            n8nSynced: n8nSuccess,
            executionId: logId
        });
    } catch (error: any) {
        console.error("[WORKFLOW_RUN_PATCH] Error:", error.message);
        return NextResponse.json({ error: "Failed to resolve permissions and start execution" }, { status: 500 });
    }
}
