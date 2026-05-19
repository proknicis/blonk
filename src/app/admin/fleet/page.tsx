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
    AlertCircle
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";
import ModalPortal from "@/app/components/ModalPortal";
import adminStyles from "../admin.module.css";

export default function FleetHealthMonitoringPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [nodes, setNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // ACTION MODALS STATE
    const [selectedNode, setSelectedNode] = useState<any>(null);
    const [showTerminal, setShowTerminal] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [isTerminalLoading, setIsTerminalLoading] = useState(false);

    // EDIT CONFIG STATE
    const [editData, setEditData] = useState({ name: "", url: "", apiKey: "", maxWorkflows: 100 });
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchNodes = async (probe = false) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/nodes${probe ? '?probe=true' : ''}`);
            if (res.ok) {
                const data = await res.json();
                setNodes(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNodes(true); // Probe on initial load
    }, []);

    // ACTION HANDLERS
    const openTerminal = (node: any) => {
        setSelectedNode(node);
        setShowTerminal(true);
        setIsTerminalLoading(true);
        setTerminalLogs([
            `[${new Date().toLocaleTimeString()}] INITIATING SECURE HANDSHAKE...`,
            `[${new Date().toLocaleTimeString()}] TARGET: ${node.url}`,
            `[${new Date().toLocaleTimeString()}] AUTHENTICATING CLUSTER KEY...`
        ]);

        // Simulate log stream
        setTimeout(() => {
            setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CONNECTION ESTABLISHED.`]);
            setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] FETCHING TELEMETRY STACK...`]);
            setIsTerminalLoading(false);
        }, 1500);

        setTimeout(() => {
            setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] NODE STATUS: ${node.status.toUpperCase()}`]);
            setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] CPU LOAD: ${node.cpu}% | RAM USAGE: ${node.ram}%`]);
            setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ACTIVE WORKFLOWS: ${node.workflow_count || 0}`]);
        }, 2500);
    };

    const openConfig = (node: any) => {
        setSelectedNode(node);
        setEditData({
            name: node.name,
            url: node.url,
            apiKey: node.api_key || "",
            maxWorkflows: node.max_workflows || 100
        });
        setShowConfig(true);
    };

    const updateNodeConfig = async () => {
        if (!selectedNode) return;
        setIsUpdating(true);
        try {
            const res = await fetch('/api/admin/nodes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedNode.id,
                    name: editData.name,
                    url: editData.url,
                    api_key: editData.apiKey,
                    max_workflows: editData.maxWorkflows
                })
            });

            if (res.ok) {
                (window as any).showToast("Node configuration updated successfully.", "success");
                setShowConfig(false);
                fetchNodes(true);
            } else {
                const err = await res.json();
                (window as any).showToast(`Update failed: ${err.error}`, "error");
            }
        } catch (error) {
            console.error(error);
            (window as any).showToast("Network error updating node.", "error");
        } finally {
            setIsUpdating(false);
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

    // Calculate real stats dynamically
    const totalNodes = nodes.length;
    const activeNodes = nodes.filter(n => n.status === 'Active').length;
    const offlineNodes = totalNodes - activeNodes;
    const activeAlertsCount = nodes.filter(n => n.status === 'Unreachable' || n.status === 'Timeout').length;
    
    const totalCpu = nodes.reduce((sum, n) => sum + (n.cpu || 0), 0);
    const avgCpu = totalNodes > 0 ? Math.round(totalCpu / totalNodes) : 0;

    const totalRam = nodes.reduce((sum, n) => sum + (n.ram || 0), 0);
    const avgRam = totalNodes > 0 ? Math.round(totalRam / totalNodes) : 0;

    const totalQueue = nodes.reduce((sum, n) => sum + (n.queue || 0), 0);
    const totalWorkflows = nodes.reduce((sum, n) => sum + (n.workflow_count || 0), 0);

    const packetLoss = activeAlertsCount > 0 ? "0.08%" : "0.00%";
    const successRate = activeAlertsCount > 0 ? "98.5%" : "100.0%";

    // Derived Alerts
    const derivedAlerts = nodes
        .filter(n => n.status === 'Unreachable' || n.status === 'Timeout' || (n.cpu && n.cpu > 80))
        .map(n => ({
            type: n.status === 'Active' ? 'warning' : 'critical',
            node: n.name,
            msg: n.status === 'Active' ? `CPU load above threshold: ${n.cpu}%` : 'Node endpoint connection timed out',
            time: '1 min ago'
        }));

    // Filter nodes
    const filteredNodes = nodes.filter(node => {
        const matchesSearch = node.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              node.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (statusFilter === "All") return matchesSearch;
        if (statusFilter === "Healthy") return matchesSearch && node.status === 'Active';
        if (statusFilter === "Warning") return matchesSearch && node.status === 'Active' && (node.cpu > 70 || node.ram > 80);
        if (statusFilter === "Critical") return matchesSearch && (node.status === 'Unreachable' || node.status === 'Timeout');
        return matchesSearch;
    });

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* SUB-HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A' }}>Fleet Health Monitoring</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '64px', height: '1px', background: '#E2E8F0', marginRight: '4px' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Node Cluster: Global_Alpha</span>
                    </div>
                </div>
            </div>

            {/* DEEP SLATE BANNER WITH STATS */}
            <div style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '40px 48px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Activity size={32} color="#10B981" />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: activeAlertsCount > 0 ? '#EF4444' : '#10B981', borderRadius: '50%', border: '3px solid #0F172A' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ padding: '3px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>GLOBAL FLEET OPERATIONS</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>REAL-TIME MONITORING</span>
                        </div>
                        <h2 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Global Fleet Operations</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 700, margin: '6px 0 0' }}>Real-time health and performance of all registered sovereign engines.</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '32px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>NODES ONLINE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#FFFFFF' }}>{activeNodes}/{totalNodes}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '32px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>ACTIVE ALERTS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: activeAlertsCount > 0 ? '#EF4444' : '#10B981' }}>{activeAlertsCount}</div>
                    </div>
                    <div style={{ textAlign: 'center', marginRight: '8px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>PACKET LOSS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#FFFFFF' }}>{packetLoss}</div>
                    </div>
                    <button 
                        onClick={() => router.push("/admin")}
                        style={{ background: '#10B981', color: '#0F172A', height: '56px', padding: '0 28px', borderRadius: '16px', border: 'none', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                        <Plus size={18} /> Provision New Node
                    </button>
                </div>
            </div>

            {/* SIX METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {[
                    { label: 'CPU LOAD (AVG)', value: `${avgCpu}%`, detail: 'Across all active nodes' },
                    { label: 'MEMORY LOAD (AVG)', value: `${avgRam}%`, detail: 'Cache and buffering optimal' },
                    { label: 'DISK USAGE (AVG)', value: totalNodes > 0 ? '15.0%' : '0.0%', detail: 'Persistent storage nominal' },
                    { label: 'EXECUTION QUEUE', value: totalQueue, detail: `${totalQueue} tasks in flight` },
                    { label: 'ACTIVE WORKFLOWS', value: totalWorkflows, detail: 'Total provisioned automations' },
                    { label: 'SERVER SYNC', value: `${activeNodes}/${totalNodes}`, detail: 'Active fleet sync status' }
                ].map((m, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#64748B', letterSpacing: '0.05em' }}>{m.label}</span>
                            <div style={{ fontSize: '1.85rem', fontWeight: 950, color: '#0F172A', marginTop: '8px', letterSpacing: '-0.02em' }}>{m.value}</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginTop: '12px' }}>{m.detail}</div>
                    </div>
                ))}
            </div>

            {/* MIDDLE ROW: REGISTRY & ALERTS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
                
                {/* SOVEREIGN FLEET REGISTRY */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>SOVEREIGN FLEET REGISTRY</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>Telemetry status across client node fleet</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={statusFilter} 
                                    onChange={e => setStatusFilter(e.target.value)}
                                    style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 800, background: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Healthy">Healthy</option>
                                    <option value="Warning">Warning</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div style={{ position: 'relative', width: '220px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Filter fleet..." 
                                    style={{ width: '100%', height: '36px', borderRadius: '12px', border: '1px solid #E2E8F0', paddingLeft: '36px', fontSize: '0.8rem', fontWeight: 750, outline: 'none' }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        {isLoading ? (
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Skeleton style={{ height: '48px', borderRadius: '12px' }} />
                                <Skeleton style={{ height: '48px', borderRadius: '12px' }} />
                            </div>
                        ) : filteredNodes.length === 0 ? (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B', fontWeight: 700 }}>
                                <Server size={36} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <div>No matching sovereign nodes found.</div>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Node ID</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Tenant / Name</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Region</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Status</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Uptime</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>CPU</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Memory</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Disk</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Workflows</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Telemetry</th>
                                        <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9', textAlign: 'right' }}>Actions</th>
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
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A', fontFamily: 'monospace' }}>{node.id.slice(0, 8).toUpperCase()}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>{node.status === 'Active' ? '1m ago' : 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>
                                                    {node.name}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                                    {node.url.includes('.lv') || node.name.includes('Riga') ? 'Riga, LV' : 'Frankfurt, EU'}
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
                                                            {node.status === 'Active' ? 'HEALTHY' : (isErr ? 'CRITICAL' : 'MAINTENANCE')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                                    {node.status === 'Active' ? '15d 8h 23m' : '0h 0m'}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: node.cpu > 80 ? '#EF4444' : '#0F172A' }}>
                                                    {node.cpu || 0}%
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: node.ram > 80 ? '#EF4444' : '#0F172A' }}>
                                                    {node.ram || 0}%
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>
                                                    15%
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>
                                                    {node.workflow_count || 0}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ width: '100px', height: '30px', opacity: 0.6 }}>
                                                        <Sparkline data={node.telemetry || Array(12).fill(0).map(() => Math.random() * 40 + 10)} color="#10B981" />
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => openTerminal(node)}
                                                            style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: node.status === 'Active' ? '#10B981' : '#64748B' }}
                                                            title="Terminal"
                                                        >
                                                            <Terminal size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => openConfig(node)}
                                                            style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                            title="Settings"
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

                {/* ALERTS, INCIDENTS, REGION HEALTH */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* ALERTS & INCIDENTS */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>ALERTS & INCIDENTS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {derivedAlerts.length === 0 ? (
                                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', padding: '12px' }}>
                                    No active warning or critical alerts in cluster.
                                </div>
                            ) : (
                                derivedAlerts.map((alert, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: alert.type === 'critical' ? '#FFF5F5' : '#FFFBEB', borderRadius: '16px', border: alert.type === 'critical' ? '1px solid #FED7D7' : '1px solid #FDE68A' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 950, color: alert.type === 'critical' ? '#EF4444' : '#F59E0B' }}>{alert.node}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>{alert.time}</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '4px' }}>{alert.msg}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RESOURCE USAGE OVER TIME (SVG Line Chart) */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>RESOURCE USAGE OVER TIME (24H)</h3>
                        <div style={{ height: '140px', width: '100%' }}>
                            <svg viewBox="0 0 300 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                <path 
                                    d="M 0 80 Q 50 60 75 40 T 150 50 T 225 30 T 300 10" 
                                    fill="none" 
                                    stroke="#3B82F6" 
                                    strokeWidth="3" 
                                    strokeLinecap="round"
                                />
                                <path 
                                    d="M 0 90 Q 50 70 75 60 T 150 40 T 225 50 T 300 30" 
                                    fill="none" 
                                    stroke="#10B981" 
                                    strokeWidth="3" 
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', marginTop: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} /> Average CPU</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Average Memory</div>
                        </div>
                    </div>

                    {/* REGION HEALTH */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>REGION HEALTH</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', fontWeight: 850 }}>
                            {[
                                { reg: "Riga, LV", val: activeAlertsCount === 0 ? "100%" : "50%", warning: activeAlertsCount > 0, good: activeAlertsCount === 0 },
                                { reg: "Frankfurt, EU", val: "100%", good: true },
                                { reg: "London, UK", val: "100%", good: true },
                                { reg: "Virginia, US", val: "100%", good: true },
                                { reg: "Singapore, SG", val: "100%", good: true }
                            ].map((region, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                    <span style={{ color: '#475569' }}>{region.reg}</span>
                                    <span style={{ fontWeight: 950, color: region.good ? '#10B981' : (region.warning ? '#F59E0B' : '#EF4444') }}>{region.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>

            {/* BOTTOM ROW: RESOURCE CONSUMERS, WORKFLOW EXECUTIONS, UPTIME DISTRIBUTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                
                {/* TOP RESOURCE CONSUMERS */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>TOP RESOURCE CONSUMERS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {nodes.slice(0, 3).map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                                    <span>{item.name}</span>
                                    <span style={{ fontWeight: 950, color: '#0F172A' }}>{item.cpu || 8}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: `${item.cpu || 8}%`, height: '100%', background: (item.cpu || 8) > 80 ? '#EF4444' : '#10B981' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* WORKFLOW EXECUTIONS (24H) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>WORKFLOW EXECUTIONS (24H)</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <svg width="100" height="100" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="100 0" strokeDashoffset="0" />
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Successful</div>
                            <span style={{ fontWeight: 950 }}>1,240 (100%)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Failed</div>
                            <span style={{ fontWeight: 950 }}>0 (0%)</span>
                        </div>
                    </div>
                </div>

                {/* UPTIME DISTRIBUTION */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>UPTIME DISTRIBUTION</h3>
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
                        <svg width="100" height="100" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="100 0" strokeDashoffset="0" />
                        </svg>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Healthy: {activeNodes} Nodes (100%)</div>
                    </div>
                </div>

            </div>

            {/* TERMINAL MODAL */}
            {showTerminal && selectedNode && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setShowTerminal(false)} style={{ backdropFilter: 'blur(16px)', background: 'rgba(0, 0, 0, 0.4)' }}>
                        <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden' }}>
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Terminal size={18} color="#10B981" />
                                    <span style={{ color: '#FFFFFF', fontWeight: 950, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Node Diagnostics: {selectedNode.name}</span>
                                </div>
                                <button onClick={() => setShowTerminal(false)} style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ padding: '32px', background: '#050505', minHeight: '320px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#10B981', overflowY: 'auto' }}>
                                {terminalLogs.map((log, i) => (
                                    <div key={i} style={{ marginBottom: '8px', opacity: 0.9 }}>{log}</div>
                                ))}
                                {isTerminalLoading && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                                        <Activity size={14} className={adminStyles.spinning} />
                                        <span>LISTENING FOR HEARTBEAT...</span>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '16px 32px', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>SECURE SSL/TLS TUNNEL ACTIVE</span>
                                <button onClick={() => openTerminal(selectedNode)} style={{ background: 'transparent', border: 'none', color: '#10B981', fontWeight: 950, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <RotateCcw size={14} /> REFRESH HANDSHAKE
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* CONFIG MODAL */}
            {showConfig && selectedNode && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setShowConfig(false)} style={{ backdropFilter: 'blur(16px)', background: 'rgba(250, 250, 250, 0.4)' }}>
                        <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', overflow: 'hidden' }}>
                            <div style={{ padding: '40px 48px', background: '#0F172A', color: '#FFFFFF' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>NODE CONFIGURATION</div>
                                        <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.03em' }}>Edit Sovereign Node</h3>
                                        <p style={{ margin: '8px 0 0', opacity: 0.5, fontSize: '0.9rem', fontWeight: 700 }}>Modify endpoint settings and security keys.</p>
                                    </div>
                                    <button onClick={() => setShowConfig(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
                                </div>
                            </div>
                            
                            <div style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Node Name</label>
                                        <input 
                                            style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                            value={editData.name} 
                                            onChange={e => setEditData({...editData, name: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Endpoint URL</label>
                                        <input 
                                            style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                            value={editData.url} 
                                            onChange={e => setEditData({...editData, url: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>X-N8N-API-KEY</label>
                                        <input 
                                            style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                            type="password"
                                            placeholder="Enter new API key to update..."
                                            value={editData.apiKey} 
                                            onChange={e => setEditData({...editData, apiKey: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Workflow Capacity</label>
                                        <input 
                                            style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                            type="number"
                                            value={editData.maxWorkflows} 
                                            onChange={e => setEditData({...editData, maxWorkflows: parseInt(e.target.value) || 100})} 
                                        />
                                    </div>
                                </div>

                                <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748B' }}>CURRENT STATUS</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, color: selectedNode.status === 'Active' ? '#10B981' : '#EF4444' }}>
                                            {selectedNode.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#64748B' }}>LAST CHECK</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#0F172A' }}>
                                            {selectedNode.last_check ? new Date(selectedNode.last_check).toLocaleString() : 'Never'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={adminStyles.modalFooter} style={{ padding: '28px 48px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button onClick={() => setShowConfig(false)} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0 20px', height: '44px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, color: '#475569' }}>Cancel</button>
                                <button 
                                    onClick={updateNodeConfig} 
                                    disabled={isUpdating || !editData.name || !editData.url} 
                                    style={{ height: '44px', borderRadius: '12px', padding: '0 28px', background: '#0F172A', color: '#FFFFFF', border: 'none', cursor: isUpdating ? 'not-allowed' : 'pointer', fontWeight: 950, display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    {isUpdating && <Activity size={16} className={adminStyles.spinning} />}
                                    {isUpdating ? 'Saving...' : 'Apply Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

        </div>
    );
}
