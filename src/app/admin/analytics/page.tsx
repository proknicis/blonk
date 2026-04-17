"use client";

import styles from "../../dashboard/page.module.css";
import adminStyles from "../admin.module.css";
import React, { useState, useEffect } from "react";
import { 
    TrendingUp,
    DollarSign,
    BarChart3,
    ArrowUp,
    ArrowDown,
    Users,
    AlertCircle,
    CheckCircle2,
    ShieldAlert,
    Target,
    Activity
} from "lucide-react";

import { Skeleton, SkeletonRectangle } from "../../components/Skeleton";

// REUSABLE ANALYTICS CHART COMPONENT
function AnalyticsChart({ data, color = "#34D186", height = 180 }: { data: number[], color?: string, height?: number }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', borderRadius: '20px', border: '1px dashed #E2E8F0' }}>
                <div style={{ textAlign: 'center' }}>
                    <Activity size={24} color="#94A3B8" style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 800 }}>No production data detected in this cycle</p>
                </div>
            </div>
        );
    }

    const max = Math.max(...data, 10);
    const getPath = (isArea = false) => {
        if (data.length < 2) return "";
        const width = 1000;
        const xStep = width / (data.length - 1);
        let path = `M 0 ${height - (data[0] / max) * height}`;
        
        for (let i = 0; i < data.length - 1; i++) {
            const x1 = (i + 1) * xStep;
            const y1 = height - (data[i + 1] / max) * height;
            const x0 = i * xStep;
            const y0 = height - (data[i] / max) * height;
            const cp1x = x0 + (x1 - x0) / 2;
            const cp2x = cp1x;
            path += ` C ${cp1x} ${y0}, ${cp2x} ${y1}, ${x1} ${y1}`;
        }
        if (isArea) path += ` V ${height} H 0 Z`;
        return path;
    };

    return (
        <svg width="100%" height={height} viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
                <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={getPath(true)} fill={`url(#grad-${color})`} stroke="none" />
            <path d={getPath(false)} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function AdminAnalyticsPage() {
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setIsLoadingAnalytics(true);
        try {
            const res = await fetch('/api/admin/analytics');
            const data = await res.json();
            if (data && !data.error) setAnalyticsData(data);
        } catch (error) { console.error(error); } finally { setIsLoadingAnalytics(false); }
    };

    const getStatusColor = (status: string) => {
        if (status === 'healthy') return adminStyles.statusHealthy;
        if (status === 'warning') return adminStyles.statusWarning;
        return adminStyles.statusCritical;
    };

    const getInsightIcon = (type: string) => {
        if (type === 'healthy') return <CheckCircle2 size={18} color="#34D186" />;
        if (type === 'warning') return <AlertCircle size={18} color="#F59E0B" />;
        return <ShieldAlert size={18} color="#EF4444" />;
    };

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* INTEGRITY PANEL */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--background)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={24} color="var(--foreground)" className={adminStyles.pulse} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', background: '#10B981', borderRadius: '50%', border: '3px solid var(--foreground)' }} />
                    </div>
                    <div>
                        <h2 style={{ color: 'var(--background)', fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>Strategic Intelligence</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '4px 0 0' }}>Authoritative Ledger Audit: Standardized across {analyticsData?.kpis.activeUsers.monthly || 0} institutional units.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <div style={{ padding: '0 32px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 950, opacity: 0.5 }}>Sync State</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#10B981' }}>NOMINAL</div>
                    </div>
                </div>
            </div>

            {/* STRATEGIC INSIGHTS GRID */}
            <div className={adminStyles.insightsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {isLoadingAnalytics ? (
                    [1, 2, 3].map(i => <SkeletonRectangle key={i} height="100px" borderRadius="18px" />)
                ) : (
                    analyticsData?.insights.map((insight: any, i: number) => (
                        <div key={i} className={adminStyles.insightCard} style={{ border: '1px solid var(--border)', borderRadius: '18px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center', background: 'white' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: insight.type === 'healthy' ? '#F0FAF5' : (insight.type === 'warning' ? '#FFFBEB' : '#FEF2F2') }}>
                                {getInsightIcon(insight.type)}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.4 }}>{insight.text}</div>
                        </div>
                    ))
                )}
            </div>

                {/* ANALYTICS KPI GRID */}
                <div className={adminStyles.analyticsGrid}>
                    {isLoadingAnalytics ? (
                        [1, 2, 3, 4].map(i => <SkeletonRectangle key={i} height="180px" borderRadius="36px" />)
                    ) : (
                        <>
                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>
                                        <span className={`${adminStyles.statusIndicator} ${getStatusColor(analyticsData?.kpis.revenue.status)}`} style={{ marginRight: '8px' }} />
                                        Total Revenue
                                    </span>
                                    <DollarSign size={18} color="#34D186" />
                                </div>
                                <div className={adminStyles.cardValue}>{analyticsData?.kpis.revenue.total}</div>
                                <div className={`${adminStyles.cardTrend} ${analyticsData?.kpis.revenue.status === 'healthy' ? adminStyles.trendPositive : adminStyles.trendNegative}`}>
                                    {analyticsData?.kpis.revenue.status === 'healthy' ? <ArrowUp size={14} /> : <ArrowDown size={14} />} 
                                    {analyticsData?.kpis.revenue.change} <span style={{ color: '#94A3B8' }}>vs last cycle</span>
                                </div>
                            </div>

                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>
                                        <span className={`${adminStyles.statusIndicator} ${getStatusColor(analyticsData?.kpis.mrr.status)}`} style={{ marginRight: '8px' }} />
                                        MRR (Estimated)
                                    </span>
                                    <TrendingUp size={18} color="#0EA5E9" />
                                </div>
                                <div className={adminStyles.cardValue}>{analyticsData?.kpis.mrr.value}</div>
                                <div className={adminStyles.cardTrend} style={{ color: '#94A3B8' }}>
                                    Active Institutional Licenses
                                </div>
                            </div>

                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>
                                        <span className={`${adminStyles.statusIndicator} ${getStatusColor(analyticsData?.kpis.cac.status)}`} style={{ marginRight: '8px' }} />
                                        CAC / LTV
                                    </span>
                                    <Users size={18} color="#8B5CF6" />
                                </div>
                                <div className={adminStyles.cardValue}>${analyticsData?.kpis.cac.value} / ${analyticsData?.kpis.ltv.value}</div>
                                <div className={`${adminStyles.cardTrend} ${analyticsData?.kpis.cac.status === 'healthy' ? adminStyles.trendPositive : adminStyles.trendNegative}`}>
                                    {analyticsData?.kpis.cac.status === 'healthy' ? 'Healthy Ratio' : (analyticsData?.kpis.cac.status === 'critical' ? 'Losing Money' : 'Calibrating Spend')}
                                </div>
                            </div>

                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>Conversion Throughput</span>
                                    <BarChart3 size={18} color="#F59E0B" />
                                </div>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <div>
                                        <div className={adminStyles.cardValue} style={{ fontSize: '1.5rem' }}>{analyticsData?.kpis.conversion.visitorToSignup}</div>
                                        <div className={adminStyles.cardLabel} style={{ fontSize: '0.65rem' }}>Vis → Sign</div>
                                    </div>
                                    <div style={{ width: '1px', background: '#EAEAEA' }} />
                                    <div>
                                        <div className={adminStyles.cardValue} style={{ fontSize: '1.5rem' }}>{analyticsData?.kpis.conversion.signupToPaid}</div>
                                        <div className={adminStyles.cardLabel} style={{ fontSize: '0.65rem' }}>Sign → Paid</div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* CHARTS GRID */}
                <div className={adminStyles.chartsGrid}>
                    <div className={adminStyles.chartCard}>
                        <h3 className={adminStyles.chartTitle}>Revenue Performance</h3>
                        <p className={adminStyles.chartSubtitle}>Institutional revenue tracking over the current cycle.</p>
                        {isLoadingAnalytics ? <Skeleton height="200px" borderRadius="20px" /> : (
                            <AnalyticsChart data={analyticsData?.charts.revenue[0].data} color="#34D186" />
                        )}
                    </div>

                    <div className={adminStyles.chartCard}>
                        <h3 className={adminStyles.chartTitle}>Identity Growth</h3>
                        <p className={adminStyles.chartSubtitle}>Sovereign user registration velocity.</p>
                        {isLoadingAnalytics ? <Skeleton height="200px" borderRadius="20px" /> : (
                            <AnalyticsChart data={analyticsData?.charts.users[0].data} color="#0EA5E9" />
                        )}
                    </div>

                    {/* FUNNEL ANALYSIS */}
                    <div className={adminStyles.chartCard} style={{ gridColumn: 'span 2' }}>
                        <div className={adminStyles.funnelHeader}>
                            <div>
                                <h3 className={adminStyles.chartTitle}>Institutional Conversion Funnel</h3>
                                <p className={adminStyles.chartSubtitle}>Throughput from initial discovery to paid institutional status.</p>
                            </div>
                            {!isLoadingAnalytics && (
                                <div className={adminStyles.bottleneckLabel}>
                                    Bottleneck: {parseFloat(analyticsData?.kpis.conversion.visitorToSignup) < parseFloat(analyticsData?.kpis.conversion.signupToPaid) ? 'Discovery' : 'Activation'}
                                </div>
                            )}
                        </div>
                        
                        {isLoadingAnalytics ? <Skeleton height="200px" borderRadius="20px" /> : (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '32px', height: '220px', padding: '0 48px' }}>
                                {analyticsData?.charts.funnel.map((val: number, i: number) => (
                                    <div key={i} className={adminStyles.funnelStep}>
                                        {i < analyticsData.charts.funnel.length - 1 && (
                                            <div className={adminStyles.conversionLabel}>
                                                {((analyticsData.charts.funnel[i+1] / (val || 1)) * 100).toFixed(1)}%
                                            </div>
                                        )}
                                        <div 
                                            className={adminStyles.funnelBar}
                                            style={{ 
                                                height: `${(val / (analyticsData?.charts.funnel[0] || 1)) * 100}%`, 
                                                background: i === 0 ? '#F1F5F9' : (i === 1 ? '#E2E8F0' : '#34D186'),
                                            }} 
                                        />
                                        <span className={adminStyles.cardLabel} style={{ fontSize: '0.7rem', marginTop: '12px' }}>
                                            {['Visitors', 'Signups', 'Paid'][i]}
                                        </span>
                                        <span className={adminStyles.cardValue} style={{ fontSize: '1.25rem' }}>{val.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
