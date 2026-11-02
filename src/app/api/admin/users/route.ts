import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { getAdminSession } from "@/lib/admin-auth";

async function ensureSchema() {
    await db.execute(`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS plan VARCHAR(50) DEFAULT 'Starter',
        ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'MEMBER',
        ADD COLUMN IF NOT EXISTS "teamId" UUID,
        ADD COLUMN IF NOT EXISTS tier VARCHAR(50) DEFAULT 'Free',
        ADD COLUMN IF NOT EXISTS "totalSpend" DECIMAL(15,2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP,
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active',
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "Team" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            "ownerId" UUID,
            "firmName" VARCHAR(255),
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await db.execute(`
        ALTER TABLE "Team"
        ADD COLUMN IF NOT EXISTS "serverId" UUID,
        ADD COLUMN IF NOT EXISTS "provisioningStatus" VARCHAR(50) DEFAULT 'NOT_STARTED',
        ADD COLUMN IF NOT EXISTS "assignedAt" TIMESTAMP
    `);
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "ClusterNode" (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255),
            status VARCHAR(50) DEFAULT 'Active',
            "teamId" UUID,
            "lastHeartbeat" TIMESTAMP,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    await db.execute(`
        ALTER TABLE "ClusterNode"
        ADD COLUMN IF NOT EXISTS "is_assignable" BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS url TEXT,
        ADD COLUMN IF NOT EXISTS api_key TEXT,
        ADD COLUMN IF NOT EXISTS max_workflows INTEGER DEFAULT 100,
        ADD COLUMN IF NOT EXISTS "customerId" TEXT,
        ADD COLUMN IF NOT EXISTS "customerName" TEXT,
        ADD COLUMN IF NOT EXISTS "customerEmail" TEXT,
        ADD COLUMN IF NOT EXISTS "instanceId" TEXT,
        ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'manual',
        ADD COLUMN IF NOT EXISTS "region" TEXT,
        ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
        ADD COLUMN IF NOT EXISTS "sshKeyId" TEXT,
        ADD COLUMN IF NOT EXISTS "contaboInstanceId" TEXT
    `);
}

export async function GET(request: Request) {
    try {
        await ensureSchema();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');
        const fetchActivity = searchParams.get('activity') === 'true';

        if (userId && fetchActivity) {
            const logs = await db.query(`
                SELECT 
                    id,
                    "eventType" as action,
                    metadata,
                    "createdAt"
                FROM "Event" 
                WHERE "userId" = $1 
                ORDER BY "createdAt" DESC 
                LIMIT 50
            `, [userId]) as any[];

            // Map database events to UI-friendly activity logs
            const mappedLogs = logs.map(log => {
                let title = log.action.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                let description = 'System event recorded';
                
                if (log.metadata) {
                    const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
                    if (meta.target) description = meta.target;
                    else if (meta.newRole) description = `Role updated to ${meta.newRole}`;
                    else if (meta.newStatus) description = `Status updated to ${meta.newStatus}`;
                }

                return {
                    title,
                    description,
                    createdAt: log.createdAt,
                    action: log.action
                };
            });

            return NextResponse.json(mappedLogs);
        }

        const rows = await db.query(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u."firmName", 
                u.plan as role,
                u.tier,
                u."totalSpend",
                u."lastActive",
                u.status,
                u."teamId",
                u."onboardingStatus",
                u.industry,
                u."activationStatus",
                u."selectedWorkflowId",
                u."activationStartedAt",
                u."activationCompletedAt",
                u."activationState",
                u."aiEmployee",
                u."problemDescription",
                t."serverId" as "assignedServerId",
                t."provisioningStatus" as "assignmentStatus",
                n.name as "serverName",
                n.status as "serverStatus",
                COALESCE(
                    (
                        SELECT json_agg(json_build_object(
                            'provider', c.provider,
                            'status', c.status
                        ))
                        FROM "credentials" c
                        WHERE c."user_id" = u.id
                    ),
                    '[]'::json
                ) as "connectedCredentials",
                COALESCE(
                    (
                        SELECT json_agg(json_build_object(
                            'id', w.id,
                            'name', w.name,
                            'status', w.status,
                            'progress', w.progress,
                            'tasksCount', w."tasksCount",
                            'lastRun', w."lastRun"
                        ))
                        FROM "Workflow" w
                        WHERE w."teamId" = u."teamId"
                    ),
                    '[]'::json
                ) as "workflowsUsed",
                (
                    SELECT COUNT(*)::int 
                    FROM "AIEmployee" 
                    WHERE "teamId" = u."teamId"
                ) as "activeEmployeesCount",
                u."updatedAt" as "createdAt" 
            FROM "User" u
            LEFT JOIN "Team" t ON u."teamId" = t.id
            LEFT JOIN "ClusterNode" n ON t."serverId" = n.id
            ORDER BY u."updatedAt" DESC
        `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await ensureSchema();
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { id, role, tier, status, totalSpend, action, subject, title, message, newPassword } = body;

        if (action === 'REASSIGN_SERVER' || tier !== undefined || totalSpend !== undefined) {
            if (admin.role !== 'SuperAdmin') {
                return NextResponse.json({ error: "Forbidden: SuperAdmin role required for server/billing access" }, { status: 403 });
            }
        }

        if (action === 'REASSIGN_SERVER') {
            const { targetServerId } = body;
            if (!id || !targetServerId) return NextResponse.json({ error: "Missing User ID or target server ID" }, { status: 400 });

            const [user] = await db.query('SELECT "teamId" FROM "User" WHERE id = $1 LIMIT 1', [id]) as any[];
            if (!user || !user.teamId) {
                return NextResponse.json({ error: "Workspace not found for this user context" }, { status: 404 });
            }
            const teamId = user.teamId;

            const [node] = await db.query('SELECT * FROM "ClusterNode" WHERE id = $1 LIMIT 1', [targetServerId]) as any[];
            if (!node) {
                return NextResponse.json({ error: "Target server node not found" }, { status: 404 });
            }

            await db.execute(
                `UPDATE "Team" SET 
                    "serverId" = $1, 
                    "assignedAt" = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [targetServerId, teamId]
            );

            const { transitionTeamProvisioningStatus } = await import("@/lib/workflow-provision");
            const { PROVISIONING_STATUS } = await import("@/lib/provisioning-lifecycle");
            await transitionTeamProvisioningStatus(teamId, PROVISIONING_STATUS.READY);

            await db.execute(
                'UPDATE "ClusterNode" SET "teamId" = $1 WHERE id = $2 AND "teamId" IS NULL',
                [teamId, targetServerId]
            );

            await db.execute(
                'UPDATE "Workflow" SET "serverId" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "teamId" = $2',
                [targetServerId, teamId]
            );

            await logAudit(id, 'server_reassigned', `Workspace reassigned to server ${node.name}`, { targetServerId, nodeName: node.name });

            return NextResponse.json({ success: true, serverName: node.name });
        }

        if (action === 'RESET_ACTIVATION') {
            if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
            await db.execute(
                `UPDATE "User" SET 
                    "activationStatus" = 'SUMMARY_READY',
                    "selectedWorkflowId" = NULL,
                    "activationCompletedAt" = NULL,
                    "activationState" = '{}'::jsonb
                 WHERE id = $1`,
                [id]
            );
            await logAudit(id, 'admin_change', 'Admin reset onboarding activation state');
            return NextResponse.json({ success: true });
        }

        if (action === 'RESET_PASSWORD') {
            if (!id || !newPassword) return NextResponse.json({ error: "Missing ID or Password" }, { status: 400 });
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.execute('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPassword, id]);
            
            await logAudit(id, 'password_reset', 'Admin reset user password');
            return NextResponse.json({ success: true });
        }

        if (action === 'SEND_EMAIL') {
            if (!id || !subject || !title || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
            
            try {
                const target = await db.query('SELECT email FROM "User" WHERE id = $1', [id]) as any[];
                if (target.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

                const { sendCustomEmail } = await import("@/lib/mail");
                await sendCustomEmail(target[0].email, subject, title, message);
                
                await logAudit(id, 'admin_mail', 'Admin sent system communication', { subject });
                return NextResponse.json({ success: true });
            } catch (err) {
                console.error("Admin mail failure:", err);
                return NextResponse.json({ error: "Email dispatch failure" }, { status: 500 });
            }
        }

        if (id) {
            // Update user business fields
            const updates = [];
            const params = [];
            let i = 1;

            if (role !== undefined) { updates.push(`plan = $${i++}`); params.push(role); }
            if (tier !== undefined) { updates.push(`tier = $${i++}`); params.push(tier); }
            if (status !== undefined) { updates.push(`status = $${i++}`); params.push(status); }
            if (totalSpend !== undefined) { updates.push(`"totalSpend" = $${i++}`); params.push(totalSpend); }

            if (updates.length > 0) {
                params.push(id);
                await db.execute(
                    `UPDATE "User" SET ${updates.join(', ')} WHERE id = $${i}`,
                    params
                );

                // Log specific changes
                if (role !== undefined) await logAudit(id, 'role_change', 'Admin Dashboard', { newRole: role });
                if (status !== undefined) await logAudit(id, 'admin_change', 'User Status Update', { newStatus: status });
                if (tier !== undefined) await logAudit(id, 'admin_change', 'Plan/Tier Update', { newTier: tier });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await ensureSchema();
        const admin = await getAdminSession();
        if (!admin || admin.role !== 'SuperAdmin') {
            return NextResponse.json({ error: "Forbidden: SuperAdmin role required" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // PostgreSQL uses single quotes for strings
        await db.execute('DELETE FROM "User" WHERE id = $1 AND plan != \'SuperAdmin\'', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
