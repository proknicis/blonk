"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Zap, CheckCircle, AlertCircle, Plus, FileText, Link2, ArrowUpRight } from "lucide-react";
import FleetVelocityChart from "./components/FleetVelocityChart";
import WorkflowList from "./components/WorkflowList";

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

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/dashboard/summary');
                const result = await res.json();
                setData(result);
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
                            {data.failedRuns > 0 ? `${data.failedRuns} Execution Interruptions detected` : `Systems Integrity: 100% Operational`}
                        </h4>
                        <p className={styles.integritySubtitle}>
                            {data.failedRuns > 0 ? `Manual intervention required in Subsystem B.` : `Fleet throughput is stable across all autonomous sectors.`}
                        </p>
                    </div>
                </div>
                <div className={styles.integrityMetrics}>
                    <span className={styles.metricLabel}>Velocity:</span>
                    <span className={styles.metricValue}>{isEmpty ? '0' : '98.2'}%</span>
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
                        <span className={styles.trendBadge}>+12%</span>
                    </div>
                    <div className={styles.value}>{data.timeSavedHours}h</div>
                    <div className={styles.trend}>Hours reclaimed this week</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Active Workforce</span>
                        <div className={styles.activeDot} />
                    </div>
                    <div className={styles.value}>{data.activeAgents}</div>
                    <div className={styles.trend}>Autonomous loops running</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Disruption Rate</span>
                        {data.failedRuns === 0 && <span className={styles.neutralBadge}>0.00%</span>}
                    </div>
                    <div className={data.failedRuns > 0 ? styles.valueCritical : styles.value}>
                        {data.failedRuns}
                    </div>
                    <div className={styles.trend}>Execution failures detected</div>
                </div>
            </div>

            {/* ANALYTICS PROJECTION */}
            <div className={styles.projectionSection}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>Fleet Velocity Projection</h3>
                    <div className={styles.projectionLegend}>
                        <div className={styles.legendItem}><span /> Real-time Throughput</div>
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
                            {[
                                { title: "Invoice Matched", meta: "Financial Audit loop completed successully", time: "2m ago", type: "success" },
                                { title: "New Lead Discovered", meta: "Lead Discovery agent synced to HubSpot", time: "14m ago", type: "success" },
                                { title: "Docusign Error", meta: "API timeout in Client Onboarding loop", time: "1h ago", type: "error" },
                                { title: "System Heartbeat", meta: "All autonomous agents synchronized", time: "2h ago", type: "info" }
                            ].map((item, idx) => (
                                <div key={idx} className={styles.feedItem}>
                                    <div className={item.type === 'error' ? styles.feedDotError : styles.feedDotSuccess} />
                                    <div className={styles.feedContent}>
                                        <div className={styles.feedTitle}>{item.title}</div>
                                        <div className={styles.feedMeta}>{item.meta}</div>
                                        <div className={styles.feedTime}>{item.time}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
