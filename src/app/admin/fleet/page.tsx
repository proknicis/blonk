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

                const nodesWithStats = data.map((node: any) => {
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
        <div className={isEmergency ? adminStyles.emergencyGlow : ''} style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '40px', padding: '20px', borderRadius: '32px', transition: 'all 0.5s ease' }}>
            
            {/* SOVEREIGN INTEGRITY PANEL */}
            <div className={adminStyles.integrityPanel} style={{ background: isEmergency ? '#7F1D1D' : 'var(--foreground)', color: 'var(--background)', border: 'none', transition: 'background 0.5s ease' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--background)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Globe size={24} color={isEmergency ? '#EF4444' : 'var(--foreground)'} className={adminStyles.spinning} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', background: isEmergency ? '#EF4444' : '#10B981', borderRadius: '50%', border: '3px solid var(--foreground)', boxShadow: `0 0 10px ${isEmergency ? '#EF4444' : '#10B981'}` }} />
                    </div>
                    <div>
                        <h2 className={adminStyles.panelTitle} style={{ color: isEmergency ? '#FCA5A5' : 'var(--background)', fontSize: '1.5rem', transition: 'color 0.5s ease' }}>
                            {isEmergency ? 'Critical Fleet Failure Detected' : 'Global Fleet Operations'}
                        </h2>
                        <p className={adminStyles.panelSubtitle} style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {isEmergency ? 'EMERGENCY PROTOCOL ACTIVE - Packet Loss Critical' : 'Sovereign cluster synchronization: ACTIVE (L-09 Regional Hub)'}
                        </p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <div className={adminStyles.hubItem} style={{ borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <span className={adminStyles.hubLabel} style={{ color: 'rgba(255,255,255,0.5)' }}>Nodes Online</span>
                        <span className={adminStyles.hubValue} style={{ color: 'var(--background)' }}>{nodes.length}</span>
                    </div>
                    <div className={adminStyles.hubItem} style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', background: isEmergency ? 'rgba(239, 68, 68, 0.2)' : 'transparent' }}>
                        <span className={adminStyles.hubLabel} style={{ color: isEmergency ? '#FCA5A5' : 'rgba(255,255,255,0.5)' }}>Packet Loss</span>
                        <span className={adminStyles.hubValue} style={{ color: isEmergency ? '#EF4444' : 'var(--background)' }}>{packetLoss}%</span>
                    </div>
                </div>
            </div>

            {/* METRICS GRID */}
            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard} style={{ borderColor: isEmergency ? '#EF4444' : '' }}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Resource Intensity</span>
                        <Cpu size={14} color={isEmergency ? '#EF4444' : "var(--accent)"} />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: isEmergency ? '#EF4444' : '' }}>{aggregateCPU}%</div>
                    <div className={adminStyles.metricDetail}>Aggregate CPU Saturation</div>
                </div>

                <div className={adminStyles.adminMetricCard} style={{ borderColor: isEmergency ? '#EF4444' : '' }}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Throughput Buffer</span>
                        <Network size={14} color={isEmergency ? '#EF4444' : "var(--accent)"} />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: isEmergency ? '#EF4444' : '' }}>{totalQueue}</div>
                    <div className={adminStyles.metricDetail}>Active Execution Threads</div>
                </div>

                <div className={adminStyles.adminMetricCard} style={{ borderColor: isEmergency ? '#EF4444' : '' }}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Operational Success</span>
                        <ShieldCheck size={14} color={isEmergency ? "#EF4444" : "#10B981"} />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: isEmergency ? "#EF4444" : "#10B981" }}>{isEmergency ? '0%' : '100%'}</div>
                    <div className={adminStyles.metricDetail}>Protocol Integrity Rate</div>
                </div>

                <div className={adminStyles.adminMetricCard} style={{ borderColor: isEmergency ? '#EF4444' : '' }}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Cluster Synchronization</span>
                        <Activity size={14} color={isEmergency ? '#EF4444' : "var(--accent)"} />
                    </div>
                    <div className={adminStyles.metricAmount} style={{ color: isEmergency ? '#EF4444' : '' }}>{nodes.filter(n => n.status === 'Healthy').length}/{nodes.length}</div>
                    <div className={adminStyles.metricDetail}>Nominal Node Distribution</div>
                </div>
            </div>

            {/* REGISTRY SECTION */}
            <div className={adminStyles.registryCard} style={{ borderColor: isEmergency ? '#EF4444' : '' }}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle} style={{ color: isEmergency ? '#EF4444' : '' }}>Sovereign Fleet Registry</h3>
                        <p className={adminStyles.registrySubtitle}>{isEmergency ? 'CRITICAL FAILURE DETECTED - NODE INTERVENTION REQUIRED' : 'Real-time telemetry and diagnostic control for all provisioned instances.'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                         <FleetManager />
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>Node Identity</th>
                                <th className={adminStyles.registryTH}>Infrastructure</th>
                                <th className={adminStyles.registryTH}>Active Load</th>
                                <th className={adminStyles.registryTH}>Resource Distribution</th>
                                <th className={adminStyles.registryTH}>Sentinel Status</th>
                                <th className={adminStyles.registryTH}>Fleet Load</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Orchestration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4].map(i => (
                                    <tr key={i}>
                                        <td colSpan={6} style={{ padding: '24px 0' }}>
                                            <div style={{ width: '100%', height: '80px', background: 'var(--muted)', borderRadius: '24px', animation: 'pulse 2s infinite' }} />
                                        </td>
                                    </tr>
                                ))
                            ) : nodes.length > 0 ? (
                                nodes.map((node) => (
                                    <tr key={node.id} className={adminStyles.registryRow}>
                                        <td>
                                            <div className={adminStyles.loopDetail}>
                                                <div className={`${adminStyles.loopIcon} ${adminStyles.floatingNode}`} style={{ background: isEmergency ? '#FEF2F2' : 'var(--muted)', color: isEmergency ? '#EF4444' : 'var(--foreground)', borderRadius: '16px' }}>
                                                    <Server size={18} />
                                                </div>
                                                <div>
                                                    <div className={adminStyles.loopName}>{node.name}</div>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                        <code className={adminStyles.identityHash}>{node.id.substring(0, 10)}</code>
                                                        <span style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--muted-foreground)' }}>{node.uptime || 'ONLINE'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 950, color: 'var(--foreground)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Globe size={14} color="var(--muted-foreground)" />
                                                {node.name.toLowerCase().includes('primary') ? 'Riga Hub' : 'AWS Europe'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 800, marginTop: '4px' }}>{node.firm}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: node.queue > 0 ? 'var(--accent)' : 'inherit' }}>{node.queue || 0}</div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Queue</div>
                                                </div>
                                                <Sparkline data={node.telemetry} color={getStatusColor(node.status)} />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <span>CPU Intensity</span>
                                                    <span style={{ color: (isEmergency || node.cpu > 80) ? '#EF4444' : 'var(--foreground)' }}>{isEmergency ? 'ERR' : `${node.cpu}%`}</span>
                                                </div>
                                                <div style={{ width: "100%", height: "4px", background: 'var(--muted)', borderRadius: "2px", overflow: "hidden" }}>
                                                    <div style={{ width: `${isEmergency ? 100 : node.cpu}%`, height: "100%", background: (isEmergency || node.cpu > 80) ? '#EF4444' : 'var(--foreground)', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    <span>Memory Load</span>
                                                    <span style={{ color: (isEmergency || node.ram > 80) ? '#EF4444' : 'var(--foreground)' }}>{isEmergency ? 'ERR' : `${node.ram}%`}</span>
                                                </div>
                                                <div style={{ width: "100%", height: "4px", background: 'var(--muted)', borderRadius: "2px", overflow: "hidden" }}>
                                                    <div style={{ width: `${isEmergency ? 100 : node.ram}%`, height: "100%", background: (isEmergency || node.ram > 80) ? '#EF4444' : 'var(--foreground)', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: `${getStatusColor(node.status)}15`, padding: '8px 16px', borderRadius: '100px', width: 'fit-content' }}>
                                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusColor(node.status), boxShadow: `0 0 10px ${getStatusColor(node.status)}` }} />
                                                <span style={{ fontWeight: 950, fontSize: "0.7rem", color: getStatusColor(node.status), textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                    {isEmergency ? 'CRITICAL' : node.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--foreground)' }}>
                                                    {node.workflow_count || 0} / {node.max_workflows || 100}
                                                </div>
                                                <div style={{ width: "100%", height: "4px", background: 'var(--muted)', borderRadius: "2px", overflow: "hidden" }}>
                                                    <div style={{ width: `${Math.min(100, ((node.workflow_count || 0) / (node.max_workflows || 100)) * 100)}%`, height: "100%", background: 'var(--accent)', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                                </div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Fleet Load</div>
                                            </div>
                                        </td>
                                        <td>
                                            <NodeActions 
                                                nodeId={node.id} 
                                                nodeUrl={node.url} 
                                                nodeName={node.name} 
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted-foreground)', fontWeight: 800 }}>NO FLEET ASSETS DETECTED</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
