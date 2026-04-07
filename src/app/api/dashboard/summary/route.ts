import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamId = (session.user as any).teamId;
    if (!teamId) return NextResponse.json({ error: "No team context" }, { status: 400 });

    try {
        const workflowRows = await db.query(`
            SELECT id, name, status, performance, "tasksCount", "lastRun" 
            FROM "Workflow" 
            WHERE "teamId" = $1
        `, [teamId]) as any[];
        
        let totalTasksDone = 0;
        let activeUnits = 0;

        workflowRows.forEach((w: any) => {
            totalTasksDone += parseInt(w.tasksCount || "0");
            const s = (w.status || 'passive').toLowerCase();
            if (s !== 'error' && s !== 'failed') {
                activeUnits++;
            }
        });

        const velocityRows = await db.query(`
            SELECT 
                "workflowId", 
                "workflowName",
                DATE_TRUNC('hour', "executedAt") as hour, 
                COUNT(*) as ops
            FROM "WorkflowLog" 
            WHERE "teamId" = $1
            AND "executedAt" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
            GROUP BY "workflowId", "workflowName", hour
            ORDER BY hour ASC
        `, [teamId]) as any[];

        const fleetPaths: Record<string, { name: string, data: number[] }> = {};
        velocityRows.forEach(row => {
            const id = row.workflowId || 'unknown';
            if (!fleetPaths[id]) {
                fleetPaths[id] = { name: row.workflowName || 'ID: ' + id.substring(0, 4), data: new Array(24).fill(0) };
            }
            const hourIdx = new Date(row.hour).getHours();
            fleetPaths[id].data[hourIdx] = parseInt(row.ops);
        });

        const calculatedTimeSaved = Math.round(totalTasksDone * 0.08);

        return NextResponse.json({
            totalWorkflows: workflowRows.length,
            activeAgents: activeUnits,
            totalTasks: totalTasksDone,
            timeSavedHours: calculatedTimeSaved,
            failedRuns: 0, // In production, query logs for 'error' status
            chartData: Object.values(fleetPaths),
            topWorkflows: workflowRows.slice(0, 5),
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
