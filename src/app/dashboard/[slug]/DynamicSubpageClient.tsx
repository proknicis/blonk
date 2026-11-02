"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
    Activity, Bell, Sparkles, FileText, Clock, Database, Globe, 
    CheckSquare, AlertTriangle, Terminal, ListChecks, CreditCard,
    Search, Filter, Check, Play, Pause, RefreshCw, ChevronRight, 
    ArrowUpRight, AlertCircle, Copy, CheckCircle2, Shield, Info, 
    Settings, Users, Trash2, X, Plus, Key, Eye, HelpCircle, HardDrive
} from "lucide-react";
import styles from "./subpages.module.css";

interface DynamicSubpageClientProps {
    slug: string;
}

export default function DynamicSubpageClient({ slug }: DynamicSubpageClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [actionFilter, setActionFilter] = useState("all");
    const [registryForm, setRegistryForm] = useState({
        name: "",
        category: "Operations",
        tools: "",
        urgency: "medium",
        description: ""
    });
    const [submittingRegistry, setSubmittingRegistry] = useState(false);

    // Dynamic states for interactive features
    const [includePhase2Rec, setIncludePhase2Rec] = useState<Record<string, boolean>>({});
    const [connectionsState, setConnectionsState] = useState<Record<string, string>>({
        openai: "Connected",
        slack: "Connected",
        stripe: "Error",
        gmail: "Unconfigured"
    });
    
    // Copy helper
    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter items helper
    const matchesSearch = (text: string) => {
        return !searchQuery || text.toLowerCase().includes(searchQuery.toLowerCase());
    };

    // 1. Workspace Activity Feed Data
    const activityItems = [
        { id: "act-1", time: "10 mins ago", event: "Workflow run completed", target: "Client Onboarding Setup", type: "execution", status: "success", user: "Sophia Co-Pilot" },
        { id: "act-2", time: "45 mins ago", event: "Credential rotated", target: "OpenAI Connector", type: "security", status: "success", user: "Admin (You)" },
        { id: "act-3", time: "2 hours ago", event: "Workflow run failed", target: "Invoice processing & Reconciliation", type: "execution", status: "failed", user: "Marcus Co-Pilot" },
        { id: "act-4", time: "5 hours ago", event: "New team member invited", target: "colleague@firm.com", type: "team", status: "success", user: "Owner (You)" },
        { id: "act-5", time: "1 day ago", event: "Deployment target changed", target: "Docker Cluster Host A", type: "deployment", status: "success", user: "Admin (You)" },
        { id: "act-6", time: "2 days ago", event: "Workspace settings updated", target: "Sterling Legal Partners", type: "settings", status: "success", user: "Owner (You)" },
        { id: "act-7", time: "3 days ago", event: "Onboarding calibration complete", target: "VPS Node Setup", type: "deployment", status: "success", user: "Owner (You)" }
    ];

    // 2. System Notifications Data
    const [notifications, setNotifications] = useState([
        { id: "not-1", time: "Just now", title: "OpenAI API Validation Failed", desc: "Your OpenAI key expired or was revoked. Deployed templates are currently running in dry-run mode.", severity: "high", read: false },
        { id: "not-2", time: "2 hours ago", title: "New Workflow Recommendation", desc: "A new candidate screening automation is available based on your HR bottlenecks.", severity: "medium", read: false },
        { id: "not-3", time: "1 day ago", title: "Database Sync Complete", desc: "PostgreSQL schema successfully compiled and synced with local docker nodes.", severity: "low", read: true },
        { id: "not-4", time: "3 days ago", title: "Slack Bot Token Verified", desc: "Sovereign handshake with slack.com Slack Bot successfully completed.", severity: "low", read: true }
    ]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotif = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // 3. Recommended Workflows Page Data
    const recommendedFlows = [
        { id: "rec-1", name: "Sovereign Client Onboarding Setup", dept: "Operations", fit: 98, impact: "Saves 15h/mo", complexity: "Medium", tools: ["Slack", "Google Drive", "Gmail"], reason: "Triggered by your manual onboarding bottlenecks and Slack workspace preferences.", deployed: false },
        { id: "rec-2", name: "CV Processing & Interview Scheduler", dept: "Recruiting", fit: 95, impact: "Saves 24h/mo", complexity: "High", tools: ["Gmail", "OpenAI", "Google Calendar"], reason: "Recommended to automate resume classification and interviewer calendar matching.", deployed: false },
        { id: "rec-3", name: "Weekly Industry Digest Assembler", dept: "Marketing", fit: 77, impact: "Saves 16h/mo", complexity: "Medium", tools: ["Gmail", "OpenAI", "Google Sheets"], reason: "Suggested based on marketing communications stack and research activities.", deployed: false }
    ];

    // 4. Drafts & Deployment Queue Data
    const [drafts, setDrafts] = useState([
        { id: "dr-1", name: "Invoice Processing & Reconciliation", stage: "Awaiting Credentials", missing: ["Stripe Key"], changedBy: "Marcus Co-Pilot", time: "2 hours ago", target: "VPS Cluster A" },
        { id: "dr-2", name: "Customer Support Triaging Loop", stage: "Awaiting Approval", missing: [], changedBy: "Sophia Co-Pilot", time: "5 mins ago", target: "Local Docker Host" }
    ]);

    const deployDraft = (id: string) => {
        setDrafts(prev => prev.filter(d => d.id !== id));
        alert("Workflow successfully deployed to local Docker container!");
    };

    // 5. Execution History Data
    const historyLogs = [
        { runId: "run-e921a", workflow: "Client Onboarding Setup", time: "10 mins ago", duration: "1.2s", status: "Success", trigger: "Webhook" },
        { runId: "run-a481c", workflow: "Invoice Processing Loop", time: "2 hours ago", duration: "3.4s", status: "Failed", trigger: "Gmail Poll" },
        { runId: "run-b203f", workflow: "Slack Triage Bot", time: "4 hours ago", duration: "0.8s", status: "Success", trigger: "Slack Event" },
        { runId: "run-f9202", workflow: "Client Onboarding Setup", time: "1 day ago", duration: "1.4s", status: "Success", trigger: "Webhook" },
        { runId: "run-c1042", workflow: "Weekly Digest Compiler", time: "2 days ago", duration: "8.9s", status: "Success", trigger: "Schedule" }
    ];

    // 6. Data Sources Page Data
    const dataSources = [
        { id: "ds-1", name: "Client Intake Mailbox", type: "Gmail Inbox", status: "Connected", volume: "1,240 emails read", sync: "Active Sync", lastPull: "5 mins ago" },
        { id: "ds-2", name: "Operational Spreadsheet Ledger", type: "Google Sheets", status: "Connected", volume: "420 records written", sync: "Active Sync", lastPull: "10 mins ago" },
        { id: "ds-3", name: "Company Invoices Directory", type: "Google Drive Folder", status: "Connected", volume: "98 files parsed", sync: "Active Sync", lastPull: "2 hours ago" },
        { id: "ds-4", name: "Private Client Database", type: "PostgreSQL DB", status: "Disconnected", volume: "0 records synced", sync: "Sync Failed", lastPull: "1 day ago" }
    ];

    // 7. Webhooks & APIs Data
    const webhooks = [
        { id: "wh-1", name: "Client Intake webhook Trigger", url: "https://n8n.blonk.sovereign/webhook/v1/client-intake", workflow: "Client Onboarding Setup", rate: "24 req/day", status: "Active" },
        { id: "wh-2", name: "Stripe Invoice Webhook Receiver", url: "https://n8n.blonk.sovereign/webhook/v1/stripe-invoice", workflow: "Invoice Processing Loop", rate: "8 req/day", status: "Active" },
        { id: "wh-3", name: "Slack Interactive Action Endpoint", url: "https://n8n.blonk.sovereign/webhook/v1/slack-actions", workflow: "Slack Triage Bot", rate: "125 req/day", status: "Active" }
    ];

    // 8. Deployment Readiness Checklist Data
    const readinessChecklist = [
        { category: "Infrastructure", name: "Docker worker container online status", status: "Ready", blocker: false },
        { category: "Databases", name: "PostgreSQL schema validation test", status: "Ready", blocker: false },
        { category: "Credentials", name: "OpenAI API credential handshake", status: "Ready", blocker: false },
        { category: "Credentials", name: "Slack workspace auth sync", status: "Ready", blocker: false },
        { category: "Credentials", name: "Stripe API credential handshake", status: "Needs Action", blocker: true, reason: "Credentials vault reports validation error." },
        { category: "Data Sources", name: "Google Sheets document mapping access", status: "Blocked", blocker: true, reason: "Google Workspace access token unconfigured." }
    ];

    // 9. Incidents & Errors Data
    const incidents = [
        { id: "inc-1", type: "Token Expired", severity: "High", workflow: "Invoice Processing Loop", integration: "Stripe API Connection", first: "2 hours ago", last: "5 mins ago", desc: "API key was revoked or restricted scopes were updated on Stripe. The pipeline cannot sweep invoices.", fix: "Go to Connections > Credentials Vault and re-enter your Stripe Secret Key." },
        { id: "inc-2", type: "Database Write Lock", severity: "Medium", workflow: "Client Onboarding Setup", integration: "PostgreSQL Local Sync", first: "1 day ago", last: "12 hours ago", desc: "Concurrent transactions caused a transient deadlock while writing new workspace parameters.", fix: "Self-healing trigger resolved it. Review database config settings if recurrence exceeds 5%." }
    ];

    // 10. Diagnostics Logs Event Stream Data
    const diagnosticLogs = [
        { time: "01:46:12", level: "INFO", source: "Docker-Host", msg: "Allocating cluster container node worker-03..." },
        { time: "01:46:14", level: "INFO", source: "n8n-Bridge", msg: "Establishing webhook listener route '/v1/client-intake'." },
        { time: "01:46:16", level: "WARN", source: "Credentials", msg: "Stripe token balance check failed with HTTP 401. Retrying..." },
        { time: "01:46:17", level: "ERROR", source: "Credentials", msg: "Sync failure to n8n server: Stripe Secret Key is invalid." },
        { time: "01:46:20", level: "INFO", source: "Database", msg: "PostgreSQL transaction logs rotated successfully. 12KB cleared." }
    ];

    // 11. Approvals & Review Queue Data
    const [approvals, setApprovals] = useState([
        { id: "app-1", workflow: "Client Onboarding Setup", item: "Slack Channel Welcome Draft", detail: "Approve custom workspace channel introduction copy drafted by Sophia Co-Pilot for client Sterling Partners.", time: "10 mins ago" },
        { id: "app-2", workflow: "Invoice Processing Loop", item: "Billing total variance validation", detail: "PDF scanned total ($4,200.00) differs from Stripe database PO amount ($4,120.00). Resolve discrepancy.", time: "1 hour ago" }
    ]);

    const handleApprove = (id: string, action: string) => {
        setApprovals(prev => prev.filter(a => a.id !== id));
        alert(`Request successfully ${action === 'approve' ? 'Approved' : 'Rejected'}.`);
    };

    const handleRegistrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingRegistry(true);
        try {
            const res = await fetch("/api/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: `Custom Workflow Request: ${registryForm.name}`,
                    message: `Custom request details:\nCategory: ${registryForm.category}\nTools: ${registryForm.tools}\nUrgency: ${registryForm.urgency}\nDescription: ${registryForm.description}`,
                    isCustomWorkflowRequest: true,
                    customForm: registryForm
                })
            });
            if (res.ok) {
                alert("Custom workflow request enqueued successfully!");
                setRegistryForm({
                    name: "",
                    category: "Operations",
                    tools: "",
                    urgency: "medium",
                    description: ""
                });
            } else {
                alert("Failed to submit request.");
            }
        } catch (err) {
            alert("Error submitting request.");
        } finally {
            setSubmittingRegistry(false);
        }
    };

    // 12. Billing Details
    const invoices = [
        { date: "June 01, 2026", id: "INV-9280", amount: "$499.00", status: "Paid" },
        { date: "May 01, 2026", id: "INV-8120", amount: "$499.00", status: "Paid" },
        { date: "April 01, 2026", id: "INV-7023", amount: "$499.00", status: "Paid" }
    ];

    const auditLogs = [
        { id: "aud-1", timestamp: "2026-06-27 01:45:10", actor: "Marcus Co-Pilot", action: "WORKFLOW_DEPLOYED", target: "Client Onboarding Setup", ipAddress: "192.168.1.45", details: "Deployed version v2.1.0 to node worker-03" },
        { id: "aud-2", timestamp: "2026-06-27 00:30:15", actor: "Admin (You)", action: "CREDENTIAL_UPDATED", target: "OpenAI API Connector", ipAddress: "84.22.191.4", details: "Rotated API key credentials; old key revoked" },
        { id: "aud-3", timestamp: "2026-06-26 22:15:40", actor: "Marcus Co-Pilot", action: "WORKFLOW_PAUSED", target: "Invoice processing & Reconciliation", ipAddress: "192.168.1.45", details: "Paused loop execution due to connection timeouts on Stripe" },
        { id: "aud-4", timestamp: "2026-06-26 18:00:22", actor: "Owner (You)", action: "USER_INVITED", target: "colleague@firm.com", ipAddress: "84.22.191.4", details: "Sent invitation link with role: VIEWER" },
        { id: "aud-5", timestamp: "2026-06-25 14:32:01", actor: "Admin (You)", action: "ACCESS_MODIFIED", target: "colleague@firm.com", ipAddress: "84.22.191.4", details: "Upgraded operator permission level to EDITOR" },
        { id: "aud-6", timestamp: "2026-06-25 11:20:10", actor: "Admin (You)", action: "DEPLOYMENT_TARGET_CHANGED", target: "Docker Cluster Host A", ipAddress: "84.22.191.4", details: "Changed default deployment host target from local-host to cluster-A" },
        { id: "aud-7", timestamp: "2026-06-24 09:15:30", actor: "Owner (You)", action: "CONNECTOR_REMOVED", target: "Slack Bot Token", ipAddress: "84.22.191.4", details: "Removed inactive Slack integration credential profiles" },
        { id: "aud-8", timestamp: "2026-06-24 09:05:00", actor: "Owner (You)", action: "WORKFLOW_CREATED", target: "Client Onboarding Setup", ipAddress: "84.22.191.4", details: "Created workflow draft based on Operations blueprint" }
    ];

    const filteredAudits = useMemo(() => {
        return auditLogs.filter(log => {
            const matchesSearch = !searchQuery || [log.actor, log.action, log.target, log.details].some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesAction = actionFilter === "all" || log.action === actionFilter;
            return matchesSearch && matchesAction;
        });
    }, [searchQuery, actionFilter]);

    return (
        <div className={styles.container}>
            
            {/* 1. ACTIVITY PAGE */}
            {slug === "activity" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>WORKSPACE ACTIVITY STREAM</h2>
                        <p className={styles.secSubtitle}>Real-time ledger of administrative events, credential updates, and automated executions.</p>
                    </div>

                    <div className={styles.filterStrip}>
                        <div className={styles.searchBar}>
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Filter activity feed..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.timelineList}>
                        {activityItems.filter(item => matchesSearch(item.event) || matchesSearch(item.target)).map(item => (
                            <div key={item.id} className={styles.timelineRow}>
                                <div className={styles.timelineMarker}>
                                    <div className={`${styles.timelineBadge} ${
                                        item.status === 'success' ? styles.badgeSuccess : styles.badgeFailed
                                    }`}>
                                        {item.status === 'success' ? <Check size={12} strokeWidth={3} /> : <AlertCircle size={12} />}
                                    </div>
                                    <div className={styles.timelineLine} />
                                </div>
                                <div className={styles.timelineContent}>
                                    <div className={styles.timelineHeader}>
                                        <span className={styles.timelineEvent}>{item.event}</span>
                                        <span className={styles.timelineTime}>{item.time}</span>
                                    </div>
                                    <div className={styles.timelineMeta}>
                                        <span>Target: <strong>{item.target}</strong></span>
                                        <span className={styles.metaDivider}>•</span>
                                        <span>Actor: <strong>{item.user}</strong></span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. NOTIFICATIONS PAGE */}
            {slug === "notifications" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>SYSTEM NOTIFICATIONS</h2>
                        <p className={styles.secSubtitle}>Active warnings, validation failures, and workflow deployment milestones.</p>
                    </div>

                    <div className={styles.actionsHeader}>
                        <button className={styles.btnSecondary} onClick={markAllRead}>
                            <CheckCircle2 size={14} /> Mark all read
                        </button>
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Bell size={32} />
                                <p>No system alerts at this time.</p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div 
                                    key={notif.id} 
                                    className={`${styles.listItem} ${!notif.read ? styles.listUnread : ""} ${
                                        notif.severity === 'high' ? styles.listBorderRed : 
                                        notif.severity === 'medium' ? styles.listBorderOrange : styles.listBorderGray
                                    }`}
                                >
                                    <div style={{ flexGrow: 1 }}>
                                        <div className={styles.itemTitleGroup}>
                                            <h3 className={styles.itemTitle}>{notif.title}</h3>
                                            <span className={styles.itemTime}>{notif.time}</span>
                                        </div>
                                        <p className={styles.itemText}>{notif.desc}</p>
                                    </div>
                                    <button className={styles.closeBtn} onClick={() => clearNotif(notif.id)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 3. RECOMMENDED WORKFLOWS PAGE */}
            {slug === "recommendations" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>AI RECOMMENDED WORKFLOWS</h2>
                        <p className={styles.secSubtitle}>Ranked workflow blueprints generated dynamically to target manual bottlenecks in your setup profile.</p>
                    </div>

                    <div className={styles.grid3Col}>
                        {recommendedFlows.map(rec => (
                            <div key={rec.id} className={styles.compareCard}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.fitBadge}>
                                        <Sparkles size={10} /> {rec.fit}% Fit Score
                                    </div>
                                    <span className={styles.cardCategory}>{rec.dept}</span>
                                </div>

                                <h3 className={styles.compareTitle}>{rec.name}</h3>
                                <p className={styles.compareDesc}>{rec.reason}</p>

                                <div className={styles.metricGroup}>
                                    <div className={styles.metricRow}>
                                        <span>Impact</span>
                                        <strong>{rec.impact}</strong>
                                    </div>
                                    <div className={styles.metricRow}>
                                        <span>Complexity</span>
                                        <span className={`${styles.complexityBadge} ${
                                            rec.complexity === 'Low' ? styles.complexLow : 
                                            rec.complexity === 'Medium' ? styles.complexMedium : styles.complexHigh
                                        }`}>{rec.complexity}</span>
                                    </div>
                                </div>

                                <div className={styles.toolList}>
                                    <span className={styles.toolLabel}>Required connections</span>
                                    <div className={styles.toolBadges}>
                                        {rec.tools.map(t => (
                                            <span key={t} className={styles.toolBadge}>{t}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.actionRow} style={{ marginTop: "auto", paddingTop: "16px" }}>
                                    <button 
                                        className={styles.btnPrimary}
                                        onClick={() => alert(`Enqueued "${rec.name}" for deployment.`)}
                                    >
                                        Deploy to Queue
                                    </button>
                                    <button className={styles.btnSecondary} onClick={() => alert("Marked as Interested.")}>
                                        Save
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 4. DRAFTS & DEPLOYMENT QUEUE PAGE */}
            {slug === "drafts" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>DRAFTS & DEPLOYMENT QUEUE</h2>
                        <p className={styles.secSubtitle}>Configure parameters and resolve missing connections to launch queued workflow loops.</p>
                    </div>

                    <div className={styles.tableCard}>
                        <table className={styles.ledgerTable}>
                            <thead>
                                <tr>
                                    <th>Workflow Name</th>
                                    <th>Queue Stage</th>
                                    <th>Missing connections</th>
                                    <th>Deployment Target</th>
                                    <th>Changed By</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {drafts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>No drafts in queue.</td>
                                    </tr>
                                ) : (
                                    drafts.map(draft => (
                                        <tr key={draft.id}>
                                            <td>
                                                <div style={{ fontWeight: 800, color: "#020617" }}>{draft.name}</div>
                                                <div style={{ fontSize: "0.7rem", color: "#64748B" }}>Updated {draft.time}</div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusLabel} ${
                                                    draft.stage === 'Awaiting Credentials' ? styles.statusWarning : styles.statusSuccess
                                                }`}>
                                                    {draft.stage}
                                                </span>
                                            </td>
                                            <td>
                                                {draft.missing.length === 0 ? (
                                                    <span style={{ color: "#10B981", fontWeight: 700 }}>None</span>
                                                ) : (
                                                    <span style={{ color: "#EF4444", fontWeight: 700 }}>
                                                        {draft.missing.join(", ")}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ fontWeight: 700, color: "#475569" }}>{draft.target}</td>
                                            <td style={{ fontSize: "0.8rem", color: "#64748B" }}>{draft.changedBy}</td>
                                            <td style={{ textAlign: "right" }}>
                                                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                                    {draft.missing.length > 0 ? (
                                                        <Link href="/dashboard/credentials" className={styles.btnSecondary} style={{ fontSize: "0.75rem", height: "32px", display: "inline-flex", alignItems: "center" }}>
                                                            Resolve Keys
                                                        </Link>
                                                    ) : (
                                                        <button 
                                                            className={styles.btnPrimary} 
                                                            style={{ fontSize: "0.75rem", height: "32px" }}
                                                            onClick={() => deployDraft(draft.id)}
                                                        >
                                                            Deploy Loop
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 5. EXECUTION HISTORY PAGE */}
            {slug === "history" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>EXECUTION HISTORY</h2>
                        <p className={styles.secSubtitle}>Comprehensive tracking ledger of active sovereign workflow run statuses and latency metrics.</p>
                    </div>

                    <div className={styles.tableCard}>
                        <table className={styles.ledgerTable}>
                            <thead>
                                <tr>
                                    <th>Execution ID</th>
                                    <th>Active Workflow</th>
                                    <th>Execution Time</th>
                                    <th>Trigger Type</th>
                                    <th>Run Duration</th>
                                    <th style={{ textAlign: "right" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyLogs.map(log => (
                                    <tr key={log.runId}>
                                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#475569" }}>{log.runId}</td>
                                        <td style={{ fontWeight: 800, color: "#020617" }}>{log.workflow}</td>
                                        <td style={{ fontSize: "0.8rem", color: "#64748B" }}>{log.time}</td>
                                        <td style={{ fontWeight: 700, color: "#334155" }}>{log.trigger}</td>
                                        <td style={{ fontSize: "0.8rem", color: "#64748B" }}>{log.duration}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className={`${styles.statusLabel} ${
                                                log.status === 'Success' ? styles.statusSuccess : styles.statusFailed
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 6. DATA SOURCES PAGE */}
            {slug === "datasources" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>OPERATIONAL DATA SOURCES</h2>
                        <p className={styles.secSubtitle}>Active business intake triggers, database syncs, and file upload structures connected to your workflow loop.</p>
                    </div>

                    <div className={styles.tableCard}>
                        <table className={styles.ledgerTable}>
                            <thead>
                                <tr>
                                    <th>Data Source</th>
                                    <th>Source Type</th>
                                    <th>Operational Volume</th>
                                    <th>Sync Status</th>
                                    <th>Last Sweep</th>
                                    <th style={{ textAlign: "right" }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataSources.map(ds => (
                                    <tr key={ds.id}>
                                        <td>
                                            <div style={{ fontWeight: 800, color: "#020617" }}>{ds.name}</div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: "#475569" }}>{ds.type}</td>
                                        <td style={{ fontSize: "0.8rem", color: "#64748B" }}>{ds.volume}</td>
                                        <td>
                                            <span className={`${styles.statusLabel} ${
                                                ds.status === 'Connected' ? styles.statusSuccess : styles.statusFailed
                                            }`}>
                                                {ds.sync}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: "0.8rem", color: "#64748B" }}>{ds.lastPull}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <button 
                                                className={styles.btnSecondary} 
                                                style={{ fontSize: "0.75rem", height: "32px" }}
                                                onClick={() => alert(`Re-indexing data source: ${ds.name}`)}
                                            >
                                                Force Pull
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 7. WEBHOOKS & APIS PAGE */}
            {slug === "webhooks" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>WEBHOOKS & APIS</h2>
                        <p className={styles.secSubtitle}>Expose secure endpoint listener routes to integrate external webhook logs with local Docker queues.</p>
                    </div>

                    <div className={styles.tableCard}>
                        <table className={styles.ledgerTable}>
                            <thead>
                                <tr>
                                    <th>Endpoint Name</th>
                                    <th>Webhook URL</th>
                                    <th>Linked workflow</th>
                                    <th>Call volume</th>
                                    <th style={{ textAlign: "right" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {webhooks.map(wh => (
                                    <tr key={wh.id}>
                                        <td style={{ fontWeight: 800, color: "#020617" }}>{wh.name}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <code style={{ fontSize: "0.75rem", background: "#F1F5F9", padding: "4px 8px", borderRadius: "6px", color: "#475569", fontFamily: "monospace" }}>
                                                    {wh.url.slice(0, 45)}...
                                                </code>
                                                <button 
                                                    className={styles.copyBtn}
                                                    onClick={() => handleCopy(wh.url, wh.id)}
                                                >
                                                    {copiedId === wh.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: "#475569" }}>{wh.workflow}</td>
                                        <td style={{ fontSize: "0.8rem", color: "#64748B" }}>{wh.rate}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className={`${styles.statusLabel} ${styles.statusSuccess}`}>
                                                {wh.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 8. DEPLOYMENT READINESS PAGE */}
            {slug === "readiness" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>DEPLOYMENT READINESS REPORT</h2>
                        <p className={styles.secSubtitle}>Pre-flight checklist to verify server containers, database handshakes, and credential verification.</p>
                    </div>

                    <div className={styles.dualColumn}>
                        {/* Left column - Checklist */}
                        <div className={styles.leftColCard}>
                            <h3 className={styles.cardTitle} style={{ marginBottom: "20px" }}>System Integrity Checks</h3>
                            <div className={styles.checklist}>
                                {readinessChecklist.map((item, idx) => (
                                    <div key={idx} className={styles.checkRow}>
                                        <div className={styles.checkHeader}>
                                            {item.status === 'Ready' ? (
                                                <CheckCircle2 size={16} color="#10B981" />
                                            ) : item.status === 'Needs Action' ? (
                                                <AlertTriangle size={16} color="#F59E0B" />
                                            ) : (
                                                <AlertCircle size={16} color="#EF4444" />
                                            )}
                                            <div style={{ flexGrow: 1 }}>
                                                <div style={{ fontWeight: 800, color: "#020617", fontSize: "0.9rem" }}>{item.name}</div>
                                                <span style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94A3B8" }}>{item.category}</span>
                                            </div>
                                        </div>
                                        {item.blocker && (
                                            <div className={styles.checkReason}>
                                                <strong>Blocker Warning:</strong> {item.reason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right column - Audit & Trigger */}
                        <div className={styles.rightColCard}>
                            <h3 className={styles.cardTitle} style={{ marginBottom: "16px" }}>Go-Live Checkpoint</h3>
                            <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.45, marginBottom: "20px" }}>
                                Core system container nodes are ready to deploy. Resolving Stripe or Google token dependencies will transition loops into fully operational production states.
                            </p>

                            <div className={styles.auditMiniBox}>
                                <div style={{ fontSize: "0.75rem", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                    <span style={{ color: "#64748B", fontWeight: 700 }}>Host Instance Status</span>
                                    <strong style={{ color: "#10B981" }}>ONLINE</strong>
                                </div>
                                <div style={{ fontSize: "0.75rem", display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "#64748B", fontWeight: 700 }}>Pending approvals</span>
                                    <strong style={{ color: "#EF4444" }}>2 Items</strong>
                                </div>
                            </div>

                            <button 
                                className={styles.btnPrimary} 
                                style={{ width: "100%", height: "48px" }}
                                onClick={() => alert("Synchronizing active Docker containers...")}
                            >
                                Trigger Sovereign Sync
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 9. INCIDENTS & ERRORS PAGE */}
            {slug === "errors" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>INCIDENTS & ERRORS</h2>
                        <p className={styles.secSubtitle}>Active integration alerts, expired API keys, and workflow runtime failures.</p>
                    </div>

                    <div className={styles.list}>
                        {incidents.map(inc => (
                            <div key={inc.id} className={`${styles.listItem} ${styles.listBorderRed}`}>
                                <div style={{ flexGrow: 1 }}>
                                    <div className={styles.itemTitleGroup}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <h3 className={styles.itemTitle} style={{ color: "#EF4444" }}>{inc.type}</h3>
                                            <span className={styles.severityBadge}>{inc.severity} Severity</span>
                                        </div>
                                        <span className={styles.itemTime}>seen {inc.last}</span>
                                    </div>
                                    <div style={{ display: "flex", gap: "16px", fontSize: "0.75rem", color: "#64748B", margin: "6px 0", fontWeight: 700 }}>
                                        <span>Workflow: <strong>{inc.workflow}</strong></span>
                                        <span>Source: <strong>{inc.integration}</strong></span>
                                    </div>
                                    <p className={styles.itemText} style={{ margin: "8px 0" }}>{inc.desc}</p>
                                    
                                    <div className={styles.suggestionBox}>
                                        <strong>Suggested Resolution Path</strong>
                                        <p>{inc.fix}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 10. LOGS & DIAGNOSTICS PAGE */}
            {slug === "logs" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>LOGS & DIAGNOSTICS</h2>
                        <p className={styles.secSubtitle}>Developer event stream monitoring backend Docker transactions and API sync handshakes.</p>
                    </div>

                    <div className={styles.filterStrip}>
                        <div className={styles.searchBar}>
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Search system logs..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.logConsole}>
                        <div className={styles.consoleHeader}>
                            <span>LIVE EVENT LEDGER</span>
                            <span>host-node-worker-01</span>
                        </div>
                        <div className={styles.consoleBody}>
                            {diagnosticLogs.filter(log => matchesSearch(log.msg) || matchesSearch(log.source)).map((log, idx) => (
                                <div key={idx} className={styles.consoleRow}>
                                    <span className={styles.logTime}>[{log.time}]</span>
                                    <span className={`${styles.logLevel} ${
                                        log.level === 'ERROR' ? styles.lvlError : 
                                        log.level === 'WARN' ? styles.lvlWarn : styles.lvlInfo
                                    }`}>{log.level}</span>
                                    <span className={styles.logSource}>({log.source})</span>
                                    <span className={styles.logMsg}>{log.msg}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 11. APPROVALS QUEUE PAGE */}
            {slug === "approvals" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>APPROVALS & REVIEW QUEUE</h2>
                        <p className={styles.secSubtitle}>Review and approve drafts, notifications, or discrepancies before loops execute automated tasks.</p>
                    </div>

                    <div className={styles.list}>
                        {approvals.length === 0 ? (
                            <div className={styles.emptyState}>
                                <ListChecks size={32} />
                                <p>All items approved. Loop queue clear.</p>
                            </div>
                        ) : (
                            approvals.map(app => (
                                <div key={app.id} className={styles.listItem} style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                                    <div style={{ flexGrow: 1 }}>
                                        <div className={styles.itemTitleGroup}>
                                            <h3 className={styles.itemTitle}>{app.item}</h3>
                                            <span className={styles.itemTime}>{app.time}</span>
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748B", margin: "4px 0", fontWeight: 700 }}>
                                            Workflow Loop: <strong>{app.workflow}</strong>
                                        </div>
                                        <p className={styles.itemText} style={{ marginTop: "8px" }}>{app.detail}</p>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "20px" }}>
                                        <button 
                                            className={styles.btnPrimary} 
                                            style={{ fontSize: "0.75rem", height: "32px", padding: "0 16px" }}
                                            onClick={() => handleApprove(app.id, 'approve')}
                                        >
                                            Confirm Task
                                        </button>
                                        <button 
                                            className={styles.btnSecondary} 
                                            style={{ fontSize: "0.75rem", height: "32px", padding: "0 16px" }}
                                            onClick={() => handleApprove(app.id, 'reject')}
                                        >
                                            Dismiss
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* 12. BILLING PAGE */}
            {slug === "billing" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>SOVEREIGN NODE BILLING</h2>
                        <p className={styles.secSubtitle}>Manage local hosting seats, view billing history, and configure secure Revolut node payments.</p>
                    </div>

                    <div className={styles.dualColumn}>
                        {/* Left column - Plan */}
                        <div className={styles.leftColCard}>
                            <span className={styles.tierLabel}>ACTIVE SUBSCRIPTION</span>
                            <h3 className={styles.planTitle} style={{ fontSize: "1.4rem", margin: "8px 0" }}>Enterprise Sovereign Cluster</h3>
                            <p style={{ fontSize: "0.8rem", color: "#64748B", lineHeight: 1.45, marginBottom: "20px" }}>
                                Allocates isolated server containers with unlimited workflow executions, hourly cron syncs, and AES encrypted vaults.
                            </p>

                            <div className={styles.billingMeters}>
                                <div style={{ marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, marginBottom: "4px" }}>
                                        <span style={{ color: "#64748B" }}>Seats Used</span>
                                        <span style={{ color: "#020617" }}>4 / 10 Operators</span>
                                    </div>
                                    <div className={styles.barMeter}><div className={styles.barFill} style={{ width: "40%" }} /></div>
                                </div>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, marginBottom: "4px" }}>
                                        <span style={{ color: "#64748B" }}>VPS Node Capacity</span>
                                        <span style={{ color: "#020617" }}>2 / 3 Containers</span>
                                    </div>
                                    <div className={styles.barMeter}><div className={styles.barFill} style={{ width: "66%" }} /></div>
                                </div>
                            </div>
                        </div>

                        {/* Right column - Payment & History */}
                        <div className={styles.rightColCard}>
                            <h3 className={styles.cardTitle} style={{ marginBottom: "12px" }}>Billing Summary</h3>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "16px" }}>
                                <span style={{ color: "#64748B", fontWeight: 700 }}>Monthly Cost</span>
                                <strong style={{ color: "#020617" }}>$499.00 / month</strong>
                            </div>

                            <div className={styles.paymentMethodStrip}>
                                <CreditCard size={18} color="#64748B" />
                                <div style={{ flexGrow: 1 }}>
                                    <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#020617" }}>Revolut Account Linked</div>
                                    <div style={{ fontSize: "0.65rem", color: "#94A3B8" }}>Renews automatically on July 01, 2026</div>
                                </div>
                            </div>

                            <button 
                                className={styles.btnSecondary}
                                style={{ width: "100%", height: "40px", marginTop: "12px" }}
                                onClick={() => alert("Redirecting to Revolut secure portal...")}
                            >
                                Modify Payment Details
                            </button>
                        </div>
                    </div>

                    <h3 className={styles.cardTitle} style={{ marginTop: "32px", marginBottom: "16px" }}>Receipt History Ledger</h3>
                    <div className={styles.tableCard}>
                        <table className={styles.ledgerTable}>
                            <thead>
                                <tr>
                                    <th>Billing Period</th>
                                    <th>Invoice ID</th>
                                    <th>Amount Paid</th>
                                    <th style={{ textAlign: "right" }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map(inv => (
                                    <tr key={inv.id}>
                                        <td style={{ fontWeight: 800, color: "#020617" }}>{inv.date}</td>
                                        <td style={{ fontFamily: "monospace", fontWeight: 700, color: "#475569" }}>{inv.id}</td>
                                        <td style={{ fontWeight: 800, color: "#020617" }}>{inv.amount}</td>
                                        <td style={{ textAlign: "right" }}>
                                            <span className={`${styles.statusLabel} ${styles.statusSuccess}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 13. AUDIT TRAIL PAGE */}
            {slug === "audit" && (
                <div className={styles.section}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>SOVEREIGN AUDIT TRAIL</h2>
                        <p className={styles.secSubtitle}>Immutable ledger of access changes, credentials rotation, and workflow deployment events.</p>
                    </div>

                    <div className={styles.filterStrip}>
                        <div className={styles.searchBar}>
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Search audit trail..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B" }}>Action Filter:</span>
                            <select 
                                value={actionFilter} 
                                onChange={e => setActionFilter(e.target.value)}
                                style={{ 
                                    padding: "8px 12px", 
                                    borderRadius: "8px", 
                                    border: "1px solid #E2E8F0", 
                                    fontSize: "0.8rem", 
                                    fontWeight: 700,
                                    background: "#FFFFFF",
                                    color: "#0F172A",
                                    outline: "none"
                                }}
                            >
                                <option value="all">All Actions</option>
                                <option value="WORKFLOW_CREATED">Workflow Created</option>
                                <option value="WORKFLOW_DEPLOYED">Workflow Deployed</option>
                                <option value="WORKFLOW_PAUSED">Workflow Paused</option>
                                <option value="CREDENTIAL_UPDATED">Credential Updated</option>
                                <option value="USER_INVITED">User Invited</option>
                                <option value="ACCESS_MODIFIED">Access Modified</option>
                                <option value="DEPLOYMENT_TARGET_CHANGED">Deployment Target Changed</option>
                                <option value="CONNECTOR_REMOVED">Connector Removed</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.tableCard}>
                        <table className={styles.ledgerTable}>
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>Actor</th>
                                    <th>Action</th>
                                    <th>Target Item</th>
                                    <th>IP Address</th>
                                    <th style={{ textAlign: "right" }}>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAudits.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>No matching audit logs found.</td>
                                    </tr>
                                ) : (
                                    filteredAudits.map(log => (
                                        <tr key={log.id}>
                                            <td style={{ fontSize: "0.78rem", color: "#64748B" }}>{log.timestamp}</td>
                                            <td style={{ fontWeight: 800, color: "#020617" }}>{log.actor}</td>
                                            <td>
                                                <span 
                                                    className={styles.statusLabel}
                                                    style={{
                                                        background: log.action.includes("PAUSED") || log.action.includes("REMOVED") ? "#FFF5F5" : 
                                                                    log.action.includes("DEPLOYED") || log.action.includes("UPDATED") ? "#ECFDF5" : "#F1F5F9",
                                                        color: log.action.includes("PAUSED") || log.action.includes("REMOVED") ? "#EF4444" : 
                                                               log.action.includes("DEPLOYED") || log.action.includes("UPDATED") ? "#10B981" : "#475569"
                                                    }}
                                                >
                                                    {log.action.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700, color: "#334155" }}>{log.target}</td>
                                            <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748B" }}>{log.ipAddress}</td>
                                            <td style={{ textAlign: "right", fontSize: "0.8rem", color: "#475569", fontWeight: 500 }}>{log.details}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 14. REGISTRY / REQUEST WORKFLOW PAGE */}
            {slug === "registry" && (
                <div className={styles.section} style={{ maxWidth: "800px", margin: "0 auto" }}>
                    <div className={styles.secHeader}>
                        <h2 className={styles.secTitle}>REQUEST CUSTOM WORKFLOW</h2>
                        <p className={styles.secSubtitle}>Submit specifications for a bespoke sovereign n8n automation loop designed for your firm's private infrastructure.</p>
                    </div>

                    <div className={styles.leftColCard} style={{ marginTop: "20px" }}>
                        <form onSubmit={handleRegistrySubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>Workflow Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Real Estate Contract Parser"
                                        value={registryForm.name}
                                        onChange={e => setRegistryForm({ ...registryForm, name: e.target.value })}
                                        style={{ 
                                            padding: "10px 14px", 
                                            borderRadius: "8px", 
                                            border: "1px solid #E2E8F0", 
                                            fontSize: "0.85rem",
                                            fontWeight: 650,
                                            outline: "none"
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>Department / Category</label>
                                    <select 
                                        value={registryForm.category}
                                        onChange={e => setRegistryForm({ ...registryForm, category: e.target.value })}
                                        style={{ 
                                            padding: "10px 14px", 
                                            borderRadius: "8px", 
                                            border: "1px solid #E2E8F0", 
                                            fontSize: "0.85rem",
                                            fontWeight: 700,
                                            background: "#FFFFFF",
                                            color: "#0F172A",
                                            outline: "none"
                                        }}
                                    >
                                        <option value="Operations">Operations</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Support">Support</option>
                                        <option value="Recruiting">Recruiting</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>Requested Integrations (Comma separated)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. OpenAI, Salesforce, Google Drive"
                                        value={registryForm.tools}
                                        onChange={e => setRegistryForm({ ...registryForm, tools: e.target.value })}
                                        style={{ 
                                            padding: "10px 14px", 
                                            borderRadius: "8px", 
                                            border: "1px solid #E2E8F0", 
                                            fontSize: "0.85rem",
                                            fontWeight: 650,
                                            outline: "none"
                                        }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>Urgency Level</label>
                                    <select 
                                        value={registryForm.urgency}
                                        onChange={e => setRegistryForm({ ...registryForm, urgency: e.target.value })}
                                        style={{ 
                                            padding: "10px 14px", 
                                            borderRadius: "8px", 
                                            border: "1px solid #E2E8F0", 
                                            fontSize: "0.85rem",
                                            fontWeight: 700,
                                            background: "#FFFFFF",
                                            color: "#0F172A",
                                            outline: "none"
                                        }}
                                    >
                                        <option value="low">Low urgency (routine build)</option>
                                        <option value="medium">Medium urgency (next sprint)</option>
                                        <option value="high">High urgency (expedited deployment)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "0.8rem", fontWeight: 800, color: "#334155" }}>Workflow Specifications & Logic Description</label>
                                <textarea 
                                    required 
                                    placeholder="Describe the trigger event, decision logic, and desired automated actions..."
                                    value={registryForm.description}
                                    onChange={e => setRegistryForm({ ...registryForm, description: e.target.value })}
                                    rows={5}
                                    style={{ 
                                        padding: "12px 14px", 
                                        borderRadius: "8px", 
                                        border: "1px solid #E2E8F0", 
                                        fontSize: "0.85rem",
                                        fontWeight: 650,
                                        lineHeight: 1.5,
                                        fontFamily: "inherit",
                                        outline: "none",
                                        resize: "vertical"
                                    }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                className={styles.btnPrimary} 
                                style={{ width: "100%", height: "46px" }}
                                disabled={submittingRegistry}
                            >
                                {submittingRegistry ? "Submitting Request..." : "Submit Custom Workflow Request"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
