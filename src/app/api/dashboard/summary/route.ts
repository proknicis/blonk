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
        // 1. Fetch Workflows summary
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
            if (s === 'active' || s === 'running') {
                activeUnits++;
            }
        });

        // 2. Fetch Velocity Chart Data (Real logs from last 24h)
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
                fleetPaths[id] = { name: row.workflowName || 'Sector ' + id.substring(0, 4), data: new Array(24).fill(0) };
            }
            const hourIdx = new Date(row.hour).getHours();
            if (hourIdx >= 0 && hourIdx < 24) {
                fleetPaths[id].data[hourIdx] = parseInt(row.ops);
            }
        });

        // 3. Fetch Real Failed Runs (Last 24h)
        const failedRunsRes = await db.query(`
            SELECT COUNT(*) as count 
            FROM "WorkflowLog" 
            WHERE "teamId" = $1 
            AND status = 'error' 
            AND "executedAt" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        `, [teamId]) as any[];
        const failedRunsCount = parseInt(failedRunsRes[0]?.count || "0");

        // 4. Fetch Intelligence Feed (Real recent logs)
        const feedLogs = await db.query(`
            SELECT "workflowName" as title, message as meta, status as type, "executedAt" as time
            FROM "WorkflowLog"
            WHERE "teamId" = $1
            ORDER BY "executedAt" DESC
            LIMIT 10
        `, [teamId]) as any[];

        const formattedFeed = feedLogs.map(log => ({
            title: log.title || "Autonomous Event",
            meta: log.meta || "System operation completed",
            type: log.type === 'error' ? 'error' : (log.type === 'info' ? 'info' : 'success'),
            time: formatTimeAgo(new Date(log.time))
        }));

        const calculatedTimeSaved = Math.round(totalTasksDone * 0.08); // 0.08 hours (approx 5 mins) per task
        
        // Calculate real efficiency percentage
        const totalLogs = await db.query(`SELECT COUNT(*) as count FROM "WorkflowLog" WHERE "teamId" = $1 AND "executedAt" > CURRENT_TIMESTAMP - INTERVAL '24 hours'`, [teamId]) as any[];
        const totalLogCount = parseInt(totalLogs[0]?.count || "0");
        const successRate = totalLogCount > 0 ? Math.round(((totalLogCount - failedRunsCount) / totalLogCount) * 1000) / 10 : 100;

        return NextResponse.json({
            totalWorkflows: workflowRows.length,
            activeAgents: activeUnits,
            totalTasks: totalTasksDone,
            timeSavedHours: calculatedTimeSaved,
            failedRuns: failedRunsCount,
            efficiencyRate: successRate,
            chartData: Object.values(fleetPaths),
            topWorkflows: workflowRows.slice(0, 5),
            intelligenceFeed: formattedFeed
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

function formatTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}
