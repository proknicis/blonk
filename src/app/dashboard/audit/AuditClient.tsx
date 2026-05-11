"use client";

import React, { useState, useMemo } from "react";
import styles from "./audit.module.css";
import {
    Search, Calendar, Filter, Download,
    MoreHorizontal, X, Zap, AlertCircle,
    Clock, MousePointer2, CheckCircle, ArrowUpRight,
    ChevronLeft, ChevronRight, MessageSquare, Flag
} from "lucide-react";

interface LogRow {
    id: string;
    rawId: string;
    ts: string;
    process: string;
    user: string;
    userInitials: string;
    action: string;
    outcome: string;
    duration: string;
}

interface Props {
    initialLogs: LogRow[];
    total: number;
    failures: number;
    successes: number;
    today: number;
    currentUser: string;
}

const PAGE_SIZE = 10;

export default function AuditClient({ initialLogs, total, failures, successes, today, currentUser }: Props) {
    const [search, setSearch]                   = useState("");
    const [selectedWorkflow, setSelectedWorkflow] = useState("All Workflows");
    const [selectedOutcome, setSelectedOutcome]   = useState("All Outcomes");
    const [selectedRun, setSelectedRun]           = useState<LogRow | null>(null);
    const [page, setPage]                         = useState(1);

    // Dynamic workflow list from real data
    const workflows = useMemo(
        () => ["All Workflows", ...Array.from(new Set(initialLogs.map(l => l.process)))],
        [initialLogs]
    );

    // Filtering
    const filteredLogs = useMemo(() => initialLogs.filter(log => {
        const q = search.toLowerCase();
        const matchesSearch = !q ||
            log.action.toLowerCase().includes(q) ||
            log.id.toLowerCase().includes(q) ||
            log.process.toLowerCase().includes(q) ||
            log.user.toLowerCase().includes(q);
        const matchesWorkflow = selectedWorkflow === "All Workflows" || log.process === selectedWorkflow;
        const matchesOutcome  = selectedOutcome  === "All Outcomes"  || log.outcome === selectedOutcome;
        return matchesSearch && matchesWorkflow && matchesOutcome;
    }), [initialLogs, search, selectedWorkflow, selectedOutcome]);

    // Pagination
    const totalPages   = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
    const currentPage  = Math.min(page, totalPages);
    const pagedLogs    = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // Reset page on filter change
    const handleSearch   = (v: string) => { setSearch(v);           setPage(1); };
    const handleWorkflow = (v: string) => { setSelectedWorkflow(v); setPage(1); };
    const handleOutcome  = (v: string) => { setSelectedOutcome(v);  setPage(1); };

    // Export CSV — uses currently filtered data
    const exportCSV = () => {
        const header = ["ID", "Timestamp", "Workflow", "User", "Action", "Outcome", "Duration"];
        const rows   = filteredLogs.map(l =>
            [l.id, l.ts, `"${l.process}"`, `"${l.user}"`, `"${l.action}"`, l.outcome, l.duration].join(",")
        );
        const csv  = [header.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // "Report an issue" — opens AI chat with context
    const reportIssue = (log: LogRow) => {
        const prompt = `There is an issue with workflow run ${log.id}. The workflow "${log.process}" ${log.outcome === 'Failed' ? 'FAILED' : 'ran'} at ${log.ts}. Action: "${log.action}". Please help diagnose and resolve this.`;
        window.dispatchEvent(new CustomEvent('OPEN_AI_CHAT', { detail: { prompt } }));
    };

    const askQuestion = (log: LogRow) => {
        const prompt = `I have a question about audit log ${log.id} — workflow "${log.process}" that ran at ${log.ts}. Can you explain what happened and what "${log.action}" means?`;
        window.dispatchEvent(new CustomEvent('OPEN_AI_CHAT', { detail: { prompt } }));
    };

    // Stats — all real from DB
    const successRate = total > 0 ? ((successes / total) * 100).toFixed(1) : "0";
    const stats = [
        { label: "Total Events",       value: total.toLocaleString(),     trend: `Today: ${today}`, trendUp: true,  icon: <Zap size={20} />,          color: "#3B82F6" },
        { label: "Successful",         value: successes.toLocaleString(), trend: `${successRate}%`,  trendUp: true,  icon: <CheckCircle size={20} />,   color: "#10B981" },
        { label: "Failed",             value: failures.toLocaleString(),  trend: `${total > 0 ? ((failures/total)*100).toFixed(1) : 0}%`, trendUp: false, icon: <AlertCircle size={20} />, color: "#EF4444" },
        { label: "Today's Activity",   value: today.toLocaleString(),     trend: "Last 24h",          trendUp: true,  icon: <MousePointer2 size={20} />, color: "#F59E0B" },
        { label: "Showing Logs For",   value: currentUser.split(' ')[0],  trend: "Your team",         trendUp: true,  icon: <Clock size={20} />,         color: "#8B5CF6" },
    ];

    return (
        <div className={styles.auditContainer}>

            {/* TOP ROW: Search + Export */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.searchBox}>
                    <Search size={18} color="#94A3B8" />
                    <input
                        type="text"
                        placeholder="Search by action, run ID, workflow, user..."
                        value={search}
                        onChange={e => handleSearch(e.target.value)}
                    />
                </div>
                <div className={styles.exportGroup}>
                    <button className={styles.btnExport} onClick={exportCSV}>
                        <Download size={14} /> Export CSV
                    </button>
                </div>
            </div>

            {/* FILTER BAR */}
            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <div className={styles.dateRange}>
                        <Calendar size={16} />
                        Last 200 events
                    </div>
                    <select className={styles.filterSelect} value={selectedWorkflow} onChange={e => handleWorkflow(e.target.value)}>
                        {workflows.map(w => <option key={w}>{w}</option>)}
                    </select>
                    <select className={styles.filterSelect} value={selectedOutcome} onChange={e => handleOutcome(e.target.value)}>
                        <option>All Outcomes</option>
                        <option>Success</option>
                        <option>Failed</option>
                    </select>
                    {(search || selectedWorkflow !== "All Workflows" || selectedOutcome !== "All Outcomes") && (
                        <button
                            className={styles.btnMoreFilters}
                            onClick={() => { setSearch(""); setSelectedWorkflow("All Workflows"); setSelectedOutcome("All Outcomes"); setPage(1); }}
                        >
                            <X size={14} /> Clear filters
                        </button>
                    )}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                    {filteredLogs.length} result{filteredLogs.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* STATS */}
            <div className={styles.statsGrid}>
                {stats.map((s, i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.statHeader}>
                            <div className={styles.statIcon} style={{ background: `${s.color}15`, color: s.color }}>
                                {s.icon}
                            </div>
                            <span className={styles.statLabel}>{s.label}</span>
                        </div>
                        <div className={styles.statValue}>{s.value}</div>
                        <div className={`${styles.statTrend} ${s.trendUp ? styles.trendUp : styles.trendDown}`}>
                            {s.trendUp ? "↑" : "↓"} {s.trend}
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE + SIDE PANEL */}
            <div className={styles.tableWrapper}>
                <div className={styles.mainTable}>
                    {pagedLogs.length === 0 ? (
                        <div style={{ padding: '80px 32px', textAlign: 'center', color: '#64748B' }}>
                            <AlertCircle size={40} style={{ marginBottom: 16, opacity: 0.4 }} />
                            <div style={{ fontWeight: 800, fontSize: '1rem' }}>No logs match your filters</div>
                            <div style={{ fontSize: '0.85rem', marginTop: 8 }}>Try adjusting the search or filter criteria</div>
                        </div>
                    ) : (
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Event</th>
                                    <th>Workflow</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Outcome</th>
                                    <th>Run ID</th>
                                    <th>Duration</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pagedLogs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className={selectedRun?.id === log.id ? styles.rowActive : ""}
                                        onClick={() => setSelectedRun(selectedRun?.id === log.id ? null : log)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>{log.ts}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ color: log.outcome === 'Success' ? '#10B981' : '#EF4444', flexShrink: 0 }}>
                                                    {log.outcome === 'Success' ? <Zap size={14} /> : <AlertCircle size={14} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Workflow Run</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Automated execution</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {log.process}
                                        </td>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar}>{log.userInitials}</div>
                                                <div>
                                                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{log.user}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Team Member</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: '#334155' }}>
                                            {log.action}
                                        </td>
                                        <td>
                                            <span className={`${styles.outcomeTag} ${log.outcome === 'Success' ? styles.success : styles.failed}`}>
                                                {log.outcome}
                                            </span>
                                        </td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94A3B8' }}>
                                            {log.id}
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                                            {log.duration}
                                        </td>
                                        <td onClick={e => e.stopPropagation()}>
                                            <MoreHorizontal size={16} color="#94A3B8" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* PAGINATION */}
                    <div className={styles.pagination}>
                        <div className={styles.pageInfo}>
                            Showing {filteredLogs.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} results
                        </div>
                        <div className={styles.pageControls}>
                            <button
                                className={styles.pageBtn}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const pg = totalPages <= 5 ? i + 1 : Math.max(1, currentPage - 2) + i;
                                if (pg > totalPages) return null;
                                return (
                                    <button
                                        key={pg}
                                        className={`${styles.pageBtn} ${currentPage === pg ? styles.pageBtnActive : ''}`}
                                        onClick={() => setPage(pg)}
                                    >
                                        {pg}
                                    </button>
                                );
                            })}
                            <button
                                className={styles.pageBtn}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* SIDE PANEL */}
                {selectedRun && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <h3 className={styles.panelTitle}>Run Details</h3>
                            <button className={styles.btnClose} onClick={() => setSelectedRun(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Run identity badge */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: '#F8FAFC', borderRadius: 16, border: '1px solid #F1F5F9' }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 10,
                                background: selectedRun.outcome === 'Success' ? '#10B981' : '#EF4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'white', fontWeight: 950, fontSize: '0.85rem'
                            }}>
                                {selectedRun.process.slice(0, 2).toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 950, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {selectedRun.process}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{selectedRun.id}</div>
                            </div>
                            <span className={`${styles.outcomeTag} ${selectedRun.outcome === 'Success' ? styles.success : styles.failed}`}>
                                {selectedRun.outcome}
                            </span>
                        </div>

                        {/* Real metadata */}
                        <div className={styles.runOverview}>
                            {[
                                { label: "Status",       value: selectedRun.outcome },
                                { label: "Started",      value: selectedRun.ts },
                                { label: "Duration",     value: selectedRun.duration },
                                { label: "Triggered By", value: selectedRun.user },
                                { label: "Action",       value: selectedRun.action },
                            ].map(item => (
                                <div key={item.label} className={styles.overviewItem} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                                    <span className={styles.overviewLabel}>{item.label}</span>
                                    <span className={styles.overviewValue} style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        {selectedRun.outcome === 'Failed' && (
                            <div className={styles.helpSection}>
                                <h4 className={styles.helpTitle}>Need help with this run?</h4>
                                <p className={styles.helpText}>
                                    This workflow failed. Use AI assistance to diagnose the issue or ask a question.
                                </p>
                                <div className={styles.helpActions}>
                                    <button
                                        className={styles.btnHelp}
                                        style={{ background: '#0F172A', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                                        onClick={() => reportIssue(selectedRun)}
                                    >
                                        <Flag size={13} /> Report issue
                                    </button>
                                    <button
                                        className={styles.btnHelp}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
                                        onClick={() => askQuestion(selectedRun)}
                                    >
                                        <MessageSquare size={13} /> Ask AI
                                    </button>
                                </div>
                            </div>
                        )}

                        {selectedRun.outcome === 'Success' && (
                            <button
                                className={styles.btnExport}
                                style={{ width: '100%', justifyContent: 'center' }}
                                onClick={() => askQuestion(selectedRun)}
                            >
                                <MessageSquare size={14} /> Ask AI about this run <ArrowUpRight size={14} />
                            </button>
                        )}

                        {/* Export this single run */}
                        <button
                            className={styles.btnExport}
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => {
                                const csv = `ID,Timestamp,Workflow,User,Action,Outcome,Duration\n${selectedRun.id},${selectedRun.ts},"${selectedRun.process}","${selectedRun.user}","${selectedRun.action}",${selectedRun.outcome},${selectedRun.duration}`;
                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url  = URL.createObjectURL(blob);
                                const a    = document.createElement('a');
                                a.href     = url;
                                a.download = `run-${selectedRun.id}.csv`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                        >
                            <Download size={14} /> Export this run
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
