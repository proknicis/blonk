"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Check, RefreshCw, Sparkles, BarChart2, Clock } from "lucide-react";
import Logo from "../../../components/Logo";
import styles from "../../setup/setup.module.css";

const STEPS = [
    { num: 1, label: "Tell Us About You" },
    { num: 2, label: "Pick Your Automation" },
    { num: 3, label: "Review Your Plan" },
    { num: 4, label: "Confirm & Pay" },
    { num: 5, label: "Go Live" },
];

export default function SuccessClient() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/activation");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                }
            } catch (err) {
                console.error("Failed to load user setup details:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleEnterDashboard = async () => {
        setUpdating(true);
        try {
            const res = await fetch("/api/activation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ACTIVATED", metadata: { onboardingComplete: true } })
            });
            if (res.ok) window.location.href = "/dashboard";
        } catch (err) {
            console.error("Failed to route to dashboard:", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw size={28} className={styles.spinning} color="#0F172A" />
                <p>Loading your workspace...</p>
            </div>
        );
    }

    const metadata     = profile.activationState || {};
    const selectedName = metadata.selectedWorkflowName || "Autonomous Workflow Loop";
    const firmName     = profile.firmName || "Your Workspace";

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                {/* ── Identical header / stepper — all 5 steps completed ── */}
                <div className={styles.headerBar}>
                    <div className={styles.logo} style={{ display: "flex", alignItems: "center" }}>
                        <Logo height={24} />
                    </div>
                    <div className={styles.stepper}>
                        {STEPS.map(s => (
                            <div
                                key={s.num}
                                className={`${styles.stepperStep} ${styles.stepCompleted}`}
                            >
                                <div className={styles.stepCircle}>
                                    <Check size={10} />
                                </div>
                                <span className={styles.stepText}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Hero success header ── */}
                <div className={styles.introHeader} style={{ paddingTop: "36px" }}>
                    {/* Big green check icon */}
                    <div style={{
                        width: "60px", height: "60px", borderRadius: "50%",
                        background: "rgba(52,209,134,0.1)", border: "2px solid rgba(52,209,134,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 20px"
                    }}>
                        <CheckCircle2 size={30} color="#34D186" />
                    </div>
                    <h1 className={styles.largeTitle}>You're Live! 🎉</h1>
                    <p className={styles.introText}>
                        Your automation is active and running on BLONK infrastructure. Head to your dashboard to monitor it.
                    </p>
                </div>

                {/* ── Summary cards ── */}
                <div className={styles.activationContainer}>

                    {/* Workspace activation card */}
                    <div className={styles.employeeSummaryCard}>
                        <div className={styles.employeeAvatarGroup}>
                            <div className={styles.employeeAvatar}>
                                <Sparkles size={16} color="#34D186" />
                            </div>
                            <div>
                                <h3 className={styles.employeeName}>{firmName}</h3>
                                <p className={styles.employeeTitle}>Workspace activated successfully</p>
                            </div>
                        </div>
                        <div className={styles.planSummaryRow}>
                            <span className={styles.planSummaryLabel}>Active Workflow</span>
                            <span className={styles.planSummaryValue}>{selectedName}</span>
                        </div>
                        <div className={styles.planSummaryRow}>
                            <span className={styles.planSummaryLabel}>Next Scheduled Run</span>
                            <span className={styles.planSummaryValue}>Hourly (top of the hour)</span>
                        </div>
                        <div className={styles.planSummaryRow}>
                            <span className={styles.planSummaryLabel}>Logging Destination</span>
                            <span className={styles.planSummaryValue}>Workspace History Ledger</span>
                        </div>
                    </div>

                    {/* What's next checklist */}
                    <div className={styles.checklistCard}>
                        <span style={{ fontSize: "0.68rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            What happens next
                        </span>

                        {[
                            { icon: <BarChart2 size={14} color="#34D186" />, text: "Monitor your live automation runs in real-time" },
                            { icon: <Clock size={14} color="#34D186" />, text: "View execution logs and performance history" },
                            { icon: <Sparkles size={14} color="#34D186" />, text: "Expand with additional AI employees anytime" },
                        ].map((item, idx) => (
                            <div key={idx} className={styles.checklistRow}>
                                <div style={{
                                    width: "28px", height: "28px", borderRadius: "8px",
                                    background: "rgba(52,209,134,0.08)",
                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                }}>
                                    {item.icon}
                                </div>
                                <span className={styles.checklistText} style={{ color: "#0F172A", fontWeight: 700 }}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Status banner */}
                    <div className={styles.statusBannerCard}>
                        <CheckCircle2 size={18} className={styles.statusIcon} />
                        <div>
                            <h3 className={styles.statusTextTitle}>Workspace is fully operational</h3>
                            <p className={styles.statusTextDesc}>
                                Your dedicated execution node is active and your first automation has been deployed. You can manage everything from your dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Identical sticky action bar ── */}
            <div className={styles.stickyActionContainer}>
                <div className={styles.stickyActionBar}>
                    <button
                        onClick={handleEnterDashboard}
                        disabled={updating}
                        className={styles.actionContinueBtn}
                    >
                        {updating
                            ? <><RefreshCw size={14} className={styles.spinning} /> Entering...</>
                            : <><span>Enter Dashboard</span><ArrowRight size={14} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}
