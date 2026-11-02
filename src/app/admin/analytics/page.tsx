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
    ShieldCheck,
    Clock
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
                    { label: "Total Enrolled Users", value: analyticsData?.activationAnalytics?.totalEnrolled || 0, trend: "Intake Ledger", icon: <Users size={20} color="var(--accent)" /> },
                    { label: "Setup Completion Rate", value: `${(analyticsData?.activationAnalytics?.setupCompletionRate || 0).toFixed(1)}%`, trend: "Phase 1 Conversion", icon: <CheckCircle2 size={20} color="#10B981" /> },
                    { label: "Activation Completion Rate", value: `${(analyticsData?.activationAnalytics?.activationCompletionRate || 0).toFixed(1)}%`, trend: "Sovereign Deployed", icon: <Zap size={20} color="#F59E0B" /> },
                    { label: "Avg Time-To-Deploy", value: `${analyticsData?.activationAnalytics?.avgTimeToDeploy || 0} mins`, trend: "Node Provisioning", icon: <Clock size={20} color="var(--accent)" /> }
                ].map((kpi, i) => (
                    <div key={i} style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{kpi.label}</div>
                            {kpi.icon}
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.02em' }}>{isLoadingAnalytics ? '...' : kpi.value}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)' }}>
                            {kpi.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* STRATEGIC CHARTS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr', gap: '24px' }}>
                {/* Onboarding & Activation Step Drop-offs */}
                <div style={{ background: 'var(--background)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Onboarding &amp; Activation Funnel</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: 750, marginTop: '4px', marginBottom: '32px' }}>
                        Drop-off analysis across canonical activation state machine steps.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {(() => {
                            const steps = [
                                { label: "1. Select AI Co-Pilot (Intake started)", key: "NOT_STARTED" },
                                { label: "2. Calibration ready (Setup complete)", key: "SUMMARY_READY" },
                                { label: "3. Loop matched (Blueprint selected)", key: "WORKFLOW_SELECTED" },
                                { label: "4. Integrations pending", key: "CONNECTIONS_IN_PROGRESS" },
                                { label: "5. Pre-flight checks", key: "READY_FOR_DEPLOY" },
                                { label: "6. Provisioning loop", key: "DEPLOYING" },
                                { label: "7. Active Cluster Deployed (Activated)", key: "ACTIVATED" }
                            ];
                            
                            const funnelData = analyticsData?.activationAnalytics?.funnel || {};
                            const maxVal = Math.max(...steps.map(s => funnelData[s.key] || 0), 1);

                            return steps.map((step, idx) => {
                                const val = funnelData[step.key] || 0;
                                const pct = Math.round((val / maxVal) * 100);

                                return (
                                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 800 }}>
                                            <span style={{ color: 'var(--foreground)' }}>{step.label}</span>
                                            <span style={{ color: 'var(--muted-foreground)' }}>{val} user(s) ({pct}%)</span>
                                        </div>
                                        <div style={{ height: '8px', background: 'var(--muted)', borderRadius: '4px', overflow: 'hidden' }}>
                                            <div style={{ width: `${pct}%`, height: '100%', background: step.key === "ACTIVATED" ? "#10B981" : "var(--primary)", transition: 'all 0.5s' }} />
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* AI Insights & Provisioning Outcomes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'var(--foreground)', padding: '40px', borderRadius: '32px', border: 'none', color: 'var(--background)' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, color: 'white' }}>Strategic Insights</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                            {analyticsData?.insights.map((insight: any, i: number) => (
                                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: insight.type === 'critical' ? '#EF4444' : 'var(--accent)', flexShrink: 0 }}>
                                        <Target size={16} color="var(--background)" />
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 750, lineHeight: 1.5, opacity: 0.9 }}>{insight.text}</div>
                                </div>
                            ))}
                            {(!analyticsData?.insights || analyticsData.insights.length === 0) && (
                                <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Nominal metrics - all conversion vectors perform within target ranges.</div>
                            )}
                        </div>
                    </div>

                    <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em', margin: '0 0 16px' }}>
                            Docker Provisioning Outcomes
                        </h4>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                                    <span>Successful Builds</span>
                                    <span style={{ color: '#10B981' }}>{analyticsData?.activationAnalytics?.successCount || 0}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 800 }}>
                                    <span>Failed Container Cleanups</span>
                                    <span style={{ color: '#EF4444' }}>{analyticsData?.activationAnalytics?.failureCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BREAKDOWN SECTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {/* AI Employee Preference Grid */}
                <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em', margin: '0 0 20px' }}>
                        Most Selected AI Co-Pilots
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analyticsData?.activationAnalytics?.mostSelectedRoles.slice(0, 5).map((role: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 750 }}>
                                <span style={{ textTransform: 'capitalize', color: 'var(--foreground)' }}>
                                    {role.role === 'ops' ? 'Sophia (Operations)' : role.role === 'sales' ? 'Elena (Sales)' : role.role === 'finance' ? 'Marcus (Finance)' : role.role}
                                </span>
                                <span style={{ padding: '2px 8px', background: 'var(--muted)', borderRadius: '6px', fontSize: '0.75rem' }}>{role.count} select(s)</span>
                            </div>
                        ))}
                        {(!analyticsData?.activationAnalytics?.mostSelectedRoles || analyticsData.activationAnalytics.mostSelectedRoles.length === 0) && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>No co-pilot selections logged.</div>
                        )}
                    </div>
                </div>

                {/* Popular Recommended Blueprint Specifications */}
                <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em', margin: '0 0 20px' }}>
                        Recommended Blueprints
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analyticsData?.activationAnalytics?.mostRecommendedBlueprints.slice(0, 5).map((bp: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 750 }}>
                                <span style={{ color: 'var(--foreground)', textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                                    {bp.id.replace(/-/g, ' ')}
                                </span>
                                <span style={{ padding: '2px 8px', background: 'var(--muted)', borderRadius: '6px', fontSize: '0.75rem' }}>{bp.count} match(es)</span>
                            </div>
                        ))}
                        {(!analyticsData?.activationAnalytics?.mostRecommendedBlueprints || analyticsData.activationAnalytics.mostRecommendedBlueprints.length === 0) && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>No blueprint recommendations registered.</div>
                        )}
                    </div>
                </div>

                {/* Integration Blocker Counts */}
                <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em', margin: '0 0 20px' }}>
                        Common Connection Blockers
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analyticsData?.activationAnalytics?.missingIntegrations.slice(0, 5).map((block: any, idx: number) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: 750 }}>
                                <span style={{ textTransform: 'capitalize', color: 'var(--foreground)' }}>{block.provider}</span>
                                <span style={{ padding: '2px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '6px', fontSize: '0.75rem' }}>
                                    {block.count} missing/invalid
                                </span>
                            </div>
                        ))}
                        {(!analyticsData?.activationAnalytics?.missingIntegrations || analyticsData.activationAnalytics.missingIntegrations.length === 0) && (
                            <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 800 }}>0 blockages logged. All syncs nominal.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
