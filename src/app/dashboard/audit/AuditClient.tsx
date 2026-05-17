"use client";

import React, { useState } from "react";
import { 
    Search, Filter, Download, Shield, Box, Settings, 
    AlertCircle, MoreHorizontal, User, Key, Server
} from "lucide-react";
import styles from "./audit.module.css";

const auditLogs = [
    {
        id: "EVT-8992",
        timestamp: "2026-05-17 14:22:01",
        category: "Provisioning",
        actor: "Jane Doe",
        action: "Deploy Node",
        target: "cache-layer-02",
        status: "Success",
        ipAddress: "192.168.1.42"
    },
    {
        id: "EVT-8991",
        timestamp: "2026-05-17 14:15:33",
        category: "Security",
        actor: "System",
        action: "Key Rotation",
        target: "db-credentials-prod",
        status: "Success",
        ipAddress: "Internal"
    },
    {
        id: "EVT-8990",
        timestamp: "2026-05-17 14:10:05",
        category: "Access",
        actor: "Alex Smith",
        action: "Login Attempt",
        target: "Admin Dashboard",
        status: "Failed",
        ipAddress: "203.0.113.15"
    },
    {
        id: "EVT-8989",
        timestamp: "2026-05-17 13:45:12",
        category: "Configuration",
        actor: "Jane Doe",
        action: "Update Route",
        target: "api-gateway",
        status: "Success",
        ipAddress: "192.168.1.42"
    },
    {
        id: "EVT-8988",
        timestamp: "2026-05-17 13:30:00",
        category: "Provisioning",
        actor: "Auto-Scaler",
        action: "Scale Up",
        target: "worker-pool-alpha",
        status: "Success",
        ipAddress: "Internal"
    }
];

export default function AuditPage() {
    const [search, setSearch] = useState("");

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Audit Trail</h1>
                    <p className={styles.subtitle}>
                        Immutable ledger of all provisioning events, access modifications, and system alerts.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.searchBox}>
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Search events, users, or IPs..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className={styles.btnFilter}><Filter size={16} /> Filter</button>
                    <button className={styles.btnExport}><Download size={16} /> Export</button>
                </div>
            </div>

            {/* STATS STRIP */}
            <div className={styles.statsStrip}>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                        <Shield size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Security Events</span>
                        <span className={styles.statValue}>12</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <Box size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Provisioning</span>
                        <span className={styles.statValue}>156</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <Settings size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Configurations</span>
                        <span className={styles.statValue}>89</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertCircle size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Failed Auth</span>
                        <span className={styles.statValue}>3</span>
                    </div>
                </div>
            </div>

            {/* AUDIT TABLE */}
            <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
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
                        {auditLogs.map((log) => {
                            let CatIcon = Box;
                            if (log.category === "Security") CatIcon = Shield;
                            if (log.category === "Access") CatIcon = Key;
                            if (log.category === "Configuration") CatIcon = Settings;
                            
                            return (
                                <tr key={log.id} className={styles.logRow}>
                                    <td className={styles.tdTime}>{log.timestamp}</td>
                                    <td className={styles.tdId}>{log.id}</td>
                                    <td>
                                        <div className={styles.categoryTag}>
                                            <CatIcon size={12} /> {log.category}
                                        </div>
                                    </td>
                                    <td className={styles.tdActor}>
                                        <User size={14} className={styles.actorIcon} /> {log.actor}
                                    </td>
                                    <td className={styles.tdAction}>{log.action}</td>
                                    <td className={styles.tdTarget}>
                                        <Server size={14} className={styles.targetIcon} /> {log.target}
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${log.status === 'Success' ? styles.statusSuccess : styles.statusFailed}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className={styles.tdIp}>{log.ipAddress}</td>
                                    <td className={styles.tdActions}>
                                        <button className={styles.btnMore}><MoreHorizontal size={16} /></button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
