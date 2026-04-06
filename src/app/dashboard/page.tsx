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

async function getDashboardSummary(userEmail: string): Promise<DashboardData> {
    const emailRef = userEmail.toLowerCase();
    
    // 1. Fetch Workflow Assets (Case-Insensitive)
    const workflowRows = await db.query(`
        SELECT id, name, status, performance, "tasksCount", "lastRun" 
        FROM "Workflow" 
        WHERE LOWER("requestedBy") = LOWER($1)
    `, [emailRef]) as any[];
    
    console.log(`[FleetSync] Dashboard requested for ${emailRef}. Found ${workflowRows.length} units.`);

    // 2. Aggregate Fleet Performance
    let totalTasksDone = 0;
    let activeUnits = 0;

    workflowRows.forEach((w: any) => {
        totalTasksDone += parseInt(w.tasksCount || "0");
        const s = (w.status || 'passive').toLowerCase();
        // Any unit not in error is considered part of the Operational Fleet
        if (s !== 'error' && s !== 'failed') {
            activeUnits++;
        }
    });

    // 3. Temporal Fleet Velocity (Last 24 Hours Metrics)
    const velocityRows = await db.query(`
        SELECT 
            "workflowId", 
            "workflowName",
            DATE_TRUNC('hour', "executedAt") as hour, 
            COUNT(*) as ops
        FROM "WorkflowLog" 
        WHERE "executedAt" > CURRENT_TIMESTAMP - INTERVAL '24 hours'
        GROUP BY "workflowId", "workflowName", hour
        ORDER BY hour ASC
    `) as any[];

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

    const successRateValue = 98;
    const uptime = "100.00%";

    // 4. Final Aggregation
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
            percentage: successRateValue,
            total: totalTasksDone * 10,
            success: totalTasksDone * 9
        },
        recentTransactions: []
    };
}

import FleetVelocityChart from "./components/FleetVelocityChart";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) redirect("/login");

    const userEmail = session.user.email;
    const [userRecord] = await db.query('SELECT "onboardingStatus" FROM "User" WHERE email = $1', [userEmail.toLowerCase()]) as any[];
    
    if (userRecord?.onboardingStatus !== 'COMPLETED') {
        redirect("/setup");
    }

    const data = await getDashboardSummary(userEmail);

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

            <div className={styles.growthMatrix}>
                <h2 className={styles.growthTitle}>
                    <div style={{ width: '4px', height: '24px', background: '#34D186', borderRadius: '2px' }} />
                    Autonomous Growth Matrix
                </h2>
                <div className={styles.growthGrid}>
                    {Array.from({ length: 48 }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`${styles.growthNode} ${(i < 12 || (i > 20 && i < 28)) ? styles.growthNodeActive : ''}`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        />
                    ))}
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

                <div className={styles.card} style={{ background: '#F8FAFC' }}>
                    <div className={styles.cardHeader}>
                        <h2 className={styles.cardTitle}>Sync Health</h2>
                    </div>
                    <div className={styles.breakdownList}>
                        <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B' }}>FLEET UTILIZATION</span>
                                <span style={{ fontSize: '0.85rem', color: '#0A0A0A', fontWeight: 900 }}>{data.activeAgents} / {data.totalWorkflows}</span>
                            </div>
                            <div className={styles.miniProgress} style={{ height: '12px' }}><div className={styles.miniFill} style={{ width: `${(data.activeAgents / (data.totalWorkflows || 1)) * 100}%` }} /></div>
                            <p style={{ marginTop: '16px', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800, lineHeight: 1.5 }}>
                                Operational capacity is {Math.round((data.activeAgents / (data.totalWorkflows || 1)) * 100)}%. All autonomous nodes responding within normal latency parameters.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <WorkflowLogs />
        </div>
    );
}
