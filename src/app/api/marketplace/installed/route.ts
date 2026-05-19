import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { findWorkflowForTemplateTeam } from "@/lib/workflow-provision";

async function ensureSchema() {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS "MarketplaceInstallation" (
            id TEXT PRIMARY KEY,
            "templateId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "workflowId" TEXT,
            "serverId" TEXT,
            status TEXT DEFAULT 'pending',
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

/** Idempotent sync after Stripe redirect (webhook is source of truth for provisioning) */
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const userId = (session.user as any).id;
        const teamId = (session.user as any).teamId;

        await ensureSchema();

        const installations = await db.query(`
            SELECT mi.*,
                   wt.name as template_name,
                   wt.description as template_description,
                   cn.name as server_name,
                   cn.status as server_status,
                   w.status as workflow_status,
                   w.progress as workflow_progress
            FROM "MarketplaceInstallation" mi
            LEFT JOIN "WorkflowTemplate" wt ON mi."templateId" = wt.id
            LEFT JOIN "ClusterNode" cn ON mi."serverId" = cn.id
            LEFT JOIN "Workflow" w ON w.id = mi."workflowId"
            WHERE mi."userId" = $1
            ORDER BY mi."createdAt" DESC
        `, [userId]);

        if (teamId) {
            const teamWorkflows = await db.query(
                `SELECT w.*, wt.name as template_name
                 FROM "Workflow" w
                 LEFT JOIN "WorkflowTemplate" wt ON wt.id = w."templateId"
                 WHERE w."teamId" = $1
                 ORDER BY w."createdAt" DESC`,
                [teamId]
            );
            return NextResponse.json({ installations: installations || [], workflows: teamWorkflows || [] });
        }

        return NextResponse.json({ installations: installations || [], workflows: [] });
    } catch (error) {
        console.error('Error fetching installed items:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { templateId } = await request.json();
        const userId = (session.user as any).id;
        const teamId = (session.user as any).teamId;

        if (!templateId || !teamId) {
            return NextResponse.json({ error: 'Template ID and team required' }, { status: 400 });
        }

        await ensureSchema();

        const workflow = await findWorkflowForTemplateTeam(teamId, templateId);

        const existing = await db.query(
            'SELECT * FROM "MarketplaceInstallation" WHERE "templateId" = $1 AND "userId" = $2',
            [templateId, userId]
        );

        if (existing.length === 0) {
            await db.execute(
                'INSERT INTO "MarketplaceInstallation" (id, "templateId", "userId", "workflowId", status) VALUES ($1, $2, $3, $4, $5)',
                [`install_${Date.now()}`, templateId, userId, workflow?.id || null, workflow ? 'synced' : 'pending']
            );
        } else if (workflow?.id) {
            await db.execute(
                'UPDATE "MarketplaceInstallation" SET "workflowId" = $1, status = $2 WHERE "templateId" = $3 AND "userId" = $4',
                [workflow.id, 'synced', templateId, userId]
            );
        }

        return NextResponse.json({
            success: true,
            workflowId: workflow?.id,
            redirect: '/dashboard/incidents',
        });
    } catch (error) {
        console.error('Error syncing installation:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
