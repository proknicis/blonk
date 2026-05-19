"use client";

import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
    Activity, Zap, CheckCircle, AlertCircle, Plus, 
    FileText, Link2, ArrowUpRight, ShieldCheck, ShieldAlert,
    TrendingUp, TrendingDown, Clock, Search, ExternalLink,
    Terminal, Database, Globe, Info
} from "lucide-react";
import FleetVelocityChart from "./components/FleetVelocityChart";
import Sparkline from "./components/Sparkline";
import { Skeleton, SkeletonRectangle, SkeletonCircle } from "../components/Skeleton";

interface DashboardData {
    totalWorkflows: number;
    activeAgents: number;
    totalTasks: number;
    runsToday: number;
    runsTrend: number;
    timeSavedHours: number;
    issuesToday: number;
    issuesTrend: number;
    efficiencyRate: number;
    chartData: Array<{
        name: string;
        data: number[];
    }>;
    topWorkflows: Array<{
        id: string;
        name: string;
        status: string;
        totalRuns: number;
        successRate: number;
        miniChart: number[];
    }>;
    intelligenceFeed: Array<{
        title: string;
        meta: string;
        type: string;
        time: string;
        rich?: any;
    }>;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [globalStats, setGlobalStats] = useState({ total_tasks: 0, status: 'online' });

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/api/dashboard/summary');
                const result = await res.json();
                if (result && !result.error) {
                    setData(result);
                    setGlobalStats(prev => ({ ...prev, total_tasks: result.totalTasks }));
                }
            } catch (error) {
                console.error("Dashboard synchronization failure", error);
            } finally {
                setTimeout(() => setIsLoading(false), 800);
            }
        };

        const fetchPulse = async () => {
            try {
                const res = await fetch('/api/n8n/stats');
                if (res.ok) {
                    const stats = await res.json();
                    setGlobalStats({ total_tasks: stats.total_tasks, status: 'online' });
                }
            } catch (e) {
                setGlobalStats(prev => ({
                    status: 'offline',
                    total_tasks: prev.total_tasks
                }));
            }
        };

        fetchDashboard();
        fetchPulse();

        const dashboardTimer = setInterval(fetchDashboard, 5000);
        const pulseTimer = setInterval(fetchPulse, 5000);

        return () => {
            clearInterval(dashboardTimer);
            clearInterval(pulseTimer);
        };
    }, []);

    if (isLoading) {
        return (
            <div className={styles.dashboard}>
                <Skeleton height="80px" borderRadius="24px" />
                <div className={styles.metricsMatrix}>
                    {[1, 2, 3, 4].map(id => (
                        <SkeletonRectangle key={id} height="160px" borderRadius="24px" />
                    ))}
                </div>
                <Skeleton height="400px" borderRadius="24px" />
            </div>
        );
    }

    if (!data) return null;

    const isEmpty = data.totalWorkflows === 0;

    return (
        <div className={styles.dashboard}>
            
            {/* INTEGRITY STATUS BAR */}
            <div className={styles.integrityRow}>
                <div className={styles.integrityCard}>
                    <div className={`${styles.integrityIcon}`} style={{ background: '#F0FAF5', color: '#34D186' }}>
                        <div className={styles.playIconBox}><div className={styles.playTriangle} /></div>
                    </div>
                    <div className={styles.integrityLabel}>
                        <span className={styles.integrityStatus}>System Operational</span>
                        <span className={styles.integritySub}>All systems running smoothly</span>
                    </div>
                </div>

                <div className={styles.integrityCard}>
                    <div className={`${styles.integrityIcon}`} style={{ background: '#F0F9FF', color: '#0EA5E9' }}>
                        <Link2 size={18} />
                    </div>
                    <div className={styles.integrityLabel}>
                        <span className={styles.integrityStatus}>Connected</span>
                        <span className={styles.integritySub}>All systems linked</span>
                    </div>
                </div>

                <div className={styles.integrityCard}>
                    <div className={`${styles.integrityIcon}`} style={{ background: '#F0FAF5', color: '#34D186' }}>
                        <ShieldCheck size={18} />
                    </div>
                    <div className={styles.integrityLabel}>
                        <span className={styles.integrityStatus}>Authorized</span>
                        <span className={styles.integritySub}>Handshake verified</span>
                    </div>
                </div>

                <div className={styles.totalRuns}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>Total Runs</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(globalStats?.total_tasks ?? 0).toLocaleString()}
                        <ArrowUpRight size={18} color="#34D186" />
                    </div>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className={styles.metricsMatrix}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Runs Today</span>
                        <TrendingUp size={14} color="#10B981" />
                    </div>
                    <div className={styles.value}>{(data?.runsToday ?? 0).toLocaleString()}</div>
                    <div className={`${styles.trendContainer} ${styles.trendUp}`}>
                        <TrendingUp size={14} />
                        {Math.abs(data?.runsTrend ?? 0)}% vs yesterday
                    </div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Hours Saved</span>
                        <div style={{ fontSize: '0.6rem', fontWeight: 950, padding: '2px 6px', background: '#F0FAF5', color: '#34D186', borderRadius: '4px' }}>REAL-TIME</div>
                    </div>
                    <div className={styles.value}>{(data?.timeSavedHours ?? 0)}h</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>Real-time</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Active Workflows</span>
                        <Activity size={14} color="#10B981" />
                    </div>
                    <div className={styles.value}>{(data?.activeAgents ?? 0)} / {(data?.totalWorkflows ?? 0)}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>All workflows active</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Issues Today</span>
                        <Clock size={14} color="#EF4444" />
                    </div>
                    <div className={styles.value}>{(data?.issuesToday ?? 0)}</div>
                    <div className={`${styles.trendContainer} ${styles.trendUp}`}>
                        <TrendingDown size={14} color="#10B981" />
                        {Math.abs(data?.issuesTrend ?? 0)}% vs yesterday
                    </div>
                </div>
            </div>

            {/* ACTIVITY VISUALIZATION */}
            <div className={styles.projectionSection}>
                <div className={styles.chartWrapper}>
                    <FleetVelocityChart initialData={data.chartData} />
                </div>
            </div>

            {isEmpty ? (
                <div className={styles.onboardingState}>
                    <div className={styles.onboardingGrid}>
                        <div className={styles.gridDot} style={{ animationDelay: '0s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '0.2s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '0.4s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '0.6s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '0.8s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '1s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '1.2s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '1.4s' }} />
                        <div className={styles.gridDot} style={{ animationDelay: '1.6s' }} />
                    </div>
                    <div className={styles.onboardingContent}>
                        <div className={styles.onboardingIconWrapper}>
                            <div className={styles.onboardingIconBg}>
                                <Zap size={48} color="#10B981" />
                            </div>
                            <div className={styles.onboardingPulse} />
                        </div>
                        <h2 className={styles.onboardingTitle}>Initialize your autonomous firm</h2>
                        <p className={styles.onboardingSubtitle}>
                            Your dashboard is empty because no workflows have been provisioned yet. 
                            Start by deploying your first automated workflow from the marketplace.
                        </p>
                        <div className={styles.onboardingActions}>
                            <Link href="/dashboard/registry?create=true" className={styles.btnPrimary}>
                                <Plus size={18} />
                                Generate Workflow
                            </Link>
                            <Link href="/dashboard/registry" className={styles.btnSecondary}>
                                <ExternalLink size={18} />
                                Browse Marketplace
                            </Link>
                        </div>
                        <div className={styles.onboardingFeatures}>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><CheckCircle size={16} color="#10B981" /></div>
                                <span className={styles.featureText}>100+ pre-built templates</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><CheckCircle size={16} color="#10B981" /></div>
                                <span className={styles.featureText}>One-click deployment</span>
                            </div>
                            <div className={styles.featureItem}>
                                <div className={styles.featureIcon}><CheckCircle size={16} color="#10B981" /></div>
                                <span className={styles.featureText}>Real-time monitoring</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.commandGrid}>
                    {/* TOP WORKFLOWS */}
                    <div className={styles.activeWorkflows}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Top Workflows</h3>
                            <Link href="/dashboard/registry" className={styles.viewAllLink}>View all workflows &rsaquo;</Link>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {data.topWorkflows.map((w, idx) => {
                                const colors = ['#10B981', '#2563EB', '#8B5CF6'];
                                return (
                                    <div key={w.id} className={styles.workflowOverviewRow}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div className={styles.workflowIconBox} style={{ background: colors[idx % 3], color: '#FFF', border: 'none' }}>
                                                {w.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={styles.workflowRowTitle}>{w.name}</div>
                                                <div className={styles.workflowRowSubtitle}>
                                                    {w.totalRuns} runs today
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                                            <div className={styles.sparklineWrapper}>
                                                <Sparkline data={w.miniChart} color="#10B981" />
                                            </div>
                                            <div className={styles.successMetric}>
                                                <div className={styles.successValue}>{w.successRate}%</div>
                                                <div className={styles.successLabel}>Success rate</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* NEEDS ATTENTION */}
                    <div className={styles.liveFeed}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>Needs Attention</h3>
                            <Link href="/dashboard/audit" className={styles.viewAllLink}>View all issues &rsaquo;</Link>
                        </div>
                        <div className={styles.feedWrapper}>
                            {data.intelligenceFeed.length > 0 ? (
                                data.intelligenceFeed.map((item, idx) => (
                                    <div key={idx} className={styles.feedItem}>
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '50%', 
                                            background: item.type === 'error' ? '#EF4444' : (item.type === 'info' ? '#F59E0B' : '#10B981'),
                                            color: '#FFF',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                        }}>
                                            {item.type === 'error' ? <AlertCircle size={18} /> : (item.type === 'info' ? <AlertCircle size={18} /> : <CheckCircle size={18} />)}
                                        </div>
                                        <div className={styles.feedContent}>
                                            <div className={styles.feedHeaderRow}>
                                                <div className={styles.feedTitle}>{item.title}</div>
                                                <div className={styles.feedTime}>{item.time}</div>
                                            </div>
                                            <div className={styles.feedMeta}>{item.meta}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyFeed}>
                                    <ShieldCheck size={32} />
                                    <p>No operational issues detected</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
