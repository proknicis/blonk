"use client";

import { 
    Activity, 
    Server, 
    Cpu, 
    Layers, 
    ArrowUpRight, 
    ArrowDownRight, 
    Zap, 
    RefreshCw, 
    ShieldCheck, 
    AlertCircle,
    Globe,
    Terminal,
    Settings2,
    Database,
    Network
} from "lucide-react";
import adminStyles from "../admin.module.css";
import React, { useState, useEffect } from 'react';
import { FleetManager } from "./FleetManager";
import { NodeActions } from "./NodeActions";
import { Sparkline } from "./Sparkline";

export default function FleetMonitoringPage() {
    const [nodes, setNodes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [packetLoss, setPacketLoss] = useState(0.01); 

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                // Use ?probe=true to ensure we get fresh health telemetry for the monitoring page
                const res = await fetch('/api/admin/nodes?probe=true');
                const data = await res.json();
                
                if (!Array.isArray(data)) {
                    console.error('Unexpected node data:', data);
                    setLoading(false);
                    return;
                }

                const nodesWithStats = data.map((node: any, index: number) => {
                    // Determine health from live probe data
                    let status = 'Critical';
                    if (node.status === 'Active') {
                        if (node.cpu < 50 && node.ram < 50) status = 'Healthy';
                        else if (node.cpu < 80 && node.ram < 80) status = 'Warning';
                        else status = 'Critical';
                    } else if (node.status === 'Unreachable' || node.status === 'Auth Failed') {
                        status = 'Critical';
                    }

                    return {
                        ...node,
                        index: index + 1,
                        status,
                        firm: node.url.replace(/^https?:\/\//, '').split('/')[0],
                        // Use actual telemetry from server if available
                        telemetry: node.telemetry || Array.from({ length: 12 }, () => 
                            Math.max(1, Math.round((node.cpu || 0) + (Math.random() * 12 - 6)))
                        )
                    };
                });
                setNodes(nodesWithStats);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNodes();
        const interval = setInterval(fetchNodes, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const isEmergency = packetLoss > 1.0;

    const aggregateCPU = nodes.length > 0 ? (nodes.reduce((acc, n) => acc + (n.cpu || 0), 0) / nodes.length).toFixed(1) : 0;
    const totalQueue = nodes.reduce((acc, n) => acc + (n.queue || 0), 0);

    const getStatusColor = (status: string) => {
        if (isEmergency) return '#EF4444'; // Force Red in Emergency
        if (status === 'Healthy') return '#10B981';
        if (status === 'Warning') return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div className={isEmergency ? adminStyles.emergencyGlow : ''} style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '40px', padding: '0px', transition: 'all 0.5s ease' }}>
            
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#111827' }}>Fleet Health Monitoring</h1>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#D1D5DB' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: '#6B7280', letterSpacing: '0.05em' }}>Node Cluster: Global_Alpha</span>
                </div>
            </div>

            {/* SOVEREIGN INTEGRITY PANEL */}
            <div className={adminStyles.integrityPanel} style={{ background: isEmergency ? '#7F1D1D' : '#0F172A', color: '#FFFFFF', border: 'none', transition: 'background 0.5s ease', borderRadius: '32px', padding: '40px 56px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={28} color="#FFFFFF" className={adminStyles.spinning} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '18px', height: '18px', background: isEmergency ? '#EF4444' : '#10B981', borderRadius: '50%', border: '4px solid #0F172A', boxShadow: `0 0 15px ${isEmergency ? '#EF4444' : '#10B981'}` }} />
                    </div>
                    <div>
                        <h2 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                            {isEmergency ? 'Critical Fleet Failure' : 'Global Fleet Operations'}
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 800, margin: '6px 0 0 0' }}>
                            {isEmergency ? 'EMERGENCY PROTOCOL ACTIVE' : 'Server cluster status: Active'}
                        </p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <div className={adminStyles.hubItem} style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Nodes Online</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: 950, color: '#FFFFFF' }}>{nodes.length}</span>
                    </div>
                    <div className={adminStyles.hubItem} style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '40px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Packet Loss</span>
                        <span style={{ fontSize: '1.75rem', fontWeight: 950, color: isEmergency ? '#EF4444' : '#FFFFFF' }}>{packetLoss}%</span>
                    </div>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard} style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '32px' }}>
                    <div className={adminStyles.metricMeta}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em' }}>CPU Load</span>
                        <Cpu size={14} color="rgba(0,0,0,0.1)" />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: '#111827', fontSize: '2.5rem' }}>{aggregateCPU}%</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 800 }}>Total CPU usage</div>
                </div>

                <div className={adminStyles.adminMetricCard} style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '32px' }}>
                    <div className={adminStyles.metricMeta}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Execution Queue</span>
                        <Network size={14} color="rgba(0,0,0,0.1)" />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: '#111827', fontSize: '2.5rem' }}>{totalQueue}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 800 }}>Active Executions</div>
                </div>

                <div className={adminStyles.adminMetricCard} style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '32px' }}>
                    <div className={adminStyles.metricMeta}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Success Rate</span>
                        <ShieldCheck size={14} color="#10B981" />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: '#10B981', fontSize: '2.5rem' }}>{isEmergency ? '0%' : '100%'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 800 }}>Workflow Success Rate</div>
                </div>

                <div className={adminStyles.adminMetricCard} style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '32px' }}>
                    <div className={adminStyles.metricMeta}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Server Sync</span>
                        <Activity size={14} color="rgba(0,0,0,0.1)" />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: '#111827', fontSize: '2.5rem' }}>{nodes.filter(n => n.status === 'Healthy').length}/{nodes.length}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 800 }}>Active Servers</div>
                </div>
            </div>

            {/* REGISTRY SECTION */}
            <div className={adminStyles.registryCard} style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '32px', padding: '48px' }}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#111827', textTransform: 'uppercase', margin: 0, letterSpacing: '0.02em' }}>SOVEREIGN FLEET REGISTRY</h3>
                        <p style={{ margin: '8px 0 0 0', color: '#6B7280', fontWeight: 800, fontSize: '0.95rem' }}>Live server and n8n instance health</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                         <FleetManager />
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable} style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH} style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Server ID</th>
                                <th className={adminStyles.registryTH} style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>INFRASTRUCTURE</th>
                                <th className={adminStyles.registryTH} style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Active Executions</th>
                                <th className={adminStyles.registryTH} style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Resource Usage</th>
                                <th className={adminStyles.registryTH} style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Health Status</th>
                                <th className={adminStyles.registryTH} style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Server Load</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right', fontSize: '0.7rem', color: '#9CA3AF' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i}>
                                        <td colSpan={7} style={{ padding: '24px 0' }}>
                                            <div style={{ width: '100%', height: '80px', background: '#F9FAFB', borderRadius: '24px', animation: 'pulse 2s infinite' }} />
                                        </td>
                                    </tr>
                                ))
                            ) : nodes.length > 0 ? (
                                nodes.map((node) => (
                                    <tr key={node.id} className={adminStyles.registryRow}>
                                        <td style={{ padding: '32px 16px' }}>
                                            <div className={adminStyles.loopDetail}>
                                                <div style={{ width: '44px', height: '44px', background: '#F3F4F6', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827' }}>
                                                    <Server size={18} />
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: '#111827' }}>{node.name}</div>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                        <code style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 800 }}>{node.index}</code>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 950, color: '#10B981', textTransform: 'uppercase' }}>{node.uptime || 'ONLINE'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 950, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Globe size={14} color="#9CA3AF" />
                                                {node.name.toLowerCase().includes('primary') ? 'Riga Hub' : 'AWS Europe'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 800, marginTop: '4px' }}>{node.url.replace(/^https?:\/\//, '').split('/')[0]}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#111827' }}>{node.queue || 0}</div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase' }}>Queue</div>
                                                </div>
                                                <Sparkline data={node.telemetry} color={node.status === 'Warning' ? '#F59E0B' : getStatusColor(node.status)} />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <span>CPU Intensity</span>
                                                    <span style={{ color: '#111827' }}>{node.cpu}%</span>
                                                </div>
                                                <div style={{ width: "100%", height: "4px", background: '#F3F4F6', borderRadius: "2px", overflow: "hidden" }}>
                                                    <div style={{ width: `${node.cpu}%`, height: "100%", background: '#111827', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <span>Memory Load</span>
                                                    <span style={{ color: '#111827' }}>{node.ram}%</span>
                                                </div>
                                                <div style={{ width: "100%", height: "4px", background: '#F3F4F6', borderRadius: "2px", overflow: "hidden" }}>
                                                    <div style={{ width: `${node.ram}%`, height: "100%", background: '#111827', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: node.status === 'Warning' ? '#FFFBEB' : '#F0FDF4', padding: '8px 16px', borderRadius: '100px', width: 'fit-content' }}>
                                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: node.status === 'Warning' ? '#F59E0B' : '#10B981' }} />
                                                <span style={{ fontWeight: 950, fontSize: "0.7rem", color: node.status === 'Warning' ? '#F59E0B' : '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {node.status === 'Warning' ? 'WARNING' : 'SENTINEL ONLINE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 950, color: '#111827' }}>
                                                    {node.workflow_count || 0} / {node.max_workflows || 100}
                                                </div>
                                                <div style={{ width: "100%", height: "6px", background: '#F3F4F6', borderRadius: "3px", overflow: "hidden" }}>
                                                    <div style={{ width: `${Math.min(100, ((node.workflow_count || 0) / (node.max_workflows || 100)) * 100)}%`, height: "100%", background: '#0F172A', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                </div>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', marginTop: '2px' }}>Workflows</div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <NodeActions 
                                                nodeId={node.id} 
                                                nodeUrl={node.url} 
                                                nodeName={node.name} 
                                                nodeIndex={node.index}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '64px', color: '#9CA3AF', fontWeight: 950 }}>NO FLEET ASSETS DETECTED</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
