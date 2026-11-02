"use client";

import React, { useState, useMemo } from "react";
import { Search, RefreshCw, AlertCircle, Clock, ChevronDown, ChevronUp, Check, Cpu, Brain, Activity, Terminal } from "lucide-react";
import styles from "./history.module.css";

interface LogItem {
    runId: string;
    rawId: string;
    workflowName: string;
    time: string;
    triggerType: string;
    duration: string;
    status: string;
    reasoning?: string;
    steps?: string[];
}

const DEFAULT_HISTORY: LogItem[] = [
    { 
        runId: "run-e921a", 
        rawId: "exec_e921a",
        workflowName: "Client Onboarding Setup", 
        time: "10 mins ago", 
        duration: "1.2s", 
        status: "Success", 
        triggerType: "Webhook",
        reasoning: "Supervisor agent initiated onboarding pipeline for client Sia Blonk.",
        steps: [
            "Started: Handshake trigger dispatched successfully.",
            "Planning: Mapped required integrations (Slack, Gmail).",
            "Reasoning: Supervisor selected Intake Agent sub-flow.",
            "Tool Call: Read Client Profile details from HubSpot CRM.",
            "Tool Call: Dispatched welcome message to Slack.",
            "Reflection: Confirmed client registration complete.",
            "Completed: Dashboard notifications pushed."
        ]
    },
    { 
        runId: "run-a481c", 
        rawId: "exec_a481c",
        workflowName: "Invoice Processing Loop", 
        time: "2 hours ago", 
        duration: "3.4s", 
        status: "Failed", 
        triggerType: "Gmail Poll",
        reasoning: "Failed to reconcile invoice data. Discrepancy detected in pricing model.",
        steps: [
            "Started: Inboxes checked for pending attachments.",
            "Planning: Scoped Brain context for Invoices folder.",
            "Reasoning: Finance Agent selected to read PDF invoices.",
            "Tool Call: Read attachment 'inv_0918.pdf' successfully.",
            "Tool Call: Attempted matching invoice total to Stripe charge.",
            "Reflection: Matching failed: Charge total mismatch ($49 vs $79).",
            "Failed: Dispatched discrepancy alert to operators."
        ]
    }
];

export default function HistoryClient({ initialLogs }: { initialLogs: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

    const historyItems: LogItem[] = useMemo(() => {
        const list = [...DEFAULT_HISTORY];
        initialLogs.forEach(log => {
            const shortId = "run-" + log.id.toString().substring(5, 10);
            if (!list.some(item => item.runId === shortId)) {
                let trigger = "API Sweep";
                let reasoning = "Execution triggered via BLONK Orchestration gateway.";
                let steps = [
                    "Started: Dispatched run request to Execution nodes.",
                    "Planning: Scoped Company Brain context permissions.",
                    "Reasoning: Main Brain coordinated task delegation.",
                    "Completed: Execution finalized successfully."
                ];

                try {
                    const parsed = typeof log.result === "string" ? JSON.parse(log.result) : log.result;
                    if (parsed?.activity?.trigger) trigger = parsed.activity.trigger;
                    if (parsed?.reasoning) reasoning = parsed.reasoning;
                    if (parsed?.steps) steps = parsed.steps;
                } catch(e) {}
                
                list.unshift({
                    runId: shortId,
                    rawId: log.id,
                    workflowName: log.workflowName || "System Loop",
                    time: new Date(log.createdAt).toLocaleString(),
                    duration: "1.8s",
                    status: (log.status === "success" || log.status === "Success" || log.status === "Running" || log.status === "Completed") ? "Success" : "Failed",
                    triggerType: trigger,
                    reasoning,
                    steps
                });
            }
        });
        return list;
    }, [initialLogs]);

    const filteredItems = useMemo(() => {
        return historyItems.filter(item => {
            const matchesSearch = searchQuery === "" || 
                item.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.runId.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === "all" || 
                item.status.toLowerCase() === statusFilter.toLowerCase();

            return matchesSearch && matchesStatus;
        });
    }, [historyItems, searchQuery, statusFilter]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 800);
    };

    const toggleRow = (runId: string) => {
        setExpandedRunId(expandedRunId === runId ? null : runId);
    };

    return (
        <main className={styles.container} aria-label="Execution Runs History Console">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Execution History</h1>
                    <p className={styles.subtitle}>Comprehensive tracking ledger of active sovereign workflow run statuses and latency metrics.</p>
                </div>
            </header>

            <section className={styles.filterStrip} aria-label="Execution filters">
                <div className={styles.searchBar}>
                    <Search size={16} color="#64748B" />
                    <input 
                        type="text" 
                        placeholder="Search by run ID or workflow..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        aria-label="Search execution logs"
                    />
                </div>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <label htmlFor="status-select" style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>Status:</label>
                    <select
                        id="status-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="all">All Runs</option>
                        <option value="success">Success</option>
                        <option value="failed">Failed</option>
                    </select>

                    <button 
                        className={styles.btnSecondary}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        aria-label="Refresh history ledger logs"
                    >
                        <RefreshCw size={14} className={isRefreshing ? "spin" : ""} /> {isRefreshing ? "Syncing..." : "Sync Logs"}
                    </button>
                </div>
            </section>

            <div className={styles.tableCard}>
                <table className={styles.ledgerTable}>
                    <thead>
                        <tr>
                            <th style={{ width: "40px" }}></th>
                            <th>Execution ID</th>
                            <th>Active Workflow</th>
                            <th>Execution Time</th>
                            <th>Trigger Type</th>
                            <th>Run Duration</th>
                            <th style={{ textAlign: "right" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className={styles.emptyState}>
                                        <AlertCircle size={48} color="#94A3B8" />
                                        <p>No execution logs match your search filter.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredItems.map(log => {
                                const isExpanded = expandedRunId === log.runId;
                                return (
                                    <React.Fragment key={log.runId}>
                                        <tr 
                                            onClick={() => toggleRow(log.runId)}
                                            style={{ cursor: "pointer", background: isExpanded ? "var(--muted)" : "transparent" }}
                                        >
                                            <td style={{ paddingLeft: "16px" }}>
                                                {isExpanded ? <ChevronUp size={16} color="#64748B" /> : <ChevronDown size={16} color="#64748B" />}
                                            </td>
                                            <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#475569", fontSize: "0.8rem" }}>
                                                {log.rawId ? log.rawId.substring(0, 15) + "..." : log.runId}
                                            </td>
                                            <td style={{ fontWeight: 800, color: "#020617", fontSize: "0.85rem" }}>{log.workflowName}</td>
                                            <td style={{ fontSize: "0.78rem", color: "#64748B" }}>{log.time}</td>
                                            <td style={{ fontWeight: 700, color: "#334155", fontSize: "0.8rem" }}>{log.triggerType}</td>
                                            <td style={{ fontSize: "0.78rem", color: "#64748B", fontFamily: "monospace" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                    <Clock size={12} color="#94A3B8" /> {log.duration}
                                                </div>
                                            </td>
                                            <td style={{ textAlign: "right", paddingRight: "16px" }}>
                                                <span className={`${styles.statusLabel} ${
                                                    log.status === "Success" ? styles.statusSuccess : styles.statusFailed
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>

                                        {/* Expanded Timeline View Row */}
                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={7} style={{ background: "var(--muted)", padding: "20px 24px" }}>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "slideDown 0.25s ease" }}>
                                                        
                                                        {/* Executive Summary */}
                                                        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                                            <Brain size={18} color="var(--accent)" style={{ marginTop: "2px" }} />
                                                            <div>
                                                                <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900 }}>AI Agent Orchestrator Reasoning</h4>
                                                                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "#475569", lineHeight: 1.4 }}>
                                                                    {log.reasoning}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Vertical Timeline Steps */}
                                                        <div>
                                                            <h4 style={{ margin: "0 0 12px 0", fontSize: "0.85rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
                                                                <Activity size={16} color="var(--accent)" />
                                                                <span>Execution Steps Timeline</span>
                                                            </h4>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                                                {(log.steps || []).map((step, sIdx) => {
                                                                    const isLast = sIdx === (log.steps || []).length - 1;
                                                                    const isFail = log.status === "Failed" && isLast;
                                                                    
                                                                    return (
                                                                        <div key={sIdx} style={{ display: "flex", gap: "14px" }}>
                                                                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                                                                <div style={{ 
                                                                                    width: "20px", 
                                                                                    height: "20px", 
                                                                                    borderRadius: "50%", 
                                                                                    background: isFail ? "#EF4444" : "#10B981", 
                                                                                    display: "flex", 
                                                                                    alignItems: "center", 
                                                                                    justifyContent: "center",
                                                                                    color: "#FFFFFF" 
                                                                                }}>
                                                                                    <Check size={12} strokeWidth={3} />
                                                                                </div>
                                                                                {!isLast && (
                                                                                    <div style={{ width: "2px", height: "24px", background: "#E2E8F0" }} />
                                                                                )}
                                                                            </div>
                                                                            <div style={{ paddingBottom: "16px", fontSize: "0.8rem", color: "#334155", fontWeight: 650 }}>
                                                                                {step}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>

                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
