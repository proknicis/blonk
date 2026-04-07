"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Zap, CheckCircle, AlertCircle, Plus, FileText, Link2, ArrowUpRight, ShieldCheck, ShieldAlert } from "lucide-react";
import FleetVelocityChart from "./components/FleetVelocityChart";
import WorkflowList from "./components/WorkflowList";

interface DashboardData {
    totalWorkflows: number;
    activeAgents: number;
    totalTasks: number;
    timeSavedHours: number;
    failedRuns: number;
    efficiencyRate: number;
    chartData: Array<{
        name: string;
        data: number[];
    }>;
    topWorkflows: Array<any>;
    intelligenceFeed: Array<{
        title: string;
        meta: string;
        type: string;
        time: string;
    }>;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/dashboard/summary');
                const result = await res.json();
                if (result && !result.error) {
                    setData(result);
                }
            } catch (error) {
                console.error("Dashboard synchronization failure", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading || !data) {
        return (
            <div className={styles.dashboardLoading}>
                <div className={styles.pulseDot} />
                <span>Synchronizing sovereign analytics...</span>
            </div>
        );
    }

    const isEmpty = data.totalWorkflows === 0;

    return (
        <div className={styles.dashboard}>
            
            {/* SOVEREIGN INTEGRITY PANEL */}
            <div className={styles.integrityBanner}>
                <div className={styles.integrityInfo}>
                    <div className={data.failedRuns > 0 ? styles.statusIndicatorCritical : styles.statusIndicatorHealthy}>
                        <div className={styles.pulseEffect} />
                    </div>
                    <div>
                        <h4 className={styles.integrityTitle}>
                            {data.failedRuns > 0 ? `${data.failedRuns} Execution Interruptions detected` : `Systems Integrity: ${data.efficiencyRate}% Operational`}
                        </h4>
                        <p className={styles.integritySubtitle}>
                            {data.failedRuns > 0 ? `Manual intervention may be required in failing autonomous loops.` : `Fleet throughput is stable across all active firm sectors.`}
                        </p>
                    </div>
                </div>
                <div className={styles.integrityMetrics}>
                    <span className={styles.metricLabel}>Real-time Efficiency:</span>
                    <span className={styles.metricValue}>{data.efficiencyRate}%</span>
                </div>
            </div>

            {/* METRICS CORE */}
            <div className={styles.metricsMatrix}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Fleet Operations</span>
                        <Zap size={14} className={styles.accentIcon} />
                    </div>
                    <div className={styles.value}>{data.totalTasks.toLocaleString()}</div>
                    <div className={styles.trend}>Total tasks automated</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Capacity Saved</span>
                        <span className={styles.neutralBadge}>Real-time</span>
                    </div>
                    <div className={styles.value}>{data.timeSavedHours}h</div>
                    <div className={styles.trend}>Hours reclaimed to date</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Active Loops</span>
                        <div className={styles.activeDot} />
                    </div>
                    <div className={styles.value}>{data.activeAgents} / {data.totalWorkflows}</div>
                    <div className={styles.trend}>Running workflow units</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Disruption Events</span>
                        {data.failedRuns === 0 ? <ShieldCheck size={14} color="#34D186"/> : <ShieldAlert size={14} color="#EF4444"/>}
                    </div>
                    <div className={data.failedRuns > 0 ? styles.valueCritical : styles.value}>
                        {data.failedRuns}
                    </div>
                    <div className={styles.trend}>Failures in last 24h</div>
                </div>
            </div>

            {/* ANALYTICS PROJECTION */}
            <div className={styles.projectionSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Fleet Velocity Projection</h3>
                    <div className={styles.projectionLegend}>
                        <div className={styles.legendItem}><span /> Real Throughput (24h Window)</div>
                    </div>
                </div>
                <div className={styles.chartWrapper}>
                    <FleetVelocityChart initialData={data.chartData} />
                </div>
            </div>

            {isEmpty ? (
                <div className={styles.onboardingState}>
                   <div className={styles.onboardingIllustration}>
                       <Plus size={32} />
                   </div>
                   <h2 className={styles.onboardingTitle}>Initialize your autonomous firm</h2>
                   <p className={styles.onboardingSubtitle}>Your dashboard is empty because no workflows have been provisioned yet. Start by creating a custom automation loop.</p>
                   <div className={styles.onboardingActions}>
                       <Link href="/dashboard/workflows?create=true" className={styles.btnInstitutional}>
                           Generate Workflow
                       </Link>
                       <Link href="/dashboard/workflows" className={styles.btnOutline}>
                           Select Template
                       </Link>
                   </div>
                </div>
            ) : (
                <div className={styles.commandGrid}>
                    <div className={styles.activeWorkflows}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Operational Loops</h3>
                            <Link href="/dashboard/workflows" className={styles.viewAllLink}>
                                Marketplace <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <WorkflowList workflows={data.topWorkflows} />
                    </div>

                    <div className={styles.liveFeed}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Intelligence Feed</h3>
                        </div>
                        <div className={styles.feedWrapper}>
                            {data.intelligenceFeed && data.intelligenceFeed.length > 0 ? (
                                data.intelligenceFeed.map((item, idx) => (
                                    <div key={idx} className={styles.feedItem}>
                                        <div className={item.type === 'error' ? styles.feedDotError : styles.feedDotSuccess} />
                                        <div className={styles.feedContent}>
                                            <div className={styles.feedTitle}>{item.title}</div>
                                            <div className={styles.feedMeta}>{item.meta}</div>
                                            <div className={styles.feedTime}>{item.time}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8' }}>
                                    <Activity size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                    <p style={{ fontWeight: 800 }}>No recent operational activity detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
