"use client";

import styles from "../dashboard/page.module.css";
import adminStyles from "./admin.module.css";
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
        <tr className={adminStyles.registryRow}>
            <td>
                <div className={adminStyles.loopDetail}>
                    <Skeleton width="44px" height="44px" borderRadius="12px" />
                    <div>
                        <Skeleton width="120px" height="18px" style={{ marginBottom: '6px' }} />
                        <Skeleton width="80px" height="12px" />
                    </div>
                </div>
            </td>
            <td>
                <div className={adminStyles.requesterInfo}>
                    <Skeleton width="36px" height="36px" borderRadius="50%" />
                    <div>
                        <Skeleton width="100px" height="16px" style={{ marginBottom: '4px' }} />
                        <Skeleton width="140px" height="12px" />
                    </div>
                </div>
            </td>
            <td>
                <div className={adminStyles.identityContainer}>
                    <Skeleton width="120px" height="20px" borderRadius="8px" />
                </div>
            </td>
            <td>
                <Skeleton width="110px" height="28px" borderRadius="100px" />
            </td>
            <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Skeleton width="84px" height="38px" borderRadius="10px" />
                    <Skeleton width="38px" height="38px" borderRadius="10px" />
                </div>
            </td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            {/* STATUS BANNER */}
            <div className={adminStyles.integrityPanel}>
                <div className={adminStyles.integrityHub}>
                    <div className={adminStyles.statusBeacon}>
                        <div className={adminStyles.beaconPulse} />
                    </div>
                    <div>
                        <h4 className={adminStyles.panelTitle}>Sovereign Fleet: Active</h4>
                        <p className={adminStyles.panelSubtitle}>All production nodes are currently synced with the regional registry.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <span className={adminStyles.hubLabel}>Total Nodes:</span>
                    <span className={adminStyles.hubValue}>{isLoadingWorkflows ? <Skeleton width="30px" height="20px" /> : workflows.length}</span>
                </div>
            </div>

            {/* QUICK METRICS */}
            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>REGISTRY TOTAL</span>
                        <Database size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoadingWorkflows ? <Skeleton width="40px" height="32px" /> : workflows.length}</div>
                    <div className={adminStyles.metricDetail}>Provisioned loop instances</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>PENDING SYNC</span>
                        <div className={adminStyles.amberDot} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoadingWorkflows ? <Skeleton width="40px" height="32px" /> : workflows.filter(wf => wf.status !== 'Active').length}</div>
                    <div className={adminStyles.metricDetail}>Provisioning queue</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>NETWORK UPTIME</span>
                        <ShieldCheck size={14} color="#34D186"/>
                    </div>
                    <div className={adminStyles.metricAmount}>100%</div>
                    <div className={adminStyles.metricDetail}>System registry integrity</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>NODE STATUS</span>
                        <Activity size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>Stable</div>
                    <div className={adminStyles.metricDetail}>Telemetry data stream</div>
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
                                    <th className={adminStyles.registryTH}>Loop Detail</th>
                                    <th className={adminStyles.registryTH}>Requested By</th>
                                    <th className={adminStyles.registryTH}>Identity Hash</th>
                                    <th className={adminStyles.registryTH}>Status</th>
                                    <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Actions</th>
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
                                                <tr key={wf.id} className={adminStyles.registryRow}>
                                                    <td>
                                                        <div className={adminStyles.loopDetail}>
                                                            <div className={adminStyles.loopIcon}>
                                                                <Zap size={18} />
                                                            </div>
                                                            <div>
                                                                <div className={adminStyles.loopName}>{wf.name}</div>
                                                                <div className={adminStyles.loopSector}>{wf.sector || 'General Institutional'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={adminStyles.requesterInfo}>
                                                            <div className={adminStyles.requesterAvatar}>
                                                                {wf.requestedBy?.charAt(0).toUpperCase() || "U"}
                                                            </div>
                                                            <div>
                                                                <div className={adminStyles.requesterName}>{wf.requestedBy || "System Operator"}</div>
                                                                <div className={adminStyles.requesterEmail}>{(wf as any).requestedBy || "operator@firm.com"}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={adminStyles.identityContainer}>
                                                            <code className={adminStyles.identityHash}>{wf.id.substring(0, 16).toUpperCase()}</code>
                                                            <button 
                                                                onClick={() => copyToClipboard(wf.id)}
                                                                className={adminStyles.copyAction}
                                                                title="Copy Full Hash"
                                                            >
                                                                <Copy size={12} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={`${adminStyles.statusBadge} ${wf.status === 'Active' ? adminStyles.statusActive : adminStyles.statusPending}`}>
                                                            <div className={adminStyles.statusPulse} />
                                                            <span>{wf.status === 'Active' ? 'OPERATIONAL' : 'CALIBRATING'}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                className={adminStyles.actionBtnPrimary}
                                                                onClick={() => { setConfigWorkflow(wf); setConfigStep(1); }}
                                                            >
                                                                Configure
                                                            </button>
                                                            <button 
                                                                className={adminStyles.actionBtnDelete}
                                                                onClick={() => deleteWorkflow(wf.id)}
                                                            >
                                                                <Trash2 size={16} />
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
                </div>
            </div>

            {/* CONFIG MODAL */}
            {configWorkflow && (
                <div className={adminStyles.modalOverlay}>
                    <div className={adminStyles.modal}>
                        {/* Modal Header */}
                        <div className={adminStyles.modalHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <Database size={20} color="#34D186" />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>NODE CALIBRATION</span>
                                    </div>
                                    <h3 className={adminStyles.modalTitle}>Production Sync</h3>
                                    <p className={adminStyles.modalSubtitle}>Instance: {configWorkflow.name}</p>
                                </div>
                                <button 
                                    onClick={() => setConfigWorkflow(null)} 
                                    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            {/* Wizard Progress */}
                            <div className={adminStyles.wizardContainer}>
                                {[1, 2, 3].map(s => (
                                    <div 
                                        key={s} 
                                        className={`${adminStyles.wizardStep} ${configStep >= s ? adminStyles.wizardStepActive : ""}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className={adminStyles.modalBody}>
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
                                                    <div key={key} className={adminStyles.parameterCard}>
                                                        <label className={adminStyles.parameterLabel}>{key}</label>
                                                        <div className={adminStyles.parameterValue}>{String(val)}</div>
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
                                        <label className={adminStyles.parameterLabel}>Sovereign Loop Identity</label>
                                        <div style={{ display: 'flex', gap: '16px' }}>
                                            <div style={{ flex: 1, padding: '24px', borderRadius: '24px', background: '#F8F9FA', border: '1px solid #EAEAEA', fontSize: '1.2rem', fontWeight: 950, color: '#0A0A0A', fontFamily: 'monospace', letterSpacing: '-0.02em' }}>
                                                {configWorkflow.id}
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(configWorkflow.id)}
                                                className={styles.btnInstitutional}
                                                style={{ padding: '0 32px', borderRadius: '24px' }}
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
                        <div className={adminStyles.modalFooter}>
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

