"use client";

import styles from "../dashboard/page.module.css";
import adminStyles from "./admin.module.css";
import React, { useState, useEffect, useRef } from "react";
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
    Link2,
    Search,
    AlertCircle,
    Play,
    Pause,
    RotateCcw,
    Terminal,
    Clock,
    Filter,
    ChevronDown,
    MoreHorizontal,
    TriangleAlert
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
    const [activeFilter, setActiveFilter] = useState("All");
    const [viewingLogs, setViewingLogs] = useState<any>(null);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchWorkflows();
        const interval = setInterval(fetchWorkflows, 10000); // Auto-refresh for operational feel
        return () => clearInterval(interval);
    }, []);

    const getStatusDetails = (status: string) => {
        switch (status) {
            case 'Initializing': return { color: '#64748B', progress: 15, icon: <RefreshCcw size={14} className={styles.spinning} /> };
            case 'Connecting': return { color: '#F59E0B', progress: 45, icon: <Link2 size={14} /> };
            case 'Syncing': return { color: '#3B82F6', progress: 75, icon: <RefreshCcw size={14} className={styles.spinning} /> };
            case 'Ready': return { color: '#34D186', progress: 100, icon: <CheckCircle2 size={14} /> };
            case 'Active': return { color: '#34D186', progress: 100, icon: <CheckCircle2 size={14} /> };
            case 'Error': return { color: '#EF4444', progress: 0, icon: <AlertCircle size={14} /> };
            default: return { color: '#94A3B8', progress: 0, icon: <Activity size={14} /> };
        }
    };

    const filteredWorkflows = workflows.filter(wf => {
        const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wf.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            wf.id.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;
        if (activeFilter === "All") return true;
        if (activeFilter === "Errors") return wf.status === 'Error';
        if (activeFilter === "Stuck") return wf.status === 'Syncing' || wf.status === 'Connecting'; // Simulation of stuck detection
        return wf.status === activeFilter;
    });

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows');
            const data = await res.json();
            if (Array.isArray(data)) {
                // Ensure default values for missing database fields
                const processed = data.map(wf => ({
                    ...wf,
                    status: wf.status || 'Ready',
                    progress: wf.progress ?? (wf.status === 'Ready' || wf.status === 'Active' ? 100 : 0),
                    createdAt: wf.createdAt || new Date().toISOString(),
                    updatedAt: wf.updatedAt || new Date().toISOString(),
                    userTier: wf.userTier || 'Starter',
                    workflowCount: Array.isArray(wf.userWorkflows) ? wf.userWorkflows.length : 0
                }));
                setWorkflows(processed);
            }
        } catch (error) { 
            console.error("Error fetching workflows:", error); 
        } finally { 
            setIsLoadingWorkflows(false); 
        }
    };

    const updateWorkflowStatus = async (id: string, status: string) => {
        setSavingId(id);
        try {
            await fetch('/api/admin/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            fetchWorkflows();
        } catch (error) { console.error(error); } finally { setSavingId(null); }
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
                <div className={adminStyles.adminMetricCard} style={{ borderColor: workflows.some(wf => wf.status === 'Error') ? '#EF4444' : '#F1F5F9' }}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>SYSTEM ERRORS</span>
                        <TriangleAlert size={14} color="#EF4444" />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: workflows.some(wf => wf.status === 'Error') ? '#EF4444' : '#0A0A0A' }}>
                        {isLoadingWorkflows ? <Skeleton width="40px" height="32px" /> : workflows.filter(wf => wf.status === 'Error').length}
                    </div>
                    <div className={adminStyles.metricDetail}>Nodes requiring attention</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>ACTIVE SYNC</span>
                        <div className={adminStyles.beaconPulse} style={{ width: '8px', height: '8px', position: 'relative', background: '#3B82F6', inset: 'auto' }} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoadingWorkflows ? <Skeleton width="40px" height="32px" /> : workflows.filter(wf => wf.status === 'Syncing').length}</div>
                    <div className={adminStyles.metricDetail}>Ongoing provisioning</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>HEALTH SCORE</span>
                        <ShieldCheck size={14} color="#34D186"/>
                    </div>
                    <div className={adminStyles.metricAmount}>98.2%</div>
                    <div className={adminStyles.metricDetail}>Fleet integrity metrics</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>STUCK STATES</span>
                        <Clock size={14} color="#F59E0B" />
                    </div>
                    <div className={adminStyles.metricAmount}>{workflows.filter(wf => wf.status === 'Connecting').length}</div>
                    <div className={adminStyles.metricDetail}>Long-running handshakes</div>
                </div>
            </div>

            {/* MAIN PROVISIONING REGISTRY */}
            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Operations Control Panel</h3>
                        <p className={adminStyles.registrySubtitle}>Real-time telemetry and granular fleet orchestration.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className={adminStyles.filterBar} style={{ marginBottom: 0, borderBottom: 'none' }}>
                            {["All", "Ready", "Syncing", "Errors", "Stuck"].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`${adminStyles.filterBtn} ${activeFilter === f ? adminStyles.filterBtnActive : ''}`}
                                    style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Search className={styles.searchIcon} size={16} style={{ left: '16px' }} />
                            <input 
                                type="text" 
                                placeholder="Search nodes..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ 
                                    padding: '12px 16px 12px 44px', 
                                    borderRadius: '14px', 
                                    border: '1px solid #EAEAEA', 
                                    background: '#F8F9FA', 
                                    fontSize: '0.9rem', 
                                    fontWeight: 800, 
                                    width: '220px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <button className={adminStyles.refreshBtn} onClick={fetchWorkflows}>
                            <RefreshCcw size={14} />
                        </button>
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                            <thead>
                                <tr>
                                    <th className={adminStyles.registryTH}>Node Instance</th>
                                    <th className={adminStyles.registryTH}>User Context</th>
                                    <th className={adminStyles.registryTH}>Telemetry Status</th>
                                    <th className={adminStyles.registryTH}>Operational State</th>
                                    <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingWorkflows ? (
                                    <>
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
                                                    <p style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '1.1rem' }}>No operational nodes found</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredWorkflows.map(wf => {
                                                const sd = getStatusDetails(wf.status);
                                                return (
                                                    <tr key={wf.id} className={adminStyles.registryRow} style={{ background: wf.status === 'Error' ? 'rgba(239, 68, 68, 0.02)' : 'transparent' }}>
                                                        <td>
                                                            <div className={adminStyles.loopDetail}>
                                                                <div className={adminStyles.loopIcon} style={{ background: wf.status === 'Error' ? '#FEF2F2' : '#FFFFFF', color: wf.status === 'Error' ? '#EF4444' : '#0A0A0A' }}>
                                                                    <Zap size={18} />
                                                                </div>
                                                                <div>
                                                                    <div className={adminStyles.loopName}>{wf.name}</div>
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                                        <code className={adminStyles.identityHash} style={{ background: 'transparent', padding: 0 }}>{wf.id.substring(0, 8)}</code>
                                                                        <span style={{ color: '#94A3B8', fontSize: '0.7rem', fontWeight: 700 }}>• {new Date(wf.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={adminStyles.requesterInfo}>
                                                                <div className={adminStyles.requesterAvatar} style={{ width: '32px', height: '32px' }}>
                                                                    {wf.requestedBy?.charAt(0).toUpperCase() || "U"}
                                                                </div>
                                                                <div>
                                                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                                        <span className={adminStyles.requesterName} style={{ fontSize: '0.85rem' }}>{wf.requestedBy}</span>
                                                                        <span className={adminStyles.tierBadge} style={{ fontSize: '0.6rem', padding: '2px 6px', background: wf.userTier === 'Enterprise' ? '#0A0A0A' : '#F1F5F9', color: wf.userTier === 'Enterprise' ? '#34D186' : '#64748B' }}>{wf.userTier}</span>
                                                                    </div>
                                                                    <div className={adminStyles.requesterEmail} style={{ fontSize: '0.7rem' }}>{wf.workflowCount} workflows active</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ width: '180px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: sd.color, fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                                        {sd.icon}
                                                                        <span>{wf.status}</span>
                                                                    </div>
                                                                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#0A0A0A' }}>{wf.progress}%</span>
                                                                </div>
                                                                <div style={{ height: '6px', width: '100%', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                                                    <div style={{ height: '100%', width: `${wf.progress}%`, background: sd.color, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                                </div>
                                                                {wf.status === 'Error' && (
                                                                    <div title={wf.errorMessage} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '8px', color: '#EF4444', fontSize: '0.75rem', fontWeight: 700 }}>
                                                                        <AlertCircle size={12} />
                                                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>{wf.errorMessage}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0A0A0A' }}>
                                                                    {wf.status === 'Ready' ? 'Operational' : 'Calibrating node...'}
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <Clock size={12} color="#94A3B8" />
                                                                    <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700 }}>
                                                                        Updated {Math.floor((Date.now() - new Date(wf.updatedAt).getTime()) / 60000)}m ago
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                                <button 
                                                                    className={adminStyles.actionIconBtn}
                                                                    onClick={() => setViewingLogs(wf)}
                                                                    title="View Node Logs"
                                                                >
                                                                    <Terminal size={16} />
                                                                </button>
                                                                {wf.status === 'Error' ? (
                                                                    <button 
                                                                        className={adminStyles.actionIconBtn}
                                                                        onClick={() => updateWorkflowStatus(wf.id, 'Syncing')}
                                                                        title="Retry Connection"
                                                                        style={{ color: '#3B82F6' }}
                                                                    >
                                                                        <RotateCcw size={16} />
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className={adminStyles.actionIconBtn}
                                                                        onClick={() => updateWorkflowStatus(wf.id, wf.status === 'Paused' ? 'Ready' : 'Paused')}
                                                                        title={wf.status === 'Paused' ? 'Resume' : 'Pause Node'}
                                                                    >
                                                                        {wf.status === 'Paused' ? <Play size={16} /> : <Pause size={16} />}
                                                                    </button>
                                                                )}
                                                                <div style={{ position: 'relative' }} ref={activeMenuId === wf.id ? menuRef : null}>
                                                                    <button 
                                                                        className={adminStyles.actionIconBtn}
                                                                        onClick={() => setActiveMenuId(activeMenuId === wf.id ? null : wf.id)}
                                                                    >
                                                                        <MoreHorizontal size={16} />
                                                                    </button>
                                                                    {activeMenuId === wf.id && (
                                                                         <div style={{
                                                                             position: 'absolute',
                                                                             bottom: 'calc(100% + 8px)',
                                                                             right: 0,
                                                                             background: 'white',
                                                                             border: '1px solid #EAEAEA',
                                                                             borderRadius: '12px',
                                                                             boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
                                                                             zIndex: 100,
                                                                             minWidth: '180px',
                                                                             padding: '8px',
                                                                             display: 'flex',
                                                                             flexDirection: 'column',
                                                                             gap: '4px'
                                                                         }}>
                                                                            <button 
                                                                                className={adminStyles.filterBtn} 
                                                                                style={{ border: 'none', justifyContent: 'flex-start', padding: '10px 12px', width: '100%', fontSize: '0.85rem' }}
                                                                                onClick={() => { updateWorkflowStatus(wf.id, 'Syncing'); setActiveMenuId(null); }}
                                                                            >
                                                                                <RotateCcw size={14} style={{ marginRight: '8px' }} /> Force Sync
                                                                            </button>
                                                                            <button 
                                                                                className={adminStyles.filterBtn} 
                                                                                style={{ border: 'none', justifyContent: 'flex-start', padding: '10px 12px', width: '100%', fontSize: '0.85rem' }}
                                                                                onClick={() => { setConfigWorkflow(wf); setConfigStep(1); setActiveMenuId(null); }}
                                                                            >
                                                                                <Settings size={14} style={{ marginRight: '8px' }} /> Configure Node
                                                                            </button>
                                                                            <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />
                                                                            <button 
                                                                                className={adminStyles.filterBtn} 
                                                                                style={{ border: 'none', justifyContent: 'flex-start', padding: '10px 12px', width: '100%', fontSize: '0.85rem', color: '#EF4444' }}
                                                                                onClick={() => { deleteWorkflow(wf.id); setActiveMenuId(null); }}
                                                                            >
                                                                                <Trash2 size={14} style={{ marginRight: '8px' }} /> Delete Instance
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
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

            {/* LOGS MODAL */}
            {viewingLogs && (
                <div className={adminStyles.modalOverlay} onClick={() => setViewingLogs(null)}>
                    <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className={adminStyles.modalHeader} style={{ background: '#0A0A0A', backgroundImage: 'none', borderBottom: '1px solid #222' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <Terminal size={16} color="#34D186" />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Operational Logs</span>
                                    </div>
                                    <h3 className={adminStyles.modalTitle} style={{ fontSize: '1.5rem' }}>{viewingLogs.name}</h3>
                                    <p className={adminStyles.modalSubtitle} style={{ color: '#64748B' }}>Node ID: {viewingLogs.id}</p>
                                </div>
                                <button className={adminStyles.modalClose} onClick={() => setViewingLogs(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className={adminStyles.modalBody} style={{ padding: '32px', background: '#050505', color: '#D1D5DB', fontFamily: 'monospace', fontSize: '0.85rem', minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { time: '14:22:01', type: 'SYS', msg: 'Initializing production handshake...' },
                                    { time: '14:22:03', type: 'AUTH', msg: 'Security token verified for sovereign access.' },
                                    { time: '14:22:05', type: 'NET', msg: `Establishing tunnel to ${viewingLogs.n8nWebhookUrl || 'remote node'}...` },
                                    { time: '14:22:08', type: 'SYNC', msg: 'Synchronizing local registry with production state.' },
                                    viewingLogs.status === 'Error' ? { time: new Date(viewingLogs.updatedAt).toLocaleTimeString(), type: 'ERR', msg: viewingLogs.errorMessage || 'Unknown system error during handshake.', color: '#EF4444' } : null,
                                    (viewingLogs.status === 'Ready' || viewingLogs.status === 'Active') ? { time: new Date(viewingLogs.updatedAt).toLocaleTimeString(), type: 'OK', msg: 'Node heartbeat established. Operational.', color: '#34D186' } : null,
                                ].filter(Boolean).map((log: any, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px', borderLeft: `2px solid ${log.color || '#222'}`, paddingLeft: '16px' }}>
                                        <span style={{ color: '#4B5563', flexShrink: 0 }}>[{log.time}]</span>
                                        <span style={{ color: log.color || '#34D186', fontWeight: 900, width: '45px', flexShrink: 0 }}>{log.type}</span>
                                        <span style={{ color: log.color || '#D1D5DB' }}>{log.msg}</span>
                                    </div>
                                ))}
                                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', color: '#4B5563' }}>
                                    <RefreshCcw size={12} className={styles.spinning} />
                                    <span>Streaming real-time telemetry...</span>
                                </div>
                            </div>
                        </div>
                        <div className={adminStyles.modalFooter} style={{ background: '#0A0A0A', borderTop: '1px solid #222' }}>
                            <button className={adminStyles.refreshBtn} style={{ background: '#111', borderColor: '#222' }}>
                                <RefreshCcw size={14} /> Clear Buffer
                            </button>
                            <button 
                                className={styles.btnInstitutional} 
                                style={{ height: '44px', padding: '0 24px' }}
                                onClick={() => setViewingLogs(null)}
                            >
                                Close Terminal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

