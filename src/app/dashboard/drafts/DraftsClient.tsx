"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { 
    FileText, 
    Play, 
    Link as LinkIcon, 
    Trash2, 
    CheckCircle, 
    AlertTriangle, 
    X,
    User,
    Clock,
    ArrowRight,
    Loader2
} from "lucide-react";
import styles from "./drafts.module.css";

interface DraftItem {
    id: string;
    name: string;
    userStatus: "Needs a Connection" | "Ready to Launch" | "Not Started";
    missing: string[];
    changedBy: string;
    time: string;
}

const DEFAULT_DRAFTS: DraftItem[] = [
    {
        id: "dr-default-1",
        name: "Invoice Processing & Reconciliation",
        userStatus: "Needs a Connection",
        missing: ["Stripe"],
        changedBy: "Marcus Co-Pilot",
        time: "2 hours ago",
    },
    {
        id: "dr-default-2",
        name: "Customer Support Triaging",
        userStatus: "Ready to Launch",
        missing: [],
        changedBy: "Sophia Co-Pilot",
        time: "5 mins ago",
    },
];

export default function DraftsClient({ initialDrafts = [] }: { initialDrafts: any[] }) {
    const [drafts, setDrafts] = useState<DraftItem[]>(() => {
        const list = [...DEFAULT_DRAFTS];
        initialDrafts.forEach(d => {
            // Avoid duplicate default entries if name matches
            if (!list.some(item => item.name.toLowerCase() === d.name.toLowerCase())) {
                list.push({
                    id: d.id,
                    name: d.name,
                    userStatus: d.userStatus,
                    missing: d.missing,
                    changedBy: "System",
                    time: d.time || "Recently",
                });
            }
        });
        return list;
    });

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [confirmLaunchId, setConfirmLaunchId] = useState<string | null>(null);
    const [isLaunching, setIsLaunching] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    const triggerToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const handleLaunchClick = (id: string) => {
        setConfirmLaunchId(id);
    };

    const handleLaunchConfirm = async () => {
        if (!confirmLaunchId) return;
        const targetId = confirmLaunchId;
        setConfirmLaunchId(null);
        setIsLaunching(true);

        try {
            const res = await fetch("/api/workflows/control", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workflowId: targetId, action: "start" }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Successfully launched — remove from list and show toast
                const draft = drafts.find(d => d.id === targetId);
                triggerToast(`Your automation "${draft?.name || ''}" is now live`, "success");
                setDrafts(prev => prev.filter(d => d.id !== targetId));
            } else {
                // Return clear error message in plain language
                const errorDetail = data.error || data.details || "Launch rejected. Check connection setup.";
                triggerToast(`Unable to launch: ${errorDetail}`, "error");
            }
        } catch (err: any) {
            triggerToast(err.message || "Network error. Please try again.", "error");
        } finally {
            setIsLaunching(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setPendingDeleteId(id);
    };

    const handleDeleteConfirm = () => {
        if (pendingDeleteId) {
            setDrafts(prev => prev.filter(d => d.id !== pendingDeleteId));
            setPendingDeleteId(null);
            triggerToast("Draft removed successfully", "success");
        }
    };

    return (
        <div className={styles.container}>
            {/* Custom toast notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
                    >
                        {toast.type === "success" ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                        <span>{toast.message}</span>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setToast(null)} 
                            className={styles.toastClose}
                        >
                            <X size={14} />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={styles.header}>
                <h1 className={styles.title}>Drafts &amp; Approvals</h1>
                <p className={styles.subtitle}>
                    Automations waiting for a connection or your approval before they go live.
                </p>
            </div>

            {/* List of drafts */}
            <div className={styles.listSection}>
                {drafts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={styles.emptyState}
                    >
                        <div className={styles.emptyIconWrapper}>
                            <FileText size={32} color="#94A3B8" />
                        </div>
                        <h3 className={styles.emptyTitle}>You have no automations waiting right now</h3>
                        <p className={styles.emptySubtitle}>All your configured workflows are active and running.</p>
                        <Link href="/dashboard/recommendations" className={styles.btnExplore}>
                            Explore new automations <ArrowRight size={14} />
                        </Link>
                    </motion.div>
                ) : (
                    <div className={styles.cardsStack}>
                        <AnimatePresence mode="popLayout">
                            {drafts.map(draft => {
                                const isAwaitingConn = draft.userStatus === "Needs a Connection";
                                const isReady = draft.userStatus === "Ready to Launch";
                                const isNotStarted = draft.userStatus === "Not Started";

                                return (
                                    <motion.div 
                                        key={draft.id} 
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0, overflow: "hidden", marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, transition: { duration: 0.2 } }}
                                        className={styles.itemCard}
                                    >
                                        <div className={styles.cardMain}>
                                            <div className={styles.itemInfo}>
                                                <h3 className={styles.itemName}>{draft.name}</h3>
                                                <div className={styles.itemMeta}>
                                                    <span className={styles.metaLabel}>
                                                        <Clock size={12} />
                                                        Updated {draft.time}
                                                    </span>
                                                    <span className={styles.metaDivider}>•</span>
                                                    <span className={styles.metaLabel}>
                                                        <User size={12} />
                                                        Updated by {draft.changedBy}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className={styles.badgeWrapper}>
                                                {isAwaitingConn && (
                                                    <span className={`${styles.badge} ${styles.badgeWarning}`}>
                                                        Needs a Connection
                                                    </span>
                                                )}
                                                {isReady && (
                                                    <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                                        Ready to Launch
                                                    </span>
                                                )}
                                                {isNotStarted && (
                                                    <span className={`${styles.badge} ${styles.badgeDraft}`}>
                                                        Not Started
                                                    </span>
                                                )}
                                            </div>

                                            {isAwaitingConn && draft.missing.length > 0 && (
                                                <div className={styles.missingBox}>
                                                    Needs {draft.missing.join(", ")}
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.cardActions}>
                                            {isAwaitingConn ? (
                                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                                    <Link 
                                                        href={`/dashboard/credentials?highlight=${(draft.missing[0] || '').toLowerCase()}`} 
                                                        className={`${styles.btn} ${styles.btnAction}`}
                                                    >
                                                        <LinkIcon size={14} />
                                                        Connect App
                                                    </Link>
                                                </motion.div>
                                            ) : isReady ? (
                                                <motion.button 
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                                    onClick={() => handleLaunchClick(draft.id)}
                                                    disabled={isLaunching}
                                                >
                                                    <Play size={14} />
                                                    Launch Automation
                                                </motion.button>
                                            ) : (
                                                <button 
                                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                                    disabled
                                                >
                                                    Pending Setup
                                                </button>
                                            )}

                                            <motion.button 
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className={`${styles.btn} ${styles.btnDelete}`}
                                                onClick={() => handleDeleteClick(draft.id)}
                                                aria-label="Remove draft"
                                            >
                                                <Trash2 size={14} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Launch confirmation dialog */}
            <AnimatePresence>
                {confirmLaunchId && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={styles.modalContent}
                        >
                            <div className={styles.modalHeader}>
                                <AlertTriangle size={24} className={styles.warningIcon} />
                                <h2 className={styles.modalTitle}>Launch Automation?</h2>
                            </div>
                            <div className={styles.modalBody}>
                                <p className={styles.modalText}>
                                    This will start running automatically. Continue?
                                </p>
                            </div>
                            <div className={styles.modalFooter}>
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => setConfirmLaunchId(null)}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    onClick={handleLaunchConfirm}
                                >
                                    Launch Now
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete confirmation dialog */}
            <AnimatePresence>
                {pendingDeleteId && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={styles.modalOverlay}
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={styles.modalContent}
                        >
                            <div className={styles.modalHeader}>
                                <AlertTriangle size={24} className={styles.deleteWarningIcon} />
                                <h2 className={styles.modalTitle}>Remove Draft?</h2>
                            </div>
                            <div className={styles.modalBody}>
                                <p className={styles.modalText}>
                                    Are you sure you want to remove this automation from the queue? This action cannot be undone.
                                </p>
                            </div>
                            <div className={styles.modalFooter}>
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => setPendingDeleteId(null)}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className={`${styles.btn} ${styles.btnDanger}`}
                                    onClick={handleDeleteConfirm}
                                >
                                    Remove Draft
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
