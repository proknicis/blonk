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
    Activity,
    RefreshCcw,
    Zap,
    Layout,
    Database,
    ShieldCheck
} from "lucide-react";

import { Skeleton, SkeletonRectangle } from "../../components/Skeleton";

// REUSABLE ANALYTICS CHART COMPONENT
function AnalyticsChart({ data, color = "#34D186", height = 180 }: { data: number[], color?: string, height?: number }) {
    if (!data || data.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muted)', borderRadius: '20px', border: '1px dashed var(--border)' }}>
                <div style={{ textAlign: 'center' }}>
                    <Activity size={24} color="var(--muted-foreground)" style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 800 }}>No production data detected in this cycle</p>
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
                    <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={getPath(true)} fill={`url(#grad-${color})`} stroke="none" />
            <path d={getPath(false)} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.05))' }} />
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
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* STRATEGIC INTELLIGENCE HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', border: 'none', padding: '40px 48px', borderRadius: '32px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--background)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={32} color="var(--foreground)" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '4px 10px', background: 'var(--accent)', color: 'var(--background)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>REGIONAL TELEMETRY</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>STRATEGIC INTELLIGENCE</span>
                        </div>
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Global Performance Ledger</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Authoritative audit of {analyticsData?.kpis.activeUsers.monthly || 0} active institutional nodes.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.refreshBtn} onClick={fetchAnalytics} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', height: '48px', width: '48px', borderRadius: '50%' }}>
                        <RefreshCcw size={18} className={isLoadingAnalytics ? adminStyles.spinning : ''} />
                    </button>
                </div>
            </div>

            {/* KPI MATRIX */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                    { label: "Gross Revenue", value: analyticsData?.kpis.revenue.total, trend: analyticsData?.kpis.revenue.change, icon: <DollarSign size={20} color="var(--accent)" /> },
                    { label: "Active Licenses", value: analyticsData?.kpis.activeUsers.monthly, trend: "+12%", icon: <Users size={20} color="var(--accent)" /> },
                    { label: "Op Velocity", value: "98.4%", trend: "+2.1%", icon: <Zap size={20} color="#F59E0B" /> },
                    { label: "System Health", value: "Optimal", trend: "0.0% Latency", icon: <ShieldCheck size={20} color="#10B981" /> }
                ].map((kpi, i) => (
                    <div key={i} style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{kpi.label}</div>
                            {kpi.icon}
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.02em' }}>{isLoadingAnalytics ? '...' : kpi.value}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', fontWeight: 950, color: '#10B981' }}>
                            <ArrowUp size={12} />
                            {kpi.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* STRATEGIC CHARTS */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                <div style={{ background: 'var(--background)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Revenue Propagation</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: 750, marginTop: '4px' }}>Institutional yield across all production clusters.</p>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--accent)' }}>{analyticsData?.kpis.revenue.total}</div>
                    </div>
                    {isLoadingAnalytics ? <SkeletonRectangle height="220px" borderRadius="20px" /> :
                        <AnalyticsChart data={analyticsData?.charts.revenue[0].data} color="var(--accent)" height={220} />
                    }
                </div>

                <div style={{ background: 'var(--foreground)', padding: '40px', borderRadius: '32px', border: 'none', color: 'var(--background)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, color: 'white' }}>Strategic Insights</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '32px' }}>
                        {analyticsData?.insights.map((insight: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent)', flexShrink: 0 }}>
                                    <Target size={16} color="var(--background)" />
                                </div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 750, lineHeight: 1.5, opacity: 0.9 }}>{insight.text}</div>
                            </div>
                        ))}
                    </div>
                    <button className={adminStyles.primaryBtn} style={{ width: '100%', marginTop: '32px', height: '56px', background: 'white', color: 'var(--foreground)', border: 'none' }}>
                        Download Full Report
                    </button>
                </div>
            </div>

            {/* FUNNEL & REGISTRY GROWTH */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ background: 'var(--background)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '32px' }}>Institutional Onboarding Funnel</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', height: '200px' }}>
                        {analyticsData?.charts.funnel.map((val: number, i: number) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div 
                                    style={{ 
                                        height: `${(val / (analyticsData?.charts.funnel[0] || 1)) * 100}%`, 
                                        background: i === 2 ? 'var(--accent)' : 'var(--muted)', 
                                        borderRadius: '12px',
                                        transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }} 
                                />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>{val.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{['Visitors', 'Signups', 'Paid'][i]}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ background: 'var(--background)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '32px' }}>Registry Growth Velocity</h3>
                    {isLoadingAnalytics ? <SkeletonRectangle height="200px" borderRadius="20px" /> :
                        <AnalyticsChart data={analyticsData?.charts.users[0].data} color="#0EA5E9" height={200} />
                    }
                </div>
            </div>
        </div>
    );
}
