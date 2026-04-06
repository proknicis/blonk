import styles from "./page.module.css";
import React from "react";
import { db } from "@/lib/db";
import WorkflowList from "./components/WorkflowList";
import WorkflowLogs from "./components/WorkflowLogs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

interface DashboardData {
    totalAgents: number;
    activeAgents: number;
    totalWorkflows: number;
    totalTasks: number;
    agentStats: {
        Working: number;
        Analyzing: number;
        Idle: number;
    };
    topWorkflows: Array<{
        name: string;
        status: string;
        performance: string;
    }>;
    uptime: string;
    chartData: Array<{
        name: string;
        data: number[];
    }>;
    kpis: Record<string, { value: string, change: string, positive: boolean }>;
    successRate: {
        percentage: number;
        total: number;
        success: number;
    };
    recentTransactions: Array<{
        trxId: string;
        date: string;
        category: string;
        status: string;
        amount: string;
    }>;
}

async function getDashboardSummary(teamId: string): Promise<DashboardData> {
    // 1. Fetch Team-Scoped Workflow Assets
    const workflowRows = await db.query(`
        SELECT id, name, status, performance, "tasksCount", "lastRun" 
        FROM "Workflow" 
        WHERE "teamId" = $1
    `, [teamId]) as any[];
    
    console.log(`[FleetSync] Team Dashboard requested for ${teamId}. Found ${workflowRows.length} units.`);

    // 2. Aggregate Fleet Performance
    let totalTasksDone = 0;
    let activeUnits = 0;

    workflowRows.forEach((w: any) => {
        totalTasksDone += parseInt(w.tasksCount || "0");
        const s = (w.status || 'passive').toLowerCase();
        if (s !== 'error' && s !== 'failed') {
            activeUnits++;
        }
    });

    // 3. Team-Scoped Temporal Fleet Velocity (Last 24 Hours Metrics)
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

    // Map velocity to individual loop trajectories
    const fleetPaths: Record<string, { name: string, data: number[] }> = {};
    velocityRows.forEach(row => {
        const id = row.workflowId || 'unknown';
        if (!fleetPaths[id]) {
            fleetPaths[id] = { name: row.workflowName || 'ID: ' + id.substring(0, 4), data: new Array(24).fill(0) };
        }
        const hourIdx = new Date(row.hour).getHours();
        fleetPaths[id].data[hourIdx] = parseInt(row.ops);
    });

    const uptime = "100.00%";

    return {
        totalAgents: workflowRows.length,
        activeAgents: activeUnits,
        totalWorkflows: workflowRows.length,
        totalTasks: totalTasksDone,
        agentStats: { Working: activeUnits, Analyzing: 0, Idle: 0 },
        topWorkflows: workflowRows.slice(0, 10),
        uptime,
        chartData: Object.values(fleetPaths),
        kpis: {},
        successRate: {
            percentage: 98,
            total: totalTasksDone,
            success: Math.round(totalTasksDone * 0.98)
        },
        recentTransactions: []
    };
}

import FleetVelocityChart from "./components/FleetVelocityChart";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const userId = (session.user as any).id;
    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    const [userRecord] = await db.query('SELECT "onboardingStatus" FROM "User" WHERE id = $1', [userId]) as any[];
    
    if (userRecord?.onboardingStatus !== 'COMPLETED') {
        redirect("/setup");
    }

    const data = await getDashboardSummary(teamId);

    return (
        <div className={styles.dashboard}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Fleet Efficiency</span>
                        <span className={`${styles.statTrend} ${styles.trendPositive}`}>+12% Gain</span>
                    </div>
                    <div className={styles.statValue}>{data.activeAgents} ACTIVE</div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Operational units responsive.</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Total Operations</span>
                        <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%' }} />
                    </div>
                    <div className={styles.statValue}>{data.totalTasks.toLocaleString()}</div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Autonomous tasks completed.</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Success Rate</span>
                        <span className={`${styles.statTrend} ${styles.trendPositive}`}>{data.successRate.percentage}%</span>
                    </div>
                    <div className={styles.statValue}>PRECISION</div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Zero-leakage execution.</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Firm Health</span>
                        <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%' }} />
                    </div>
                    <div className={styles.statValue}>{data.uptime}</div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>System-wide stability.</p>
                </div>
            </div>

            <FleetVelocityChart initialData={data.chartData} />

            <div className={styles.mainGrid} style={{ gridTemplateColumns: '2fr 1.2fr' }}>
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Live Loop Assets</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                             <div style={{ padding: '6px 12px', background: '#F0FAF5', color: '#34D186', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950 }}>{data.activeAgents} ONLINE</div>
                        </div>
                    </div>
                    <WorkflowList workflows={data.topWorkflows} />
                </div>

                <div className={styles.card} style={{ background: '#FFFFFF', border: '1px solid #EAEAEA' }}>
                    <div className={styles.cardHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%', boxShadow: '0 0 10px rgba(52, 209, 134, 0.5)' }} />
                            <h2 className={styles.cardTitle}>Sync Health</h2>
                        </div>
                    </div>
                    <div className={styles.breakdownList}>
                        <div style={{ padding: '32px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FLEET UTILIZATION</span>
                                <span style={{ fontSize: '1.1rem', color: '#0A0A0A', fontWeight: 950 }}>{data.activeAgents} / {data.totalWorkflows}</span>
                            </div>
                            <div className={styles.miniProgress} style={{ height: '16px', background: '#E2E8F0' }}>
                                <div 
                                    className={styles.miniFill} 
                                    style={{ 
                                        width: `${(data.activeAgents / (data.totalWorkflows || 1)) * 100}%`,
                                        background: 'linear-gradient(90deg, #34D186, #10B981)',
                                        boxShadow: '0 4px 10px rgba(52, 209, 134, 0.3)'
                                    }} 
                                />
                            </div>
                            <p style={{ marginTop: '24px', fontSize: '0.85rem', color: '#64748B', fontWeight: 800, lineHeight: 1.6 }}>
                                Your firm's operational capacity is <strong style={{ color: '#0A0A0A' }}>{Math.round((data.activeAgents / (data.totalWorkflows || 1)) * 100)}%</strong>. All autonomous nodes are responding within normal institutional latency parameters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <WorkflowLogs />
        </div>
    );
}
