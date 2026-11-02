"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, Check, Server, ArrowRight } from "lucide-react";
import Logo from "../../../components/Logo";
import styles from "../../setup/setup.module.css";

const PRICING_DB: Record<string, { employeeName: string; employeeTitle: string; setupFee: number; monthlyPlan: number; desc: string }> = {
    sales:     { employeeName: "Elena",  employeeTitle: "Sales AI Employee",      setupFee: 250, monthlyPlan: 450, desc: "Leads enrichment, automatic inbound qualification, and CRM logging." },
    finance:   { employeeName: "Marcus", employeeTitle: "Finance Analyst",         setupFee: 350, monthlyPlan: 600, desc: "Invoice parsing, billing reminders, ledger matching, and cost audits." },
    ops:       { employeeName: "Sophia", employeeTitle: "Operations Director",     setupFee: 300, monthlyPlan: 550, desc: "Project directory provisioning, scheduling automation, and team onboarding." },
    support:   { employeeName: "Alex",   employeeTitle: "Support Manager",         setupFee: 250, monthlyPlan: 500, desc: "Automatic ticket classification, draft responses from KB, and escalation." },
    recruiting:{ employeeName: "David",  employeeTitle: "Recruiting Coordinator",  setupFee: 300, monthlyPlan: 550, desc: "Resume parsing, candidate mapping, calendar sync, and feedback drafts." },
    marketing: { employeeName: "Zara",   employeeTitle: "Marketing Specialist",    setupFee: 200, monthlyPlan: 400, desc: "Social monitoring, campaign analytics, and automatic brand alerts." },
    admin:     { employeeName: "Oliver", employeeTitle: "Administrative Assistant", setupFee: 250, monthlyPlan: 450, desc: "NDA drafting, document verification, audit preparation, and log analysis." }
};

const STEPS = [
    { num: 1, label: "Tell Us About You" },
    { num: 2, label: "Pick Your Automation" },
    { num: 3, label: "Review Your Plan" },
    { num: 4, label: "Confirm & Pay" },
    { num: 5, label: "Go Live" }
];

export default function DeployClient() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [orderStatus, setOrderStatus] = useState<string>("NOT_STARTED");
    const [progress, setProgress] = useState(10);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/activation");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                    const activeId = data.user.activationState?.activeOrderId;
                    if (activeId) setOrderId(activeId);
                }
            } catch (err) {
                console.error("Failed to load user setup details:", err);
            }
        }
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!orderId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders?id=${orderId}`);
                if (!res.ok) throw new Error("Connection failed");
                const data = await res.json();

                setOrderStatus(data.status || "NOT_STARTED");

                const statusMap: Record<string, number> = {
                    PAYMENT_RECEIVED: 15,
                    PROVISIONING: 35,
                    INSTALLING_N8N: 55,
                    SERVER_READY: 75,
                    WORKFLOW_IMPORTED: 90,
                    WAITING_CREDENTIALS: 100,
                    CREDENTIALS_RECEIVED: 100,
                    COMPLETED: 100
                };
                setProgress(statusMap[data.status] || 15);

                if (["WAITING_CREDENTIALS", "CREDENTIALS_RECEIVED", "COMPLETED"].includes(data.status)) {
                    clearInterval(interval);
                    await handleActivationSuccess();
                }
            } catch (err) {
                console.error("Failed to poll order status:", err);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [orderId]);

    const handleActivationSuccess = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/activation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "ACTIVATED",
                    metadata: { firstWorkflowDeployed: true, activationCompletedAt: new Date().toISOString() }
                })
            });
            if (res.ok) {
                setTimeout(() => router.push("/activation/success"), 1000);
            }
        } catch (err) {
            console.error("Error setting activation status:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const pricing = useMemo(() => {
        const role = profile?.aiEmployee?.toLowerCase() || "ops";
        return PRICING_DB[role] || PRICING_DB.ops;
    }, [profile]);

    const currentProgress = orderStatus === "FAILED" ? 45 : progress;

    const checklistSteps = [
        { label: "Setting up your workspace",  status: currentProgress >= 35  ? "completed" : "loading" },
        { label: "Connecting your apps",        status: currentProgress >= 75  ? "completed" : (currentProgress >= 35  ? "loading" : "pending") },
        { label: "Preparing your automation",   status: currentProgress >= 90  ? "completed" : (currentProgress >= 75  ? "loading" : "pending") },
        { label: "Ready to launch",             status: currentProgress >= 100 ? "completed" : "pending" }
    ];

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>

                {/* ── Identical header/stepper as /setup ── */}
                <div className={styles.headerBar}>
                    <div className={styles.logo} style={{ display: "flex", alignItems: "center" }}>
                        <Logo height={24} />
                    </div>
                    <div className={styles.stepper}>
                        {STEPS.map(s => (
                            <div
                                key={s.num}
                                className={`${styles.stepperStep} ${5 === s.num ? styles.stepActive : ""} ${5 > s.num ? styles.stepCompleted : ""}`}
                            >
                                <div className={styles.stepCircle}>
                                    {5 > s.num ? <Check size={10} /> : s.num}
                                </div>
                                <span className={styles.stepText}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Page title ── */}
                <div className={styles.introHeader}>
                    <h1 className={styles.largeTitle}>Go Live</h1>
                    <p className={styles.introText}>Setting up your workspace. This usually takes a few minutes.</p>
                </div>

                {/* ── Content ── */}
                <div className={styles.activationContainer}>

                    {/* AI Employee summary */}
                    <div className={styles.employeeSummaryCard}>
                        <div className={styles.employeeAvatarGroup}>
                            <div className={styles.employeeAvatar}>
                                <Sparkles size={16} color="#34D186" />
                            </div>
                            <div>
                                <h3 className={styles.employeeName}>{pricing.employeeName}</h3>
                                <p className={styles.employeeTitle}>{pricing.employeeTitle}</p>
                            </div>
                        </div>
                        <p className={styles.employeeDesc}>{pricing.desc}</p>
                        <div className={styles.planSummaryRow}>
                            <span className={styles.planSummaryLabel}>Workspace Plan</span>
                            <span className={styles.planSummaryValue}>{profile?.firmName || "Client Onboarding Setup"}</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", fontWeight: 800, color: "#0F172A" }}>
                            <span>Installation Progress</span>
                            <span>{currentProgress}%</span>
                        </div>
                        <div style={{ height: "7px", background: "#F1F5F9", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ width: `${currentProgress}%`, height: "100%", background: "#34D186", transition: "width 0.4s ease" }} />
                        </div>
                        <span style={{ fontSize: "0.73rem", color: "#64748B" }}>
                            Almost there — this usually takes 15–30 minutes.
                        </span>
                    </div>

                    {/* Checklist card */}
                    <div className={styles.checklistCard}>
                        {checklistSteps.map((item, idx) => {
                            const isComp = item.status === "completed";
                            const isLoad = item.status === "loading";
                            return (
                                <div key={idx} className={styles.checklistRow}>
                                    <div style={{
                                        width: "20px", height: "20px", borderRadius: "50%",
                                        background: isComp ? "rgba(52,209,134,0.12)" : isLoad ? "rgba(52,209,134,0.05)" : "#FFFFFF",
                                        border: isComp ? "none" : "1.5px solid #E2E8F0",
                                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                                    }}>
                                        {isComp ? <Check size={10} color="#34D186" strokeWidth={3} /> :
                                         isLoad ? <RefreshCw size={10} className={styles.spinning} color="#34D186" /> :
                                         <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#CBD5E1" }} />}
                                    </div>
                                    <span className={`${styles.checklistText} ${isComp ? styles.checklistCompleted : isLoad ? styles.checklistActive : ""}`}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Status banner */}
                    <div className={styles.statusBannerCard}>
                        <Server size={18} className={styles.statusIcon} />
                        <div>
                            <h3 className={styles.statusTextTitle}>Workspace Configuration</h3>
                            <p className={styles.statusTextDesc}>
                                A specialist is configuring your workspace setup. Your data is private and secure.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Identical sticky action bar as /setup ── */}
            <div className={styles.stickyActionContainer}>
                <div className={styles.stickyActionBar}>
                    <button
                        onClick={handleActivationSuccess}
                        disabled={isSaving}
                        className={styles.actionContinueBtn}
                    >
                        {isSaving
                            ? <><RefreshCw size={14} className={styles.spinning} /> Activating...</>
                            : <><span>Go Live</span><ArrowRight size={14} /></>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}
