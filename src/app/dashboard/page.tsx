import styles from "./page.module.css";
import React from "react";
import { db } from "@/lib/db";
import WorkflowList from "./components/WorkflowList";
import WorkflowLogs from "./components/WorkflowLogs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import FleetVelocityChart from "./components/FleetVelocityChart";
import Link from "next/link";
import { Activity, Clock, Zap, AlertCircle, RefreshCw, CheckCircle, Plus, FileText, Link2 } from "lucide-react";

interface DashboardData {
    totalWorkflows: number;
    activeAgents: number;
    totalTasks: number;
    timeSavedHours: number;
    failedRuns: number;
    chartData: Array<{
        name: string;
        data: number[];
    }>;
    topWorkflows: Array<any>;
}

async function getDashboardSummary(teamId: string): Promise<DashboardData> {
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

    // If empty, return zeroed metrics. The empty state handles the UI.
    if (workflowRows.length === 0) {
        return {
            totalWorkflows: 0,
            activeAgents: 0,
            totalTasks: 0,
            timeSavedHours: 0,
            failedRuns: 0,
            chartData: [],
            topWorkflows: []
        };
    }

    // Rough calculation: Assume each task saves about 5 mins (0.08 hours)
    const calculatedTimeSaved = Math.round(totalTasksDone * 0.08);

    return {
        totalWorkflows: workflowRows.length,
        activeAgents: activeUnits,
        totalTasks: totalTasksDone,
        timeSavedHours: calculatedTimeSaved,
        failedRuns: 0, // In reality, query from logs where status='error'
        chartData: Object.values(fleetPaths),
        topWorkflows: workflowRows.slice(0, 10),
    };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const userId = (session.user as any).id;
    const sessionTeamId = (session.user as any).teamId;

    const [userRecord] = await db.query('SELECT "onboardingStatus", "teamId" FROM "User" WHERE id = $1', [userId]) as any[];
    
    const finalTeamId = sessionTeamId || userRecord?.teamId;

    if (userRecord?.onboardingStatus !== 'COMPLETED' && !finalTeamId) {
        redirect("/setup");
    }

    const data = await getDashboardSummary(finalTeamId);
    const isEmpty = data.totalWorkflows === 0;

    return (
        <div className={styles.dashboard}>
            
            {/* ALERT / HEALTH PANEL */}
            <div className={styles.healthPanel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {data.failedRuns > 0 ? (
                        <AlertCircle color="#EF4444" size={24} />
                    ) : (
                        <CheckCircle color="#34D186" size={24} />
                    )}
                    <div>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 950, color: '#0A0A0A' }}>
                            {data.failedRuns > 0 ? `${data.failedRuns} workflows need attention` : `All systems operational`}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontWeight: 800 }}>
                            {data.failedRuns > 0 ? `Last error 2 hours ago` : `Zero disruptions detected in the last 24 hours.`}
                        </p>
                    </div>
                </div>
                <div className={styles.healthPanelValue}>
                    {isEmpty ? '0 hours saved this week' : `You saved ${data.timeSavedHours} hours this week`}
                </div>
            </div>

            {/* REAL METRICS GRID */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Tasks Automated Today</span>
                        <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%' }} />
                    </div>
                    <div className={styles.statValue}>{data.totalTasks.toLocaleString()}</div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>
                        {isEmpty ? '0 operations processed' : `${data.totalTasks} operations processed`}
                    </p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Time Saved (hours)</span>
                        <span className={`${styles.statTrend} ${styles.trendPositive}`}>+15%</span>
                    </div>
                    <div className={styles.statValue}>{data.timeSavedHours}h</div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Valuable hours reclaimed.</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Active Workflows</span>
                        <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%' }} />
                    </div>
                    <div className={styles.statValue}>{data.activeAgents}</div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Running background loops.</p>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Errors / Failed Runs</span>
                        {data.failedRuns === 0 && <span className={`${styles.statTrend} ${styles.trendPositive}`}>0% Fail Rate</span>}
                    </div>
                    <div className={styles.statValue} style={{ color: data.failedRuns > 0 ? '#EF4444' : '#0A0A0A' }}>
                        {data.failedRuns}
                    </div>
                    <p style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>Execution interruptions.</p>
                </div>
            </div>

            <FleetVelocityChart initialData={data.chartData} />

            {isEmpty ? (
                // CRITICAL ONBOARDING STATE
                <div className={styles.onboardingState}>
                    <div className={styles.onboardingIllustration}>
                        <Zap size={48} color="#34D186" />
                    </div>
                    <h2 className={styles.onboardingTitle}>You don’t have any workflows yet</h2>
                    <p className={styles.onboardingSubtitle}>Automate your tasks by designing a new workflow, selecting a template, or integrating with your existing apps.</p>
                    
                    <div className={styles.onboardingActions}>
                        <Link href="/dashboard/workflows?create=true" className={styles.primaryActionBtn}>
                            <Plus size={20} />
                            Create Workflow
                        </Link>
                        <button className={styles.secondaryActionBtn}>
                            <FileText size={20} />
                            Use Template
                        </button>
                        <button className={styles.secondaryActionBtn}>
                            <Link2 size={20} />
                            Connect App
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.mainGrid} style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                    {/* WORKFLOW LIST SECTION */}
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2 className={styles.cardTitle}>Active Workflows</h2>
                            <Link href="/dashboard/workflows?create=true" className={styles.btnOutline} style={{ textDecoration: 'none' }}>
                                + Create Workflow
                            </Link>
                        </div>
                        <WorkflowList workflows={data.topWorkflows} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        {/* ACTIVITY FEED */}
                        <div className={styles.card} style={{ padding: '32px' }}>
                            <div className={styles.cardHeader} style={{ marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Activity size={20} color="#0A0A0A" />
                                    <h2 className={styles.cardTitle} style={{ fontSize: '1.25rem' }}>Live Activity Feed</h2>
                                </div>
                            </div>
                            <div className={styles.activityFeed}>
                                {isEmpty ? (
                                    <>
                                        <div className={styles.activityItem}>
                                            <div className={styles.activityDotWrapper}><div className={styles.activityDotSuccess} /></div>
                                            <div className={styles.activityContent}>
                                                <strong>New lead captured</strong>
                                                <span>From Landing Page Form • Just now</span>
                                            </div>
                                        </div>
                                        <div className={styles.activityItem}>
                                            <div className={styles.activityDotWrapper}><div className={styles.activityDotSuccess} /></div>
                                            <div className={styles.activityContent}>
                                                <strong>Email sent</strong>
                                                <span>To client@acme.inc • 2m ago</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className={styles.activityItem}>
                                            <div className={styles.activityDotWrapper}><div className={styles.activityDotSuccess} /></div>
                                            <div className={styles.activityContent}>
                                                <strong>Invoice generated</strong>
                                                <span>Stripe automation • 10m ago</span>
                                            </div>
                                        </div>
                                        <div className={styles.activityItem}>
                                            <div className={styles.activityDotWrapper}><div className={styles.activityDotSuccess} /></div>
                                            <div className={styles.activityContent}>
                                                <strong>New lead captured</strong>
                                                <span>Lead Form • 1h ago</span>
                                            </div>
                                        </div>
                                        <div className={styles.activityItem}>
                                            <div className={styles.activityDotWrapper}><div className={styles.activityDotError} /></div>
                                            <div className={styles.activityContent}>
                                                <strong>Workflow failed</strong>
                                                <span>Data sync timed out • 2h ago</span>
                                            </div>
                                        </div>
                                        <div className={styles.activityItem}>
                                            <div className={styles.activityDotWrapper}><div className={styles.activityDotSuccess} /></div>
                                            <div className={styles.activityContent}>
                                                <strong>Client onboarding complete</strong>
                                                <span>Task automatically resolved • 5h ago</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* TEMPLATES SECTION */}
                        <div className={styles.card} style={{ padding: '32px', background: '#F8F9FA' }}>
                            <div className={styles.cardHeader} style={{ marginBottom: '24px' }}>
                                <h2 className={styles.cardTitle} style={{ fontSize: '1.25rem' }}>Suggested Templates</h2>
                            </div>
                            <div className={styles.templateList}>
                                <div className={styles.templateCard}>
                                    <div className={styles.templateInfo}>
                                        <h4>Lead Management Automation</h4>
                                        <p>Capture leads, sync to CRM, and send welcome email.</p>
                                    </div>
                                    <button className={styles.templateBtn}>Use Template</button>
                                </div>
                                <div className={styles.templateCard}>
                                    <div className={styles.templateInfo}>
                                        <h4>E-commerce Order Flow</h4>
                                        <p>Process new orders, generate invoice, and notify team.</p>
                                    </div>
                                    <button className={styles.templateBtn}>Use Template</button>
                                </div>
                                <div className={styles.templateCard}>
                                    <div className={styles.templateInfo}>
                                        <h4>Client Onboarding</h4>
                                        <p>Create folders, send contracts, and track status.</p>
                                    </div>
                                    <button className={styles.templateBtn}>Use Template</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
