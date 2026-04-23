import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    console.log("[DASHBOARD_SUMMARY_API] Fetched Session:", JSON.stringify(session, null, 2));

    if (!session?.user) {
        console.log("[DASHBOARD_SUMMARY_API] Missing user in session. Returning 401.");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (session.user as any).teamId;
    console.log("[DASHBOARD_SUMMARY_API] Extracted teamId:", teamId);

    if (!teamId) {
        console.log("[DASHBOARD_SUMMARY_API] Missing teamId. Rejecting request with 400.");
        return NextResponse.json({ error: "No team context" }, { status: 400 });
    }

    try {
        // 1. Fetch Workflows summary (only existing workflows for this team)
        const workflowRows = await db.query(`
            SELECT id, name, status, performance, "tasksCount", "lastRun", "n8nWorkflowId", "n8nWebhookUrl"
            FROM "Workflow" 
            WHERE "teamId" = $1
        `, [teamId]) as any[];
        
        const workflowIds = workflowRows.map(w => w.id);
        const hasWorkflows = workflowIds.length > 0;

        let totalTasksDone = 0;
        let activeUnits = 0;

        workflowRows.forEach((w: any) => {
            totalTasksDone += parseInt(w.tasksCount || "0");
            const s = (w.status || 'passive').toLowerCase();
            if (s === 'active' || s === 'running' || s === 'success') {
                activeUnits++;
            }
        });

        // 2. Fetch Velocity Chart Data (Last 24h, only for existing workflows)
        let velocityRows = [];
        if (hasWorkflows) {
            velocityRows = await db.query(`
                SELECT 
                    "workflowName",
                    DATE_TRUNC('hour', "createdAt") as hour, 
                    COUNT(*) as ops
                FROM "WorkflowLog" 
                WHERE "teamId" = $1
                AND "workflowId" = ANY($2)
                AND "createdAt" > NOW() - INTERVAL '24 hours'
                GROUP BY "workflowName", hour
                ORDER BY hour ASC
            `, [teamId, workflowIds]) as any[];
        }

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

        // 3. Fetch Real Failed Runs (Last 24h, only for existing workflows)
        let failedRunsCount = 0;
        if (hasWorkflows) {
            const failedRunsRes = await db.query(`
                SELECT COUNT(*) as count 
                FROM "WorkflowLog" 
                WHERE "teamId" = $1 
                AND "workflowId" = ANY($2)
                AND (status = 'error' OR status = 'failed')
                AND "createdAt" > NOW() - INTERVAL '24 hours'
            `, [teamId, workflowIds]) as any[];
            failedRunsCount = parseInt(failedRunsRes[0]?.count || "0");
        }

        // 4. Fetch Intelligence Feed (Last 24h, only for existing workflows)
        let formattedFeed = [];
        if (hasWorkflows) {
            const feedLogs = await db.query(`
                SELECT "workflowName" as title, result as meta, status as type, "createdAt" as time
                FROM "WorkflowLog"
                WHERE "teamId" = $1
                AND "workflowId" = ANY($2)
                AND "createdAt" > NOW() - INTERVAL '24 hours'
                ORDER BY "createdAt" DESC
                LIMIT 30
            `, [teamId, workflowIds]) as any[];

            formattedFeed = feedLogs.map(log => {
                let richMeta = { message: "Data synchronized", metrics: null, activity: null };
                try {
                    if (log.meta) {
                        const parsed = typeof log.meta === 'string' ? JSON.parse(log.meta) : log.meta;
                        if (parsed.metrics || parsed.activity) {
                            richMeta = { 
                                message: parsed.activity?.action || "Operation complete",
                                metrics: parsed.metrics,
                                activity: parsed.activity
                            };
                        } else {
                            richMeta.message = parsed.message || parsed.status || "Data packet synchronized.";
                        }
                    }
                } catch (e) {}

                return {
                    title: log.title || "Autonomous Event",
                    meta: richMeta.message,
                    rich: richMeta,
                    type: (log.type === 'error' || log.type === 'failed') ? 'error' : (log.type === 'info' ? 'info' : 'success'),
                    time: formatTimeAgo(new Date(log.time))
                };
            });
        }

        const calculatedTimeSaved = Math.round(totalTasksDone * 0.08); // 0.08 hours per task
        
        // Calculate real efficiency percentage
        let totalLogCount = 0;
        if (hasWorkflows) {
            const totalLogs = await db.query(`
                SELECT COUNT(*) as count 
                FROM "WorkflowLog" 
                WHERE "teamId" = $1 
                AND "workflowId" = ANY($2)
                AND "createdAt" > NOW() - INTERVAL '24 hours'
            `, [teamId, workflowIds]) as any[];
            totalLogCount = parseInt(totalLogs[0]?.count || "0");
        }
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
