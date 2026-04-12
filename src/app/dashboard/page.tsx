"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, Zap, CheckCircle, AlertCircle, Plus, FileText, Link2, ArrowUpRight, ShieldCheck, ShieldAlert } from "lucide-react";
import FleetVelocityChart from "./components/FleetVelocityChart";
import WorkflowList from "./components/WorkflowList";
import { Skeleton, SkeletonRectangle, SkeletonCircle } from "../components/Skeleton";

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
                setTimeout(() => setIsLoading(false), 800); // Institutional smoothing
            }
        };
        fetchDashboard();
    }, []);

    if (isLoading) {
        return (
            <div className={styles.dashboard}>
                {/* Skeleton Integrity Banner */}
                <div className={styles.integrityBanner} style={{ borderStyle: 'none', background: 'transparent', padding: 0 }}>
                    <Skeleton height="100px" borderRadius="24px" />
                </div>

                {/* Skeleton Metrics Matrix */}
                <div className={styles.metricsMatrix}>
                    {[1, 2, 3, 4].map(id => (
                        <SkeletonRectangle key={id} height="200px" borderRadius="32px" />
                    ))}
                </div>

                {/* Skeleton Chart */}
                <Skeleton height="500px" borderRadius="36px" />

                {/* Skeleton Bottom Grid */}
                <div className={styles.commandGrid}>
                   <Skeleton height="400px" borderRadius="36px" />
                   <Skeleton height="400px" borderRadius="36px" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    const isEmpty = data.totalWorkflows === 0;

    return (
        <div className={styles.dashboard} style={{ backgroundColor: '#FAFAFA', minHeight: '100%' }}>
            
            {/* SOVEREIGN INTEGRITY PANEL */}
            <div className={styles.integrityBanner} style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)' }}>
                <div className={styles.integrityInfo}>
                    <div className={data.failedRuns === 0 ? styles.statusIndicatorHealthy : styles.statusIndicatorCritical}>
                        <div className={styles.pulseEffect} style={{ backgroundColor: data.failedRuns === 0 ? '#34D186' : '#EF4444' }} />
                    </div>
                    <div>
                        <h2 className={styles.integrityTitle} style={{ color: '#111' }}>Sovereign Integrity: {data.failedRuns === 0 ? 'Healthy' : 'Critical'}</h2>
                        <p className={styles.integritySubtitle} style={{ color: 'rgba(0, 0, 0, 0.4)' }}>All production nodes are currently synced with the regional registry.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '32px' }}>
                    <div className={styles.integrityMetrics}>
                        <span className={styles.metricLabel} style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Fleet Uptime</span>
                        <span className={styles.metricValue} style={{ color: '#111' }}>100%</span>
                    </div>
                    <div className={styles.integrityMetrics}>
                        <span className={styles.metricLabel} style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Sync Latency</span>
                        <span className={styles.metricValue} style={{ color: '#111' }}>14ms</span>
                    </div>
                </div>
            </div>

            {/* METRICS CORE */}
            <div className={styles.metricsMatrix}>
                <div className={styles.metricCard} style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label} style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Fleet Operations</span>
                        <Zap size={14} className={styles.accentIcon} />
                    </div>
                    <div className={styles.value} style={{ color: '#111' }}>{data.totalTasks.toLocaleString()}</div>
                    <div className={styles.trend} style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Total tasks automated</div>
                </div>

                <div className={styles.metricCard} style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label} style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Capacity Saved</span>
                        <span className={styles.neutralBadge} style={{ background: 'rgba(0, 0, 0, 0.03)', color: 'rgba(0, 0, 0, 0.4)' }}>Real-time</span>
                    </div>
                    <div className={styles.value} style={{ color: '#111' }}>{data.timeSavedHours}h</div>
                    <div className={styles.trend} style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Hours reclaimed to date</div>
                </div>

                <div className={styles.metricCard} style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label} style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Active Loops</span>
                        <div className={styles.activeDot} style={{ background: '#34D186', boxShadow: '0 0 10px #34D186' }} />
                    </div>
                    <div className={styles.value} style={{ color: '#111' }}>{data.activeAgents} / {data.totalWorkflows}</div>
                    <div className={styles.trend} style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Running workflow units</div>
                </div>

                <div className={styles.metricCard} style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)' }}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label} style={{ color: 'rgba(0, 0, 0, 0.3)' }}>Disruption Events</span>
                        {data.failedRuns === 0 ? <ShieldCheck size={14} color="#34D186"/> : <ShieldAlert size={14} color="#EF4444"/>}
                    </div>
                    <div className={data.failedRuns > 0 ? styles.valueCritical : styles.value} style={{ color: data.failedRuns > 0 ? '#EF4444' : '#111' }}>
                        {data.failedRuns}
                    </div>
                    <div className={styles.trend} style={{ color: 'rgba(0, 0, 0, 0.4)' }}>Failures in last 24h</div>
                </div>
            </div>

            {/* ANALYTICS PROJECTION */}
            <div className={styles.projectionSection} style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)' }}>
                <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle} style={{ color: '#111' }}>Fleet Velocity Projection</h3>
                    <div className={styles.projectionLegend}>
                        <div className={styles.legendItem} style={{ color: 'rgba(0, 0, 0, 0.4)' }}><span style={{ background: '#34D186' }} /> Real Throughput (24h Window)</div>
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
                    <div className={styles.activeWorkflows} style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)' }}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle} style={{ color: '#111' }}>Operational Loops</h3>
                            <Link href="/dashboard/workflows" className={styles.viewAllLink} style={{ color: '#34D186', fontWeight: 800 }}>
                                Marketplace <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <WorkflowList workflows={data.topWorkflows} />
                    </div>

                    <div className={styles.liveFeed} style={{ background: '#FFFFFF', border: '1px solid rgba(0, 0, 0, 0.05)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)' }}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle} style={{ color: '#111' }}>Intelligence Feed</h3>
                        </div>
                        <div className={styles.feedWrapper}>
                            {data.intelligenceFeed && data.intelligenceFeed.length > 0 ? (
                                data.intelligenceFeed.map((item, idx) => (
                                    <div key={idx} className={styles.feedItem}>
                                        <div className={item.type === 'error' ? styles.feedDotError : styles.feedDotSuccess} />
                                        <div className={styles.feedContent}>
                                            <div className={styles.feedTitle} style={{ color: '#111' }}>{item.title}</div>
                                            <div className={styles.feedMeta} style={{ color: 'rgba(0, 0, 0, 0.4)' }}>{item.meta}</div>
                                            <div className={styles.feedTime} style={{ color: 'rgba(0, 0, 0, 0.2)' }}>{item.time}</div>
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
