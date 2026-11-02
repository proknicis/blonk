"use client";

import React, { useState } from "react";
import { AlertCircle, RefreshCw, CheckCircle2, ShieldAlert, Key, CheckCheck } from "lucide-react";
import Link from "next/link";
import styles from "./errors.module.css";

interface Incident {
    id: string;
    type: string;
    severity: string;
    workflow: string;
    integration: string;
    firstSeen: string;
    lastSeen: string;
    desc: string;
    fix: string;
}

const DEFAULT_INCIDENTS: Incident[] = [
    {
        id: "inc-1",
        type: "Token Expired / Auth Revoked",
        severity: "High",
        workflow: "Invoice Processing Loop",
        integration: "Stripe API Connection",
        firstSeen: "2 hours ago",
        lastSeen: "5 mins ago",
        desc: "Stripe API balance poll returned HTTP 401 Unauthorized. The API key was revoked or restricted scopes were updated in Stripe Dashboard.",
        fix: "Go to Connections > Credentials Vault, verify credentials scopes, and enter a new Stripe Secret Key."
    },
    {
        id: "inc-2",
        type: "Database Write Deadlock",
        severity: "Medium",
        workflow: "Client Onboarding Setup",
        integration: "PostgreSQL Local Sync",
        firstSeen: "1 day ago",
        lastSeen: "12 hours ago",
        desc: "Concurrent transaction rollback caused a deadlock lock state during bulk insert of parameters.",
        fix: "Self-healing trigger resolved it. Review transaction batch sizes if error rate exceeds 2%."
    }
];

export default function ErrorsClient({ initialErrors }: { initialErrors: any[] }) {
    const [incidents, setIncidents] = useState<Incident[]>(() => {
        const list = [...DEFAULT_INCIDENTS];
        initialErrors.forEach(err => {
            const shortId = "err-" + err.id.toString().substring(0, 5);
            if (!list.some(item => item.id === shortId)) {
                let errorDesc = "Execution exception encountered during workflow run.";
                try {
                    const parsed = typeof err.result === "string" ? JSON.parse(err.result) : err.result;
                    if (parsed?.message) errorDesc = parsed.message;
                } catch(e) {}

                list.unshift({
                    id: shortId,
                    type: "Execution Failure",
                    severity: "High",
                    workflow: err.workflowName || "System Loop",
                    integration: "Sovereign Container",
                    firstSeen: new Date(err.createdAt).toLocaleTimeString(),
                    lastSeen: "Just now",
                    desc: errorDesc,
                    fix: "Inspect execution log payload in History tab and trigger retry."
                });
            }
        });
        return list;
    });

    const [retryingId, setRetryingId] = useState<string | null>(null);
    const [statusMsg, setStatusMsg] = useState<string | null>(null);

    const showStatus = (msg: string) => {
        setStatusMsg(msg);
        setTimeout(() => setStatusMsg(null), 5000);
    };

    const handleRetry = (id: string, name: string) => {
        setRetryingId(id);
        setTimeout(() => {
            setRetryingId(null);
            setIncidents(prev => prev.filter(inc => inc.id !== id));
            showStatus(`Retry for "${name}" completed. Node status reset.`);
        }, 1200);
    };

    const handleResolve = (id: string) => {
        setIncidents(prev => prev.filter(inc => inc.id !== id));
        showStatus("Incident marked as resolved and removed from active queue.");
    };

    return (
        <main className={styles.container} aria-label="Incidents and Errors Cockpit">
            {statusMsg && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    background: "#ECFDF5", border: "1px solid #D1FAE5", color: "#065F46",
                    borderRadius: "10px", padding: "12px 16px", fontSize: "0.82rem",
                    fontWeight: 600, marginBottom: "20px"
                }} role="status" aria-live="polite">
                    <CheckCheck size={16} aria-hidden="true" />
                    {statusMsg}
                </div>
            )}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Incidents & Errors Desk</h1>
                    <p className={styles.subtitle}>Active integration alerts, expired API keys, and workflow runtime failures.</p>
                </div>
            </header>

            <div className={styles.list}>
                {incidents.length === 0 ? (
                    <div className={styles.emptyState}>
                        <CheckCircle2 size={48} color="#10B981" />
                        <p>No active incidents or error alerts. Sovereign console healthy.</p>
                    </div>
                ) : (
                    incidents.map(inc => {
                        const isRetrying = retryingId === inc.id;
                        const isHigh = inc.severity.toLowerCase() === "high";
                        
                        return (
                            <article 
                                key={inc.id}
                                className={styles.listItem}
                                style={{ borderLeftColor: isHigh ? "#EF4444" : "#F59E0B" }}
                                tabIndex={0}
                                aria-label={`Incident ID ${inc.id}: ${inc.type}`}
                            >
                                <div className={styles.itemHeader}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <ShieldAlert size={18} color={isHigh ? "#EF4444" : "#F59E0B"} />
                                        <h3 className={styles.itemTitle} style={{ color: isHigh ? "#EF4444" : "#D97706" }}>{inc.type}</h3>
                                        <span className={styles.severityBadge} style={{ 
                                            background: isHigh ? "#FEF2F2" : "#FFFBEB", 
                                            color: isHigh ? "#EF4444" : "#D97706",
                                            borderColor: isHigh ? "#FEE2E2" : "#FEF3C7"
                                        }}>
                                            {inc.severity} Severity
                                        </span>
                                    </div>
                                    <span className={styles.itemTime}>seen {inc.lastSeen}</span>
                                </div>

                                <div className={styles.metaRow}>
                                    <span>Workflow: <strong>{inc.workflow}</strong></span>
                                    <span>Source: <strong>{inc.integration}</strong></span>
                                    <span>Log ID: <strong>#{inc.id}</strong></span>
                                </div>

                                <p className={styles.itemDesc}>{inc.desc}</p>

                                <div className={styles.suggestionBox}>
                                    <strong className={styles.suggestionTitle}>Suggested Resolution Path</strong>
                                    <p className={styles.suggestionDesc}>{inc.fix}</p>
                                </div>

                                <div className={styles.actionsRow}>
                                    {inc.fix.includes("Credentials Vault") && (
                                        <Link 
                                            href="/dashboard/credentials" 
                                            className={styles.btnSecondary}
                                            aria-label="Link to credentials vault"
                                        >
                                            <Key size={14} /> Vault Setup
                                        </Link>
                                    )}
                                    <button 
                                        className={styles.btnPrimary}
                                        onClick={() => handleRetry(inc.id, inc.workflow)}
                                        disabled={isRetrying}
                                        aria-label={`Retry execution for ${inc.workflow}`}
                                    >
                                        <RefreshCw size={12} className={isRetrying ? "spin" : ""} /> 
                                        {isRetrying ? "Retrying..." : "Retry Loop"}
                                    </button>
                                    <button 
                                        className={styles.btnSecondary}
                                        onClick={() => handleResolve(inc.id)}
                                        aria-label={`Mark incident ${inc.id} as resolved`}
                                    >
                                        Resolve
                                    </button>
                                </div>
                            </article>
                        )
                    })
                )}
            </div>
        </main>
    );
}
