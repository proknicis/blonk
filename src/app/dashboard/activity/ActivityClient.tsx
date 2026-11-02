"use client";

import React, { useState, useMemo } from "react";
import { Search, Download, Check, AlertCircle, X, Eye, RefreshCw } from "lucide-react";
import styles from "./activity.module.css";

interface DBLog {
    id: string;
    workflowName: string;
    status: string;
    createdAt: string;
    result: any;
}

export default function ActivityClient({ initialLogs }: { initialLogs: DBLog[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [inspectLog, setInspectLog] = useState<DBLog | null>(null);

    const matchesSearch = (log: DBLog) => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return true;
        return (
            log.workflowName?.toLowerCase().includes(query) ||
            log.id?.toString().includes(query) ||
            log.status?.toLowerCase().includes(query)
        );
    };

    const matchesStatus = (log: DBLog) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "success") return log.status === "success" || log.status === "Success" || log.status === "Running" || log.status === "Active";
        if (statusFilter === "failed") return log.status === "failed" || log.status === "error" || log.status === "Failed" || log.status === "Error";
        return true;
    };

    const filteredLogs = useMemo(() => {
        return initialLogs.filter(log => matchesSearch(log) && matchesStatus(log));
    }, [initialLogs, searchQuery, statusFilter]);

    const handleExportCSV = () => {
        const headers = ["Timestamp", "Workflow Log ID", "Workflow Name", "Status", "Payload Message"];
        const rows = filteredLogs.map(log => {
            let msg = "";
            try {
                const parsed = typeof log.result === "string" ? JSON.parse(log.result) : log.result;
                msg = parsed?.message || parsed?.status || parsed?.activity?.action || JSON.stringify(parsed) || "";
            } catch (e) {
                msg = String(log.result || "");
            }
            return [
                new Date(log.createdAt).toISOString(),
                log.id,
                log.workflowName || "System Process",
                log.status,
                msg.replace(/"/g, '""')
            ];
        });

        const csvContent = [headers.join(","), ...rows.map(r => r.map(val => `"${val}"`).join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `blonk-activity-logs-${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className={styles.container} aria-label="Workspace Activity Timeline">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Workspace Activity Stream</h1>
                    <p className={styles.subtitle}>Real-time ledger of administrative events, credential handshakes, and automated executions.</p>
                </div>
                <button 
                    onClick={handleExportCSV} 
                    className={styles.btnPrimary}
                    aria-label="Export activity timeline logs as CSV"
                >
                    <Download size={16} /> Export CSV
                </button>
            </header>

            {/* Filter Strip */}
            <section className={styles.filterStrip} aria-label="Timeline Filters">
                <div className={styles.searchBar}>
                    <Search size={16} color="#64748B" />
                    <input 
                        type="text" 
                        placeholder="Filter activity feed..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Search activity logs"
                    />
                </div>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label htmlFor="status-filter" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>Status Filter:</label>
                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Events</option>
                        <option value="success">Successful</option>
                        <option value="failed">Failed / Warning</option>
                    </select>
                    
                    <button 
                        onClick={() => { setSearchQuery(""); setStatusFilter("all"); }} 
                        className={styles.btnSecondary} 
                        style={{ height: "36px", padding: "0 10px" }}
                        aria-label="Reset filters"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </section>

            {/* Timeline Stream */}
            <div className={styles.timelineList}>
                {filteredLogs.length === 0 ? (
                    <div className={styles.emptyState}>
                        <AlertCircle size={32} />
                        <p>No activity logs matched your current filters.</p>
                    </div>
                ) : (
                    filteredLogs.map(log => {
                        const isSuccess = log.status === "success" || log.status === "Success" || log.status === "Running" || log.status === "Active";
                        
                        let displayMessage = "";
                        try {
                            const parsed = typeof log.result === "string" ? JSON.parse(log.result) : log.result;
                            displayMessage = parsed?.message || parsed?.status || parsed?.activity?.action || "Workflow execution recorded.";
                        } catch (e) {
                            displayMessage = String(log.result || "Workflow execution recorded.");
                        }

                        return (
                            <div key={log.id} className={styles.timelineRow}>
                                <div className={styles.timelineMarker}>
                                    <div className={`${styles.timelineBadge} ${isSuccess ? styles.badgeSuccess : styles.badgeFailed}`}>
                                        {isSuccess ? <Check size={12} strokeWidth={3} /> : <AlertCircle size={12} />}
                                    </div>
                                    <div className={styles.timelineLine} />
                                </div>
                                <div 
                                    className={styles.timelineContent} 
                                    tabIndex={0}
                                >
                                    <div style={{ flexGrow: 1 }}>
                                        <div className={styles.timelineHeader}>
                                            <span className={styles.timelineEvent}>{log.workflowName || "System Process"}</span>
                                            <span className={styles.timelineTime}>{new Date(log.createdAt).toLocaleString()}</span>
                                        </div>
                                        <div className={styles.timelineMeta}>
                                            <span>Event: <strong>{displayMessage}</strong></span>
                                            <span className={styles.metaDivider}>•</span>
                                            <span>Log ID: <strong>#{log.id.toString().substring(0, 8)}</strong></span>
                                        </div>
                                    </div>
                                    <button 
                                        className={styles.btnSecondary} 
                                        style={{ height: "30px", padding: "0 10px", fontSize: "0.72rem", marginLeft: "16px" }}
                                        onClick={() => setInspectLog(log)}
                                        aria-label={`Inspect Log ID ${log.id}`}
                                    >
                                        <Eye size={12} /> Inspect
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Inspect Modal */}
            {inspectLog && (
                <div className={styles.modalOverlay} onClick={() => setInspectLog(null)} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3 id="modal-title" className={styles.modalTitle}>Inspect Execution Details</h3>
                            <button className={styles.modalCloseBtn} onClick={() => setInspectLog(null)} aria-label="Close modal">
                                <X size={18} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.modalRow}>
                                <div className={styles.modalLabel}>Log Event ID</div>
                                <div className={styles.modalVal} style={{ fontFamily: "monospace", fontWeight: 700 }}>{inspectLog.id}</div>
                            </div>
                            <div className={styles.modalRow}>
                                <div className={styles.modalLabel}>Workflow Engine</div>
                                <div className={styles.modalVal}>{inspectLog.workflowName || "System Process"}</div>
                            </div>
                            <div className={styles.modalRow}>
                                <div className={styles.modalLabel}>Status</div>
                                <div className={styles.modalVal}>
                                    <span className={styles.statusLabel} style={{
                                        background: inspectLog.status === "success" || inspectLog.status === "Success" ? "#ECFDF5" : "#FFF5F5",
                                        color: inspectLog.status === "success" || inspectLog.status === "Success" ? "#10B981" : "#EF4444"
                                    }}>
                                        {inspectLog.status}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.modalRow}>
                                <div className={styles.modalLabel}>Timestamp</div>
                                <div className={styles.modalVal}>{new Date(inspectLog.createdAt).toString()}</div>
                            </div>
                            <div className={styles.modalRow}>
                                <div className={styles.modalLabel}>Raw Payload / Log Result</div>
                                <div className={styles.modalVal}>
                                    <pre className={styles.codeBlock}>
                                        {typeof inspectLog.result === "string" 
                                            ? inspectLog.result 
                                            : JSON.stringify(inspectLog.result, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
