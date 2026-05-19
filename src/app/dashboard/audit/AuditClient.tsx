"use client";

import React, { useMemo, useState } from "react";
import { Search, Download, Shield, Box, Settings, AlertTriangle, MoreHorizontal, User, Server, FileText, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import styles from "./audit.module.css";

interface AuditLog {
    id: string;
    timestamp: string;
    category: string;
    actor: string;
    action: string;
    target: string;
    status: string;
    ipAddress: string;
}

interface AuditStats {
    securityEvents: number;
    provisioning: number;
    configurations: number;
    failedAuth: number;
}

export default function AuditPage({ auditLogs, stats }: { auditLogs: AuditLog[]; stats: AuditStats }) {
    const [search, setSearch] = useState("");

    const filteredLogs = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return auditLogs;
        return auditLogs.filter(log => [log.id, log.timestamp, log.category, log.actor, log.action, log.target, log.status, log.ipAddress].some(value => value.toLowerCase().includes(term)));
    }, [auditLogs, search]);

    const exportCsv = () => {
        const rows = [["Timestamp", "Event ID", "Category", "Actor", "Action", "Target", "Status", "IP Address"], ...filteredLogs.map(log => [log.timestamp, log.id, log.category, log.actor, log.action, log.target, log.status, log.ipAddress])];
        const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `blonk-audit-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const successCount = filteredLogs.filter(l => l.status === 'Success').length;
    const failedCount = filteredLogs.filter(l => l.status === 'Failed').length;

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerBadge}>
                        <FileText size={16} color="#8B5CF6" />
                        <span>AUDIT TRAIL</span>
                    </div>
                    <h1 className={styles.title}>Audit Logs</h1>
                    <p className={styles.subtitle}>Immutable ledger of workflow executions, access events, and operational changes.</p>
                </div>
                <button className={styles.btnPrimary} onClick={exportCsv}>
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* METRICS */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metricIconBox} style={{ background: '#F3E8FF', color: '#8B5CF6' }}><FileText size={24} /></div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricValue}>{auditLogs.length}</span>
                        <span className={styles.metricLabel}>Total Events</span>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricIconBox} style={{ background: '#ECFDF5', color: '#10B981' }}><CheckCircle size={24} /></div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricValue}>{successCount}</span>
                        <span className={styles.metricLabel}>Successful</span>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricIconBox} style={{ background: '#FEF2F2', color: '#EF4444' }}><XCircle size={24} /></div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricValue}>{failedCount}</span>
                        <span className={styles.metricLabel}>Failed</span>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metricIconBox} style={{ background: '#EFF6FF', color: '#3B82F6' }}><Shield size={24} /></div>
                    <div className={styles.metricInfo}>
                        <span className={styles.metricValue}>{stats.securityEvents}</span>
                        <span className={styles.metricLabel}>Security Events</span>
                    </div>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className={styles.searchBar}>
                <div className={styles.searchBox}>
                    <Search size={18} color="#94A3B8" />
                    <input type="text" placeholder="Search events, users, or IP addresses..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                {search && (
                    <button className={styles.btnClear} onClick={() => setSearch("")}>
                        <RefreshCw size={16} /> Clear
                    </button>
                )}
            </div>

            {/* TABLE */}
            <div className={styles.tableContainer}>
                <table className={styles.auditTable}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Event ID</th>
                            <th>Category</th>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Target</th>
                            <th>Status</th>
                            <th>IP Address</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log) => {
                            let CatIcon = Box;
                            let catColor = '#10B981';
                            if (log.category === "Security") { CatIcon = Shield; catColor = '#EF4444'; }
                            if (log.category === "Access") { CatIcon = User; catColor = '#3B82F6'; }
                            if (log.category === "Configuration") { CatIcon = Settings; catColor = '#8B5CF6'; }
                            
                            const isSuccess = log.status === 'Success';
                            
                            return (
                                <tr key={log.id} className={styles.logRow}>
                                    <td className={styles.tdTime}>
                                        <div className={styles.timeCell}>
                                            <Clock size={14} color="#94A3B8" />
                                            {log.timestamp}
                                        </div>
                                    </td>
                                    <td className={styles.tdId}>{log.id}</td>
                                    <td>
                                        <div className={styles.categoryBadge} style={{ color: catColor, background: `${catColor}15` }}>
                                            <CatIcon size={12} />
                                            {log.category}
                                        </div>
                                    </td>
                                    <td className={styles.tdActor}>
                                        <div className={styles.actorCell}>
                                            <div className={styles.actorAvatar} style={{ background: `${catColor}15`, color: catColor }}>
                                                {log.actor?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <span>{log.actor}</span>
                                        </div>
                                    </td>
                                    <td className={styles.tdAction}>{log.action}</td>
                                    <td className={styles.tdTarget}>
                                        <div className={styles.targetCell}>
                                            <Server size={14} color="#94A3B8" />
                                            {log.target}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.statusBadge} style={{ color: isSuccess ? '#10B981' : '#EF4444', background: isSuccess ? '#ECFDF5' : '#FEF2F2' }}>
                                            {isSuccess ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {log.status}
                                        </div>
                                    </td>
                                    <td className={styles.tdIp}>{log.ipAddress}</td>
                                    <td className={styles.tdActions}>
                                        <button className={styles.actionBtn} title={log.id}>
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className={styles.emptyState}>
                        <FileText size={48} color="#94A3B8" />
                        <p>No audit events found matching your search</p>
                    </div>
                )}
            </div>
        </div>
    );
}

