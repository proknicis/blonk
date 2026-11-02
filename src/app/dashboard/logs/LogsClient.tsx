"use client";

import React, { useState, useMemo } from "react";
import { Search, Terminal, Trash2, Copy, Check } from "lucide-react";
import styles from "./logs.module.css";

interface LogConsoleItem {
    time: string;
    level: "INFO" | "WARN" | "ERROR";
    source: string;
    msg: string;
}

const DEFAULT_DIAGNOSTICS: LogConsoleItem[] = [
    { time: "01:46:12", level: "INFO", source: "Docker-Host", msg: "Allocating cluster container node worker-03..." },
    { time: "01:46:14", level: "INFO", source: "n8n-Bridge", msg: "Establishing webhook listener route '/v1/client-intake'." },
    { time: "01:46:16", level: "WARN", source: "Credentials", msg: "Stripe token balance check failed with HTTP 401. Retrying..." },
    { time: "01:46:17", level: "ERROR", source: "Credentials", msg: "Sync failure to n8n server: Stripe Secret Key is invalid." },
    { time: "01:46:20", level: "INFO", source: "Database", msg: "PostgreSQL transaction logs rotated successfully. 12KB cleared." }
];

export default function LogsClient({ initialLogs }: { initialLogs: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"ALL" | "INFO" | "WARN" | "ERROR">("ALL");
    const [copiedLogs, setCopiedLogs] = useState(false);

    const consoleLogs: LogConsoleItem[] = useMemo(() => {
        const list = [...DEFAULT_DIAGNOSTICS];
        initialLogs.forEach(log => {
            const timeStr = new Date(log.createdAt).toTimeString().split(" ")[0];
            let level: "INFO" | "WARN" | "ERROR" = "INFO";
            if (log.status === "error" || log.status === "failed") level = "ERROR";
            
            let messageText = "Workflow run triggered.";
            try {
                const parsed = typeof log.result === "string" ? JSON.parse(log.result) : log.result;
                messageText = parsed?.message || parsed?.status || parsed?.activity?.action || JSON.stringify(parsed) || "Execution completed.";
            } catch(e) {}

            list.push({
                time: timeStr,
                level: level,
                source: log.workflowName ? log.workflowName.substring(0, 12) : "System",
                msg: messageText
            });
        });
        return list;
    }, [initialLogs]);

    const filteredLogs = useMemo(() => {
        return consoleLogs.filter(log => {
            const matchesTab = activeTab === "ALL" || log.level === activeTab;
            const matchesSearch = searchQuery === "" || 
                log.msg.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.source.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTab && matchesSearch;
        });
    }, [consoleLogs, activeTab, searchQuery]);

    const handleCopyAll = () => {
        const text = filteredLogs.map(l => `[${l.time}] ${l.level} (${l.source}) - ${l.msg}`).join("\n");
        navigator.clipboard.writeText(text);
        setCopiedLogs(true);
        setTimeout(() => setCopiedLogs(false), 2000);
    };

    return (
        <main className={styles.container} aria-label="Logs and Developer Diagnostics Console">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Logs & Diagnostics</h1>
                    <p className={styles.subtitle}>Developer event stream monitoring backend Docker transactions and API sync handshakes.</p>
                </div>
            </header>

            <section className={styles.filterStrip} aria-label="Logs filters">
                <div className={styles.searchBar}>
                    <Search size={16} color="#64748B" />
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Filter logs search query"
                    />
                </div>

                <div className={styles.tabButtons}>
                    {(["ALL", "INFO", "WARN", "ERROR"] as const).map(tab => (
                        <button
                            key={tab}
                            className={styles.btnSecondary}
                            style={{
                                background: activeTab === tab ? "#0F172A" : "#FFFFFF",
                                color: activeTab === tab ? "#E2E8F0" : "#475569",
                                borderColor: activeTab === tab ? "#334155" : "#E2E8F0",
                                height: "34px",
                                fontSize: "0.75rem"
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                    
                    <button 
                        className={styles.btnSecondary}
                        onClick={handleCopyAll}
                        style={{ height: "34px", fontSize: "0.75rem" }}
                        aria-label="Copy logs buffer to clipboard"
                    >
                        {copiedLogs ? <Check size={14} color="#10B981" /> : <Copy size={14} />} Copy Buffer
                    </button>
                </div>
            </section>

            <div className={styles.logConsole}>
                <div className={styles.consoleHeader}>
                    <span>LIVE EVENT LEDGER</span>
                    <span>host-node-worker-01</span>
                </div>
                <div className={styles.consoleBody} tabIndex={0} aria-label="Live logs terminal terminal window">
                    {filteredLogs.length === 0 ? (
                        <div style={{ color: "#64748B", textAlign: "center", padding: "40px" }}>No logs output matching current criteria.</div>
                    ) : (
                        filteredLogs.map((log, idx) => (
                            <div key={idx} className={styles.consoleRow}>
                                <span className={styles.logTime}>[{log.time}]</span>
                                <span className={`${styles.logLevel} ${
                                    log.level === "ERROR" ? styles.lvlError : 
                                    log.level === "WARN" ? styles.lvlWarn : styles.lvlInfo
                                }`}>{log.level}</span>
                                <span className={styles.logSource}>({log.source})</span>
                                <span className={styles.logMsg}>{log.msg}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
