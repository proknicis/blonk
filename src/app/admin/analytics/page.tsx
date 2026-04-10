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
    Users
} from "lucide-react";

import { Skeleton, SkeletonRectangle } from "../../components/Skeleton";

// REUSABLE ANALYTICS CHART COMPONENT
function AnalyticsChart({ data, color = "#34D186", height = 180 }: { data: number[], color?: string, height?: number }) {
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
            <path d={getPath(true)} fill={`url(#grad-${color})`} />
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

    return (
        <div className={styles.dashboard}>
            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                {/* ANALYTICS KPI GRID */}
                <div className={adminStyles.analyticsGrid}>
                    {isLoadingAnalytics ? (
                        [1, 2, 3, 4].map(i => <SkeletonRectangle key={i} height="180px" borderRadius="36px" />)
                    ) : (
                        <>
                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>Total Revenue</span>
                                    <DollarSign size={18} color="#34D186" />
                                </div>
                                <div className={adminStyles.cardValue}>{analyticsData?.kpis.revenue.total}</div>
                                <div className={`${adminStyles.cardTrend} ${adminStyles.trendPositive}`}>
                                    <ArrowUp size={14} /> {analyticsData?.kpis.revenue.change} <span style={{ color: '#94A3B8' }}>vs last month</span>
                                </div>
                            </div>
                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>MRR Estimation</span>
                                    <TrendingUp size={18} color="#0EA5E9" />
                                </div>
                                <div className={adminStyles.cardValue}>{analyticsData?.kpis.mrr.value}</div>
                                <div className={`${adminStyles.cardTrend} ${adminStyles.trendPositive}`}>
                                    <ArrowUp size={14} /> {analyticsData?.kpis.mrr.change} <span style={{ color: '#94A3B8' }}>growth</span>
                                </div>
                            </div>
                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>CAC / LTV</span>
                                    <Users size={18} color="#8B5CF6" />
                                </div>
                                <div className={adminStyles.cardValue}>{analyticsData?.kpis.cac.value} / {analyticsData?.kpis.ltv.value}</div>
                                <div className={`${adminStyles.cardTrend} ${analyticsData?.kpis.cac.positive ? adminStyles.trendPositive : adminStyles.trendNegative}`}>
                                    {analyticsData?.kpis.cac.positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {analyticsData?.kpis.cac.change} <span style={{ color: '#94A3B8' }}>efficiency</span>
                                </div>
                            </div>
                            <div className={adminStyles.analyticsCard}>
                                <div className={adminStyles.cardHeader}>
                                    <span className={adminStyles.cardLabel}>Conversion Rates</span>
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
                        <p className={adminStyles.chartSubtitle}>Institutional revenue tracking over the last 7 cycles.</p>
                        {isLoadingAnalytics ? <Skeleton height="200px" borderRadius="20px" /> : (
                            <AnalyticsChart data={analyticsData?.charts.revenue[0].data} color="#34D186" />
                        )}
                    </div>
                    <div className={adminStyles.chartCard}>
                        <h3 className={adminStyles.chartTitle}>User Growth</h3>
                        <p className={adminStyles.chartSubtitle}>Sovereign identity registration velocity.</p>
                        {isLoadingAnalytics ? <Skeleton height="200px" borderRadius="20px" /> : (
                            <AnalyticsChart data={analyticsData?.charts.users[0].data} color="#0EA5E9" />
                        )}
                    </div>
                    <div className={adminStyles.chartCard} style={{ gridColumn: 'span 2' }}>
                        <h3 className={adminStyles.chartTitle}>Conversion Funnel</h3>
                        <p className={adminStyles.chartSubtitle}>Throughput from initial discovery to paid institutional status.</p>
                        {isLoadingAnalytics ? <Skeleton height="200px" borderRadius="20px" /> : (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 24px' }}>
                                {analyticsData?.charts.funnel[0].data.map((val: number, i: number) => (
                                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ 
                                            width: '100%', 
                                            height: `${(val / analyticsData?.charts.funnel[0].data[0]) * 100}%`, 
                                            background: i === 0 ? '#F1F5F9' : (i === 1 ? '#E2E8F0' : '#34D186'),
                                            borderRadius: '16px',
                                            transition: 'height 1s ease'
                                        }} />
                                        <span className={adminStyles.cardLabel} style={{ fontSize: '0.7rem' }}>
                                            {['Visitors', 'Signups', 'Paid'][i]}
                                        </span>
                                        <span className={adminStyles.cardValue} style={{ fontSize: '1.1rem' }}>{val.toLocaleString()}</span>
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
