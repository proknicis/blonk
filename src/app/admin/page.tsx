"use client";

import styles from "../dashboard/page.module.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
    Zap, 
    Database, 
    ArrowUpRight, 
    MoreVertical, 
    Trash2, 
    Settings, 
    Activity, 
    ShieldCheck, 
    RefreshCcw,
    Copy,
    CheckCircle2,
    Users
} from "lucide-react";

import { Skeleton } from "../components/Skeleton";

export default function AdminControlPage() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [configWorkflow, setConfigWorkflow] = useState<any>(null);
    const [configStep, setConfigStep] = useState(1);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows');
            const data = await res.json();
            if (Array.isArray(data)) setWorkflows(data);
        } catch (error) { console.error(error); } finally { setIsLoadingWorkflows(false); }
    };

    const updateWebhook = async (id: string, url: string) => {
        setSavingId(id);
        try {
            await fetch('/api/admin/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, n8nWebhookUrl: url })
            });
            fetchWorkflows();
            setConfigWorkflow(null);
            setConfigStep(1);
        } catch (error) { console.error(error); } finally { setSavingId(null); }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm("Permanently delete this instance? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/workflows?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchWorkflows();
        } catch (error) { console.error(error); }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const SkeletonRow = () => (
        <tr>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Skeleton width="44px" height="44px" borderRadius="14px" />
                    <div>
                        <Skeleton width="120px" height="18px" style={{ marginBottom: '8px' }} />
                        <Skeleton width="80px" height="12px" />
                    </div>
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Skeleton width="32px" height="32px" borderRadius="50%" />
                    <Skeleton width="100px" height="16px" />
                </div>
            </td>
            <td><Skeleton width="100px" height="28px" borderRadius="8px" /></td>
            <td><Skeleton width="90px" height="24px" borderRadius="100px" /></td>
            <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Skeleton width="80px" height="40px" borderRadius="12px" />
                    <Skeleton width="40px" height="40px" borderRadius="12px" />
                </div>
            </td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            {/* STATUS BANNER */}
            <div className={styles.integrityBanner}>
                <div className={styles.integrityInfo}>
                    <div className={styles.statusIndicatorHealthy}>
                        <div className={styles.pulseEffect} />
                    </div>
                    <div>
                        <h4 className={styles.integrityTitle}>Fleet Infrastructure: Operational</h4>
                        <p className={styles.integritySubtitle}>All system registries are synced with production nodes.</p>
                    </div>
                </div>
                <div className={styles.integrityMetrics}>
                    <span className={styles.metricLabel}>Active Nodes:</span>
                    <span className={styles.metricValue}>{isLoadingWorkflows ? <Skeleton width="30px" height="20px" /> : workflows.length}</span>
                </div>
            </div>

            {/* QUICK METRICS */}
            <div className={styles.metricsMatrix}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Total Provisioned</span>
                        <Database size={14} className={styles.accentIcon} />
                    </div>
                    <div className={styles.value}>{isLoadingWorkflows ? <Skeleton width="40px" height="32px" /> : workflows.length}</div>
                    <div className={styles.trend}>Loop instances in registry</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Pending Nodes</span>
                        <div className={styles.activeDot} style={{ background: '#F59E0B' }} />
                    </div>
                    <div className={styles.value}>{isLoadingWorkflows ? <Skeleton width="40px" height="32px" /> : workflows.filter(wf => wf.status !== 'Active').length}</div>
                    <div className={styles.trend}>Awaiting calibration</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>System Integrity</span>
                        <ShieldCheck size={14} color="#34D186"/>
                    </div>
                    <div className={styles.value}>100%</div>
                    <div className={styles.trend}>Registry connectivity</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Provisioning Rate</span>
                        <Activity size={14} />
                    </div>
                    <div className={styles.value}>Stable</div>
                    <div className={styles.trend}>Request flow consistency</div>
                </div>
            </div>

            {/* MAIN PROVISIONING REGISTRY */}
            <div className={styles.commandGrid} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.activeWorkflows} style={{ padding: '32px' }}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h3 className={styles.cardTitle}>Fleet Management</h3>
                            <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>Calibrate and sync autonomous loops with production nodes.</p>
                        </div>
                        <button className={styles.viewAllLink} onClick={fetchWorkflows} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <RefreshCcw size={14} /> Refresh Registry
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto', marginTop: '24px' }}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Loop Detail</th>
                                    <th>Requested By</th>
                                    <th>Identity Hash</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingWorkflows ? (
                                    <>
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                        <SkeletonRow />
                                    </>
                                ) : (
                                    <>
                                        {workflows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                                                    <Database size={48} style={{ color: '#EAEAEA', marginBottom: '20px' }} />
                                                    <p style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '1.1rem' }}>No nodes provisioned</p>
                                                    <p style={{ color: '#94A3B8', fontWeight: 700 }}>Initialize your first operational instance from user requests.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            workflows.map(wf => (
                                                <tr key={wf.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                            <div style={{ width: '44px', height: '44px', background: '#F8F9FA', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EAEAEA' }}>
                                                                <Zap size={20} color="#0A0A0A" />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 950, color: '#0A0A0A', fontSize: '1rem' }}>{wf.name}</div>
                                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{wf.sector}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <div className={styles.avatar} style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                                                {wf.requestedBy?.charAt(0) || "U"}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 850, color: '#0A0A0A' }}>{wf.requestedBy || "Client User"}</div>
                                                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>Institutional Partner</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <button 
                                                            onClick={() => copyToClipboard(wf.id)}
                                                            style={{ background: '#F8F9FA', border: '1px solid #EAEAEA', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 900, color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                        >
                                                            <code>{wf.id.substring(0, 12)}...</code>
                                                            <Copy size={12} />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '6px 14px',
                                                            borderRadius: '100px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 950,
                                                            background: wf.status === 'Pending' ? '#FFFBEB' : '#F0FAF5',
                                                            color: wf.status === 'Pending' ? '#B45309' : '#34D186',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}>
                                                            <span style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }}></span>
                                                            {wf.status === 'Active' ? 'SYNCED' : 'AWAITING NODE'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                className={styles.btnInstitutional}
                                                                style={{ padding: '0 16px', height: '40px', fontSize: '0.85rem', background: wf.status === 'Pending' ? '#0A0A0A' : '#F8F9FA', color: wf.status === 'Pending' ? '#FFFFFF' : '#64748B' }}
                                                                onClick={() => { setConfigWorkflow(wf); setConfigStep(1); }}
                                                            >
                                                                Configure
                                                            </button>
                                                            <button 
                                                                style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'none', border: '1px solid #FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                onClick={() => deleteWorkflow(wf.id)}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </>
                                )}
                            </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* CONFIG MODAL */}
            {configWorkflow && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 10, 10, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '640px', borderRadius: '32px', boxShadow: '0 40px 80px -12px rgba(0, 0, 0, 0.2)', overflow: 'hidden', border: '1px solid #EAEAEA' }}>
                        {/* Modal Header */}
                        <div style={{ background: '#0A0A0A', padding: '40px', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <Database size={20} color="#34D186" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>NODE CALIBRATION</span>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.04em' }}>Production Sync</h3>
                                    <p style={{ margin: '8px 0 0', fontSize: '1rem', color: '#94A3B8', fontWeight: 700 }}>Instance: {configWorkflow.name}</p>
                                </div>
                                <button onClick={() => setConfigWorkflow(null)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            {/* Wizard Progress */}
                            <div style={{ display: 'flex', gap: '12px', marginTop: '48px' }}>
                                {[1, 2, 3].map(s => (
                                    <div key={s} style={{ flex: 1, height: '6px', background: configStep >= s ? '#34D186' : 'rgba(255,255,255,0.1)', borderRadius: '10px' }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '48px', maxHeight: '60vh', overflowY: 'auto' }}>
                            {configStep === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#34D186' }}></div>
                                        <h4 style={{ margin: 0, fontSize: '0.8rem', color: '#0A0A0A', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Inbound Parameters</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        {configWorkflow.inputs ? (
                                            (() => {
                                                let data = {};
                                                try {
                                                    data = typeof configWorkflow.inputs === 'string' 
                                                        ? JSON.parse(configWorkflow.inputs) 
                                                        : configWorkflow.inputs;
                                                    if (typeof data === 'string') data = JSON.parse(data);
                                                } catch (e) { data = {}; }
                                                
                                                return Object.entries(data || {}).map(([key, val]: any) => (
                                                    <div key={key} style={{ background: '#F8F9FA', padding: '24px', borderRadius: '24px', border: '1px solid #EAEAEA' }}>
                                                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: '#94A3B8', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{key}</label>
                                                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0A0A', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', background: 'white', padding: '16px', borderRadius: '14px', border: '1px solid #EAEAEA' }}>{String(val)}</div>
                                                    </div>
                                                ));
                                            })()
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '60px', border: '2px dashed #EAEAEA', borderRadius: '24px' }}>
                                                <Database size={32} style={{ color: '#EAEAEA', marginBottom: '16px' }} />
                                                <p style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 800, margin: 0 }}>No custom data provided.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {configStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 950, marginBottom: '16px', fontSize: '0.8rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sovereign Loop Identity</label>
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{ flex: 1, padding: '24px', borderRadius: '24px', background: '#F8F9FA', border: '1px solid #EAEAEA', fontSize: '1.2rem', fontWeight: 950, color: '#0A0A0A', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                                                {configWorkflow.id}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(configWorkflow.id)}
                                                style={{ padding: '0 32px', borderRadius: '24px', background: '#0A0A0A', color: 'white', fontWeight: 950, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                COPY
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: '#F0FAF5', padding: '28px', borderRadius: '28px', border: '1px solid #34D186', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '44px', height: '44px', background: '#34D186', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <ShieldCheck size={24} color="#0A0A0A" />
                                        </div>
                                        <div style={{ fontSize: '0.95rem', color: '#0A0A0A', lineHeight: '1.6', fontWeight: 800 }}>
                                            Autonomous Deployment: Use this identity hash in your production n8n nodes. Systematic tracking will commence upon activation.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {configStep === 3 && (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '100px', height: '100px', background: '#F0FAF5', color: '#34D186', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 36px' }}>
                                        <CheckCircle2 size={48} strokeWidth={2.5} />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '2rem', color: '#0A0A0A', fontWeight: 950, letterSpacing: '-0.04em' }}>Node Authorized</h4>
                                    <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '380px', margin: '20px auto 0', lineHeight: '1.6', fontWeight: 700 }}>The loop is ready for full production. Finalizing will activate real-time telemetry and notify the client.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '32px 48px', borderTop: '1px solid #EAEAEA', display: 'flex', justifyContent: 'space-between', background: '#F8F9FA' }}>
                            <button 
                                className={styles.btnOutline} 
                                style={{ padding: '0 32px', height: '52px', borderRadius: '20px', fontWeight: 950, fontSize: '1rem' }}
                                onClick={() => configStep > 1 ? setConfigStep(prev => prev - 1) : setConfigWorkflow(null)}
                            >
                                {configStep === 1 ? 'Discard' : 'Back'}
                            </button>
                            <button 
                                className={styles.btnInstitutional} 
                                style={{ background: configStep === 3 ? '#34D186' : '#0A0A0A', color: configStep === 3 ? '#0A0A0A' : '#FFFFFF', minWidth: '180px', height: '52px', borderRadius: '20px', fontWeight: 950, fontSize: '1rem' }}
                                onClick={() => {
                                    if (configStep < 3) setConfigStep(prev => prev + 1);
                                    else updateWebhook(configWorkflow.id, ""); // No URL needed
                                }}
                                disabled={savingId === configWorkflow.id}
                            >
                                {savingId === configWorkflow.id ? "Syncing..." : (configStep === 3 ? 'Broadcast Activation' : 'Step Complete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

