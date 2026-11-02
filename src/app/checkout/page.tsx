"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    Sparkles, RefreshCw, CreditCard, Lock, Calendar, Check
} from "lucide-react";
import Logo from "../../components/Logo";
import styles from "../setup/setup.module.css";

interface Opportunity {
    id: string;
    title: string;
    description: string;
    hoursSaved: number;
    confidence: number;
    impact: string;
    complexity: "Low" | "Medium" | "High";
    compliance: string;
    role: string;
    apps: string[];
}

const OPPORTUNITIES: Opportunity[] = [
    {
        id: "ops-onboarding",
        title: "Client Onboarding Setup",
        description: "Creates workspace folders, sends Slack greeting messages, and prepares client folders once a service agreement is signed.",
        hoursSaved: 24,
        confidence: 96,
        impact: "Reduces setup time & automates shared Drive folders.",
        complexity: "Medium",
        compliance: "High (GDPR isolated data)",
        role: "ops",
        apps: ["Gmail", "Slack", "Google Drive"]
    },
    {
        id: "sales-qualification",
        title: "Inbound Lead Qualification & CRM Sync",
        description: "Monitors incoming emails, evaluates qualification fit using artificial intelligence, and records details in your CRM.",
        hoursSaved: 20,
        confidence: 98,
        impact: "Enables instant response routing & logs to Google Sheets / CRM.",
        complexity: "Low",
        compliance: "Medium (Enriched profiles)",
        role: "sales",
        apps: ["Gmail", "Slack", "Google Sheets"]
    },
    {
        id: "finance-reconciliation",
        title: "PDF Invoice Processing & Reconciliation",
        description: "Scans email inboxes for receipts, extracts line-item totals using AI, and cross-checks transactions.",
        hoursSaved: 28,
        confidence: 99,
        impact: "Zero manual data entry & reconciliation errors.",
        complexity: "High",
        compliance: "High (PCI credentials isolated)",
        role: "finance",
        apps: ["Gmail", "Stripe", "Google Sheets"]
    },
    {
        id: "support-triaging",
        title: "Customer Support Intelligent Triaging",
        description: "Ingests client help requests, routes by priority levels, queries internal documentation library, and drafts response options.",
        hoursSaved: 18,
        confidence: 94,
        impact: "Auto-categorizes issues and alerts support channels.",
        complexity: "Medium",
        compliance: "Medium (PII anonymization rules)",
        role: "support",
        apps: ["Gmail", "Slack", "Notion"]
    },
    {
        id: "admin-auditing",
        title: "Smart Document Review & Compliance Loop",
        description: "Scans corporate legal files or NDA documents, matches clauses against policy models, and lists deviations.",
        hoursSaved: 16,
        confidence: 92,
        impact: "Automates initial contract audits with pre-approved parameters.",
        complexity: "Medium",
        compliance: "High (Encrypted client isolation)",
        role: "admin",
        apps: ["Google Drive", "Slack"]
    },
    {
        id: "marketing-monitoring",
        title: "Competitor Intelligence & Brand Alert Hub",
        description: "Monitors target market updates, aggregates RSS publications, summarizes alerts using local intelligence, and alerts channels.",
        hoursSaved: 12,
        confidence: 88,
        impact: "Real-time market insights feed directly to operations chat.",
        complexity: "Low",
        compliance: "Low (Public web scraper only)",
        role: "marketing",
        apps: ["Slack", "Gmail"]
    }
];

const PRICING_DB: Record<string, { employeeName: string; employeeTitle: string; setupFee: number; monthlyPlan: number; desc: string }> = {
    sales: { employeeName: "Elena", employeeTitle: "Sales AI Employee", setupFee: 250, monthlyPlan: 450, desc: "Leads enrichment, automatic inbound qualification, and CRM logging." },
    finance: { employeeName: "Marcus", employeeTitle: "Finance Analyst", setupFee: 350, monthlyPlan: 600, desc: "Invoice parsing, billing reminders, ledger matching, and cost audits." },
    ops: { employeeName: "Sophia", employeeTitle: "Operations Director", setupFee: 300, monthlyPlan: 550, desc: "Project directory provisioning, scheduling automation, and team onboarding." },
    support: { employeeName: "Alex", employeeTitle: "Support Manager", setupFee: 250, monthlyPlan: 500, desc: "Automatic ticket classification, draft responses from KB, and escalation." },
    recruiting: { employeeName: "David", employeeTitle: "Recruiting Coordinator", setupFee: 300, monthlyPlan: 550, desc: "Resume parsing, candidate mapping, calendar sync, and feedback drafts." },
    marketing: { employeeName: "Zara", employeeTitle: "Marketing Specialist", setupFee: 200, monthlyPlan: 400, desc: "Social monitoring, campaign analytics, and automatic brand alerts." },
    admin: { employeeName: "Oliver", employeeTitle: "Administrative Assistant", setupFee: 250, monthlyPlan: 450, desc: "NDA drafting, document verification, audit preparation, and log analysis." }
};

function CheckoutContent() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [isLoaded, setIsLoaded] = useState(false);
    
    // Core parameters stored from setup
    const [companyBrief, setCompanyBrief] = useState("");
    const [targetProcess, setTargetProcess] = useState("");
    const [selectedOpportunityId, setSelectedOpportunityId] = useState("ops-onboarding");
    const [adaptiveAnswers, setAdaptiveAnswers] = useState<Record<string, string>>({});

    // UI state
    const [cardHolder, setCardHolder] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvc, setCardCvc] = useState("");
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState("");

    // Load data from setup onboarding cache
    useEffect(() => {
        const saved = localStorage.getItem("blonk_onboarding_state_v2");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.companyBrief) setCompanyBrief(parsed.companyBrief);
                if (parsed.targetProcess) setTargetProcess(parsed.targetProcess);
                if (parsed.selectedOpportunityId) setSelectedOpportunityId(parsed.selectedOpportunityId);
                if (parsed.adaptiveAnswers) setAdaptiveAnswers(parsed.adaptiveAnswers);
            } catch (e) {
                console.error("Failed to parse setup state on checkout:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Get selected active opportunity
    const activeOpportunity = useMemo(() => {
        return OPPORTUNITIES.find(o => o.id === selectedOpportunityId) || OPPORTUNITIES[0];
    }, [selectedOpportunityId]);

    // Retrieve pricing variables dynamically based on AI employee role
    const pricing = useMemo(() => {
        return PRICING_DB[activeOpportunity.role] || PRICING_DB.ops;
    }, [activeOpportunity]);

    // Calculate dates
    const dates = useMemo(() => {
        const trialEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days free trial
        return {
            trialEndFormatted: trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        };
    }, []);

    // Simulated card validation & payment
    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPaymentError("");

        if (!cardHolder || !cardNumber || !cardExpiry || !cardCvc) {
            setPaymentError("Please fill out all payment fields to authorize checkout.");
            return;
        }

        if (cardNumber.replace(/\s+/g, "").length < 16) {
            setPaymentError("Invalid card number format. Please check your card info.");
            return;
        }

        setIsProcessing(true);

        setTimeout(async () => {
            try {
                const setupRes = await fetch("/api/setup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        firmName: activeOpportunity.title,
                        industry: activeOpportunity.role.toUpperCase(),
                        teamSize: "6-20 Operators",
                        businessModel: "B2B",
                        toolStack: activeOpportunity.apps,
                        dataLocation: activeOpportunity.apps[0] || "Gmail",
                        selectedBlueprintId: activeOpportunity.id,
                        aiEmployee: activeOpportunity.role,
                        problemDescription: `Company brief: ${companyBrief}. Process: ${targetProcess}. Answers: ${JSON.stringify(adaptiveAnswers)}`,
                        credentials: {}
                    })
                });

                localStorage.removeItem("blonk_onboarding_state_v2");

                if (setupRes.ok) {
                    window.location.href = "/setup";
                } else {
                    setPaymentError("Verification failed: Secure container registry could not validate workspace. Please try again.");
                    setIsProcessing(false);
                }
            } catch (err) {
                setPaymentError("Network timeout: Unable to synchronize credentials vault. Please retry.");
                setIsProcessing(false);
            }
        }, 1800);
    };

    if (status === "loading" || !isLoaded) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className={styles.spinning} size={32} color="#0F172A" />
                <p>Loading secure billing portal...</p>
            </div>
        );
    }

    if (status === "unauthenticated") {
        router.replace("/login");
        return null;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                {/* Header & Stepper Timeline */}
                <div className={styles.headerBar}>
                    <div className={styles.logo} style={{ display: "flex", alignItems: "center" }}>
                        <Logo height={24} />
                    </div>
                    <div className={styles.stepper}>
                        {[
                            { num: 1, label: "Tell Us About You" },
                            { num: 2, label: "Pick Your Automation" },
                            { num: 3, label: "Review Your Plan" },
                            { num: 4, label: "Confirm & Pay" },
                            { num: 5, label: "Go Live" }
                        ].map(s => (
                            <div key={s.num} className={`${styles.stepperStep} ${4 === s.num ? styles.stepActive : ""} ${4 > s.num ? styles.stepCompleted : ""}`}>
                                <div className={styles.stepCircle}>
                                    {4 > s.num ? <Check size={10} /> : s.num}
                                </div>
                                <span className={styles.stepText}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Intro Header */}
                <div className={styles.introHeader}>
                    <span className={styles.trialBadge}>2-day free trial included</span>
                    <h1 className={styles.largeTitle}>Confirm &amp; Pay</h1>
                    <p className={styles.introText}>Review your order summary and securely authorize your setup below.</p>
                </div>

                {/* Centered checkout form area */}
                <div className={styles.activationContainer}>
                    {/* Horizontal AI Employee summary card */}
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
                            <span className={styles.planSummaryLabel}>Strategy Blueprint</span>
                            <span className={styles.planSummaryValue}>{activeOpportunity.title}</span>
                        </div>
                        <div className={styles.planSummaryRow}>
                            <span className={styles.planSummaryLabel}>Estimated Savings</span>
                            <span className={styles.planSummaryValue} style={{ color: "#34D186" }}>
                                {activeOpportunity.hoursSaved} Hours / month
                            </span>
                        </div>
                    </div>

                    {paymentError && (
                        <div className={styles.errorAlert}>
                            <div>{paymentError}</div>
                        </div>
                    )}

                    <form onSubmit={handlePaySubmit} className={styles.checklistCard} style={{ gap: "18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0F172A" }}>One-time setup fee</div>
                                <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "3px" }}>Charged immediately to configure your workspace</div>
                            </div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0F172A" }}>€{pricing.setupFee}</div>
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderTop: "1px dashed #E2E8F0", paddingTop: "16px" }}>
                            <div>
                                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#0F172A" }}>{pricing.employeeTitle} Subscription</div>
                                <div style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "3px" }}>Monthly plan starts after 2-day trial</div>
                            </div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#0F172A" }}>
                                €{pricing.monthlyPlan}<span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B" }}>/mo</span>
                            </div>
                        </div>

                        <div className={styles.statusBannerCard} style={{ padding: "14px 16px" }}>
                            <Calendar size={14} className={styles.statusIcon} />
                            <div style={{ fontSize: "0.75rem", color: "#475569", lineHeight: 1.5 }}>
                                <strong>Payment Schedule:</strong> Today you pay the setup fee (<strong>€{pricing.setupFee}</strong>). Monthly subscription starts after trial ends on <strong>{dates.trialEndFormatted}</strong>. Cancel anytime.
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Cardholder Name</label>
                                <input
                                    type="text"
                                    className={styles.textareaField}
                                    style={{ padding: "12px 16px" }}
                                    placeholder="e.g. Elena Smith"
                                    value={cardHolder}
                                    onChange={e => setCardHolder(e.target.value)}
                                    required
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label className={styles.inputLabel}>Card Number</label>
                                <input
                                    type="text"
                                    className={styles.textareaField}
                                    style={{ padding: "12px 16px" }}
                                    placeholder="•••• •••• •••• ••••"
                                    maxLength={19}
                                    value={cardNumber}
                                    onChange={e => {
                                        const rawVal = e.target.value.replace(/\D/g, "");
                                        const matches = rawVal.match(/.{1,4}/g);
                                        setCardNumber(matches ? matches.join(" ") : rawVal);
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Expires</label>
                                    <input
                                        type="text"
                                        className={styles.textareaField}
                                        style={{ padding: "12px 16px" }}
                                        placeholder="MM / YY"
                                        maxLength={7}
                                        value={cardExpiry}
                                        onChange={e => {
                                            const rawVal = e.target.value.replace(/\D/g, "");
                                            if (rawVal.length > 2) {
                                                setCardExpiry(`${rawVal.slice(0, 2)} / ${rawVal.slice(2, 4)}`);
                                            } else {
                                                setCardExpiry(rawVal);
                                            }
                                        }}
                                        required
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>CVC</label>
                                    <input
                                        type="password"
                                        className={styles.textareaField}
                                        style={{ padding: "12px 16px" }}
                                        placeholder="•••"
                                        maxLength={4}
                                        value={cardCvc}
                                        onChange={e => setCardCvc(e.target.value.replace(/\D/g, ""))}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* submit handled by sticky bar below */}
                    </form>

                    <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "0.72rem", color: "#94A3B8", fontWeight: 700 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Lock size={11} /> Secured Encryption</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Check size={11} /> Cancel Online Anytime</span>
                    </div>
                </div>
            </div>

            {/* ── Identical sticky action bar as /setup ── */}
            <div className={styles.stickyActionContainer}>
                <div className={styles.stickyActionBar}>
                    <button onClick={() => router.push("/setup")} className={styles.actionBackBtn}>
                        Back
                    </button>
                    <button
                        form="checkout-form"
                        onClick={handlePaySubmit as any}
                        disabled={isProcessing}
                        className={styles.actionContinueBtn}
                    >
                        {isProcessing
                            ? <><RefreshCw size={14} className={styles.spinning} /> Confirming...</>
                            : <><span>Confirm &amp; Pay</span><Lock size={14} /></>}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className={styles.loadingContainer}><p>Opening checkout portal...</p></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
