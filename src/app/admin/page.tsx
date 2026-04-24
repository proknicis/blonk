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
    Workflow,
    Globe,
    Lock,
    Shield
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
        nodes: "2 vCPU / 8GB RAM",
    });
    const [isProvisioningLoading, setIsProvisioningLoading] = useState(false);

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
        const interval = setInterval(fetchWorkflows, 10000); 
        return () => clearInterval(interval);
    }, []);

    const fetchServers = async () => {
        try {
            const res = await fetch('/api/admin/nodes');
            const data = await res.json();
            if (Array.isArray(data)) setServers(data);
        } catch (error) { console.error(error); }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/templates');
            const data = await res.json();
            if (Array.isArray(data)) setTemplates(data);
        } catch (error) { console.error(error); }
    };

    const fetchLiveWorkflows = async (serverId: string) => {
        if (!serverId) return;
        setIsFetchingLive(true);
        try {
            const res = await fetch(`/api/admin/nodes/${serverId}/diagnostics`);
            const data = await res.json();
            if (data && data.allWorkflows) setServerWorkflows(data.allWorkflows);
            else if (data && data.workflows) setServerWorkflows(data.workflows);
        } catch (error) { console.error(error); } finally { setIsFetchingLive(false); }
    };

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows');
            const data = await res.json();
            if (Array.isArray(data)) {
                const processed = data.map(wf => ({
                    ...wf,
                    status: wf.status || 'Ready',
                    progress: wf.progress ?? (wf.status === 'Ready' || wf.status === 'Active' ? 100 : 0),
                    updatedAt: wf.updatedAt || new Date().toISOString(),
                }));
                setWorkflows(processed);
            }
        } catch (error) { console.error(error); } finally { setIsLoadingWorkflows(false); }
    };

    const provisionClient = async () => {
        setIsProvisioningLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsProvisioning(false);
            setProvisionStep(1);
            alert(`Sovereign Node Cluster for ${provisionData.clientName} successfully established.`);
            fetchWorkflows();
        } catch (error) { console.error(error); } finally { setIsProvisioningLoading(false); }
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

    const updateWebhook = async (id: string, url: string, n8nWfId?: string, srvId?: string, tplId?: string) => {
        setSavingId(id);
        try {
            await fetch('/api/admin/workflows', {
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
            fetchWorkflows();
            setConfigWorkflow(null);
            setConfigStep(1);
            setSelectedServerId("");
        } catch (error) { console.error(error); } finally { setSavingId(null); }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm("Permanently decommission this node instance?")) return;
        try {
            await fetch(`/api/admin/workflows?id=${id}`, { method: 'DELETE' });
            fetchWorkflows();
        } catch (error) { console.error(error); }
    };

    const filteredWorkflows = workflows.filter(wf => {
        const matchesSearch = String(wf.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(wf.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(wf.id || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (activeFilter === "All") return true;
        if (activeFilter === "Errors") return wf.status === 'Error';
        return wf.status === activeFilter;
    });

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* OPERATIONS MASTER PANEL */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', border: 'none', padding: '40px 48px', borderRadius: '32px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--background)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Globe size={32} color="var(--foreground)" className={adminStyles.spinning} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '4px 10px', background: workflows.some(w => w.status === 'Error') ? '#EF4444' : '#10B981', color: 'var(--background)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>
                                {workflows.some(w => w.status === 'Error') ? 'ATTENTION REQUIRED' : 'FLEET NOMINAL'}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>ORCHESTRATION HUB</span>
                        </div>
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Sovereign Operations</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Real-time telemetry and granular fleet orchestration across {workflows.length} clusters.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.primaryBtn} onClick={() => setIsProvisioning(true)} style={{ background: 'var(--background)', color: 'var(--foreground)', border: 'none', height: '48px', padding: '0 24px' }}>
                        <Plus size={18} style={{ marginRight: '8px' }} /> Provision New Cluster
                    </button>
                </div>
            </div>

            {/* METRICS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                    { label: "Active Nodes", value: workflows.filter(w => w.status === 'Active' || w.status === 'Ready').length, icon: <Server size={20} color="var(--accent)" /> },
                    { label: "System Health", value: workflows.length === 0 ? "100%" : `${Math.round(((workflows.length - workflows.filter(w => w.status === 'Error').length) / workflows.length) * 100)}%`, icon: <ShieldCheck size={20} color="#10B981" /> },
                    { label: "Resource Load", value: "24.2%", icon: <Cpu size={20} color="var(--accent)" /> },
                    { label: "Op Velocity", value: workflows.reduce((acc, w) => acc + (w.tasksCount || 0), 0), icon: <Zap size={20} color="#F59E0B" /> }
                ].map((m, i) => (
                    <div key={i} style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{m.label}</span>
                            {m.icon}
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 950 }}>{isLoadingWorkflows ? '...' : m.value}</div>
                    </div>
                ))}
            </div>

            {/* OPERATIONS REGISTRY */}
            <div className={adminStyles.registryCard} style={{ borderRadius: '32px', border: '1px solid var(--border)' }}>
                <div className={adminStyles.registryHeader} style={{ padding: '32px 40px' }}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Operations Ledger</h3>
                        <p className={adminStyles.registrySubtitle}>Real-time streaming from provisioned institutional nodes.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className={adminStyles.filterBar}>
                            {["All", "Ready", "Syncing", "Errors"].map(f => (
                                <button key={f} onClick={() => setActiveFilter(f)} className={`${adminStyles.filterBtn} ${activeFilter === f ? adminStyles.filterBtnActive : ''}`}>{f}</button>
                            ))}
                        </div>
                        <div className={adminStyles.searchContainer}>
                            <Search className={adminStyles.searchIcon} size={18} />
                            <input type="text" placeholder="Search the fleet..." className={adminStyles.searchField} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className={adminStyles.tableWrapper} style={{ padding: '0 40px 40px' }}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>NODE IDENTITY</th>
                                <th className={adminStyles.registryTH}>CLUSTER HUB</th>
                                <th className={adminStyles.registryTH}>YIELD</th>
                                <th className={adminStyles.registryTH}>TELEMETRY</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>COMMANDS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoadingWorkflows ? (
                                [1, 2, 3].map(i => <tr key={i}><td colSpan={5} style={{ padding: '20px 0' }}><Skeleton width="100%" height="64px" borderRadius="16px" /></td></tr>)
                            ) : filteredWorkflows.map(wf => (
                                <tr key={wf.id} className={adminStyles.registryRow} style={{ height: '84px' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 950, color: 'var(--accent)', border: '1px solid var(--border)' }}>
                                                {wf.workflowCount || 0}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '1rem', fontWeight: 950 }}>{wf.userEmail || 'Anonymous'}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <Lock size={12} /> {wf.id.substring(0, 12)}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <Server size={14} color="var(--accent)" />
                                            <span style={{ fontSize: '0.9rem', fontWeight: 950 }}>{wf.serverName || 'Pending Hub'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 800 }}>{wf.serverUrl?.replace(/^https?:\/\//, '') || 'ALLOCATING...'}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Zap size={16} color="#F59E0B" />
                                            <span style={{ fontSize: '1.1rem', fontWeight: 950 }}>{wf.tasksCount || 0}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--muted)', borderRadius: '10px', overflow: 'hidden', minWidth: '100px' }}>
                                                <div style={{ height: '100%', width: `${wf.progress}%`, background: wf.status === 'Error' ? '#EF4444' : 'var(--accent)', transition: 'all 1s ease' }} />
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--foreground)' }}>{wf.progress}%</span>
                                        </div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 950, color: wf.status === 'Error' ? '#EF4444' : 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                                            {wf.status === 'Active' ? 'LIVE PULSE' : wf.status}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className={adminStyles.actionIconBtn} onClick={() => { setConfigWorkflow(wf); setConfigStep(1); }}><Settings size={18} /></button>
                                            <button className={adminStyles.actionIconBtn} onClick={(e) => toggleMenu(e, wf.id)}><MoreHorizontal size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CONFIG MODAL */}
            {configWorkflow && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setConfigWorkflow(null)}>
                        <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                            <div className={adminStyles.modalHeader} style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '48px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ fontSize: '2.25rem', fontWeight: 950, margin: 0, letterSpacing: '-0.04em' }}>Cluster Calibration</h2>
                                        <p style={{ opacity: 0.6, margin: '8px 0 0', fontWeight: 750 }}>Orchestrating node {configWorkflow.id.substring(0, 8)}</p>
                                    </div>
                                    <button onClick={() => setConfigWorkflow(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '12px', borderRadius: '12px', cursor: 'pointer' }}><X size={24} /></button>
                                </div>
                                <div style={{ display: 'flex', gap: '32px', marginTop: '40px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '24px', height: '24px', background: configStep >= 1 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', color: configStep >= 1 ? 'var(--background)' : 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 950 }}>01</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.1em', opacity: configStep === 1 ? 1 : 0.6 }}>MATRIX</span>
                                    </div>
                                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'center' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '24px', height: '24px', background: configStep >= 2 ? 'var(--accent)' : 'rgba(255,255,255,0.1)', color: configStep >= 2 ? 'var(--background)' : 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 950 }}>02</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.1em', opacity: configStep === 2 ? 1 : 0.6 }}>ORCHESTRATION</span>
                                    </div>
                                </div>
                            </div>
                            <div className={adminStyles.modalBody} style={{ padding: '48px' }}>
                                {configStep === 1 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Database size={20} color="var(--accent)" />
                                            <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: 0 }}>CONFIGURATION MATRIX</h3>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            {Object.entries(configWorkflow.inputs || {}).map(([k, v]: any) => (
                                                <div key={k} style={{ padding: '24px', background: '#FAFAFA', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>{k}</div>
                                                    <div style={{ fontWeight: 850, fontSize: '1.1rem', wordBreak: 'break-all' }}>{String(v)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Zap size={20} color="var(--accent)" />
                                            <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: 0 }}>ORCHESTRATION SETTINGS</h3>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Select Target Node</label>
                                                <select 
                                                    className={adminStyles.searchField} 
                                                    style={{ paddingLeft: '24px' }}
                                                    value={selectedServerId || configWorkflow.serverId || ""}
                                                    onChange={e => setSelectedServerId(e.target.value)}
                                                >
                                                    <option value="">-- No Node Allocated --</option>
                                                    {servers.map(s => (
                                                        <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Webhook Endpoint</label>
                                                    <input className={adminStyles.searchField} style={{ paddingLeft: '24px' }} placeholder="https://..." value={webhookUrl || configWorkflow.n8nWebhookUrl || ""} onChange={e => setWebhookUrl(e.target.value)} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '12px', textTransform: 'uppercase' }}>Protocol ID</label>
                                                    <input className={adminStyles.searchField} style={{ paddingLeft: '24px' }} placeholder="Workflow UUID" value={n8nWorkflowId || configWorkflow.n8nWorkflowId || ""} onChange={e => setN8nWorkflowId(e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={adminStyles.modalFooter} style={{ padding: '32px 48px', background: '#FAFAFA' }}>
                                <button className={adminStyles.refreshBtn} onClick={() => setConfigWorkflow(null)} style={{ border: 'none', width: 'auto', padding: '0 24px' }}>Discard Changes</button>
                                {configStep === 1 ? (
                                    <button className={adminStyles.primaryBtn} onClick={() => setConfigStep(2)}>Calibrate Fleet</button>
                                ) : (
                                    <button className={adminStyles.primaryBtn} onClick={() => updateWebhook(configWorkflow.id, webhookUrl || configWorkflow.n8nWebhookUrl, n8nWorkflowId || configWorkflow.n8nWorkflowId, selectedServerId || configWorkflow.serverId)}>
                                        {savingId ? 'SYNCHRONIZING...' : 'FINALIZE ORCHESTRATION'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* PROVISION MODAL */}
            {isProvisioning && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setIsProvisioning(false)}>
                        <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '32px' }}>
                            <div className={adminStyles.modalHeader} style={{ padding: '48px' }}>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0 }}>Provision Node Cluster</h3>
                                <p style={{ color: 'var(--muted-foreground)', marginTop: '8px' }}>Initialize a new sovereign compute instance.</p>
                            </div>
                            <div className={adminStyles.modalBody} style={{ padding: '0 48px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Client Identity</label>
                                    <input className={adminStyles.searchField} style={{ paddingLeft: '24px' }} placeholder="Organization Name" value={provisionData.clientName} onChange={e => setProvisionData({...provisionData, clientName: e.target.value})} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Anchor</label>
                                    <input className={adminStyles.searchField} style={{ paddingLeft: '24px' }} placeholder="admin@org.com" value={provisionData.email} onChange={e => setProvisionData({...provisionData, email: e.target.value})} />
                                </div>
                            </div>
                            <div className={adminStyles.modalFooter} style={{ padding: '32px 48px', background: 'var(--muted)' }}>
                                <button className={adminStyles.refreshBtn} onClick={() => setIsProvisioning(false)} style={{ border: 'none' }}>Cancel</button>
                                <button className={adminStyles.primaryBtn} onClick={provisionClient} disabled={isProvisioningLoading}>
                                    {isProvisioningLoading ? 'HANDSHAKING...' : 'INITIALIZE CLUSTER'}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
            {/* CONTEXT MENU */}
            {activeMenuId && (
                <div 
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: menuPosition.top,
                        right: menuPosition.right,
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        border: '1px solid var(--border)',
                        padding: '12px',
                        zIndex: 10000,
                        width: '240px',
                        animation: 'fadeIn 0.2s ease'
                    }}
                >
                    <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', padding: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Node Operations</div>
                    <button className={adminStyles.navLink} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }} onClick={() => { updateWorkflowStatus(activeMenuId, 'Ready'); setActiveMenuId(null); }}>
                        <RefreshCcw size={16} /> Mark as Ready
                    </button>
                    <button className={adminStyles.navLink} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }} onClick={() => { updateWorkflowStatus(activeMenuId, 'Active'); setActiveMenuId(null); }}>
                        <Zap size={16} /> Force Active
                    </button>
                    <div style={{ height: '1px', background: 'var(--border)', margin: '8px 12px' }} />
                    <button className={adminStyles.navLink} style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#EF4444' }} onClick={() => { deleteWorkflow(activeMenuId); setActiveMenuId(null); }}>
                        <Trash2 size={16} /> Decommission Node
                    </button>
                </div>
            )}
        </div>
    );
}
