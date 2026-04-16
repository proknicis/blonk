"use client";

import React, { useState, useEffect } from 'react';
import adminStyles from "../admin.module.css";
import { Activity, Server, Cpu, Layers, ArrowUpRight, ArrowDownRight, Zap, RefreshCw } from "lucide-react";

interface NodeStats {
    id: string;
    name: string;
    firm: string;
    status: 'Healthy' | 'Warning' | 'Critical';
    cpu: number;
    ram: number;
    queue: number;
    uptime: string;
}

export default function FleetMonitoringPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [nodes, setNodes] = useState<NodeStats[]>([
        { id: 'n-1', name: 'NODE_ALPHA_01', firm: 'Institutional Hub HQ', status: 'Healthy', cpu: 42, ram: 58, queue: 0, uptime: '14d 2h' },
        { id: 'n-2', name: 'NODE_BETA_04', firm: 'Legacy Firm Partner', status: 'Warning', cpu: 78, ram: 82, queue: 12, uptime: '3d 18h' },
        { id: 'n-3', name: 'NODE_GAMMA_09', firm: 'Sovereign Wealth Node', status: 'Healthy', cpu: 15, ram: 31, queue: 0, uptime: '42d 11h' },
        { id: 'n-4', name: 'NODE_DELTA_12', firm: 'Global Trade Corp', status: 'Critical', cpu: 94, ram: 91, queue: 84, uptime: '0d 4h' },
    ]);

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 800);
    }, []);

    const getStatusColor = (status: string) => {
        if (status === 'Healthy') return 'var(--accent)';
        if (status === 'Warning') return '#FFA726';
        return '#FF5252';
    };

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            {/* Top Metrics */}
            <div className={adminStyles.metricsGrid} style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "32px" }}>
                <div className={adminStyles.metricCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div className={adminStyles.statLabel}>Aggregate CPU</div>
                        <Cpu className={adminStyles.metricIcon} size={20} />
                    </div>
                    <div className={adminStyles.statValue}>54.2%</div>
                    <div className={adminStyles.statTrend} style={{ color: "var(--accent)" }}>
                        <ArrowDownRight size={14} /> 2.1% from Peak
                    </div>
                </div>
                <div className={adminStyles.metricCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div className={adminStyles.statLabel}>Memory Allocation</div>
                        <Layers className={adminStyles.metricIcon} size={20} />
                    </div>
                    <div className={adminStyles.statValue}>128.5 GB</div>
                    <div className={adminStyles.statTrend} style={{ color: "var(--accent)" }}>
                        <ArrowUpRight size={14} /> 12% Provisioned
                    </div>
                </div>
                <div className={adminStyles.metricCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div className={adminStyles.statLabel}>Active Queues</div>
                        <Activity className={adminStyles.metricIcon} size={20} />
                    </div>
                    <div className={adminStyles.statValue}>96 Tasks</div>
                    <div className={adminStyles.statTrend} style={{ color: "#FFA726" }}>
                        <ArrowUpRight size={14} /> 42% Backlog
                    </div>
                </div>
                <div className={adminStyles.metricCard}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                        <div className={adminStyles.statLabel}>Instance Uptime</div>
                        <Server className={adminStyles.metricIcon} size={20} />
                    </div>
                    <div className={adminStyles.statValue}>99.98%</div>
                    <div className={adminStyles.statTrend} style={{ color: "var(--accent)" }}>
                        Nominal Stability
                    </div>
                </div>
            </div>

            {/* Fleet Status Table */}
            <div className={adminStyles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                    <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 950, marginBottom: "4px" }}>Active Node Cluster</h3>
                        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Real-time health monitoring for client n8n instances</p>
                    </div>
                    <button className={adminStyles.refreshBtn}>
                        <RefreshCw size={18} /> Sync Fleet
                    </button>
                </div>

                <div className={adminStyles.tableContainer}>
                    <table className={adminStyles.table}>
                        <thead>
                            <tr>
                                <th>IDENTIFIER</th>
                                <th>FIRM / OWNER</th>
                                <th>STATUS</th>
                                <th>CPU LOAD</th>
                                <th>RAM USAGE</th>
                                <th>QUEUE</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nodes.map((node) => (
                                <tr key={node.id}>
                                    <td style={{ fontWeight: 950 }}>{node.name}</td>
                                    <td style={{ color: "var(--muted-foreground)" }}>{node.firm}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: getStatusColor(node.status) }} />
                                            <span style={{ fontWeight: 800, fontSize: "0.75rem", color: getStatusColor(node.status) }}>{node.status}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{ width: "60px", height: "6px", background: "var(--muted)", borderRadius: "3px", overflow: "hidden" }}>
                                                <div style={{ width: `${node.cpu}%`, height: "100%", background: node.cpu > 80 ? '#FF5252' : 'var(--accent)' }} />
                                            </div>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{node.cpu}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <div style={{ width: "60px", height: "6px", background: "var(--muted)", borderRadius: "3px", overflow: "hidden" }}>
                                                <div style={{ width: `${node.ram}%`, height: "100%", background: node.ram > 80 ? '#FF5252' : 'var(--accent)' }} />
                                            </div>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>{node.ram}%</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 900, color: node.queue > 20 ? '#FF5252' : 'var(--foreground)' }}>
                                        {node.queue} tasks
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button className={adminStyles.statActionBtn} title="Auto-Scale Node">
                                                <Zap size={14} />
                                            </button>
                                            <button className={adminStyles.statActionBtn} title="Emergency Restart">
                                                <RefreshCw size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
