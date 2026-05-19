"use client";

import React, { useMemo, useState } from "react";
import { Search, Filter, Download, Shield, Box, Settings, AlertCircle, MoreHorizontal, User, Key, Server } from "lucide-react";
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

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Audit Trail</h1>
                    <p className={styles.subtitle}>Immutable ledger of workflow executions, access events, and operational changes from your database.</p>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.searchBox}>
                        <Search size={16} />
                        <input type="text" placeholder="Search events, users, or IPs..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <button className={styles.btnFilter} onClick={() => setSearch("")}><Filter size={16} /> Clear</button>
                    <button className={styles.btnExport} onClick={exportCsv}><Download size={16} /> Export</button>
                </div>
            </div>

            <div className={styles.statsStrip}>
                <StatBox icon={<Shield size={20} />} color="#8B5CF6" label="Security Events" value={stats.securityEvents} />
                <StatBox icon={<Box size={20} />} color="#10B981" label="Provisioning" value={stats.provisioning} />
                <StatBox icon={<Settings size={20} />} color="#3B82F6" label="Configurations" value={stats.configurations} />
                <StatBox icon={<AlertCircle size={20} />} color="#EF4444" label="Failed Auth" value={stats.failedAuth} />
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Timestamp</th><th>Event ID</th><th>Category</th><th>Actor</th><th>Action</th><th>Target</th><th>Status</th><th>IP Address</th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log) => {
                            let CatIcon = Box;
                            if (log.category === "Security") CatIcon = Shield;
                            if (log.category === "Access") CatIcon = Key;
                            if (log.category === "Configuration") CatIcon = Settings;
                            return (
                                <tr key={log.id} className={styles.logRow}>
                                    <td className={styles.tdTime}>{log.timestamp}</td>
                                    <td className={styles.tdId}>{log.id}</td>
                                    <td><div className={styles.categoryTag}><CatIcon size={12} /> {log.category}</div></td>
                                    <td className={styles.tdActor}><User size={14} className={styles.actorIcon} /> {log.actor}</td>
                                    <td className={styles.tdAction}>{log.action}</td>
                                    <td className={styles.tdTarget}><Server size={14} className={styles.targetIcon} /> {log.target}</td>
                                    <td><span className={`${styles.statusBadge} ${log.status === 'Success' ? styles.statusSuccess : styles.statusFailed}`}>{log.status}</span></td>
                                    <td className={styles.tdIp}>{log.ipAddress}</td>
                                    <td className={styles.tdActions}><button className={styles.btnMore} title={log.id}><MoreHorizontal size={16} /></button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && <div style={{ padding: 32, textAlign: "center", color: "#64748B", fontWeight: 700 }}>No audit events found.</div>}
            </div>
        </div>
    );
}

function StatBox({ icon, color, label, value }: { icon: React.ReactNode; color: string; label: string; value: number }) {
    return (
        <div className={styles.statBox}>
            <div className={styles.statIcon} style={{ color, backgroundColor: `${color}1A` }}>{icon}</div>
            <div className={styles.statInfo}><span className={styles.statLabel}>{label}</span><span className={styles.statValue}>{value}</span></div>
        </div>
    );
}
