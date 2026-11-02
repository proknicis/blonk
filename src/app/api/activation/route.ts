import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const VALID_STATUSES = [
    "NOT_STARTED",
    "SUMMARY_READY",
    "WORKFLOW_SELECTED",
    "CONNECTIONS_IN_PROGRESS",
    "READY_FOR_DEPLOY",
    "DEPLOYING",
    "ACTIVATED",
    "CUSTOM_REQUEST_SUBMITTED"
];

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;

        // Fetch User with new activation fields
        // Fetch User and their Team + assigned Server
        const [user] = await db.query(
            `SELECT u.id, u.name, u.email, u."firmName", u.industry, u."aiEmployee", u."problemDescription",
                    u."activationStatus", u."selectedWorkflowId", u."activationStartedAt", u."activationCompletedAt", u."activationState",
                    t.id as "teamId", t."serverId", t."provisioningStatus", t."assignedAt",
                    n.name as "serverName", n.provider as "serverProvider", n.region as "serverRegion", n.status as "serverStatus"
             FROM "User" u
             LEFT JOIN "Team" t ON u."teamId" = t.id
             LEFT JOIN "ClusterNode" n ON t."serverId" = n.id
             WHERE u.id = $1 LIMIT 1`,
            [userId]
        ) as any[];

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch connected credential providers
        const credentials = await db.query(
            'SELECT provider, status FROM "credentials" WHERE "user_id" = $1 ORDER BY provider ASC',
            [userId]
        ) as any[];

        return NextResponse.json({
            user,
            credentials: credentials.map(c => ({ provider: c.provider, status: c.status }))
        });
    } catch (error: any) {
        console.error("[ACTIVATION_API_GET] Error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await request.json();
        const { status, selectedWorkflowId, metadata } = body;

        // Validate status if provided
        if (status && !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
        }

        // Fetch current state to enforce transition guards
        const [current] = await db.query(
            'SELECT "activationStatus" FROM "User" WHERE id = $1 LIMIT 1',
            [userId]
        ) as any[];

        if (!current) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const updates: string[] = ['"updatedAt" = CURRENT_TIMESTAMP'];
        const params: any[] = [];
        let paramIndex = 1;

        if (status) {
            updates.push(`"activationStatus" = $${paramIndex++}`);
            params.push(status);

            // Set completion time if status shifts to ACTIVATED
            if (status === "ACTIVATED") {
                updates.push(`"activationCompletedAt" = CURRENT_TIMESTAMP`);
            }
        }

        if (selectedWorkflowId !== undefined) {
            updates.push(`"selectedWorkflowId" = $${paramIndex++}`);
            params.push(selectedWorkflowId);
        }

        if (metadata !== undefined) {
            // Append or replace activationState metadata
            const existingState = current.activationState || {};
            const mergedState = { ...existingState, ...metadata };
            updates.push(`"activationState" = $${paramIndex++}`);
            params.push(JSON.stringify(mergedState));
        }

        params.push(userId);
        await db.execute(
            `UPDATE "User" SET ${updates.join(", ")} WHERE id = $${paramIndex}`,
            params
        );

        // Log telemetry events for activation step tracking
        try {
            const { logAudit } = await import("@/lib/audit");
            if (status) {
                await logAudit(userId, 'activation_step_completed', status, { selectedWorkflowId });
            }
            if (selectedWorkflowId) {
                await logAudit(userId, 'blueprint_matched', selectedWorkflowId);
            }
        } catch (auditErr) {
            console.error("Non-fatal: Failed to log activation audit events:", auditErr);
        }

        return NextResponse.json({ success: true, updatedStatus: status });
    } catch (error: any) {
        console.error("[ACTIVATION_API_POST] Error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
