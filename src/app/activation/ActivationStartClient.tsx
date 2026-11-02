"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Sparkles, ArrowRight, Check, Building2, BarChart2, Users,
    HardDrive, ShieldAlert, RefreshCw, ChevronRight
} from "lucide-react";
import Logo from "../../components/Logo";
import styles from "../setup/setup.module.css";

const STEPS = [
    { num: 1, label: "Tell Us About You" },
    { num: 2, label: "Pick Your Automation" },
    { num: 3, label: "Review Your Plan" },
    { num: 4, label: "Confirm & Pay" },
    { num: 5, label: "Go Live" },
];

const CURRENT_STEP = 5; // activation is the final step

export default function ActivationStartClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchState() {
            try {
                const res = await fetch("/api/activation");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                }
            } catch (err) {
                console.error("Failed to load user setup profile:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchState();
    }, []);

    const handleContinue = () => {
        setUpdating(true);
        router.push("/activation/recommendations");
    };

    if (loading || !profile) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw size={28} className={styles.spinning} color="#0F172A" />
                <p>Loading your workspace profile...</p>
            </div>
        );
    }

    const problemText = profile.problemDescription || "Workspace configuration ready.";
    const firmName   = profile.firmName   || "Your Organization";
    const industry   = profile.industry   || "Professional Services";
    const aiEmployee = profile.aiEmployee || "Operations";

    const getRecommendations = (role: string) => {
        const r = role.toLowerCase();
        if (r.includes("sales")) return {
            primary: { name: "Autonomous Inbound Qualification & Scoring", desc: "Parses new signups using AI, qualifies key accounts, and posts live alerts.", why: "Directly solves lead screening delays and automates manual CRM mapping." },
            alts: ["Public Record Profile Data Enrichment", "CRM Outbound Sync & Opportunity Creator"]
        };
        if (r.includes("finance")) return {
            primary: { name: "Automated Ledger Reconciliation Loop", desc: "Checks Stripe logs against bank files, matches transactions, and reports variance alerts.", why: "Addresses PDF invoice matching bottlenecks and secures payout integrity." },
            alts: ["PDF Invoice Parser & Data Extractor", "Dormant Account Balance Reminder Loop"]
        };
        return {
            primary: { name: "Client Onboarding & Project Workspace Setup", desc: "Orchestrates Slack channels, Notion docs, and Google Drive folders on client signup.", why: "Resolves client delivery delays and guarantees strict system standards." },
            alts: ["Operational Audit & System Telemetry Logger", "Helpdesk Query Response Draft Assistant"]
        };
    };

    const recs = getRecommendations(aiEmployee);
    const isQueued   = profile.provisioningStatus === "QUEUED";
    const isDegraded = profile.serverId && profile.serverStatus && profile.serverStatus !== "Active";

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                {/* ── Header / Stepper ── */}
                <div className={styles.headerBar}>
                    <div className={styles.logo} style={{ display: "flex", alignItems: "center" }}>
                        <Logo height={24} />
                    </div>
                    <div className={styles.stepper}>
                        {STEPS.map(s => (
                            <div
                                key={s.num}
                                className={`${styles.stepperStep} ${CURRENT_STEP === s.num ? styles.stepActive : ""} ${CURRENT_STEP > s.num ? styles.stepCompleted : ""}`}
                            >
                                <div className={styles.stepCircle}>
                                    {CURRENT_STEP > s.num ? <Check size={10} /> : s.num}
                                </div>
                                <span className={styles.stepText}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Page heading ── */}
                <div className={styles.introHeader}>
                    <h1 className={styles.largeTitle}>Your Workspace is Ready</h1>
                    <p className={styles.introText}>
                        BLONK has analyzed your setup and matched your automation blueprint. Review it below before going live.
                    </p>
                </div>

                {/* ── Content cards ── */}
                <div className={styles.activationContainer}>

                    {/* Profile summary card */}
                    <div className={styles.employeeSummaryCard}>
                        <div className={styles.employeeAvatarGroup}>
                            <div className={styles.employeeAvatar}>
                                <Building2 size={16} color="#34D186" />
                            </div>
                            <div>
                                <h3 className={styles.employeeName}>{firmName}</h3>
                                <p className={styles.employeeTitle}>{industry} · {aiEmployee} Focus</p>
                            </div>
                        </div>
                        <p className={styles.employeeDesc}>{problemText}</p>

                        {/* Infrastructure row */}
                        <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <HardDrive size={13} color={isQueued ? "#F59E0B" : isDegraded ? "#EF4444" : "#34D186"} />
                                <span style={{ fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.05em", color: "#0F172A" }}>
                                    {isQueued ? "Infrastructure Allocation Pending" : "Secure Execution Node Reserved"}
                                </span>
                            </div>
                            <div className={styles.planSummaryRow}>
                                <span className={styles.planSummaryLabel}>Reserved Host</span>
                                <span className={styles.planSummaryValue} style={{ color: isQueued ? "#F59E0B" : isDegraded ? "#EF4444" : "#34D186" }}>
                                    {isQueued ? "Awaiting Capacity Match" : (profile.serverName || "BLONK Cluster Engine")}
                                </span>
                            </div>
                            <div className={styles.planSummaryRow}>
                                <span className={styles.planSummaryLabel}>Region</span>
                                <span className={styles.planSummaryValue}>
                                    {isQueued ? "Frankfurt Pool" : `${profile.serverRegion || "Frankfurt, DE"} (${profile.serverProvider || "Hetzner Cloud"})`}
                                </span>
                            </div>

                            {isQueued && (
                                <div style={{ padding: "10px 14px", background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "10px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                    <ShieldAlert size={13} color="#F59E0B" style={{ marginTop: "2px", flexShrink: 0 }} />
                                    <p style={{ fontSize: "0.72rem", color: "#B45309", margin: 0, fontWeight: 700, lineHeight: 1.4 }}>
                                        No active hosts are currently vacant. Your profile is queued for automatic allocation.
                                    </p>
                                </div>
                            )}
                            {isDegraded && (
                                <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                    <ShieldAlert size={13} color="#EF4444" style={{ marginTop: "2px", flexShrink: 0 }} />
                                    <p style={{ fontSize: "0.72rem", color: "#B91C1C", margin: 0, fontWeight: 700, lineHeight: 1.4 }}>
                                        Temporary degraded state. Your engine is completing a routine check. Automatic recovery is active.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Matched automation card */}
                    <div className={styles.checklistCard}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "14px", borderBottom: "1px solid #F1F5F9" }}>
                            <Sparkles size={14} color="#34D186" />
                            <span style={{ fontSize: "0.68rem", fontWeight: 900, color: "#34D186", textTransform: "uppercase", letterSpacing: "0.06em" }}>Matched Automation</span>
                        </div>

                        <div style={{ background: "rgba(52,209,134,0.03)", border: "1.5px solid rgba(52,209,134,0.15)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.62rem", fontWeight: 900, color: "#2cb372", textTransform: "uppercase", letterSpacing: "0.04em" }}>Primary Recommendation</span>
                            <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0F172A", margin: 0, letterSpacing: "-0.01em" }}>{recs.primary.name}</h3>
                            <p style={{ fontSize: "0.78rem", color: "#64748B", margin: 0, lineHeight: 1.5 }}>{recs.primary.desc}</p>
                            <div style={{ fontSize: "0.72rem", color: "#475569", background: "#F8FAFC", borderRadius: "8px", padding: "10px 12px", lineHeight: 1.5 }}>
                                <strong>Why matched:</strong> {recs.primary.why}
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em" }}>Alternative blueprints</span>
                            {recs.alts.map((alt, idx) => (
                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <ChevronRight size={12} color="#CBD5E1" />
                                    <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>{alt}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Identical sticky action bar as /setup ── */}
            <div className={styles.stickyActionContainer}>
                <div className={styles.stickyActionBar}>
                    <button
                        onClick={handleContinue}
                        disabled={updating}
                        className={styles.actionContinueBtn}
                    >
                        {updating
                            ? <><RefreshCw size={14} className={styles.spinning} /> Loading...</>
                            : <><span>Continue to Blueprints</span><ArrowRight size={14} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
