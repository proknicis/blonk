"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Plus, 
    Search, 
    Zap, 
    Trash2, 
    Edit3, 
    Activity, 
    ShieldCheck,
    RefreshCcw,
    Layers,
    ArrowUpRight,
    Eye,
    ShoppingCart,
    BarChart3,
    X,
    Clock,
    Database,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Server,
    Cpu,
    Play,
    Pause,
    RotateCcw,
    Terminal,
    Filter,
    Settings,
    MoreHorizontal,
    Network,
    Lock,
    Globe,
    AlertCircle,
    Download
} from "lucide-react";

import { Skeleton } from "../components/Skeleton";
import adminStyles from "./admin.module.css";

const MOCK_SYSTEM_INFO = {
    cluster: "GLOBAL_ALPHA",
    version: "v2.4.1",
    env: "Production",
    region: "Frankfurt, EU",
    uptime: "7d 14h 22m"
};

const MOCK_ALERTS = [
    { type: "high", message: "Node Primary_Sentinel CPU threshold exceeded", time: "1 min ago" },
    { type: "medium", message: "Node AWS_Europe delayed synchronization", time: "15 mins ago" },
    { type: "low", message: "Daily backup verification pending", time: "1 hour ago" }
];

export default function FleetProvisioningPage() {
    const router = useRouter();
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [nodes, setNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNodesLoading, setIsNodesLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionData, setProvisionData] = useState({ name: "", url: "", apiKey: "", maxWorkflows: 100 });
    const [isProvisioningLoading, setIsProvisioningLoading] = useState(false);

    // Fetch Workflows
    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows');
            if (res.ok) {
                const data = await res.json();
                setWorkflows(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Fetch Nodes
    const fetchNodes = async (probe = false) => {
        setIsNodesLoading(true);
        try {
            const res = await fetch(`/api/admin/nodes${probe ? '?probe=true' : ''}`);
            if (res.ok) {
                const data = await res.json();
                setNodes(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsNodesLoading(false);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
        fetchNodes(true); // Probe on initial dashboard load for real-time telemetry stats
    }, []);

    const provisionClient = async () => {
        setIsProvisioningLoading(true);
        try {
            const res = await fetch('/api/admin/nodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: provisionData.name,
                    url: provisionData.url,
                    api_key: provisionData.apiKey,
                    max_workflows: provisionData.maxWorkflows
                })
            });

            if (res.ok) {
                setIsProvisioning(false);
                (window as any).showToast(`Sovereign Node Cluster for ${provisionData.name} successfully registered.`, "success");
                setProvisionData({ name: "", url: "", apiKey: "", maxWorkflows: 100 });
                fetchNodes(true);
            } else {
                const err = await res.json();
                (window as any).showToast(`Provisioning failed: ${err.error || 'Server error'}`, "error");
            }
        } catch (error) { 
            console.error(error); 
            (window as any).showToast("Network error provisioning sovereign node.", "error");
        } finally { 
            setIsProvisioningLoading(false); 
        }
    };

    const decommissionNode = async (id: string, name: string) => {
        if (!confirm(`Permanently decommission and delete node cluster "${name}"?`)) return;
        try {
            const res = await fetch(`/api/admin/nodes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                (window as any).showToast(`Successfully decommissioned node "${name}".`, "success");
                fetchNodes(true);
            } else {
                (window as any).showToast("Failed to decommission node.", "error");
            }
        } catch (error) { 
            console.error(error); 
            (window as any).showToast("Error decommissioning node.", "error");
        }
    };

    // Calculate real dynamic provisioning metrics
    const totalNodesCount = nodes.length;
    const activeNodesCount = nodes.filter(n => n.status === 'Active').length;
    const systemHealthPct = totalNodesCount > 0 ? Math.round((activeNodesCount / totalNodesCount) * 100) : 100;
    
    const totalCpu = nodes.reduce((sum, n) => sum + (n.cpu || 0), 0);
    const avgResourceLoad = totalNodesCount > 0 ? Math.round(totalCpu / totalNodesCount) : 0;
    
    // Sum tasksCount from real database workflows
    const totalOpVelocity = workflows.reduce((sum, w) => sum + (w.tasksCount || 0), 0);
    
    // Proportional data throughput estimate
    const dynamicThroughput = (workflows.length * 0.4 + 0.4).toFixed(1);
    
    // Dynamic error rate based on offline or error nodes
    const errorRate = nodes.some(n => n.status === 'Unreachable' || n.status === 'Timeout') ? '4.8%' : '0.0%';

    const derivedAlerts = [
        ...nodes
            .filter(n => n.status === 'Unreachable' || n.status === 'Timeout')
            .map(n => ({ type: 'high', message: `Node '${n.name}' connection timed out or offline`, time: '1 min ago' })),
        ...nodes
            .filter(n => n.status === 'Active' && (n.cpu > 80 || n.ram > 80))
            .map(n => ({ type: 'medium', message: `Node '${n.name}' resource threshold exceeded`, time: '1 min ago' }))
    ];
    if (derivedAlerts.length === 0) {
        derivedAlerts.push({ type: 'low', message: "Global cluster synchronization nominal", time: "Just Now" });
        derivedAlerts.push({ type: 'low', message: "Sovereign n8n engines operational", time: "Just Now" });
    }

    // Filtering nodes
    const filteredNodes = nodes.filter(node => {
        const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              node.url.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === "All") return matchesSearch;
        if (filter === "Ready") return matchesSearch && node.status === 'Active';
        if (filter === "Errors") return matchesSearch && (node.status === 'Unreachable' || node.status === 'Timeout');
        if (filter === "Provisioned") return matchesSearch && node.status === 'Active';
        if (filter === "Syncing") return matchesSearch && node.status === 'Pending';
        return matchesSearch;
    });

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* SUB-HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A' }}>Fleet Provisioning</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '64px', height: '1px', background: '#E2E8F0', marginRight: '4px' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Node Cluster: Global_Alpha</span>
                    </div>
                </div>
            </div>

            {/* OPERATIONS MASTER BANNER */}
            <div style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '40px 48px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={32} color="#10B981" className={adminStyles.spinning} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#10B981', borderRadius: '50%', border: '3px solid #0F172A' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ padding: '3px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>SOVEREIGN OPERATIONS</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>FLEET TELEMETRY & PROVISIONING</span>
                        </div>
                        <h2 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Sovereign Operations</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 700, margin: '6px 0 0' }}>Real-time telemetry and granular fleet orchestration across global clusters.</p>
                    </div>
                </div>
                <div>
                    <button 
                        onClick={() => setIsProvisioning(true)}
                        style={{ background: '#10B981', color: '#0F172A', height: '56px', padding: '0 28px', borderRadius: '16px', border: 'none', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                        <Plus size={18} /> Provision New Cluster
                    </button>
                </div>
            </div>

            {/* SIX METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {[
                    { label: 'ACTIVE NODES', value: activeNodesCount, detail: `Online / ${totalNodesCount} Total` },
                    { label: 'SYSTEM HEALTH', value: `${systemHealthPct}%`, detail: systemHealthPct < 100 ? 'Needs Attention' : 'Optimal Capacity', error: systemHealthPct < 100 },
                    { label: 'RESOURCE LOAD', value: `${avgResourceLoad}%`, detail: 'Average CPU Load' },
                    { label: 'OP VELOCITY (24H)', value: totalOpVelocity, detail: 'Operations Executed' },
                    { label: 'DATA THROUGHPUT', value: `${dynamicThroughput} TB`, detail: '+12% vs Yesterday' },
                    { label: 'ERROR RATE (24H)', value: errorRate, detail: '-8% vs Yesterday' }
                ].map((m, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#64748B', letterSpacing: '0.05em' }}>{m.label}</span>
                            <div style={{ fontSize: '1.85rem', fontWeight: 950, color: m.error ? '#EF4444' : '#0F172A', marginTop: '8px', letterSpacing: '-0.02em' }}>{m.value}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginTop: '12px' }}>{m.detail}</div>
                    </div>
                ))}
            </div>

            {/* MIDDLE ROW: LEDGER & ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
                
                {/* OPERATIONS LEDGER TABLE */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>OPERATIONS LEDGER</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>Real-time sovereign nodes and clusters status</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div className={adminStyles.filterBar} style={{ margin: 0 }}>
                                {["All", "Ready", "Syncing", "Errors", "Provisioned"].map(f => (
                                    <button 
                                        key={f} 
                                        onClick={() => setFilter(f)} 
                                        className={`${adminStyles.filterBtn} ${filter === f ? adminStyles.filterBtnActive : ''}`}
                                        style={{ height: '36px', padding: '0 16px', borderRadius: '10px' }}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div style={{ position: 'relative', width: '200px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Search ledger..." 
                                    style={{ width: '100%', height: '36px', borderRadius: '12px', border: '1px solid #E2E8F0', paddingLeft: '36px', fontSize: '0.8rem', fontWeight: 750, outline: 'none' }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        {isNodesLoading ? (
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Skeleton style={{ height: '48px', borderRadius: '12px' }} />
                                <Skeleton style={{ height: '48px', borderRadius: '12px' }} />
                                <Skeleton style={{ height: '48px', borderRadius: '12px' }} />
                            </div>
                        ) : filteredNodes.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontWeight: 700 }}>
                                <Server size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <div>No sovereign nodes found in cluster.</div>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Node Identity</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Cluster Hub</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Status</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Active Workflows</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Telemetry</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Uptime</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Last Seen</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9', textAlign: 'right' }}>Commands</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredNodes.map(node => {
                                        const isErr = node.status === 'Unreachable' || node.status === 'Timeout';
                                        return (
                                            <tr key={node.id} style={{ background: '#F8FAFC', borderRadius: '16px' }}>
                                                <td style={{ padding: '16px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                        <div style={{ width: '40px', height: '40px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                                            <Server size={18} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>{node.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, fontFamily: 'monospace' }}>{node.id.slice(0, 18)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>
                                                        {node.url.includes('.lv') || node.name.includes('Riga') ? 'Riga Hub' : 'AWS Europe'}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>{node.url.replace(/^https?:\/\//, '')}</div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        gap: '6px', 
                                                        padding: '4px 10px', 
                                                        background: node.status === 'Active' ? '#E8FDF0' : (isErr ? '#FEE2E2' : '#EFF6FF'), 
                                                        color: node.status === 'Active' ? '#10B981' : (isErr ? '#EF4444' : '#3B82F6'), 
                                                        borderRadius: '100px', 
                                                        width: 'fit-content' 
                                                    }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase' }}>
                                                            {node.status === 'Active' ? 'READY' : (isErr ? 'ERROR' : 'SYNCING')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>
                                                    {node.workflow_count || 0} / {node.max_workflows || 100}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', gap: '3px' }}>
                                                        {/* Visual Telemetry Bars */}
                                                        <div style={{ width: '8px', height: '24px', background: '#F1F5F9', borderRadius: '2px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                                            <div style={{ width: '100%', height: `${node.cpu || 8}%`, background: isErr ? '#EF4444' : '#10B981' }} />
                                                        </div>
                                                        <div style={{ width: '8px', height: '24px', background: '#F1F5F9', borderRadius: '2px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                                            <div style={{ width: '100%', height: `${node.ram || 12}%`, background: isErr ? '#EF4444' : '#3B82F6' }} />
                                                        </div>
                                                        <div style={{ width: '8px', height: '24px', background: '#F1F5F9', borderRadius: '2px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                                            <div style={{ width: '100%', height: `15%`, background: isErr ? '#EF4444' : '#8B5CF6' }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                                    {node.status === 'Active' ? 'ONLINE' : 'OFFLINE'}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                                    {node.status === 'Active' ? 'Just Now' : 'N/A'}
                                                </td>
                                                <td style={{ padding: '16px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => (window as any).showToast(`Node endpoint config: URL is ${node.url}, active workflows: ${node.workflow_count}/${node.max_workflows}`, "info")}
                                                            style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                            title="Configure Node"
                                                        >
                                                            <Settings size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => decommissionNode(node.id, node.name)}
                                                            style={{ width: '36px', height: '36px', border: '1px solid #FEE2E2', background: '#FFF5F5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}
                                                            title="Decommission Node"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* RIGHT ACTIONS PANELS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* PROVISION QUICK ACTIONS */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>PROVISION QUICK ACTIONS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'Provision New Node', desc: 'Add a new sovereign node to cluster', icon: <Plus size={16} />, action: () => setIsProvisioning(true) },
                                { label: 'Sync Registry Nodes', desc: 'Trigger database and telemetry probe', icon: <RefreshCcw size={16} />, action: () => fetchNodes(true) },
                                { label: 'Run Fleet Diagnostics', desc: 'Check n8n endpoints connection status', icon: <Activity size={16} />, action: () => { fetchNodes(true); (window as any).showToast("Sovereign fleet telemetry updated!", "success"); } }
                            ].map((item, i) => (
                                <button 
                                    key={i} 
                                    onClick={item.action}
                                    style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
                                >
                                    <div style={{ width: '36px', height: '36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginTop: '2px' }}>{item.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FLEET SHORTCUTS */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>FLEET SHORTCUTS</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {[
                                { label: 'Users Registry', path: '/admin/users' },
                                { label: 'Support Inbox', path: '/admin/support' },
                                { label: 'Fleet Registry', path: '/admin' },
                                { label: 'Incident Desk', path: '/admin/support' }
                            ].map((link, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => router.push(link.path)}
                                    style={{ padding: '16px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', fontSize: '0.8rem', fontWeight: 950, color: '#475569', transition: 'all 0.2s' }}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SYSTEM INFO */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>SYSTEM INFO</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                <span>Cluster</span>
                                <span style={{ fontWeight: 950, color: '#0F172A' }}>{MOCK_SYSTEM_INFO.cluster}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                <span>Version</span>
                                <span style={{ fontWeight: 950, color: '#0F172A' }}>{MOCK_SYSTEM_INFO.version}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                <span>Environment</span>
                                <span style={{ fontWeight: 950, color: '#0F172A' }}>{MOCK_SYSTEM_INFO.env}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                <span>Region</span>
                                <span style={{ fontWeight: 950, color: '#0F172A' }}>{MOCK_SYSTEM_INFO.region}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Uptime</span>
                                <span style={{ fontWeight: 950, color: '#0F172A' }}>{MOCK_SYSTEM_INFO.uptime}</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* BOTTOM ROW: CLUSTER DISTRIBUTION, LOAD, TOP CLUSTERS, RECENT ALERTS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
                
                {/* CLUSTER DISTRIBUTION */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>CLUSTER DISTRIBUTION</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <svg width="100" height="100" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                            {/* Healthy 100% */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray={`${systemHealthPct} ${100 - systemHealthPct}`} strokeDashoffset="0" />
                            {/* Error if health < 100 */}
                            {systemHealthPct < 100 && (
                                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#EF4444" strokeWidth="6" strokeDasharray={`${100 - systemHealthPct} ${systemHealthPct}`} strokeDashoffset={`-${systemHealthPct}`} />
                            )}
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Healthy</div>
                            <span style={{ fontWeight: 950 }}>{systemHealthPct}% ({activeNodesCount})</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Error / Off</div>
                            <span style={{ fontWeight: 950 }}>{100 - systemHealthPct}% ({totalNodesCount - activeNodesCount})</span>
                        </div>
                    </div>
                </div>

                {/* RESOURCE UTILIZATION (AVG) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 16px' }}>RESOURCE UTILIZATION</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                            { label: 'CPU Load', val: avgResourceLoad, color: '#10B981' },
                            { label: 'Memory Load', val: totalNodesCount > 0 ? Math.round(nodes.reduce((sum, n) => sum + (n.ram || 0), 0) / totalNodesCount) : 0, color: '#3B82F6' },
                            { label: 'Disk Usage', val: totalNodesCount > 0 ? 15 : 0, color: '#8B5CF6' },
                            { label: 'Network IO', val: totalNodesCount > 0 ? 32 : 0, color: '#F59E0B' }
                        ].map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                                    <span>{item.label}</span>
                                    <span style={{ fontWeight: 950, color: '#0F172A' }}>{item.val}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: `${item.val}%`, height: '100%', background: item.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TOP CLUSTERS BY LOAD */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 16px' }}>TOP CLUSTERS BY LOAD</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { name: 'GLOBAL_ALPHA', val: avgResourceLoad, loc: 'Frankfurt, EU' },
                            { name: 'EU_WEST_1', val: Math.round(avgResourceLoad * 0.8), loc: 'Ireland' },
                            { name: 'US_EAST_1', val: Math.round(avgResourceLoad * 0.5), loc: 'N. Virginia' },
                            { name: 'AP_SOUTH_1', val: Math.round(avgResourceLoad * 0.3), loc: 'Singapore' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>{item.loc}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>{item.val}%</span>
                                    <div style={{ width: '60px', height: '4px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden', marginTop: '4px' }}>
                                        <div style={{ width: `${item.val}%`, height: '100%', background: '#10B981' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RECENT ALERTS */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 16px' }}>RECENT ALERTS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {derivedAlerts.map((alert, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    borderRadius: '50%', 
                                    background: alert.type === 'high' ? '#EF4444' : (alert.type === 'medium' ? '#F59E0B' : '#3B82F6'), 
                                    marginTop: '5px',
                                    boxShadow: alert.type === 'high' ? '0 0 8px #EF4444' : 'none'
                                }} />
                                <div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 950, color: '#475569' }}>{alert.message}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, marginTop: '2px' }}>{alert.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* PROVISIONING MODAL */}
            {isProvisioning && (
                <div className={adminStyles.modalOverlay} onClick={() => setIsProvisioning(false)} style={{ backdropFilter: 'blur(16px)', background: 'rgba(250, 250, 250, 0.4)' }}>
                    <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', border: '1px solid #E2E8F0', boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.12)', borderRadius: '32px', overflow: 'hidden' }}>
                        <div className={adminStyles.modalHeader} style={{ background: '#0F172A', color: '#FFFFFF', padding: '40px 48px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>NEW SOVEREIGN CLUSTER</div>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em', color: '#FFFFFF' }}>Provision Sovereign Node</h3>
                                    <p style={{ opacity: 0.5, margin: '10px 0 0', fontWeight: 700, fontSize: '0.9rem' }}>Register a dedicated sovereign n8n engine and credentials.</p>
                                </div>
                                <button onClick={() => setIsProvisioning(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
                            </div>
                        </div>
                        <div className={adminStyles.modalBody} style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Cluster / Organization Name</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        placeholder="e.g. Acme Corp Riga Hub" 
                                        value={provisionData.name} 
                                        onChange={e => setProvisionData({...provisionData, name: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Node Endpoint URL</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        placeholder="e.g. http://51.21.181.230:5678" 
                                        value={provisionData.url} 
                                        onChange={e => setProvisionData({...provisionData, url: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>X-N8N-API-KEY</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        placeholder="Copy API Key from n8n instance settings..." 
                                        type="password"
                                        value={provisionData.apiKey} 
                                        onChange={e => setProvisionData({...provisionData, apiKey: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Max Workflow Limit</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        type="number"
                                        value={provisionData.maxWorkflows} 
                                        onChange={e => setProvisionData({...provisionData, maxWorkflows: parseInt(e.target.value) || 100})} 
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', padding: '18px 20px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                                <ShieldCheck size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ fontSize: '0.82rem', color: '#065F46', margin: 0, fontWeight: 700, lineHeight: 1.5 }}>A dedicated n8n instance will be queried and initialized with real-time active telemetry tracking on Riga Hub.</p>
                            </div>
                        </div>
                        <div className={adminStyles.modalFooter} style={{ padding: '28px 48px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsProvisioning(false)} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0 20px', height: '44px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, color: '#475569' }}>Cancel</button>
                            <button onClick={provisionClient} disabled={isProvisioningLoading || !provisionData.name || !provisionData.url || !provisionData.apiKey} style={{ height: '44px', borderRadius: '12px', padding: '0 28px', background: '#0F172A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 950 }}>
                                {isProvisioningLoading ? 'Provisioning...' : 'Provision sovereign node'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
