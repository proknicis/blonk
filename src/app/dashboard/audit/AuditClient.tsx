import React, { useState } from "react";
import styles from "./audit.module.css";
import { 
    Search, Calendar, ChevronDown, Filter, Download, 
    MoreHorizontal, X, Zap, ShieldCheck, AlertCircle, 
    Clock, MousePointer2, CheckCircle, ArrowUpRight
} from "lucide-react";

export default function AuditClient({ initialLogs, total, failures, today }: { initialLogs: any[]; total: number; failures: number, today: number }) {
    const [search, setSearch] = useState("");
    const [selectedRun, setSelectedRun] = useState<any>(null);
    const [selectedWorkflow, setSelectedWorkflow] = useState("All Workflows");
    
    const workflows = ["All Workflows", ...Array.from(new Set(initialLogs.map(l => l.process)))];

    const filteredLogs = initialLogs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                             log.id.toLowerCase().includes(search.toLowerCase());
        const matchesWorkflow = selectedWorkflow === "All Workflows" || log.process === selectedWorkflow;
        return matchesSearch && matchesWorkflow;
    });

    const stats = [
        { label: "Total Events", value: total.toLocaleString(), trend: "+18%", trendUp: true, icon: <Zap size={20} />, color: "#3B82F6" },
        { label: "Successful", value: (total - failures).toLocaleString(), trend: "87.5%", trendUp: true, icon: <CheckCircle size={20} />, color: "#10B981" },
        { label: "Failed", value: failures.toLocaleString(), trend: "10.3%", trendUp: false, icon: <AlertCircle size={20} />, color: "#EF4444" },
        { label: "Manual Actions", value: "28", trend: "2.2%", trendUp: true, icon: <MousePointer2 size={20} />, color: "#F59E0B" },
        { label: "Avg. Response Time", value: "2.48s", trend: "-12%", trendUp: true, icon: <Clock size={20} />, color: "#8B5CF6" },
    ];

    return (
        <div className={styles.auditContainer}>
            {/* SEARCH & FILTERS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={styles.searchBox}>
                    <Search size={18} color="#94A3B8" />
                    <input 
                        type="text" 
                        placeholder="Search by action, run ID, workflow, user..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.filterGroup}>
                    <div className={styles.dateRange}>
                        <Calendar size={16} />
                        May 10, 2025 - May 17, 2025
                    </div>
                    <select className={styles.filterSelect} value={selectedWorkflow} onChange={e => setSelectedWorkflow(e.target.value)}>
                        {workflows.map(w => <option key={w}>{w}</option>)}
                    </select>
                    <select className={styles.filterSelect}><option>All Actions</option></select>
                    <select className={styles.filterSelect}><option>All Users</option></select>
                    <select className={styles.filterSelect}><option>All Outcomes</option></select>
                    <button className={styles.btnMoreFilters}><Filter size={14} /> More Filters</button>
                </div>
                <div className={styles.exportGroup}>
                    <button className={styles.btnExport}><Download size={14} /> Export CSV</button>
                    <button className={styles.btnExport}><Download size={14} /> Export PDF</button>
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
                            {s.trendUp ? "↑" : "↓"} {s.trend} vs previous 7 days
                        </div>
                    </div>
                ))}
            </div>

            {/* TABLE AREA */}
            <div className={styles.tableWrapper}>
                <div className={styles.mainTable}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Event</th>
                                <th>Workflow</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Outcome</th>
                                <th>Run ID / Details</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr 
                                    key={log.id} 
                                    className={selectedRun?.id === log.id ? styles.rowActive : ""}
                                    onClick={() => setSelectedRun(log)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td style={{ whiteSpace: 'nowrap' }}>{log.ts}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ color: log.outcome === 'Success' ? '#10B981' : '#EF4444' }}>
                                                {log.outcome === 'Success' ? <Zap size={14} /> : <AlertCircle size={14} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 950 }}>Workflow Run</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Workflow executed</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{log.process}</td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <div className={styles.avatar}>MK</div>
                                            <div>
                                                <div>Markus Kaknens</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Owner</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{log.action}</td>
                                    <td>
                                        <span className={`${styles.outcomeTag} ${log.outcome === 'Success' ? styles.success : styles.failed}`}>
                                            {log.outcome}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', color: '#64748B' }}>{log.id.toLowerCase()}</td>
                                    <td><MoreHorizontal size={16} color="#94A3B8" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    <div className={styles.pagination}>
                        <div className={styles.pageInfo}>Showing 1 to 10 of {total.toLocaleString()} results</div>
                        <div className={styles.pageControls}>
                            <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                            <button className={styles.pageBtn}>2</button>
                            <button className={styles.pageBtn}>3</button>
                            <span style={{ color: '#94A3B8' }}>...</span>
                            <button className={styles.pageBtn}>125</button>
                        </div>
                    </div>
                </div>

                {selectedRun && (
                    <div className={styles.sidePanel}>
                        <div className={styles.panelHeader}>
                            <h3 className={styles.panelTitle}>Run Details</h3>
                            <button className={styles.btnClose} onClick={() => setSelectedRun(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.runOverview}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 40, height: 40, background: '#EF4444', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 950 }}>
                                    DS
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 950 }}>Daily Sync</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{selectedRun.id.toLowerCase()}</div>
                                </div>
                                <span className={`${styles.outcomeTag} ${selectedRun.outcome === 'Success' ? styles.success : styles.failed}`}>
                                    {selectedRun.outcome}
                                </span>
                            </div>

                            <div className={styles.overviewItem}>
                                <span className={styles.overviewLabel}>Status</span>
                                <span className={styles.overviewValue}>{selectedRun.outcome}</span>
                            </div>
                            <div className={styles.overviewItem}>
                                <span className={styles.overviewLabel}>Started</span>
                                <span className={styles.overviewValue}>{selectedRun.ts}</span>
                            </div>
                            <div className={styles.overviewItem}>
                                <span className={styles.overviewLabel}>Duration</span>
                                <span className={styles.overviewValue}>17.3s</span>
                            </div>
                            <div className={styles.overviewItem}>
                                <span className={styles.overviewLabel}>Triggered By</span>
                                <span className={styles.overviewValue}>Manual (Markus Kaknens)</span>
                            </div>
                        </div>

                        <button className={styles.btnExport} style={{ width: '100%', justifyContent: 'center' }}>
                            View Full Run Details <ArrowUpRight size={14} />
                        </button>

                        <div className={styles.helpSection}>
                            <h4 className={styles.helpTitle}>Need help with this run?</h4>
                            <p className={styles.helpText}>Something went wrong or have a question about this workflow run?</p>
                            <div className={styles.helpActions}>
                                <button className={styles.btnHelp} style={{ background: '#0F172A', color: 'white', border: 'none' }}>Report an issue</button>
                                <button className={styles.btnHelp}>Ask a Question</button>
                            </div>
                        </div>

                        <div className={styles.recentSteps}>
                            <h4 className={styles.helpTitle}>Recent Steps</h4>
                            {[
                                { name: 'Manual Trigger', status: 'Started', time: '10:24:16 PM', success: true },
                                { name: 'Get Records (Airtable)', status: 'Success', time: '10:24:19 PM', success: true },
                                { name: 'Create Message (Slack)', status: 'Success', time: '10:24:21 PM', success: true },
                                { name: 'Update Record (Airtable)', status: 'Success', time: '10:24:24 PM', success: true },
                                { name: 'Google Sheets', status: 'Failed', time: '10:24:35 PM', success: false },
                            ].map((step, i) => (
                                <div key={i} className={styles.stepItem}>
                                    <div className={styles.stepCircle} style={{ background: step.success ? '#10B981' : '#EF4444' }}>
                                        <CheckCircle size={14} color="white" />
                                    </div>
                                    <div className={styles.stepContent}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span className={styles.stepName}>{step.name}</span>
                                            <span className={styles.stepTime}>{step.time}</span>
                                        </div>
                                        <div className={styles.stepStatus} style={{ color: step.success ? '#10B981' : '#EF4444' }}>{step.status}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className={styles.btnExport} style={{ width: '100%', justifyContent: 'center' }}>
                            View All Steps
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
