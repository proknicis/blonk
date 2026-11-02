"use client";

import React, { useState, useCallback, useRef, useEffect, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, MessageSquare, ListChecks, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./approvals.module.css";

// ─── Types ────────────────────────────────────────────────────────────────────
type ItemPriority = "high" | "normal" | "low";
type Decision = "approved" | "changes_requested" | "dismissed";

interface ApprovalItem {
    id: string;
    workflow: string;
    item: string;
    detail: string;
    receivedAt: string;
    priority: ItemPriority;
    inspectData?: Record<string, string>;
}

interface ResolvedItem extends ApprovalItem {
    resolvedAt: string;
    decision: Decision;
    resolvedBy: string;
}

interface Toast {
    id: string;
    message: string;
    type: "success" | "warning" | "error";
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({
    item,
    onConfirm,
    onCancel,
}: {
    item: ApprovalItem | null;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const dialogRef = useRef<HTMLDivElement>(null);
    const confirmBtnRef = useRef<HTMLButtonElement>(null);
    const headingId = useId();

    useEffect(() => {
        if (!item) return;
        confirmBtnRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") { onCancel(); return; }
            if (e.key !== "Tab") return;
            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [item, onCancel]);

    return (
        <AnimatePresence>
            {item && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className={styles.modalOverlay} 
                    role="presentation"
                >
                    <motion.div
                        ref={dialogRef}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={styles.modal}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={headingId}
                    >
                        <h2 id={headingId} className={styles.modalTitle}>Confirm Approval</h2>
                        <p className={styles.modalBody}>
                            Approving <strong>{item.item}</strong> will queue it for immediate execution
                            in the <strong>{item.workflow}</strong> workflow loop.
                            This action will be logged in the decision audit trail.
                        </p>
                        <div className={styles.modalActions}>
                            <motion.button 
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={styles.btnSecondary} 
                                onClick={onCancel} 
                                aria-label="Cancel and return"
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                ref={confirmBtnRef}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className={styles.btnPrimary}
                                onClick={onConfirm}
                                aria-label={`Confirm approval of ${item.item}`}
                            >
                                <Check size={14} /> Confirm &amp; Queue
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Toast system ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    return (
        <div className={styles.toastContainer} aria-live="polite" aria-atomic="false" aria-label="Notifications">
            <AnimatePresence>
                {toasts.map(t => (
                    <motion.div 
                        key={t.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`${styles.toast} ${styles[`toast_${t.type}`]}`} 
                        role="status"
                    >
                        <span>{t.message}</span>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onDismiss(t.id)} 
                            aria-label="Dismiss notification" 
                            className={styles.toastDismiss}
                        >
                            <X size={12} />
                        </motion.button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// ─── Default queue ────────────────────────────────────────────────────────────
const DEFAULT_QUEUE: ApprovalItem[] = [
    {
        id: "app-1",
        workflow: "Client Onboarding Setup",
        item: "Slack Channel Welcome Draft",
        detail: "Approve custom workspace channel introduction copy drafted by the onboarding loop for client Sterling Partners. Message will be sent automatically on approval.",
        receivedAt: "10 minutes ago",
        priority: "normal",
        inspectData: {
            "Channel Target": "#sterling-partners-ops",
            "Template Version": "v2.1",
            "Drafted by": "Onboarding Loop",
            "Client Tier": "Enterprise",
            "Scheduled Send": "Immediately on approval",
        },
    },
    {
        id: "app-2",
        workflow: "Invoice Processing Loop",
        item: "Billing Total Variance — Stripe vs PDF",
        detail: "Scanned invoice total (€4,200.00) differs from Stripe PO database value (€4,120.00) by €80.00. Resolve discrepancy before issuing payment authorization.",
        receivedAt: "1 hour ago",
        priority: "high",
        inspectData: {
            "PDF Total": "€4,200.00",
            "Stripe PO Total": "€4,120.00",
            "Variance": "€80.00 (1.9%)",
            "Invoice Ref": "PO-2025-0842",
            "Action on Approval": "Issue payment via Stripe",
        },
    },
    {
        id: "app-3",
        workflow: "Recruitment Screening Loop",
        item: "Candidate Shortlist — Senior DevOps Role",
        detail: "Automated CV screener has produced a shortlist of 4 candidates from 24 reviewed. Approve to issue automated interview invitations via the scheduling integration.",
        receivedAt: "3 hours ago",
        priority: "normal",
        inspectData: {
            "Role": "Senior DevOps Engineer",
            "Reviewed": "24 candidates",
            "Shortlisted": "4 candidates",
            "Screening Method": "Keyword match + Years + Location",
            "Action on Approval": "Send calendar invites via Calendly",
        },
    },
];

// ─── Main component ───────────────────────────────────────────────────────────
export default function ApprovalsClient({ initialOrders }: { initialOrders: any[] }) {
    const lastFocusRef = useRef<HTMLElement | null>(null);

    // Merge DB orders into the queue
    const [queue, setQueue] = useState<ApprovalItem[]>(() => {
        const list: ApprovalItem[] = [...DEFAULT_QUEUE];
        initialOrders.forEach(order => {
            const id = "order-" + order.id.toString().substring(0, 8);
            if (list.some(i => i.id === id)) return;
            let detail = "Custom workflow request awaiting team review and approval.";
            const inspectData: Record<string, string> = { "Order Status": order.status };
            try {
                const parsed = typeof order.customDetails === "string" ? JSON.parse(order.customDetails) : order.customDetails;
                if (parsed?.description) detail = parsed.description;
                if (parsed?.category) inspectData["Category"] = parsed.category;
                if (parsed?.urgency) inspectData["Priority"] = parsed.urgency;
            } catch (_) {}
            if (order.amount) inspectData["Quoted Price"] = `€${Number(order.amount).toLocaleString()}`;
            list.push({
                id,
                workflow: order.workflowName || "Custom Workflow",
                item: `Custom Workflow Order #${order.id.toString().substring(0, 6).toUpperCase()}`,
                detail,
                receivedAt: new Date(order.createdAt).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
                priority: "normal",
                inspectData,
            });
        });
        return list;
    });

    const [resolved, setResolved] = useState<ResolvedItem[]>([]);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [confirmTarget, setConfirmTarget] = useState<ApprovalItem | null>(null);
    const [expandedInspect, setExpandedInspect] = useState<Set<string>>(new Set());
    const [showResolved, setShowResolved] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [changesItemId, setChangesItemId] = useState<string | null>(null);
    const [changesNote, setChangesNote] = useState("");

    const addToast = useCallback((message: string, type: Toast["type"]) => {
        const id = `toast-${Date.now()}`;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    }, []);

    const resolveItem = useCallback((id: string, decision: Decision) => {
        setQueue(prev => {
            const item = prev.find(i => i.id === id);
            if (!item) return prev;
            setResolved(r => [{
                ...item,
                resolvedAt: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
                decision,
                resolvedBy: "Current Operator",
            }, ...r]);
            const label: Record<Decision, string> = {
                approved: "approved and queued for execution",
                dismissed: "dismissed from queue",
                changes_requested: "returned — changes requested",
            };
            const toastType: Record<Decision, Toast["type"]> = {
                approved: "success", dismissed: "error", changes_requested: "warning"
            };
            addToast(`"${item.item}" ${label[decision]}.`, toastType[decision]);
            return prev.filter(i => i.id !== id);
        });
        setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
    }, [addToast]);

    // Approve flow (requires confirmation)
    const openApproveModal = (item: ApprovalItem) => {
        lastFocusRef.current = document.activeElement as HTMLElement;
        setConfirmTarget(item);
    };
    const handleConfirmApprove = () => {
        if (confirmTarget) resolveItem(confirmTarget.id, "approved");
        setConfirmTarget(null);
        setTimeout(() => lastFocusRef.current?.focus(), 50);
    };
    const handleCancelModal = () => {
        setConfirmTarget(null);
        setTimeout(() => lastFocusRef.current?.focus(), 50);
    };

    // Changes flow
    const handleOpenChanges = (id: string) => {
        setChangesItemId(prev => prev === id ? null : id);
        setChangesNote("");
    };
    const handleSubmitChanges = (id: string) => {
        resolveItem(id, "changes_requested");
        setChangesItemId(null);
        setChangesNote("");
    };

    // Selection
    const toggleSelect = (id: string) => setSelected(prev => {
        const s = new Set(prev);
        s.has(id) ? s.delete(id) : s.add(id);
        return s;
    });
    const toggleAll = () => setSelected(prev =>
        prev.size === queue.length ? new Set() : new Set(queue.map(i => i.id))
    );

    // Bulk operations
    const bulkResolve = (decision: Decision) => {
        const ids = Array.from(selected);
        const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        setResolved(prev => [
            ...queue
                .filter(i => ids.includes(i.id))
                .map(item => ({ ...item, resolvedAt: now, decision, resolvedBy: "Current Operator (Bulk)" })),
            ...prev,
        ]);
        setQueue(prev => prev.filter(i => !ids.includes(i.id)));
        setSelected(new Set());
        const label: Record<Decision, string> = {
            approved: `${ids.length} item${ids.length > 1 ? "s" : ""} approved and queued.`,
            dismissed: `${ids.length} item${ids.length > 1 ? "s" : ""} dismissed.`,
            changes_requested: `${ids.length} item${ids.length > 1 ? "s" : ""} returned for changes.`,
        };
        const type: Record<Decision, Toast["type"]> = { approved: "success", dismissed: "error", changes_requested: "warning" };
        addToast(label[decision], type[decision]);
    };

    const priorityColor = (p: ItemPriority) =>
        p === "high" ? "#EF4444" : p === "low" ? "#CBD5E1" : "#F59E0B";

    return (
        <main className={styles.container} aria-label="Human-in-the-Loop Approvals Queue">
            <ToastContainer toasts={toasts} onDismiss={id => setToasts(prev => prev.filter(t => t.id !== id))} />
            <ConfirmModal item={confirmTarget} onConfirm={handleConfirmApprove} onCancel={handleCancelModal} />

            {/* Header */}
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Approvals &amp; Review Queue</h1>
                    <p className={styles.subtitle}>
                        Human-in-the-loop decisions required before workflow loops proceed.
                        Approved items queue immediately for execution. All decisions are logged.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {queue.length > 0 && (
                        <span className={styles.pendingBadge} aria-live="polite" aria-label={`${queue.length} pending items`}>
                            {queue.length} Pending
                        </span>
                    )}
                    {resolved.length > 0 && (
                        <button
                            className={styles.btnGhost}
                            onClick={() => setShowResolved(p => !p)}
                            aria-expanded={showResolved}
                            aria-controls="resolved-log"
                        >
                            {showResolved ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            Resolved ({resolved.length})
                        </button>
                    )}
                </div>
            </header>

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div className={styles.bulkBar} role="toolbar" aria-label={`Bulk actions for ${selected.size} selected items`}>
                    <span className={styles.bulkCount} aria-live="polite" aria-atomic="true">
                        {selected.size} selected
                    </span>
                    <button className={styles.bulkBtnApprove} onClick={() => bulkResolve("approved")} aria-label={`Approve all ${selected.size} selected items`}>
                        <Check size={13} /> Approve All
                    </button>
                    <button className={styles.bulkBtnDismiss} onClick={() => bulkResolve("dismissed")} aria-label={`Dismiss all ${selected.size} selected items`}>
                        <X size={13} /> Dismiss All
                    </button>
                    <button className={styles.btnGhost} onClick={() => setSelected(new Set())} aria-label="Clear selection">
                        Clear
                    </button>
                </div>
            )}

            {/* Select all row */}
            {queue.length > 1 && (
                <div className={styles.selectAllRow}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={selected.size === queue.length && queue.length > 0}
                            onChange={toggleAll}
                            aria-label={selected.size === queue.length ? "Deselect all items" : "Select all items"}
                        />
                        {selected.size === queue.length ? "Deselect all" : `Select all (${queue.length})`}
                    </label>
                </div>
            )}

            {/* Queue list */}
            <div className={styles.list} role="list">
                {queue.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={styles.emptyState} 
                        role="status"
                    >
                        <ListChecks size={40} color="#10B981" aria-hidden="true" />
                        <p>Queue is clear — no pending items.</p>
                        <span>All workflow loops are running without human gates.</span>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {queue.map(item => {
                            const isSelected = selected.has(item.id);
                            const isExpanded = expandedInspect.has(item.id);
                            const showChanges = changesItemId === item.id;

                            return (
                                <motion.article
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, overflow: "hidden", marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.2 } }}
                                    role="listitem"
                                    className={`${styles.listItem} ${isSelected ? styles.listItemSelected : ""}`}
                                    aria-label={`Approval request: ${item.item}, Priority: ${item.priority}`}
                                >
                                    <div className={styles.itemTop}>
                                        {/* Checkbox */}
                                        <label className={styles.checkboxLabel} aria-label={`Select: ${item.item}`}>
                                            <input
                                                type="checkbox"
                                                className={styles.checkbox}
                                                checked={isSelected}
                                                onChange={() => toggleSelect(item.id)}
                                                aria-label={`Select approval: ${item.item}`}
                                            />
                                        </label>

                                        {/* Content */}
                                        <div className={styles.itemBody}>
                                            <div className={styles.itemTitleRow}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    <span
                                                        className={styles.priorityDot}
                                                        style={{ background: priorityColor(item.priority) }}
                                                        aria-label={`${item.priority} priority`}
                                                        role="img"
                                                    />
                                                    <h3 className={styles.itemTitle}>{item.item}</h3>
                                                </div>
                                                <span className={styles.itemTime}>{item.receivedAt}</span>
                                            </div>

                                            <div className={styles.itemWorkflow}>
                                                Loop: <strong>{item.workflow}</strong>
                                            </div>

                                            <p className={styles.itemDetail}>{item.detail}</p>

                                            {/* Inspect toggle */}
                                            <button
                                                className={styles.inspectToggle}
                                                onClick={() => setExpandedInspect(prev => {
                                                    const s = new Set(prev);
                                                    s.has(item.id) ? s.delete(item.id) : s.add(item.id);
                                                    return s;
                                                })}
                                                aria-expanded={isExpanded}
                                                aria-controls={`inspect-${item.id}`}
                                            >
                                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                {isExpanded ? "Hide" : "Inspect"} Payload
                                            </button>

                                            {isExpanded && item.inspectData && (
                                                <div
                                                    id={`inspect-${item.id}`}
                                                    className={styles.inspectPanel}
                                                    role="region"
                                                    aria-label="Execution payload data"
                                                >
                                                    <span className={styles.inspectCaption}>Execution Payload</span>
                                                    <table className={styles.inspectTable}>
                                                        <tbody>
                                                            {Object.entries(item.inspectData).map(([k, v]) => (
                                                                <tr key={k}>
                                                                    <th scope="row" className={styles.inspectKey}>{k}</th>
                                                                    <td className={styles.inspectVal}>{v}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {/* Request changes form */}
                                            {showChanges && (
                                                <div className={styles.changesForm} role="form" aria-label="Request changes">
                                                    <label htmlFor={`changes-${item.id}`} className={styles.changesLabel}>
                                                        Changes Required
                                                    </label>
                                                    <textarea
                                                        id={`changes-${item.id}`}
                                                        className={styles.changesTextarea}
                                                        placeholder="Describe the changes needed before this item can be approved..."
                                                        value={changesNote}
                                                        onChange={e => setChangesNote(e.target.value)}
                                                        rows={3}
                                                        autoFocus
                                                        aria-required="true"
                                                        aria-describedby={`changes-hint-${item.id}`}
                                                    />
                                                    <span id={`changes-hint-${item.id}`} className={styles.changesHint}>
                                                        This note will be logged against the item and flagged in the resolved audit trail.
                                                    </span>
                                                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                                        <motion.button
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            className={styles.btnChanges}
                                                            onClick={() => handleSubmitChanges(item.id)}
                                                            disabled={!changesNote.trim()}
                                                            aria-label="Submit changes request"
                                                        >
                                                            <MessageSquare size={13} /> Submit Request
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.03 }}
                                                            whileTap={{ scale: 0.97 }}
                                                            className={styles.btnSecondary}
                                                            onClick={() => setChangesItemId(null)}
                                                            aria-label="Cancel"
                                                            style={{ fontSize: "0.78rem", padding: "7px 12px" }}
                                                        >
                                                            Cancel
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className={styles.actionsCol}>
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className={styles.btnApprove}
                                                onClick={() => openApproveModal(item)}
                                                aria-label={`Approve: ${item.item}`}
                                            >
                                                <Check size={13} /> Approve
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className={styles.btnChangesBtn}
                                                onClick={() => handleOpenChanges(item.id)}
                                                aria-label={`Request changes for: ${item.item}`}
                                                aria-pressed={showChanges}
                                            >
                                                <MessageSquare size={13} /> Changes
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className={styles.btnDismiss}
                                                onClick={() => resolveItem(item.id, "dismissed")}
                                                aria-label={`Dismiss: ${item.item}`}
                                            >
                                                <X size={13} /> Dismiss
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Resolved decision log */}
            {showResolved && resolved.length > 0 && (
                <section id="resolved-log" className={styles.resolvedSection} aria-labelledby="resolved-heading">
                    <h2 id="resolved-heading" className={styles.resolvedTitle}>Decision Audit Log</h2>
                    <table className={styles.resolvedTable} aria-label="Resolved approval decisions">
                        <thead>
                            <tr>
                                <th scope="col">Item</th>
                                <th scope="col">Workflow</th>
                                <th scope="col">Decision</th>
                                <th scope="col">Resolved By</th>
                                <th scope="col">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resolved.map((r, i) => (
                                <tr key={`${r.id}-${i}`}>
                                    <td style={{ fontWeight: 700, color: "#0F172A" }}>{r.item}</td>
                                    <td style={{ color: "#64748B" }}>{r.workflow}</td>
                                    <td>
                                        <span className={`${styles.decisionBadge} ${styles[`decision_${r.decision}`]}`}>
                                            {r.decision === "approved" ? "Approved"
                                                : r.decision === "dismissed" ? "Dismissed"
                                                : "Changes Requested"}
                                        </span>
                                    </td>
                                    <td style={{ color: "#64748B" }}>{r.resolvedBy}</td>
                                    <td style={{ color: "#94A3B8", fontVariantNumeric: "tabular-nums" }}>{r.resolvedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            )}
        </main>
    );
}
