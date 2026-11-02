"use client";

import React, { useState, useMemo } from "react";
import { Database, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import styles from "./datasources.module.css";

interface DSItem {
    id: string;
    name: string;
    type: string;
    status: string;
    volume: string;
    sync: string;
    lastPull: string;
}

const DEFAULT_SOURCES: DSItem[] = [
    { id: "ds-1", name: "Client Intake Mailbox", type: "Gmail Inbox", status: "Connected", volume: "1,240 emails read", sync: "Active Sync", lastPull: "5 mins ago" },
    { id: "ds-2", name: "Operational Spreadsheet Ledger", type: "Google Sheets", status: "Connected", volume: "420 records written", sync: "Active Sync", lastPull: "10 mins ago" },
    { id: "ds-3", name: "Company Invoices Directory", type: "Google Drive Folder", status: "Connected", volume: "98 files parsed", sync: "Active Sync", lastPull: "2 hours ago" },
    { id: "ds-4", name: "Private Client Database", type: "PostgreSQL DB", status: "Disconnected", volume: "0 records synced", sync: "Sync Failed", lastPull: "1 day ago" }
];

export default function DatasourcesClient({ initialCreds }: { initialCreds: any[] }) {
    const [sources, setSources] = useState<DSItem[]>(() => {
        const list = [...DEFAULT_SOURCES];
        // Dynamic credentials sync
        initialCreds.forEach(c => {
            const matchedIndex = list.findIndex(item => item.name.toLowerCase().includes(c.provider.toLowerCase()));
            if (matchedIndex !== -1) {
                list[matchedIndex].status = c.status === "Connected" ? "Connected" : "Disconnected";
                list[matchedIndex].sync = c.status === "Connected" ? "Active Sync" : "Sync Failed";
            }
        });
        return list;
    });

    const [pullingId, setPullingId] = useState<string | null>(null);

    const handleForcePull = (id: string, name: string) => {
        setPullingId(id);
        setTimeout(() => {
            setSources(prev => prev.map(s => {
                if (s.id === id) {
                    return {
                        ...s,
                        status: "Connected",
                        sync: "Active Sync",
                        lastPull: "Just now",
                        volume: s.volume.includes("0 records") ? "12 records synced" : s.volume
                    };
                }
                return s;
            }));
            setPullingId(null);
            alert(`Sovereign sweep of "${name}" completed successfully.`);
        }, 1200);
    };

    return (
        <main className={styles.container} aria-label="Operational Data Sources Console">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Data Sources</h1>
                    <p className={styles.subtitle}>Active business intake triggers, database syncs, and file upload structures connected to your workflow loops.</p>
                </div>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.ledgerTable}>
                    <thead>
                        <tr>
                            <th>Data Source</th>
                            <th>Source Type</th>
                            <th>Operational Volume</th>
                            <th>Sync Status</th>
                            <th>Last Sweep</th>
                            <th style={{ textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sources.map(ds => {
                            const isConnected = ds.status === "Connected";
                            const isPulling = pullingId === ds.id;
                            
                            return (
                                <tr key={ds.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <Database size={16} color="#64748B" />
                                            <span style={{ fontWeight: 800, color: "#020617", fontSize: "0.85rem" }}>{ds.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: "#475569", fontSize: "0.8rem" }}>{ds.type}</td>
                                    <td style={{ fontSize: "0.78rem", color: "#64748B" }}>{ds.volume}</td>
                                    <td>
                                        <span className={`${styles.statusLabel} ${
                                            isConnected ? styles.statusSuccess : styles.statusFailed
                                        }`}>
                                            {ds.sync}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: "0.78rem", color: "#64748B" }}>{ds.lastPull}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <button 
                                            className={styles.btnSecondary} 
                                            onClick={() => handleForcePull(ds.id, ds.name)}
                                            disabled={isPulling}
                                            aria-label={`Force pull data synchronization from ${ds.name}`}
                                        >
                                            <RefreshCw size={12} className={isPulling ? "spin" : ""} /> 
                                            {isPulling ? "Sweeping..." : "Force Pull"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
