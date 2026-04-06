import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const teamId = (session.user as any).teamId;
        if (!teamId) return NextResponse.json({ error: 'Missing Team Anchor' }, { status: 400 });

        // Fetch marketplace templates (only published ones)
        const templates = await db.query('SELECT * FROM "WorkflowTemplate" WHERE status = \'Published\' OR status IS NULL');

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
        const { name, sector, performance, inputs } = body;

        const workflowId = uuidv4();
        const notificationId = uuidv4();

        // Register the asset in the Sovereign Team Ledger
        await db.execute(
            'INSERT INTO "Workflow" (id, "teamId", name, sector, status, performance, "tasksCount", inputs, "requestedBy") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [workflowId, teamId, name, sector, 'Pending', performance || '0', 0, JSON.stringify(inputs || {}), session.user.email?.toLowerCase()]
        );

        await db.execute(
            'INSERT INTO "Notification" (id, "teamId", title, message) VALUES ($1, $2, $3, $4)',
            [notificationId, teamId, 'Workflow Requested', `Firm has requested "${name}". Operational backend will sync shortly.`]
        );

        return NextResponse.json({ success: true, id: workflowId });
    } catch (error) {
        console.error('Error requesting workflow:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
