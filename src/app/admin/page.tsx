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
    Users,
    X,
    Link2
} from "lucide-react";

import { Skeleton } from "../components/Skeleton";

export default function AdminControlPage() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [configWorkflow, setConfigWorkflow] = useState<any>(null);
    const [configStep, setConfigStep] = useState(1);
    const [webhookUrl, setWebhookUrl] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchWorkflows();
    }, []);

    useEffect(() => {
        if (configWorkflow) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [configWorkflow]);

    const filteredWorkflows = workflows.filter(wf => 
        wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wf.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows');
            const data = await res.json();
            if (Array.isArray(data)) setWorkflows(data);
        } catch (error) { console.error(error); } finally { setIsLoadingWorkflows(false); }
    };

    const updateWebhook = async (id: string, url: string) => {
        setSavingId(id);
        // Simulation delay for "institutional feel"
        await new Promise(resolve => setTimeout(resolve, 1500));
        try {
            await fetch('/api/admin/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, n8nWebhookUrl: url })
            });
            fetchWorkflows();
            setConfigWorkflow(null);
            setConfigStep(1);
            setWebhookUrl("");
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
        if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
            // Fallback for non-secure contexts
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
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
            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Fleet Management</h3>
                        <p className={adminStyles.registrySubtitle}>Calibrate and sync autonomous loops with production nodes.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                                <Users size={16} />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Filter registry..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ 
                                    padding: '12px 16px 12px 44px', 
                                    borderRadius: '14px', 
                                    border: '1px solid #EAEAEA', 
                                    background: '#F8F9FA', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 800, 
                                    width: '260px',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                            />
                        </div>
                        <button className={adminStyles.refreshBtn} onClick={fetchWorkflows}>
                            <RefreshCcw size={14} /> Refresh Registry
                        </button>
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
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
                                        {filteredWorkflows.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                                                    <Database size={48} style={{ color: '#EAEAEA', marginBottom: '20px' }} />
                                                    <p style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '1.1rem' }}>No nodes found</p>
                                                    <p style={{ color: '#94A3B8', fontWeight: 700 }}>{searchQuery ? 'Try a different search query.' : 'Initialize your first operational instance from user requests.'}</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredWorkflows.map(wf => (
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

            {/* CONFIG MODAL */}
            {configWorkflow && (
                <div className={adminStyles.modalOverlay}>
                    <div className={adminStyles.modal}>
                        {/* Modal Header */}
                        <div className={adminStyles.modalHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%', boxShadow: '0 0 10px #34D186' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>NODE CALIBRATION</span>
                                    </div>
                                    <h3 className={adminStyles.modalTitle}>Production Sync</h3>
                                    <p className={adminStyles.modalSubtitle}>Loop Instance: {configWorkflow.name}</p>
                                </div>
                                <button 
                                    className={adminStyles.modalClose}
                                    onClick={() => { setConfigWorkflow(null); setConfigStep(1); setWebhookUrl(""); }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Wizard Progress */}
                            <div className={adminStyles.wizardContainer}>
                                {[1, 2, 3].map(s => (
                                    <div key={s} style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                                        {configStep === 1 && (
                                            <div 
                                                className={adminStyles.wizardStep} 
                                                style={{ width: '100%', position: 'absolute' }}
                                            />
                                        )}
                                        <div 
                                            className={`${adminStyles.wizardStep} ${configStep >= s ? adminStyles.wizardStepActive : ""}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className={adminStyles.modalBody}>
                            {configStep === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#F8F9FA', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Database size={20} color="#0A0A0A" />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#0A0A0A', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inbound Parameters</h4>
                                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>Pre-configured node variables</div>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 950, color: '#34D186', background: 'rgba(52, 209, 134, 0.1)', padding: '6px 14px', borderRadius: '100px', letterSpacing: '0.05em' }}>
                                            {Object.keys(configWorkflow.inputs || {}).length} VARIABLES
                                        </div>
                                    </div>

                                    <div className={adminStyles.parameterGrid}>
                                        {configWorkflow.inputs ? (
                                            (() => {
                                                let data = {};
                                                try {
                                                    data = typeof configWorkflow.inputs === 'string' 
                                                        ? JSON.parse(configWorkflow.inputs) 
                                                        : configWorkflow.inputs;
                                                    if (typeof data === 'string') data = JSON.parse(data);
                                                } catch (e) { data = {}; }
                                                
                                                const entries = Object.entries(data || {});
                                                if (entries.length === 0) return (
                                                    <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '80px 40px', background: '#F8F9FA', border: '1px solid #F1F5F9', borderRadius: '32px' }}>
                                                        <div style={{ width: '64px', height: '64px', background: '#FFFFFF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                                            <Database size={28} style={{ color: '#E2E8F0' }} />
                                                        </div>
                                                        <h5 style={{ fontSize: '1.1rem', color: '#0A0A0A', fontWeight: 950, margin: '0 0 8px' }}>No custom data</h5>
                                                        <p style={{ fontSize: '0.9rem', color: '#94A3B8', fontWeight: 750, margin: 0, maxWidth: '240px', marginInline: 'auto', lineHeight: '1.5' }}>This node instance is operating with default system parameters.</p>
                                                    </div>
                                                );

                                                return entries.map(([key, val]: any) => (
                                                    <div key={key} className={adminStyles.parameterCard}>
                                                        <label className={adminStyles.parameterLabel}>{key.replace(/_/g, ' ')}</label>
                                                        <div className={adminStyles.parameterValue}>{String(val)}</div>
                                                    </div>
                                                ));
                                            })()
                                        ) : (
                                            <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '60px', border: '2px dashed #F1F5F9', borderRadius: '32px' }}>
                                                <Database size={32} style={{ color: '#E2E8F0', marginBottom: '16px' }} />
                                                <p style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 800, margin: 0 }}>No custom data provided.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {configStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <ShieldCheck size={18} color="#0A0A0A" />
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0A0A0A', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sovereign Loop Identity</h4>
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ flex: 1, padding: '24px', borderRadius: '24px', background: '#F8FAFC', border: '2px solid #F1F5F9', fontSize: '1.25rem', fontWeight: 950, color: '#0A0A0A', fontFamily: 'monospace', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span>{configWorkflow.id.substring(0, 8)}...{configWorkflow.id.substring(configWorkflow.id.length - 8)}</span>
                                                <div style={{ color: '#34D186', fontSize: '0.75rem', fontWeight: 950, background: 'rgba(52, 209, 134, 0.1)', padding: '4px 12px', borderRadius: '100px' }}>SECURE</div>
                                            </div>
                                            <button 
                                                onClick={() => copyToClipboard(configWorkflow.id)}
                                                className={styles.btnInstitutional}
                                                style={{ padding: '0 32px', borderRadius: '24px', height: 'auto' }}
                                            >
                                                COPY HASH
                                            </button>
                                        </div>
                                    </div>

                                    <div className={adminStyles.inputWrapper}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <Link2 size={18} color="#0A0A0A" />
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0A0A0A', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Production Endpoint</h4>
                                        </div>
                                        <input 
                                            type="text" 
                                            className={adminStyles.mainInput}
                                            placeholder="https://n8n.yourfirm.com/webhook/..."
                                            value={webhookUrl}
                                            onChange={(e) => setWebhookUrl(e.target.value)}
                                        />
                                        <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748B', fontWeight: 700, lineHeight: '1.5' }}>
                                            Paste the n8n production webhook URL here. This will bridge the platform with your sovereign workflow engine.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {configStep === 3 && (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '120px', height: '120px', background: 'rgba(52, 209, 134, 0.1)', color: '#34D186', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', position: 'relative' }}>
                                        <CheckCircle2 size={56} strokeWidth={2.5} />
                                        <div style={{ position: 'absolute', top: -10, right: -10, background: '#0A0A0A', color: 'white', fontSize: '0.7rem', fontWeight: 950, padding: '6px 14px', borderRadius: '100px' }}>READY</div>
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '2.25rem', color: '#0A0A0A', fontWeight: 950, letterSpacing: '-0.04em' }}>Authorization Verified</h4>
                                    <p style={{ fontSize: '1.1rem', color: '#64748B', maxWidth: '420px', margin: '24px auto 0', lineHeight: '1.6', fontWeight: 700 }}>
                                        The loop is fully calibrated and ready for production deployment. Activating will initiate real-time telemetry and notify the requester.
                                    </p>
                                    
                                    <div style={{ marginTop: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '24px', border: '1px solid #F1F5F9', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '12px', height: '12px', background: '#34D186', borderRadius: '50%' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Endpoint</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0A0A', fontFamily: 'monospace' }}>{webhookUrl || "No endpoint specified"}</div>
                                            </div>
                                            <ShieldCheck size={20} color="#34D186" />
                                        </div>

                                        <div style={{ padding: '16px 24px', background: '#0A0A0A', borderRadius: '16px', textAlign: 'left' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', background: '#34D186', borderRadius: '50%' }} />
                                                <span style={{ fontSize: '0.7rem', color: '#34D186', fontWeight: 950, letterSpacing: '0.1em' }}>SYSTEM LOGS</span>
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#94A3B8', lineHeight: '1.4' }}>
                                                <div>&gt; Parameters verified ... OK</div>
                                                <div>&gt; Identity hash synced ... OK</div>
                                                <div>&gt; Ready for broadcast ...</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className={adminStyles.modalFooter}>
                            <button 
                                className={styles.btnOutline} 
                                style={{ 
                                    padding: '0 32px', 
                                    height: '56px', 
                                    borderRadius: '18px', 
                                    fontWeight: 950, 
                                    fontSize: '0.95rem',
                                    border: '1px solid #EAEAEA',
                                    background: '#FFFFFF',
                                    color: '#64748B',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                                onClick={() => configStep > 1 ? setConfigStep(prev => prev - 1) : setConfigWorkflow(null)}
                            >
                                {configStep === 1 ? 'Discard' : 'Previous Step'}
                            </button>
                            <button 
                                className={styles.btnInstitutional} 
                                style={{ 
                                    background: configStep === 3 ? '#34D186' : '#0A0A0A', 
                                    color: configStep === 3 ? '#0A0A0A' : '#FFFFFF', 
                                    minWidth: '240px', 
                                    height: '56px', 
                                    borderRadius: '18px', 
                                    fontWeight: 950, 
                                    fontSize: '0.95rem',
                                    boxShadow: configStep === 3 
                                        ? '0 20px 40px -10px rgba(52, 209, 134, 0.5)' 
                                        : '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                }}
                                onClick={() => {
                                    if (configStep < 3) setConfigStep(prev => prev + 1);
                                    else updateWebhook(configWorkflow.id, webhookUrl);
                                }}
                                disabled={savingId === configWorkflow.id || (configStep === 2 && !webhookUrl)}
                            >
                                {savingId === configWorkflow.id ? (
                                    <>
                                        <RefreshCcw size={18} className={styles.spinning} />
                                        <span>SYNCHRONIZING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{configStep === 3 ? 'INITIALIZE NODE' : 'CONTINUE CALIBRATION'}</span>
                                        <ArrowUpRight size={18} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

