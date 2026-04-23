import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * PATCH /api/workflows/run
 * Body: { workflowId: string, action: 'start' | 'end' }
 * Persists the user-triggered run state to the DB so it survives page refreshes.
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

        // Map action → status value
        const newStatus = action === 'start' ? 'Active' : 'Passive';

        // Only allow updating workflows that belong to this team
        await db.execute(
            `UPDATE "Workflow" SET status = $1, "updatedAt" = CURRENT_TIMESTAMP
             WHERE id = $2 AND "teamId" = $3`,
            [newStatus, workflowId, teamId]
        );

        return NextResponse.json({ success: true, status: newStatus });
    } catch (error: any) {
        console.error("[WORKFLOW_RUN_PATCH] Error:", error.message);
        return NextResponse.json({ error: "Failed to persist run state" }, { status: 500 });
    }
}
