"use client";

import styles from "../dashboard/page.module.css";
import adminStyles from "./admin.module.css";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
    Plus,
    Cpu,
    Zap, 
    Database, 
    Server,
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
    TriangleAlert,
    Workflow
} from "lucide-react";

import { Skeleton } from "../components/Skeleton";
import ModalPortal from "../components/ModalPortal";

export default function AdminControlPage() {
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [servers, setServers] = useState<any[]>([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [configWorkflow, setConfigWorkflow] = useState<any>(null);
    const [configStep, setConfigStep] = useState(1);
    
    // Selection states for Production Sync
    const [selectedServerId, setSelectedServerId] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [serverWorkflows, setServerWorkflows] = useState<any[]>([]);
    const [isFetchingLive, setIsFetchingLive] = useState(false);

    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionStep, setProvisionStep] = useState(1);
    const [provisionData, setProvisionData] = useState({
        clientName: "",
        email: "",
        plan: "Institutional",
        nodes: "High (8 vCPU / 32GB)",
    });
    const [webhookUrl, setWebhookUrl] = useState("");
    const [n8nWorkflowId, setN8nWorkflowId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
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

    const toggleMenu = (e: React.MouseEvent, id: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({
            top: rect.bottom + window.scrollY,
            right: window.innerWidth - rect.right - window.scrollX
        });
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    useEffect(() => {
        fetchWorkflows();
        fetchTemplates();
        fetchServers();
        const interval = setInterval(fetchWorkflows, 10000); // Auto-refresh for operational feel
        return () => clearInterval(interval);
    }, []);

    const fetchServers = async () => {
        try {
            const res = await fetch('/api/admin/nodes');
            const data = await res.json();
            if (Array.isArray(data)) {
                setServers(data);
            }
        } catch (error) {
            console.error("Error fetching servers:", error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/templates');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTemplates(data);
            }
        } catch (error) {
            console.error("Error fetching templates:", error);
        }
    };

    const fetchLiveWorkflows = async (serverId: string) => {
        if (!serverId) return;
        setIsFetchingLive(true);
        try {
            const res = await fetch(`/api/admin/nodes/${serverId}/diagnostics`);
            const data = await res.json();
            // We want the RAW n8n workflows here, so we might need a dedicated endpoint or 
            // use the 'workflows' field from diagnostics (but diagnostics now filters them!)
            // Wait, the user said "from node diagnostic take all workflows".
            // If I updated diagnostics to filter, I should probably have a RAW endpoint or 
            // the user might want to see EVERYTHING on that server to pick from.
            
            // Use the 'allWorkflows' field from diagnostics to show EVERY workflow on the server
            if (data && data.allWorkflows) {
                setServerWorkflows(data.allWorkflows);
            } else if (data && data.workflows) {
                // Fallback for safety
                setServerWorkflows(data.workflows);
            }
        } catch (error) {
            console.error("Error fetching live workflows:", error);
        } finally {
            setIsFetchingLive(false);
        }
    };

    const getStatusDetails = (status: string) => {
        switch (status) {
            case 'Initializing': return { color: 'var(--muted-foreground)', progress: 15, icon: <RefreshCcw size={14} className={styles.spinning} /> };
            case 'Connecting': return { color: 'var(--warning)', progress: 45, icon: <Link2 size={14} /> };
            case 'Syncing': return { color: 'var(--accent)', progress: 75, icon: <RefreshCcw size={14} className={styles.spinning} /> };
            case 'Ready': return { color: 'var(--accent)', progress: 100, icon: <CheckCircle2 size={14} /> };
            case 'Active': return { color: 'var(--accent)', progress: 100, icon: <CheckCircle2 size={14} /> };
            case 'Error': return { color: 'var(--destructive)', progress: 0, icon: <AlertCircle size={14} /> };
            default: return { color: 'var(--muted-foreground)', progress: 0, icon: <Activity size={14} /> };
        }
    };

    const filteredWorkflows = workflows.filter(wf => {
        const matchesSearch = String(wf.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(wf.requestedBy || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(wf.id || '').toLowerCase().includes(searchQuery.toLowerCase());
        
        if (!matchesSearch) return false;
        if (activeFilter === "All") return true;
        if (activeFilter === "Errors") return wf.status === 'Error';
        if (activeFilter === "Stuck") return wf.status === 'Syncing' || wf.status === 'Connecting'; 
        return wf.status === activeFilter;
    });

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows');
            const data = await res.json();
            if (Array.isArray(data)) {
                const processed = data.map(wf => ({
                    ...wf,
                    status: wf.status || 'Ready',
                    progress: wf.progress ?? (wf.status === 'Ready' || wf.status === 'Active' ? 100 : 0),
                    createdAt: wf.createdAt || new Date().toISOString(),
                    updatedAt: wf.updatedAt || new Date().toISOString(),
                    userTier: wf.userTier || 'Starter',
                    workflowCount: typeof wf.userWorkflows === 'number' ? wf.userWorkflows : (Array.isArray(wf.userWorkflows) ? wf.userWorkflows.length : 0)
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
            const res = await fetch('/api/admin/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchWorkflows();
        } catch (error: any) { 
            console.error("Workflow update failure:", error);
            alert(`Fleet Instruction Failure: ${error.message}`);
        } finally { setSavingId(null); }
    };

    const updateWebhook = async (id: string, url: string, n8nWfId?: string, srvId?: string, tplId?: string) => {
        setSavingId(id);
        try {
            const res = await fetch('/api/admin/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id, 
                    n8nWebhookUrl: url || undefined, 
                    n8nWorkflowId: n8nWfId,
                    serverId: srvId || undefined,
                    templateId: tplId || undefined
                })
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchWorkflows();
            setConfigWorkflow(null);
            setConfigStep(1);
            setWebhookUrl("");
            setN8nWorkflowId("");
            setSelectedServerId("");
            setSelectedTemplateId("");
        } catch (error: any) { 
            console.error("Webhook calibration failure:", error);
            alert(`Node Calibration Failure: ${error.message}`);
        } finally { setSavingId(null); }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm("Permanently decommission this node instance? This action is irreversible.")) return;
        try {
            const res = await fetch(`/api/admin/workflows?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchWorkflows();
        } catch (error: any) { 
            console.error("Node decommissioning failure:", error);
            alert(`Fleet Decommissioning Failure: ${error.message}`);
        }
    };

    const copyToClipboard = (text: string) => {
        if (typeof window !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(text);
        } else {
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
                    <Skeleton width="48px" height="48px" borderRadius="14px" />
                    <div>
                        <Skeleton width="140px" height="20px" style={{ marginBottom: '8px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Skeleton width="60px" height="12px" />
                            <Skeleton width="40px" height="12px" />
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div className={adminStyles.requesterInfo}>
                    <Skeleton width="36px" height="36px" borderRadius="12px" />
                    <div>
                        <Skeleton width="110px" height="16px" style={{ marginBottom: '4px' }} />
                        <Skeleton width="90px" height="12px" />
                    </div>
                </div>
            </td>
            <td>
                <div style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Skeleton width="70px" height="14px" />
                        <Skeleton width="30px" height="14px" />
                    </div>
                    <Skeleton width="100%" height="6px" borderRadius="10px" />
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Skeleton width="100px" height="18px" />
                    <Skeleton width="120px" height="12px" />
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Skeleton width="38px" height="38px" borderRadius="10px" />
                    <Skeleton width="38px" height="38px" borderRadius="10px" />
                </div>
            </td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            {/* SOVEREIGN INTEGRITY PANEL */}
            <div className={adminStyles.integrityPanel}>
                <div className={adminStyles.integrityHub}>
                    <div className={workflows.some(wf => wf.status === 'Error') ? adminStyles.statusIndicatorCritical : adminStyles.statusIndicatorHealthy}>
                        <div className={adminStyles.beaconPulse} />
                    </div>
                    <div>
                        <h2 className={adminStyles.panelTitle}>Sovereign Fleet: {workflows.some(wf => wf.status === 'Error') ? 'Critical' : 'Operational'}</h2>
                        <p className={adminStyles.panelSubtitle}>All production nodes are currently synced with the regional registry.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <div className={adminStyles.hubItem}>
                        <span className={adminStyles.hubLabel}>Active Nodes</span>
                        <span className={adminStyles.hubValue}>{isLoadingWorkflows ? <Skeleton width="30px" height="24px" /> : workflows.length}</span>
                    </div>
                    <div className={adminStyles.hubItem}>
                        <button 
                            className={adminStyles.refreshBtn} 
                            style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none', padding: '0 24px', width: 'auto' }}
                            onClick={() => setIsProvisioning(true)}
                        >
                            <Plus size={16} style={{ marginRight: '8px' }} /> Provision New Client
                        </button>
                    </div>
                </div>
            </div>

            {/* METRICS CORE */}
            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>System Errors</span>
                        <TriangleAlert size={14} color="var(--destructive)" />
                    </div>
                    <div className={workflows.some(wf => wf.status === 'Error') ? adminStyles.metricAmount : adminStyles.metricAmount}>
                        {isLoadingWorkflows ? <Skeleton width="40px" height="40px" /> : workflows.filter(wf => wf.status === 'Error').length}
                    </div>
                    <div className={adminStyles.metricDetail}>Nodes requiring attention</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Active Sync</span>
                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoadingWorkflows ? <Skeleton width="40px" height="40px" /> : workflows.filter(wf => wf.status === 'Syncing').length}</div>
                    <div className={adminStyles.metricDetail}>Ongoing provisioning</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Fleet Health</span>
                        <ShieldCheck size={14} color="var(--accent)"/>
                    </div>
                    <div className={adminStyles.metricAmount}>98.2%</div>
                    <div className={adminStyles.metricDetail}>Integrity metrics aggregate</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Stuck Handshakes</span>
                        <Clock size={14} color="var(--warning)" />
                    </div>
                    <div className={adminStyles.metricAmount}>{workflows.filter(wf => wf.status === 'Connecting').length}</div>
                    <div className={adminStyles.metricDetail}>Stalled connections (24h)</div>
                </div>
            </div>

            {/* OPERATIONS REGISTRY SECTION */}
            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Operations Control Panel</h3>
                        <p className={adminStyles.registrySubtitle}>Real-time telemetry and granular fleet orchestration.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className={adminStyles.filterBar}>
                            {["All", "Ready", "Syncing", "Errors", "Stuck"].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`${adminStyles.filterBtn} ${activeFilter === f ? adminStyles.filterBtnActive : ''}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className={adminStyles.searchContainer}>
                            <Search className={adminStyles.searchIcon} size={18} />
                            <input 
                                type="text" 
                                placeholder="Search nodes by name or ID..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={adminStyles.searchField}
                            />
                        </div>
                        <button className={adminStyles.refreshBtn} onClick={fetchWorkflows}>
                            <RefreshCcw size={16} className={isLoadingWorkflows ? styles.spinning : ''} />
                        </button>
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                    <thead>
                        <tr>
                            <th className={adminStyles.registryTH}>Identity & Context</th>
                            <th className={adminStyles.registryTH}>Server Deployment</th>
                            <th className={adminStyles.registryTH}>Autonomous Yield</th>
                            <th className={adminStyles.registryTH}>Live Telemetry</th>
                            <th className={adminStyles.registryTH}>Operational State</th>
                            <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Controls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoadingWorkflows ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '60px 0' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <RefreshCcw size={32} className={adminStyles.spinning} color="var(--accent)" />
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', fontWeight: 800 }}>Synchronizing with Global Fleet...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredWorkflows.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '60px 0', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <Search size={32} color="var(--muted)" />
                                        <p style={{ color: 'var(--muted-foreground)', fontWeight: 800 }}>No autonomous loops found in this sector.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredWorkflows.map((wf) => {
                                const sd = getStatusDetails(wf.status);
                                return (
                                    <tr key={wf.id} className={adminStyles.registryRow}>
                                        <td>
                                            <div className={adminStyles.userContext}>
                                                <div className={adminStyles.userMain} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 950, color: 'var(--accent)' }}>
                                                        {wf.workflowCount || 0}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--foreground)' }}>{wf.userEmail || 'Anonymous'}</div>
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            <code style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', fontWeight: 800, background: 'var(--muted)', padding: '2px 6px', borderRadius: '4px' }}>{String(wf.id || '').substring(0, 10)}</code>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{wf.userTier}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {wf.serverName ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Server size={12} color="var(--accent)" />
                                                        {wf.serverName}
                                                    </div>
                                                    <div style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontWeight: 800, fontFamily: 'monospace' }}>
                                                        {wf.serverUrl?.replace(/^https?:\/\//, '')}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 800, fontStyle: 'italic' }}>
                                                    Unassigned Hub
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--muted)', borderRadius: '12px', width: 'fit-content', border: '1px solid var(--border)' }}>
                                                <Zap size={14} color="var(--accent)" />
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--foreground)' }}>{wf.tasksCount || 0}</span>
                                                    <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasks Done</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ padding: '0 8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        {wf.status === 'Active' ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--accent)', color: 'var(--background)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>
                                                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--background)', boxShadow: '0 0 5px var(--background)', animation: 'pulse 1.5s infinite' }} />
                                                                LIVE
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: sd.color, fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                                <Activity size={12} className={wf.status === 'Syncing' ? adminStyles.spinning : ''} />
                                                                <span>{wf.status === 'Passive' ? 'STOPPED' : wf.status}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--foreground)' }}>{wf.progress}%</span>
                                                </div>
                                                <div style={{ height: '5px', width: '100%', background: 'var(--muted)', borderRadius: '10px', overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${wf.progress}%`, background: sd.color, transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--foreground)' }}>
                                                    {wf.status === 'Ready' || wf.status === 'Active' ? 'Integrity Verified' : (wf.errorMessage || 'Syncing node...')}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <Clock size={12} color="var(--muted-foreground)" />
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 800 }}>
                                                        {Math.floor((Date.now() - new Date(wf.updatedAt).getTime()) / 60000)}m ago
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>

                                                <button 
                                                    className={adminStyles.actionIconBtn}
                                                    onClick={(e) => toggleMenu(e, wf.id)}
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                                {activeMenuId === wf.id && (
                                                    <ModalPortal>
                                                        <div 
                                                            ref={menuRef}
                                                            style={{
                                                                position: 'absolute',
                                                                top: `${menuPosition.top + 8}px`,
                                                                right: `${menuPosition.right}px`,
                                                                background: 'var(--card)',
                                                                border: '1px solid var(--border)',
                                                                borderRadius: '16px',
                                                                boxShadow: 'var(--shadow-lg)',
                                                                zIndex: 10000,
                                                                minWidth: '200px',
                                                                padding: '8px',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            <button 
                                                                className={adminStyles.filterBtn} 
                                                                style={{ display: 'flex', alignItems: 'center', border: 'none', justifyContent: 'flex-start', padding: '12px', width: '100%', fontSize: '0.85rem' }}
                                                                onClick={() => { updateWorkflowStatus(wf.id, 'Syncing'); setActiveMenuId(null); }}
                                                            >
                                                                <RotateCcw size={14} style={{ marginRight: '12px' }} /> Force Sync
                                                            </button>
                                                            <button 
                                                                className={adminStyles.filterBtn} 
                                                                style={{ display: 'flex', alignItems: 'center', border: 'none', justifyContent: 'flex-start', padding: '12px', width: '100%', fontSize: '0.85rem' }}
                                                                onClick={() => { setConfigWorkflow(wf); setConfigStep(1); setActiveMenuId(null); }}
                                                            >
                                                                <Settings size={14} style={{ marginRight: '12px' }} /> Configure Node
                                                            </button>
                                                            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 8px' }} />
                                                            <button 
                                                                className={adminStyles.filterBtn} 
                                                                style={{ display: 'flex', alignItems: 'center', border: 'none', justifyContent: 'flex-start', padding: '12px', width: '100%', fontSize: '0.85rem', color: 'var(--destructive)' }}
                                                                onClick={() => { deleteWorkflow(wf.id); setActiveMenuId(null); }}
                                                            >
                                                                <Trash2 size={14} style={{ marginRight: '12px' }} /> Delete Instance
                                                            </button>
                                                        </div>
                                                    </ModalPortal>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                    </table>
                </div>
            </div>

            {/* CONFIG MODAL */}
            {configWorkflow && (
                <div className={adminStyles.modalOverlay} style={{ backdropFilter: 'blur(12px)', background: 'rgba(250, 250, 250, 0.6)' }}>
                    <div className={adminStyles.modal} style={{ maxWidth: '640px', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', overflow: 'hidden' }}>
                        <div className={adminStyles.modalHeader} style={{ padding: '32px 40px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, var(--card) 0%, var(--background) 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ width: '10px', height: '10px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 15px var(--accent)' }} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.25em', color: 'var(--accent)' }}>SYSTEM CALIBRATION</span>
                                    </div>
                                    <h3 className={adminStyles.modalTitle} style={{ fontSize: '1.75rem', letterSpacing: '-0.03em', marginBottom: '8px' }}>Production Sync</h3>
                                    <p className={adminStyles.modalSubtitle} style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', fontWeight: 750 }}>
                                        Establish secure link with <span style={{ color: 'var(--foreground)', fontWeight: 950 }}>{configWorkflow.name || 'Autonomous Node'}</span>
                                    </p>
                                </div>
                                <button className={adminStyles.modalClose} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--muted)' }} onClick={() => { 
                                    setConfigWorkflow(null); 
                                    setConfigStep(1); 
                                    setWebhookUrl(""); 
                                    setN8nWorkflowId("");
                                    setSelectedServerId("");
                                    setServerWorkflows([]);
                                }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={adminStyles.wizardContainer} style={{ marginTop: '32px', gap: '12px' }}>
                                {[1, 2, 3].map(s => (
                                    <div key={s} style={{ flex: 1, height: '4px', background: configStep >= s ? 'var(--accent)' : 'var(--border)', borderRadius: '10px', transition: 'all 0.5s ease' }} />
                                ))}
                            </div>
                        </div>

                        <div className={adminStyles.modalBody} style={{ padding: '40px' }}>
                            {configStep === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Database size={24} color="var(--foreground)" />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--foreground)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inbound Parameters</h4>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 750 }}>Verified node operational variables</div>
                                        </div>
                                    </div>

                                    <div className={adminStyles.parameterGrid} style={{ gap: '20px' }}>
                                        {(() => {
                                            let data = {};
                                            try {
                                                data = typeof configWorkflow.inputs === 'string' 
                                                    ? JSON.parse(configWorkflow.inputs) 
                                                    : configWorkflow.inputs;
                                                if (typeof data === 'string') data = JSON.parse(data);
                                            } catch (e) { data = {}; }
                                            
                                            const entries = Object.entries(data || {});
                                            if (entries.length === 0) return (
                                                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '80px 40px', background: 'var(--muted)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                                                    <Database size={40} style={{ color: 'var(--muted-foreground)', margin: '0 auto 20px', opacity: 0.3 }} />
                                                    <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)', fontWeight: 800 }}>No custom data provided.</p>
                                                </div>
                                            );

                                            return entries.map(([key, val]: any) => (
                                                <div key={key} className={adminStyles.parameterCard} style={{ borderRadius: '20px', padding: '20px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                                                    <label className={adminStyles.parameterLabel} style={{ fontSize: '0.65rem', marginBottom: '8px', color: 'var(--muted-foreground)' }}>{key.replace(/_/g, ' ')}</label>
                                                    <div className={adminStyles.parameterValue} style={{ fontSize: '0.95rem', color: 'var(--foreground)', fontWeight: 950 }}>{String(val)}</div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            )}

                            {configStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ background: 'var(--card)', padding: '28px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.3s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{ width: '44px', height: '44px', background: 'var(--muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Server size={22} color="var(--accent)" />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Operational Hub</h4>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 750 }}>Authorized physical cluster</div>
                                            </div>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <select 
                                                className={adminStyles.mainInput}
                                                value={selectedServerId}
                                                onChange={(e) => {
                                                    const srvId = e.target.value;
                                                    setSelectedServerId(srvId);
                                                    fetchLiveWorkflows(srvId);
                                                }}
                                                style={{ appearance: 'none', background: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', paddingRight: '48px', height: '56px', borderRadius: '16px', fontWeight: 800 }}
                                            >
                                                <option value="">Select operational hub registry...</option>
                                                {servers.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name} — {s.url.replace(/^https?:\/\//, '')}</option>
                                                ))}
                                            </select>
                                            <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                                <ChevronDown size={20} color="var(--muted-foreground)" />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: 'var(--card)', padding: '28px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', opacity: !selectedServerId ? 0.6 : 1, transition: 'all 0.3s ease' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                            <div style={{ width: '44px', height: '44px', background: 'var(--muted)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Workflow size={22} color={isFetchingLive ? "var(--accent)" : "var(--foreground)"} className={isFetchingLive ? adminStyles.spinning : ''} />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--foreground)', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Autonomous Node Discovery</h4>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 750 }}>Real-time n8n register mapping</div>
                                            </div>
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <select 
                                                className={adminStyles.mainInput}
                                                value={n8nWorkflowId}
                                                onChange={(e) => setN8nWorkflowId(e.target.value)}
                                                disabled={isFetchingLive || !selectedServerId}
                                                style={{ appearance: 'none', background: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer', paddingRight: '48px', height: '56px', borderRadius: '16px', fontWeight: 800 }}
                                            >
                                                <option value="">{isFetchingLive ? 'Probing cluster registry...' : 'Select detected node...'}</option>
                                                {serverWorkflows.map(wf => (
                                                    <option key={wf.id} value={wf.id}>{wf.name} [{wf.id.substring(0, 8)}]</option>
                                                ))}
                                            </select>
                                            <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                                {isFetchingLive ? <RefreshCcw size={18} className={adminStyles.spinning} color="var(--accent)" /> : <ChevronDown size={20} color="var(--muted-foreground)" />}
                                            </div>
                                        </div>
                                        {selectedServerId && !isFetchingLive && serverWorkflows.length === 0 && (
                                            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--destructive-muted)', borderRadius: '16px', border: '1px solid var(--destructive-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <TriangleAlert size={18} color="var(--destructive)" />
                                                <span style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--destructive)' }}>NODE DISCOVERY FAILED. VERIFY AUTHENTICATION TOKENS.</span>
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.5 }}>
                                            <ShieldCheck size={14} color="var(--muted-foreground)" />
                                            <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted-foreground)' }}>Secured by Sovereign Protocol v4.2</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {configStep === 3 && (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ width: '120px', height: '120px', background: 'var(--accent-muted)', color: 'var(--accent)', borderRadius: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', inset: -10, borderRadius: '45px', border: '2px solid var(--accent)', animation: 'ping 3s infinite', opacity: 0.15 }} />
                                        <CheckCircle2 size={56} />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '2.2rem', color: 'var(--foreground)', fontWeight: 950, letterSpacing: '-0.05em' }}>Handshake Ready</h4>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', maxWidth: '440px', margin: '24px auto 0', lineHeight: '1.6', fontWeight: 750 }}>
                                        Internal registers synchronized. Establishing this link will activate real-time telemetry and full administrative control for the fleet requester.
                                    </p>
                                    
                                    <div style={{ marginTop: '40px', padding: '20px', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
                                        <code style={{ fontSize: '0.85rem', color: 'var(--foreground)', fontWeight: 950, letterSpacing: '0.05em' }}>{String(configWorkflow.id).substring(0, 24)}...</code>
                                        <button 
                                            onClick={() => {
                                                navigator.clipboard.writeText(configWorkflow.id);
                                            }}
                                            style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 950, cursor: 'pointer' }}
                                        >
                                            COPY ID
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={adminStyles.modalFooter} style={{ padding: '32px 40px', background: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                            <button className={styles.btnOutline} style={{ padding: '0 32px', height: '56px', borderRadius: '18px', background: 'var(--card)' }} onClick={() => configStep > 1 ? setConfigStep(prev => prev - 1) : setConfigWorkflow(null)}>
                                {configStep === 1 ? 'Discard Calibration' : 'Previous Step'}
                            </button>
                            <button 
                                className={styles.btnInstitutional} 
                                style={{ background: configStep === 3 ? 'var(--accent)' : 'var(--foreground)', color: 'var(--background)', minWidth: '240px', height: '56px', borderRadius: '18px', fontSize: '0.95rem', fontWeight: 950 }}
                                onClick={() => configStep < 3 ? setConfigStep(prev => prev + 1) : updateWebhook(configWorkflow.id, webhookUrl, n8nWorkflowId, selectedServerId, selectedTemplateId)}
                                disabled={savingId === configWorkflow.id || (configStep === 2 && (!selectedServerId || !n8nWorkflowId))}
                            >
                                {savingId === configWorkflow.id ? 'SYNCHRONIZING...' : (configStep === 3 ? 'ACTIVATE NODE LINK' : 'CONTINUE CALIBRATION')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isProvisioning && (
                <div className={adminStyles.modalOverlay}>
                    <div className={adminStyles.modal}>
                        <div className={adminStyles.modalHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted-foreground)' }}>FLEET PROVISIONING</span>
                                    </div>
                                    <h3 className={adminStyles.modalTitle}>Establish New Node</h3>
                                    <p className={adminStyles.modalSubtitle}>Initialize institutional infrastructure for a new client.</p>
                                </div>
                                <button className={adminStyles.modalClose} onClick={() => { setIsProvisioning(false); setProvisionStep(1); }}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className={adminStyles.wizardContainer}>
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`${adminStyles.wizardStep} ${provisionStep >= s ? adminStyles.wizardStepActive : ""}`} />
                                ))}
                            </div>
                        </div>

                        <div className={adminStyles.modalBody}>
                            {provisionStep === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <div className={adminStyles.inputWrapper}>
                                        <label className={adminStyles.parameterLabel}>Firm Name</label>
                                        <input 
                                            type="text" 
                                            className={adminStyles.mainInput} 
                                            placeholder="e.g. Goldman Sachs Institutional" 
                                            value={provisionData.clientName}
                                            onChange={(e) => setProvisionData({...provisionData, clientName: e.target.value})}
                                        />
                                    </div>
                                    <div className={adminStyles.inputWrapper}>
                                        <label className={adminStyles.parameterLabel}>Sovereign Email</label>
                                        <input 
                                            type="email" 
                                            className={adminStyles.mainInput} 
                                            placeholder="admin@firm.com" 
                                            value={provisionData.email}
                                            onChange={(e) => setProvisionData({...provisionData, email: e.target.value})}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                        {['Starter', 'Pro', 'Institutional'].map(p => (
                                            <button 
                                                key={p}
                                                className={adminStyles.filterBtn}
                                                style={{ 
                                                    height: '80px', 
                                                    flexDirection: 'column', 
                                                    gap: '8px', 
                                                    border: provisionData.plan === p ? '2px solid var(--accent)' : '1px solid var(--border)',
                                                    background: provisionData.plan === p ? 'var(--accent-muted)' : 'var(--card)'
                                                }}
                                                onClick={() => setProvisionData({...provisionData, plan: p})}
                                            >
                                                <ShieldCheck size={18} color={provisionData.plan === p ? 'var(--accent)' : 'var(--muted-foreground)'} />
                                                <span style={{ fontSize: '0.75rem', fontWeight: 950 }}>{p}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {provisionStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    <h4 style={{ fontSize: '0.85rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Node Resource Assignment</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[
                                            { name: 'Standard', specs: '2 vCPU / 8GB RAM', cost: 'Included' },
                                            { name: 'Enterprise', specs: '4 vCPU / 16GB RAM', cost: '+€49/mo' },
                                            { name: 'Sovereign', specs: '8 vCPU / 32GB RAM', cost: '+€99/mo' }
                                        ].map(n => (
                                            <button 
                                                key={n.name}
                                                className={adminStyles.filterBtn}
                                                style={{ 
                                                    padding: '20px', 
                                                    justifyContent: 'space-between', 
                                                    width: '100%',
                                                    border: provisionData.nodes.includes(n.name) || (n.name === 'Sovereign' && provisionData.nodes.includes('High')) ? '2px solid var(--accent)' : '1px solid var(--border)',
                                                    background: provisionData.nodes.includes(n.name) || (n.name === 'Sovereign' && provisionData.nodes.includes('High')) ? 'var(--accent-muted)' : 'var(--card)'
                                                }}
                                                onClick={() => setProvisionData({...provisionData, nodes: n.specs})}
                                            >
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                                    <Cpu size={24} />
                                                    <div style={{ textAlign: 'left' }}>
                                                        <div style={{ fontWeight: 950 }}>{n.name} Node</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{n.specs}</div>
                                                    </div>
                                                </div>
                                                <span style={{ fontWeight: 950, color: 'var(--accent)' }}>{n.cost}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {provisionStep === 3 && (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '100px', height: '100px', background: 'var(--accent-muted)', color: 'var(--accent)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' }}>
                                        <Zap size={48} />
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '2rem', color: 'var(--foreground)', fontWeight: 950, letterSpacing: '-0.04em' }}>Ready for Deployment</h4>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', maxWidth: '420px', margin: '24px auto 0', lineHeight: '1.6', fontWeight: 750 }}>
                                        One button to establish the integration and provision all sovereign infrastructure for <strong>{provisionData.clientName}</strong>.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className={adminStyles.modalFooter}>
                            <button className={styles.btnOutline} style={{ padding: '0 32px', height: '52px', borderRadius: '16px' }} onClick={() => provisionStep > 1 ? setProvisionStep(prev => prev - 1) : setIsProvisioning(false)}>
                                {provisionStep === 1 ? 'Discard' : 'Back'}
                            </button>
                            <button 
                                className={styles.btnInstitutional} 
                                style={{ background: provisionStep === 3 ? 'var(--accent)' : 'var(--foreground)', color: 'var(--background)', minWidth: '220px', height: '52px', borderRadius: '16px' }}
                                onClick={() => provisionStep < 3 ? setProvisionStep(prev => prev + 1) : alert("Deployment Initialized... Initializing Node Cluster.")}
                                disabled={provisionStep === 1 && (!provisionData.clientName || !provisionData.email)}
                            >
                                {provisionStep === 3 ? 'ESTABLISH INTEGRATION' : 'NEXT STEP'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

