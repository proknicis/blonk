"use client";

import React, { useState } from "react";
import { Play, Square, RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";

type RunStatus = "idle" | "running" | "success" | "error";

interface LogLine {
    ts: string;
    msg: string;
    type: "info" | "success" | "error";
}

const sampleWorkflows = [
    { id: "wf-001", name: "Client Onboarding Flow", description: "Intake form → CRM → Folder → Contract draft" },
    { id: "wf-002", name: "Invoice Reminder Loop", description: "Billing system → Overdue check → Email reminder" },
    { id: "wf-003", name: "Payroll Reconciliation", description: "Accounting → Payroll → Bank → Match & flag" },
    { id: "wf-004", name: "NDA Auto-Generator", description: "Client data → Template fill → Document output" },
];

const simulatedLogs: LogLine[] = [
    { ts: "00:00.0", msg: "Initializing sandbox environment...", type: "info" },
    { ts: "00:00.3", msg: "Loaded test dataset: 3 mock client records", type: "info" },
    { ts: "00:01.1", msg: "Step 1/4 — Pulling intake form data", type: "info" },
    { ts: "00:01.4", msg: "Step 1/4 — Complete ✓", type: "success" },
    { ts: "00:02.0", msg: "Step 2/4 — Pushing to CRM (sandbox mode)", type: "info" },
    { ts: "00:02.6", msg: "Step 2/4 — Complete ✓", type: "success" },
    { ts: "00:03.1", msg: "Step 3/4 — Creating document folder", type: "info" },
    { ts: "00:03.5", msg: "Step 3/4 — Complete ✓", type: "success" },
    { ts: "00:04.0", msg: "Step 4/4 — Generating contract draft", type: "info" },
    { ts: "00:04.8", msg: "Step 4/4 — Complete ✓", type: "success" },
    { ts: "00:05.0", msg: "Run complete. 0 errors. Safe to promote to production.", type: "success" },
];

export default function TheLabPage() {
    const [selected, setSelected] = useState(sampleWorkflows[0].id);
    const [status, setStatus] = useState<RunStatus>("idle");
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [currentLog, setCurrentLog] = useState(0);

    const selectedWf = sampleWorkflows.find(w => w.id === selected)!;

    const handleRun = () => {
        setStatus("running");
        setLogs([]);
        setCurrentLog(0);

        simulatedLogs.forEach((line, i) => {
            setTimeout(() => {
                setLogs(prev => [...prev, line]);
                setCurrentLog(i + 1);
                if (i === simulatedLogs.length - 1) {
                    setStatus("success");
                }
            }, i * 500);
        });
    };

    const handleStop = () => {
        setStatus("idle");
        setLogs([]);
        setCurrentLog(0);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Header */}
            <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--accent)", marginBottom: 6 }}>Sandbox Environment</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 950, letterSpacing: "-0.03em", margin: 0 }}>The Lab</h2>
                <p style={{ fontSize: "0.88rem", color: "var(--muted-foreground)", marginTop: 6 }}>
                    Test any process against mock data before it touches a live client record. Nothing here affects production.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
                {/* Left: Workflow selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.16em", color: "var(--muted-foreground)", marginBottom: 4 }}>
                        Select process to test
                    </div>
                    {sampleWorkflows.map(wf => (
                        <button
                            key={wf.id}
                            onClick={() => { setSelected(wf.id); setStatus("idle"); setLogs([]); }}
                            style={{
                                background: selected === wf.id ? "var(--foreground)" : "var(--card)",
                                color: selected === wf.id ? "var(--background)" : "var(--foreground)",
                                border: `1px solid ${selected === wf.id ? "var(--foreground)" : "var(--border)"}`,
                                borderRadius: 16,
                                padding: "16px 20px",
                                textAlign: "left",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                        >
                            <div style={{ fontWeight: 800, fontSize: "0.9rem", marginBottom: 4 }}>{wf.name}</div>
                            <div style={{ fontSize: "0.78rem", opacity: 0.6, lineHeight: 1.5 }}>{wf.description}</div>
                        </button>
                    ))}

                    <div style={{ marginTop: 8, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "16px 20px" }}>
                        <div style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--muted-foreground)", marginBottom: 12 }}>Test Dataset</div>
                        <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground)", marginBottom: 4 }}>3 mock client records</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>No real client data is used in sandbox mode.</div>
                    </div>
                </div>

                {/* Right: Console */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    {/* Console header */}
                    <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            {status === "idle" && <Clock size={16} style={{ color: "var(--muted-foreground)" }} />}
                            {status === "running" && <RefreshCw size={16} style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />}
                            {status === "success" && <CheckCircle size={16} style={{ color: "var(--accent)" }} />}
                            {status === "error" && <AlertTriangle size={16} style={{ color: "#ef4444" }} />}
                            <span style={{ fontWeight: 800, fontSize: "0.85rem" }}>
                                {status === "idle" ? "Ready" : status === "running" ? `Running ${selectedWf.name}...` : status === "success" ? "Run complete — 0 errors" : "Run failed"}
                            </span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {status !== "running" ? (
                                <button
                                    onClick={handleRun}
                                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "var(--accent)", color: "#111", border: "none", borderRadius: 10, fontWeight: 900, fontSize: "0.82rem", cursor: "pointer" }}
                                >
                                    <Play size={13} fill="#111" /> Run Test
                                </button>
                            ) : (
                                <button
                                    onClick={handleStop}
                                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", background: "#ef4444", color: "#fff", border: "none", borderRadius: 10, fontWeight: 900, fontSize: "0.82rem", cursor: "pointer" }}
                                >
                                    <Square size={13} fill="#fff" /> Stop
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Console output */}
                    <div style={{ background: "#0d0d0d", fontFamily: "monospace", padding: "20px 24px", minHeight: 360, display: "flex", flexDirection: "column", gap: 6, overflowY: "auto" }}>
                        {logs.length === 0 && (
                            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.82rem" }}>Awaiting test run...</div>
                        )}
                        {logs.map((line, i) => (
                            <div key={i} style={{ display: "flex", gap: 14, fontSize: "0.8rem" }}>
                                <span style={{ color: "rgba(255,255,255,0.25)", minWidth: 56 }}>{line.ts}</span>
                                <span style={{
                                    color: line.type === "success" ? "#34D186" : line.type === "error" ? "#ef4444" : "rgba(255,255,255,0.7)"
                                }}>
                                    {line.msg}
                                </span>
                            </div>
                        ))}
                        {status === "success" && (
                            <div style={{ marginTop: 12, padding: "12px 16px", background: "rgba(52,209,134,0.08)", border: "1px solid rgba(52,209,134,0.15)", borderRadius: 10, fontSize: "0.82rem", color: "#34D186", fontWeight: 700 }}>
                                ✓ Safe to promote to Mission Control (production)
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
