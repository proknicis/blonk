import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
            if (s === 'active' || s === 'running' || s === 'success') { // success could be a transient state
                activeUnits++;
            }
        });

        // 2. Fetch Velocity Chart Data (Real logs from last 24h)
        const velocityRows = await db.query(`
            SELECT 
                "workflowName",
                DATE_TRUNC('hour', "createdAt") as hour, 
                COUNT(*) as ops
            FROM "WorkflowLog" 
            WHERE "teamId" = $1
            AND "createdAt" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
            GROUP BY "workflowName", hour
            ORDER BY hour ASC
        `, [teamId]) as any[];

        const fleetPaths: Record<string, { name: string, data: number[] }> = {};
        velocityRows.forEach(row => {
            const name = row.workflowName || 'Sector Alpha';
            if (!fleetPaths[name]) {
                fleetPaths[name] = { name: name, data: new Array(24).fill(0) };
            }
            const hourIdx = new Date(row.hour).getHours();
            if (hourIdx >= 0 && hourIdx < 24) {
                fleetPaths[name].data[hourIdx] = parseInt(row.ops);
            }
        });

        // 3. Fetch Real Failed Runs (Last 24h)
        const failedRunsRes = await db.query(`
            SELECT COUNT(*) as count 
            FROM "WorkflowLog" 
            WHERE "teamId" = $1 
            AND (status = 'error' OR status = 'failed')
            AND "createdAt" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        `, [teamId]) as any[];
        const failedRunsCount = parseInt(failedRunsRes[0]?.count || "0");

        // 4. Fetch Intelligence Feed (Real recent logs)
        const feedLogs = await db.query(`
            SELECT "workflowName" as title, result as meta, status as type, "createdAt" as time
            FROM "WorkflowLog"
            WHERE "teamId" = $1
            ORDER BY "createdAt" DESC
            LIMIT 10
        `, [teamId]) as any[];

        const formattedFeed = feedLogs.map(log => ({
            title: log.title || "Autonomous Event",
            meta: formatResultMessage(log.meta),
            type: (log.type === 'error' || log.type === 'failed') ? 'error' : (log.type === 'info' ? 'info' : 'success'),
            time: formatTimeAgo(new Date(log.time))
        }));

        const calculatedTimeSaved = Math.round(totalTasksDone * 0.08); // 0.08 hours per task
        
        // Calculate real efficiency percentage
        const totalLogs = await db.query(`SELECT COUNT(*) as count FROM "WorkflowLog" WHERE "teamId" = $1 AND "createdAt" > CURRENT_TIMESTAMP - INTERVAL '24 hours'`, [teamId]) as any[];
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

function formatResultMessage(meta: any) {
    if (!meta) return "System operation finalized.";
    if (typeof meta === 'string') {
        try {
            const parsed = JSON.parse(meta);
            if (typeof parsed === 'object') return parsed.message || parsed.status || "Data packet synchronized.";
            return meta.substring(0, 60);
        } catch {
            return meta.substring(0, 60);
        }
    }
    return "Data packet synchronized.";
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
