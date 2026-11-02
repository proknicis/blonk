"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
    Shield, Clock, AlertCircle, CheckCircle, XCircle, 
    MessageSquare, AlertTriangle, Eye, ArrowUpRight, HelpCircle, ChevronRight,
    Edit3, Play, Search, Filter, Calendar, Sparkles
} from "lucide-react";
import adminStyles from "../admin.module.css";

export default function ApprovalsPage() {
    const router = useRouter();
    const [approvals, setApprovals] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApproval, setSelectedApproval] = useState<any>(null);
    const [editedPayload, setEditedPayload] = useState("");
    const [decisionRationale, setDecisionRationale] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filters for history
    const [searchQuery, setSearchQuery] = useState("");
    const [decisionFilter, setDecisionFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    const fetchApprovals = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/approvals");
            if (res.ok) {
                const data = await res.json();
                setApprovals(data);
            }
        } catch (e) {
            console.error("Failed to load approvals queue:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    // Relative time utility helper
    const getRelativeTimeString = (dateString: string) => {
        if (!dateString) return "recently";
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();
        if (isNaN(diffMs)) return "recently";
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleOpenPreview = (app: any) => {
        setSelectedApproval(app);
        setEditedPayload(app.actionPreview || "");
        setDecisionRationale("");
    };

    const handleClosePreview = () => {
        setSelectedApproval(null);
    };

    const handleDecision = async (approvalId: string, decision: "APPROVED" | "REJECTED", payloadOverride?: string) => {
        const verb = decision === "APPROVED" ? "approve and execute" : "reject";
        if (!confirm(`This will ${verb} the automation action. Continue?`)) {
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/approvals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    approvalId,
                    decision,
                    rationale: decisionRationale || `Admin ${decision.toLowerCase()} via approvals console`,
                    editedPreview: payloadOverride
                })
            });

            if (res.ok) {
                if ((window as any).showToast) {
                    (window as any).showToast(`Automation request ${decision.toLowerCase()} successfully.`, "success");
                } else {
                    alert(`Automation request ${decision.toLowerCase()} successfully.`);
                }
                handleClosePreview();
                fetchApprovals();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to submit decision.");
            }
        } catch (err: any) {
            console.error("Decision error:", err);
            alert("Failed to submit decision due to a network error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFriendlyActionLabel = (type: string) => {
        const t = String(type || "").toLowerCase();
        if (t === "send_email" || t.includes("email")) return "Send Email";
        if (t === "send_payment" || t.includes("payment") || t.includes("payout")) return "Send Payment";
        if (t === "post_message" || t.includes("slack") || t.includes("message")) return "Slack Notification";
        return "Custom Action";
    };

    const pendingApprovals = approvals.filter(a => a.status === 'PENDING');
    const historyApprovals = approvals.filter(a => a.status !== 'PENDING');

    // Filter history records
    const filteredHistory = historyApprovals.filter(app => {
        const matchesSearch = 
            (app.customerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.automationName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.actionType || "").toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesDecision = decisionFilter === "All" || app.status === decisionFilter;
        
        let matchesDate = true;
        if (dateFilter) {
            const rowDateStr = new Date(app.decidedAt || app.requestedAt).toISOString().split('T')[0];
            matchesDate = rowDateStr === dateFilter;
        }
        
        return matchesSearch && matchesDecision && matchesDate;
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* WAITING FOR REVIEW */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                        <h3 style={{ fontSize: "1.15rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>Waiting for Your Review</h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 750 }}>Actions that need approval before the automation continues</p>
                    </div>

                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {isLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[1, 2].map(i => (
                                <div key={i} style={{ height: "64px", background: "var(--muted)", borderRadius: "12px", animation: "pulse 1.5s infinite" }} />
                            ))}
                        </div>
                    ) : pendingApprovals.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", border: "1px dashed var(--border)", borderRadius: "16px", color: "var(--muted-foreground)", gap: "10px", padding: "20px" }}>
                            <CheckCircle size={28} style={{ color: "var(--accent)" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--foreground)" }}>Nothing needs your review right now.</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, maxWidth: "340px", textAlign: "center", lineHeight: "1.4" }}>
                                All customer AI employees are operating autonomously under active policy guidelines.
                            </span>
                        </div>
                    ) : (
                        pendingApprovals.map(app => (
                            <div 
                                key={app.id} 
                                style={{ 
                                    background: "var(--muted)", 
                                    border: "1px solid var(--border)", 
                                    borderRadius: "16px", 
                                    padding: "20px 24px", 
                                    display: "flex", 
                                    justifyContent: "space-between", 
                                    alignItems: "center", 
                                    gap: "24px" 
                                }}
                            >
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--foreground)" }}>
                                            {app.customerName || "Sovereign Customer"}
                                        </span>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700 }}>•</span>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--accent)" }}>
                                            {app.automationName || "Autonomous Loop"}
                                        </span>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700 }}>•</span>
                                        <span style={{ 
                                            fontSize: "0.6rem", 
                                            fontWeight: 950, 
                                            padding: "2px 8px", 
                                            borderRadius: "100px", 
                                            background: "rgba(59, 130, 246, 0.1)", 
                                            color: "#3B82F6",
                                            textTransform: "uppercase" 
                                        }}>
                                            {getFriendlyActionLabel(app.actionType)}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "580px" }}>
                                        {app.actionPreview || app.outputPreview}
                                    </div>
                                    <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 750, display: "flex", alignItems: "center", gap: "4px" }}>
                                        <Clock size={10} /> Requested {getRelativeTimeString(app.requestedAt)} by {app.requestedBy}
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                    <button 
                                        onClick={() => handleOpenPreview(app)}
                                        style={{ height: "36px", padding: "0 16px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 900, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <Eye size={12} /> Preview &amp; Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDecision(app.id, "REJECTED")}
                                        style={{ height: "36px", padding: "0 16px", border: "1px solid rgba(239, 68, 68, 0.15)", background: "rgba(239, 68, 68, 0.05)", color: "#EF4444", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 900 }}
                                    >
                                        Reject
                                    </button>
                                    <button 
                                        onClick={() => handleDecision(app.id, "APPROVED")}
                                        style={{ height: "36px", padding: "0 18px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 900 }}
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* APPROVAL HISTORY */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
                    <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>Approval History</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 750 }}>A record of past approval decisions</p>
                    </div>

                    {/* FILTERS */}
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        <div style={{ position: "relative", minWidth: "200px" }}>
                            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                            <input 
                                type="text"
                                placeholder="Search customer or action..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px 0 32px", fontSize: "0.75rem", background: "var(--muted)", color: "var(--foreground)", fontWeight: 800 }}
                            />
                        </div>

                        <select 
                            value={decisionFilter}
                            onChange={e => setDecisionFilter(e.target.value)}
                            style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.75rem", background: "var(--muted)", color: "var(--foreground)", fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Decisions</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                        </select>

                        <div style={{ position: "relative" }}>
                            <Calendar size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} />
                            <input 
                                type="date"
                                value={dateFilter}
                                onChange={e => setDateFilter(e.target.value)}
                                style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px 0 32px", fontSize: "0.75rem", background: "var(--muted)", color: "var(--foreground)", fontWeight: 800, outline: "none" }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    {isLoading ? (
                        <div style={{ height: "60px", background: "var(--muted)", borderRadius: "8px", animation: "pulse 1.5s infinite" }} />
                    ) : filteredHistory.length === 0 ? (
                        <div style={{ padding: "32px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.8rem", fontStyle: "italic" }}>
                            No approval decisions logged matching the filter parameters.
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Date Decided</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Customer</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>AI Employee</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Action Type</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Decision</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'right' }}>Decided By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map(app => (
                                    <tr key={app.id} style={{ background: "var(--muted)" }}>
                                        <td style={{ padding: "14px 16px", borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                            {app.decidedAt ? new Date(app.decidedAt).toLocaleString() : new Date(app.requestedAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontWeight: 900, fontSize: "0.8rem" }}>
                                            {app.customerName || "Sovereign Customer"}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.8rem", fontWeight: 800, color: "var(--accent)" }}>
                                            {app.automationName || "Autonomous Loop"}
                                        </td>
                                        <td style={{ padding: "14px 16px", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 800 }}>
                                            {getFriendlyActionLabel(app.actionType)}
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <span style={{ 
                                                fontSize: "0.65rem", 
                                                fontWeight: 950, 
                                                padding: "3px 8px", 
                                                borderRadius: "4px",
                                                background: app.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                color: app.status === 'APPROVED' ? '#10B981' : '#EF4444'
                                            }}>{app.status}</span>
                                        </td>
                                        <td style={{ padding: "14px 16px", borderTopRightRadius: "10px", borderBottomRightRadius: "10px", textAlign: "right", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 800 }}>
                                            {app.decidedBy || "System"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* PREVIEW & EDIT MODAL */}
            {selectedApproval && (
                <div className={adminStyles.modalOverlay}>
                    <div className={adminStyles.modal} style={{ maxWidth: "680px" }}>
                        <div className={adminStyles.modalHeader}>
                            <h3 className={adminStyles.modalTitle}>Preview &amp; Edit Action</h3>
                            <p className={adminStyles.modalSubtitle}>Reviewing action for <strong>{selectedApproval.customerName || "Sovereign Customer"}</strong></p>
                        </div>

                        <div className={adminStyles.modalBody} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.8rem", fontWeight: 800, color: "var(--muted-foreground)" }}>
                                <div>
                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>AI Employee</span>
                                    <div style={{ color: "var(--foreground)", marginTop: "4px" }}>
                                        {selectedApproval.aiEmployeeName || "General AI"}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Action Type</span>
                                    <div style={{ color: "var(--foreground)", marginTop: "4px" }}>
                                        {getFriendlyActionLabel(selectedApproval.actionType)}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: "6px" }}>
                                    Action Payload (Draft Text)
                                </label>
                                <textarea 
                                    rows={8}
                                    value={editedPayload}
                                    onChange={e => setEditedPayload(e.target.value)}
                                    style={{ 
                                        width: "100%", 
                                        border: "1px solid var(--border)", 
                                        borderRadius: "12px", 
                                        padding: "16px", 
                                        fontSize: "0.85rem", 
                                        fontFamily: "monospace",
                                        background: "var(--muted)", 
                                        color: "var(--foreground)", 
                                        resize: "vertical",
                                        lineHeight: "1.5"
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", marginBottom: "6px" }}>
                                    Decision Rationale (Optional)
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="Explain this decision or editing rationale for security auditing"
                                    value={decisionRationale}
                                    onChange={e => setDecisionRationale(e.target.value)}
                                    style={{ width: "100%", height: "40px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)", fontWeight: 800 }}
                                />
                            </div>
                        </div>

                        <div className={adminStyles.modalFooter} style={{ display: "flex", gap: "8px" }}>
                            <button 
                                onClick={handleClosePreview}
                                style={{ height: "42px", padding: "0 20px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 900, color: "var(--foreground)" }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleDecision(selectedApproval.id, "REJECTED")}
                                disabled={isSubmitting}
                                style={{ height: "42px", padding: "0 20px", border: "1px solid rgba(239, 68, 68, 0.15)", background: "rgba(239, 68, 68, 0.05)", color: "#EF4444", borderRadius: "12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 950 }}
                            >
                                Reject Action
                            </button>
                            <button 
                                onClick={() => handleDecision(selectedApproval.id, "APPROVED", editedPayload)}
                                disabled={isSubmitting}
                                style={{ height: "42px", padding: "0 24px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 950 }}
                            >
                                Approve &amp; Execute
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
