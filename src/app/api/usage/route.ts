import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        // Fetch User Plan to see limits
        const userRows = await db.query('SELECT plan FROM "User" LIMIT 1');
        const currentTier = userRows[0]?.plan || 'Starter';

        // Fetch Total Active Loops
        const workflowRows = await db.query('SELECT COUNT(*) as count FROM "Workflow"');
        const activeLoops = workflowRows[0]?.count || 0;

        // Fetch Total Task Requests (from logs)
        const logRows = await db.query('SELECT COUNT(*) as count FROM "WorkflowLog"');
        const totalTasks = logRows[0]?.count || 0;

        const isPro = currentTier === 'Professional';

        return NextResponse.json({
            activeLoops: Number(activeLoops),
            activeLoopsLimit: isPro ? 5 : 1,
            totalTasks: Number(totalTasks),
            totalTasksLimit: isPro ? 500 : 10,
            proLoopsLimit: 5,
            proTasksLimit: 500,
            plan: currentTier
        });
    } catch (error) {
        console.error('Error fetching usage data:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
