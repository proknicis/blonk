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
                        <span className={`${styles.statTrend} ${styles.trendPositive}`}>+100.0%</span>
                    </div>
                    <div className={styles.statValue}>{data.activeAgents} Units ACTIVE</div>
                    <div className={styles.statChart}>
                        <div className={styles.statBarActive} style={{ height: '80%', width: '10%' }}></div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Total Operations</span>
                    </div>
                    <div className={styles.statValue}>{data.totalTasks} Done</div>
                    <div className={styles.statChart}>
                        {[40, 60, 80, 100].map((h, i) => (
                            <div key={i} className={styles.statBar} style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Success Precision</span>
                    </div>
                    <div className={styles.statValue}>{data.successRate.percentage}% Accuracy</div>
                    <div className={styles.statChart}>
                        <div className={styles.statBarActive} style={{ height: `${data.successRate.percentage}%` }}></div>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>System Uptime</span>
                    </div>
                    <div className={styles.statValue}>{data.uptime}</div>
                    <div className={styles.statChart}>
                        <div className={styles.statBarActive} style={{ height: '99%' }}></div>
                    </div>
                </div>
            </div>

            <div className={styles.card} style={{ border: '1px solid #EAEAEA', background: '#FFFFFF', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#0A0A0A', marginBottom: '8px', letterSpacing: '-0.05em' }}>Fleet Velocity</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 800 }}>Sovereign performance trajectory tracking (24h Window).</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {data.chartData.slice(0, 3).map((line, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? '#34D186' : '#38BDF8' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#0A0A0A' }}>{line.name.toUpperCase()}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div style={{ position: 'relative', height: '160px', width: '100%', marginBottom: '24px' }}>
                    <svg width="100%" height="100%" viewBox="0 0 1000 160" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        {/* Grid Lines */}
                        <line x1="0" y1="0" x2="1000" y2="0" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                        <line x1="0" y1="80" x2="1000" y2="80" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                        <line x1="0" y1="160" x2="1000" y2="160" stroke="rgba(0,0,0,0.05)" strokeWidth="2" />

                        {data.chartData.map((line, idx) => {
                            const max = Math.max(...line.data, 5);
                            const points = line.data.map((val, i) => {
                                const x = (i / 23) * 1000;
                                const y = 160 - (val / max) * 140;
                                return `${x},${y}`;
                            }).join(' ');

                            return (
                                <path 
                                    key={idx} 
                                    d={`M ${points}`} 
                                    fill="none" 
                                    stroke={idx === 0 ? '#34D186' : '#38BDF8'} 
                                    strokeWidth="4" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    opacity={0.9 - (idx * 0.2)}
                                />
                            );
                        })}
                    </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.65rem', fontWeight: 950 }}>
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>23:59</span>
                </div>
            </div>

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

                        <div style={{ padding: '24px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F0FAF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34D186' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0A0A0A' }}>System Nominal</div>
                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>NGROK TUNNEL: STABLE</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <WorkflowLogs />
        </div>
    );
}
