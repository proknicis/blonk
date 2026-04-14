"use client";

import React, { useState } from "react";
import { Search, Download, Filter, ChevronDown } from "lucide-react";
// We don't have local css, the previous page.tsx used styles from "../dashboard.module.css".
// Wait, I will just use inline styles if that is what it was doing, or adjust.
// The original `page.tsx` was just using `import styles from "../dashboard.module.css";`.

export default function AuditClient({ initialLogs, total, failures }: { initialLogs: any[]; total: number; failures: number }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All Processes");

    // Extract unique process types from real data
    const uniqueProcesses = Array.from(new Set(initialLogs.map(l => l.process))).filter(Boolean);
    const processTypes = ["All Processes", ...uniqueProcesses];

    const visible = initialLogs.filter(l =>
        (filter === "All Processes" || l.process === filter) &&
        (search === "" || String(l.action).toLowerCase().includes(search.toLowerCase()) || String(l.user).toLowerCase().includes(search.toLowerCase()) || String(l.id).toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--accent)", marginBottom: 6 }}>
                        Immutable Record
                    </div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: 950, letterSpacing: "-0.03em", margin: 0 }}>Audit Vault</h2>
                    <p style={{ fontSize: "0.88rem", color: "var(--muted-foreground)", marginTop: 6 }}>
                        Every action taken on your behalf — timestamped, immutable, and ready for compliance review.
                    </p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                    <button
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", color: "var(--foreground)" }}
                    >
                        <Download size={15} /> Export CSV
                    </button>
                    <button
                        style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", color: "var(--foreground)" }}
                    >
                        <Download size={15} /> Export PDF
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
                {[
                    { label: "Total Events (Recorded)", value: total.toLocaleString() },
                    { label: "Today", value: initialLogs.length.toString() }, // Simplified representation for today
                    { label: "Failures", value: failures.toString(), accent: true },
                    { label: "Retention", value: "365 days" },
                ].map((s, i) => (
                    <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 28px" }}>
                        <div style={{ fontSize: "1.9rem", fontWeight: 950, letterSpacing: "-0.05em", color: s.accent ? "#ef4444" : "var(--foreground)", marginBottom: 4 }}>{s.value}</div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters + Table */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden" }}>
                {/* Toolbar */}
                <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                        <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                        <input
                            type="text"
                            placeholder="Search logs by action, ID, or context..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: "100%", paddingLeft: 36, paddingRight: 12, height: 38, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ position: "relative" }}>
                        <Filter size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            style={{ appearance: "none", paddingLeft: 32, paddingRight: 32, height: 38, background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 10, fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", cursor: "pointer", outline: "none" }}
                        >
                            {processTypes.map((p, idx) => <option key={idx}>{p}</option>)}
                        </select>
                        <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--muted-foreground)" }} />
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["Event ID", "Timestamp", "Process", "Context", "Action", "Outcome"].map(h => (
                                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--muted-foreground)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {visible.map((log, i) => (
                            <tr key={log.id} style={{ borderBottom: i < visible.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s" }}>
                                <td style={{ padding: "14px 20px", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted-foreground)", fontFamily: "monospace" }}>{log.id}</td>
                                <td style={{ padding: "14px 20px", fontSize: "0.82rem", fontWeight: 600, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>{log.ts}</td>
                                <td style={{ padding: "14px 20px" }}>
                                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent)", background: "rgba(52,209,134,0.08)", padding: "3px 10px", borderRadius: 100, whiteSpace: "nowrap" }}>{log.process}</span>
                                </td>
                                <td style={{ padding: "14px 20px", fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)" }}>{log.user}</td>
                                <td style={{ padding: "14px 20px", fontSize: "0.85rem", color: "var(--foreground)", maxWidth: 340 }}>{log.action}</td>
                                <td style={{ padding: "14px 20px" }}>
                                    <span style={{
                                        fontSize: "0.7rem", fontWeight: 900, padding: "3px 10px", borderRadius: 100,
                                        color: log.outcome === "Success" ? "var(--accent)" : "#ef4444",
                                        background: log.outcome === "Success" ? "rgba(52,209,134,0.08)" : "rgba(239,68,68,0.08)"
                                    }}>
                                        {log.outcome}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {visible.length === 0 && (
                    <div style={{ padding: 48, textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.9rem" }}>No database records match the current filter.</div>
                )}
            </div>
        </div>
    );
}
