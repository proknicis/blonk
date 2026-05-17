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
import adminStyles from "../admin.module.css";

// Premium Mock Data matching Screenshot 3
const MOCK_FLEET_METRICS = {
    nodesOnline: "12/14",
    activeAlerts: 3,
    packetLoss: "0.01%",
    avgCpu: "38.0%",
    avgMemory: "65.3%",
    avgDisk: "42.7%",
    execQueue: 0,
    successRate: "100%",
    serverSync: "12/14"
};

const MOCK_FLEET_NODES = [
    { id: "NODE-01", tenant: "Acme Corp", region: "Frankfurt, EU", status: "Healthy", uptime: "15d 8h 23m", cpu: 32, mem: 56, disk: 41, workflows: 120, lastSeen: "1m ago" },
    { id: "NODE-02", tenant: "Nova Analytics", region: "London, UK", status: "Warning", uptime: "7d 12h 05m", cpu: 72, mem: 80, disk: 48, workflows: 85, lastSeen: "3m ago" },
    { id: "NODE-03", tenant: "HealthPlus", region: "Virginia, US", status: "Healthy", uptime: "12d 4h 11m", cpu: 15, mem: 42, disk: 30, workflows: 200, lastSeen: "5m ago" },
    { id: "NODE-04", tenant: "LexFlow LLC", region: "Singapore, SG", status: "Critical", uptime: "0h 42m 10s", cpu: 92, mem: 95, disk: 89, workflows: 14, lastSeen: "2m ago" },
    { id: "NODE-05", tenant: "FinEdge Ltd", region: "Sydney, AU", status: "Maintenance", uptime: "24d 18h 30m", cpu: 0, mem: 12, disk: 10, workflows: 0, lastSeen: "1h ago" }
];

const MOCK_FLEET_ALERTS = [
    { type: "critical", node: "NODE-04", msg: "CPU and memory load above 90%", time: "2 mins ago" },
    { type: "warning", node: "NODE-02", msg: "Memory consumption above 80%", time: "12 mins ago" },
    { type: "info", node: "NODE-05", msg: "Scheduled maintenance in progress", time: "1 hour ago" }
];

export default function FleetHealthMonitoringPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isLoading, setIsLoading] = useState(false);

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
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#EF4444', borderRadius: '50%', border: '3px solid #0F172A' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ padding: '3px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>GLOBAL FLEET OPERATIONS</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>REAL-TIME MONITORING</span>
                        </div>
                        <h2 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Global Fleet Operations</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 700, margin: '6px 0 0' }}>Real-time health and performance of all sovereign infrastructure.</p>
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '32px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>NODES ONLINE</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#FFFFFF' }}>{MOCK_FLEET_METRICS.nodesOnline}</div>
                    </div>
                    <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '32px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>ACTIVE ALERTS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#EF4444' }}>{MOCK_FLEET_METRICS.activeAlerts}</div>
                    </div>
                    <div style={{ textAlign: 'center', marginRight: '8px' }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>PACKET LOSS</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: '#FFFFFF' }}>{MOCK_FLEET_METRICS.packetLoss}</div>
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
                    { label: 'CPU LOAD (AVG)', value: MOCK_FLEET_METRICS.avgCpu, detail: 'Across all active nodes' },
                    { label: 'MEMORY LOAD (AVG)', value: MOCK_FLEET_METRICS.avgMemory, detail: 'Cache and buffering optimal' },
                    { label: 'DISK USAGE (AVG)', value: MOCK_FLEET_METRICS.avgDisk, detail: 'Persistent storage nominal' },
                    { label: 'EXECUTION QUEUE', value: MOCK_FLEET_METRICS.execQueue, detail: '0 tasks delayed' },
                    { label: 'SUCCESS RATE (24H)', value: MOCK_FLEET_METRICS.successRate, detail: 'Target 100.00% success' },
                    { label: 'SERVER SYNC', value: MOCK_FLEET_METRICS.serverSync, detail: ' Riga Hub, AWS, Frankfurt' }
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
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Node ID</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Tenant</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Region</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Status</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Uptime</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>CPU</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Memory</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Disk</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Workflows</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_FLEET_NODES.filter(n => {
                                    const matchesSearch = n.id.toLowerCase().includes(searchTerm.toLowerCase()) || n.tenant.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesStatus = statusFilter === "All" || n.status === statusFilter;
                                    return matchesSearch && matchesStatus;
                                }).map(node => (
                                    <tr key={node.id} style={{ background: '#F8FAFC', borderRadius: '16px' }}>
                                        <td style={{ padding: '16px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                                    <Server size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>{node.id}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>{node.lastSeen}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>
                                            {node.tenant}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                            {node.region}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px', 
                                                padding: '4px 10px', 
                                                background: node.status === 'Healthy' ? '#E8FDF0' : (node.status === 'Critical' ? '#FEE2E2' : (node.status === 'Warning' ? '#FFFBEB' : '#EFF6FF')), 
                                                color: node.status === 'Healthy' ? '#10B981' : (node.status === 'Critical' ? '#EF4444' : (node.status === 'Warning' ? '#F59E0B' : '#3B82F6')), 
                                                borderRadius: '100px', 
                                                width: 'fit-content' 
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase' }}>{node.status}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                            {node.uptime}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: node.cpu > 80 ? '#EF4444' : '#0F172A' }}>
                                            {node.cpu}%
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: node.mem > 80 ? '#EF4444' : '#0F172A' }}>
                                            {node.mem}%
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: node.disk > 80 ? '#EF4444' : '#0F172A' }}>
                                            {node.disk}%
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>
                                            {node.workflows}
                                        </td>
                                        <td style={{ padding: '16px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => alert("Terminal connection initialized.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                    title="Terminal"
                                                >
                                                    <Terminal size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Configuration settings opened.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                    title="Settings"
                                                >
                                                    <Settings size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ALERTS, INCIDENTS, REGION HEALTH */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* ALERTS & INCIDENTS */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>ALERTS & INCIDENTS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {MOCK_FLEET_ALERTS.map((alert, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: alert.type === 'critical' ? '#FFF5F5' : '#F8FAFC', borderRadius: '16px', border: alert.type === 'critical' ? '1px solid #FED7D7' : '1px solid #F1F5F9' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 950, color: alert.type === 'critical' ? '#EF4444' : '#F59E0B' }}>{alert.node}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>{alert.time}</span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginTop: '4px' }}>{alert.msg}</div>
                                    </div>
                                </div>
                            ))}
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
                                { reg: "Frankfurt, EU", val: "100%", good: true },
                                { reg: "London, UK", val: "100%", good: true },
                                { reg: "Virginia, US", val: "100%", good: true },
                                { reg: "Singapore, SG", val: "50%", warning: true },
                                { reg: "Sydney, AU", val: "0%", bad: true }
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
                        {[
                            { id: "NODE-04 (LexFlow LLC)", val: 92, color: '#EF4444' },
                            { id: "NODE-02 (Nova Analytics)", val: 72, color: '#F59E0B' },
                            { id: "NODE-01 (Acme Corp)", val: 32, color: '#10B981' }
                        ].map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                                    <span>{item.id}</span>
                                    <span style={{ fontWeight: 950, color: '#0F172A' }}>{item.val}%</span>
                                </div>
                                <div style={{ width: '100%', height: '6px', background: '#F1F5F9', borderRadius: '100px', overflow: 'hidden' }}>
                                    <div style={{ width: `${item.val}%`, height: '100%', background: item.color }} />
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
                            <span style={{ fontWeight: 950 }}>12,540 (100%)</span>
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
                            {/* Healthy 71% */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="71 29" strokeDashoffset="0" />
                            {/* Warning 14% */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray="14 86" strokeDashoffset="-71" />
                            {/* Critical 7% */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#EF4444" strokeWidth="6" strokeDasharray="7 93" strokeDashoffset="-85" />
                            {/* Maintenance 7% */}
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="6" strokeDasharray="8 92" strokeDashoffset="-92" />
                        </svg>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.7rem', fontWeight: 800, color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Healthy 10 (71%)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} /> Warning 2 (14%)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} /> Critical 1 (7%)</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} /> Maint. 1 (7%)</div>
                    </div>
                </div>

            </div>

        </div>
    );
}
