"use client";

import React, { useEffect, useState, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, ShieldCheck, Play, Check } from "lucide-react";
import styles from "../activation.module.css";

export default function ReviewClient() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [credentials, setCredentials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const lastFocusRef = useRef<HTMLElement | null>(null);
    const dialogRef = useRef<HTMLDivElement>(null);
    const confirmBtnRef = useRef<HTMLButtonElement>(null);
    const headingId = useId();

    const fetchState = async () => {
        try {
            const res = await fetch("/api/activation");
            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                setCredentials(data.credentials || []);
            }
        } catch (err) {
            console.error("Failed to load state details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchState();
    }, []);

    useEffect(() => {
        if (!showConfirm) return;
        confirmBtnRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleCancel();
                return;
            }
            if (e.key !== "Tab") return;

            const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'
            );
            if (!focusable || focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [showConfirm]);

    const metadata = profile?.activationState || {};
    const selectedName = metadata.selectedWorkflowName || "Autonomous Workflow Loop";
    const requiredSystems = metadata.requiredSystems || [];

    const connectStatusMap = React.useMemo(() => {
        const map: Record<string, string> = {};
        credentials.forEach(c => {
            map[c.provider.toLowerCase()] = c.status;
        });
        return map;
    }, [credentials]);

    const connectedCount = requiredSystems.filter((sys: string) => {
        return connectStatusMap[sys.toLowerCase()] === "Connected";
    }).length;

    const readinessPct = requiredSystems.length > 0 
        ? Math.round((connectedCount / requiredSystems.length) * 100)
        : 100;

    const handleDeployClick = () => {
        lastFocusRef.current = document.activeElement as HTMLElement;
        setShowConfirm(true);
    };

    const handleCancel = () => {
        setShowConfirm(false);
        setTimeout(() => lastFocusRef.current?.focus(), 50);
    };

    const handleConfirmDeploy = async () => {
        setShowConfirm(false);
        setUpdating(true);
        try {
            const res = await fetch("/api/activation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "DEPLOYING"
                })
            });

            if (res.ok) {
                const orderRes = await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        workflowName: selectedName,
                        price: 0,
                        templateId: profile.selectedWorkflowId
                    })
                });

                const orderData = await orderRes.json();
                if (orderRes.ok && orderData.success) {
                    await fetch("/api/activation", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            metadata: { activeOrderId: orderData.orderId }
                        })
                    });
                }

                router.push("/activation/deploy");
            }
        } catch (err) {
            console.error("Failed to start deployment:", err);
        } finally {
            setUpdating(false);
        }
    };

    const descId = useId();

    if (loading || !profile) {
        return (
            <div className={styles.loadingInner}>
                <p>Decoding system settings...</p>
            </div>
        );
    }

    return (
        <main className={styles.container} aria-label="Review final workspace activation specifications">
            <div className={styles.stepper}>
                <span className={styles.step}>1. Analysis</span>
                <span className={styles.step}>2. Blueprints</span>
                <span className={styles.step}>3. Connections</span>
                <span className={`${styles.step} ${styles.stepActive}`}>4. Readiness</span>
                <span className={styles.step}>5. Launch</span>
            </div>

            <header className={styles.header}>
                <h1 className={styles.title}>Deployment Readiness</h1>
                <p className={styles.subtitle}>
                    Confirm final configurations. Once launched, BLONK builds your container on secure fleet servers.
                </p>
            </header>

            <div className={styles.grid}>
                <section className={styles.panel} aria-labelledby="readiness-summary-title">
                    <div className={styles.panelHeader}>
                        <ShieldCheck size={16} color="#10B981" />
                        <h2 id="readiness-summary-title" className={styles.panelTitle}>Sovereign Pipeline</h2>
                    </div>

                    <div className={styles.summaryBox}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Selected Blueprint</span>
                            <span className={styles.summaryValue}>{selectedName}</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Deployment Target</span>
                            <span className={styles.summaryValue}>Dedicated Docker Node (VPS Cluster Central)</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Credentials Verification</span>
                            <span className={styles.summaryValue}>
                                {connectedCount} of {requiredSystems.length} integrations connected.
                            </span>
                        </div>
                    </div>
                </section>

                <section className={styles.panel} aria-labelledby="checklist-title">
                    <div className={styles.panelHeader}>
                        <Play size={16} color="#10B981" />
                        <h2 id="checklist-title" className={styles.panelTitle}>Readiness Score</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
                        <div style={{
                            width: "120px", height: "120px", borderRadius: "50%",
                            border: `8px solid ${readinessPct === 100 ? "#10B981" : "#E2E8F0"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "1.75rem", fontWeight: 900, color: "#0F172A"
                        }}>
                            {readinessPct}%
                        </div>

                        <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#334155" }}>
                                <Check size={14} color="#10B981" /> Profiling check complete
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#334155" }}>
                                <Check size={14} color="#10B981" /> Secure keys resolved
                            </li>
                            <li style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", color: "#334155" }}>
                                <Check size={14} color="#10B981" /> VPS Cluster allocations confirmed
                            </li>
                        </ul>
                    </div>
                </section>
            </div>

            {showConfirm && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }} role="presentation">
                    <div
                        ref={dialogRef}
                        style={{
                            background: "#FFFFFF", padding: "32px", borderRadius: "16px",
                            border: "1px solid #E2E8F0", width: "450px", maxWidth: "90%",
                            display: "flex", flexDirection: "column", gap: "20px"
                        }}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby={headingId}
                        aria-describedby={descId}
                    >
                        <h3 id={headingId} style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0F172A", textTransform: "uppercase" }}>
                            Confirm Automation Launch
                        </h3>
                        <p id={descId} style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5 }}>
                            You are launching the <strong>{selectedName}</strong> workflow.
                            This will create a dedicated server allocation, sync connections, and activate live triggers.
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                            <button
                                className={styles.btnSecondary}
                                style={{ height: "38px", fontSize: "0.78rem" }}
                                onClick={handleCancel}
                                aria-label="Cancel and return to review checklist"
                            >
                                Cancel
                            </button>
                            <button
                                ref={confirmBtnRef}
                                className={styles.btnPrimary}
                                style={{ height: "38px", fontSize: "0.78rem" }}
                                onClick={handleConfirmDeploy}
                                aria-label={`Confirm deployment of ${selectedName}`}
                            >
                                <Play size={12} /> Confirm &amp; Deploy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className={styles.ctaRow}>
                <button
                    className={styles.btnSecondary}
                    onClick={() => router.push("/activation/connect")}
                    aria-label="Back to secure credentials screen"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    className={styles.btnPrimary}
                    onClick={handleDeployClick}
                    disabled={readinessPct < 100 || updating}
                    aria-label="Deploy first automation"
                >
                    {updating ? "Deploying..." : "Deploy Automation"} <ArrowRight size={16} />
                </button>
            </footer>
        </main>
    );
}
