import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { provisionWorkflowAfterOrder } from "@/lib/workflow-provision";
import { WORKFLOW_STATUS } from "@/lib/workflow-lifecycle";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const teamId = (session.user as any).teamId;
        if (!teamId) return NextResponse.json({ error: 'Missing Team Anchor' }, { status: 400 });

        const templates = await db.query('SELECT * FROM "WorkflowTemplate" WHERE status IN (\'Published\', \'Live\') OR status IS NULL');
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
        const { name, sector, inputs, templateId } = body;

        if (!templateId) {
            return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
        }

        const [template] = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [templateId]) as any[];
        if (!template) {
            return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        const result = await provisionWorkflowAfterOrder({
            teamId,
            templateId,
            name: name || template.name,
            sector: sector || template.sector,
            requestedBy: session.user.email?.toLowerCase(),
            inputs,
            paid: false,
        });

        if (result.awaitingServer) {
            return NextResponse.json({
                success: true,
                id: result.workflowId,
                orchestration: {
                    status: WORKFLOW_STATUS.PROVISIONING,
                    message: 'Order received. A dedicated server will be assigned shortly.',
                },
            });
        }

        return NextResponse.json({
            success: true,
            id: result.workflowId,
            orchestration: {
                server: result.node?.name,
                serverUrl: result.node?.url,
                status: WORKFLOW_STATUS.AWAITING_CREDENTIALS,
                nextStep: '/dashboard/integrations',
            },
        });
    } catch (error) {
        console.error('Error requesting workflow:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
