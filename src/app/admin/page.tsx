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

// Mock metrics matching Screenshot 2
const MOCK_PROVISIONING_METRICS = {
    activeNodes: 2,
    systemHealth: 50, // Needs attention
    resourceLoad: 24.2,
    opVelocity: 350,
    dataThroughput: 1.2,
    errorRate24h: 0.8
};

const MOCK_LEDGER_NODES = [
    { id: "node-1", email: "admin@novaanalytics.io", uuid: "1a8b9c-2d3e4f-5g6h7i", hubName: "Riga Hub", domain: "n8n.novaanalytics.io", status: "ERROR", yield: 135, cpu: 85, ram: 90, disk: 40, uptime: "15d 8h", lastSeen: "2m ago" },
    { id: "node-2", email: "support@lexflow.com", uuid: "7j8k9l-0m1n2o-3p4q5r", hubName: "Riga Hub", domain: "n8n.lexflow.com", status: "PROVISIONED", yield: 207, cpu: 20, ram: 45, disk: 30, uptime: "7d 12h", lastSeen: "5m ago" },
    { id: "node-3", email: "billing@healthplus.org", uuid: "4s5t6u-7v8w9x-0y1z2a", hubName: "AWS Europe", domain: "n8n.healthplus.org", status: "READY", yield: 8, cpu: 5, ram: 12, disk: 10, uptime: "2d 4h", lastSeen: "12m ago" },
    { id: "node-4", email: "contact@finedge.net", uuid: "3b4c5d-6e7f8g-9h0i1j", hubName: "Riga Hub", domain: "n8n.finedge.net", status: "READY", yield: 0, cpu: 0, ram: 0, disk: 0, uptime: "0h 2m", lastSeen: "22m ago" }
];

const MOCK_SYSTEM_INFO = {
    cluster: "GLOBAL_ALPHA",
    version: "v2.4.1",
    env: "Production",
    region: "Frankfurt, EU",
    uptime: "7d 14h 22m"
};

const MOCK_ALERTS = [
    { type: "high", message: "Node Latvian_Sentinel CPU threshold exceeded", time: "1 min ago" },
    { type: "medium", message: "Node LexFlow delayed synchronization", time: "15 mins ago" },
    { type: "low", message: "Daily backup verification pending", time: "1 hour ago" }
];

export default function FleetProvisioningPage() {
    const router = useRouter();
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [provisionData, setProvisionData] = useState({ clientName: "", email: "" });
    const [isProvisioningLoading, setIsProvisioningLoading] = useState(false);

    // Fetch Workflows
    const fetchWorkflows = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/workflows');
            if (res.ok) {
                const data = await res.json();
                setWorkflows(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const provisionClient = async () => {
        setIsProvisioningLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsProvisioning(false);
            alert(`Sovereign Node Cluster for ${provisionData.clientName} successfully provisioned.`);
            setProvisionData({ clientName: "", email: "" });
            fetchWorkflows();
        } catch (error) { console.error(error); } finally { setIsProvisioningLoading(false); }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm("Permanently decommission this node instance?")) return;
        try {
            await fetch(`/api/admin/workflows?id=${id}`, { method: 'DELETE' });
            fetchWorkflows();
        } catch (error) { console.error(error); }
    };

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
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#F59E0B', borderRadius: '50%', border: '3px solid #0F172A' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ padding: '3px 8px', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>SOVEREIGN OPERATIONS</span>
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
                    { label: 'ACTIVE NODES', value: MOCK_PROVISIONING_METRICS.activeNodes, detail: 'Online & Connected' },
                    { label: 'SYSTEM HEALTH', value: `${MOCK_PROVISIONING_METRICS.systemHealth}%`, detail: 'Needs Attention', error: true },
                    { label: 'RESOURCE LOAD', value: `${MOCK_PROVISIONING_METRICS.resourceLoad}%`, detail: 'Average Utilization' },
                    { label: 'OP VELOCITY (24H)', value: MOCK_PROVISIONING_METRICS.opVelocity, detail: 'Operations Executed' },
                    { label: 'DATA THROUGHPUT', value: `${MOCK_PROVISIONING_METRICS.dataThroughput} TB`, detail: '+12% vs Yesterday' },
                    { label: 'ERROR RATE (24H)', value: `${MOCK_PROVISIONING_METRICS.errorRate24h}%`, detail: '-8% vs Yesterday' }
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
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Node Identity</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Cluster Hub</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Status</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Yield (ops/hr)</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Telemetry</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Uptime</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Last Seen</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9', textAlign: 'right' }}>Commands</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_LEDGER_NODES.map(node => (
                                    <tr key={node.id} style={{ background: '#F8FAFC', borderRadius: '16px' }}>
                                        <td style={{ padding: '16px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                                    <Server size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>{node.email}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, fontFamily: 'monospace' }}>{node.uuid}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>{node.hubName}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>{node.domain}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px', 
                                                padding: '4px 10px', 
                                                background: node.status === 'PROVISIONED' ? '#E8FDF0' : (node.status === 'ERROR' ? '#FEE2E2' : '#EFF6FF'), 
                                                color: node.status === 'PROVISIONED' ? '#10B981' : (node.status === 'ERROR' ? '#EF4444' : '#3B82F6'), 
                                                borderRadius: '100px', 
                                                width: 'fit-content' 
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase' }}>{node.status}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>
                                            {node.yield}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', gap: '3px' }}>
                                                {/* Visual Telemetry Bars */}
                                                <div style={{ width: '8px', height: '24px', background: '#F1F5F9', borderRadius: '2px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                                    <div style={{ width: '100%', height: `${node.cpu}%`, background: node.status === 'ERROR' ? '#EF4444' : '#10B981' }} />
                                                </div>
                                                <div style={{ width: '8px', height: '24px', background: '#F1F5F9', borderRadius: '2px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                                    <div style={{ width: '100%', height: `${node.ram}%`, background: node.status === 'ERROR' ? '#EF4444' : '#3B82F6' }} />
                                                </div>
                                                <div style={{ width: '8px', height: '24px', background: '#F1F5F9', borderRadius: '2px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                                                    <div style={{ width: '100%', height: `${node.disk}%`, background: node.status === 'ERROR' ? '#EF4444' : '#8B5CF6' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                            {node.uptime}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                            {node.lastSeen}
                                        </td>
                                        <td style={{ padding: '16px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => alert("Calibration parameters opened.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                    title="Configure Node"
                                                >
                                                    <Settings size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Actions ledger opened.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                    title="More Options"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                { label: 'Import Node Config', desc: 'Bulk import node configurations', icon: <Download size={16} />, action: () => alert("Bulk import initiated.") },
                                { label: 'Sync All Nodes', desc: 'Trigger sync across all clusters', icon: <RefreshCcw size={16} />, action: () => alert("Synchronizing clusters...") },
                                { label: 'Run Diagnostics', desc: 'Check system and node health', icon: <Activity size={16} />, action: () => router.push('/admin/fleet') }
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
                                { label: 'Node Registry', path: '/admin/fleet' },
                                { label: 'Health Monitoring', path: '/admin/fleet' },
                                { label: 'Audit Trail', path: '/admin/audit' },
                                { label: 'Incident Command', path: '/admin/incidents' }
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
                            {/* Healthy 83.3% */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="83.3 16.7" strokeDashoffset="0" />
                            {/* Error 16.7% */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#EF4444" strokeWidth="6" strokeDasharray="16.7 83.3" strokeDashoffset="-83.3" />
                        </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Healthy</div>
                            <span style={{ fontWeight: 950 }}>83.3% (5)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Error</div>
                            <span style={{ fontWeight: 950 }}>16.7% (1)</span>
                        </div>
                    </div>
                </div>

                {/* RESOURCE UTILIZATION (AVG) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 16px' }}>RESOURCE UTILIZATION</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                            { label: 'CPU Load', val: 24.2, color: '#10B981' },
                            { label: 'Memory Load', val: 50.0, color: '#3B82F6' },
                            { label: 'Disk Usage', val: 18.7, color: '#8B5CF6' },
                            { label: 'Network IO', val: 32.1, color: '#F59E0B' }
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
                            { name: 'GLOBAL_ALPHA', val: 24.2, loc: 'Frankfurt, EU' },
                            { name: 'EU_WEST_1', val: 18.7, loc: 'Ireland' },
                            { name: 'US_EAST_1', val: 12.3, loc: 'N. Virginia' },
                            { name: 'AP_SOUTH_1', val: 8.5, loc: 'Singapore' }
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
                        {MOCK_ALERTS.map((alert, i) => (
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
                                    <div style={{ fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>NEW NODE</div>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em', color: '#FFFFFF' }}>Provision Sovereign Node</h3>
                                    <p style={{ opacity: 0.5, margin: '10px 0 0', fontWeight: 700, fontSize: '0.9rem' }}>Create a dedicated sovereign n8n engine and credentials.</p>
                                </div>
                                <button onClick={() => setIsProvisioning(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
                            </div>
                        </div>
                        <div className={adminStyles.modalBody} style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Organization Name</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        placeholder="e.g. Acme Corp" 
                                        value={provisionData.clientName} 
                                        onChange={e => setProvisionData({...provisionData, clientName: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Operator Email</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        placeholder="operator@acme.com" 
                                        type="email" 
                                        value={provisionData.email} 
                                        onChange={e => setProvisionData({...provisionData, email: e.target.value})} 
                                    />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '14px', padding: '18px 20px', background: 'rgba(16, 185, 129, 0.06)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                                <ShieldCheck size={18} color="#10B981" style={{ flexShrink: 0, marginTop: '1px' }} />
                                <p style={{ fontSize: '0.82rem', color: '#065F46', margin: 0, fontWeight: 700, lineHeight: 1.5 }}>A dedicated n8n instance will be initialized on Riga Hub and linked to this admin operator profile.</p>
                            </div>
                        </div>
                        <div className={adminStyles.modalFooter} style={{ padding: '28px 48px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsProvisioning(false)} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0 20px', height: '44px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, color: '#475569' }}>Cancel</button>
                            <button onClick={provisionClient} disabled={isProvisioningLoading || !provisionData.clientName || !provisionData.email} style={{ height: '44px', borderRadius: '12px', padding: '0 28px', background: '#0F172A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 950 }}>
                                {isProvisioningLoading ? 'Provisioning...' : 'Provision sovereign node'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
