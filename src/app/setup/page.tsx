"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "motion/react";
import { 
    ArrowRight, ArrowLeft, Check, Brain, Receipt, 
    TrendingUp, Users, Headphones, Radar, ShieldCheck, 
    Loader2, Building2, User
} from "lucide-react";
import styles from "./setup.module.css";

interface PrimaryBrainOption {
    id: string;
    title: string;
    shortName: string;
    description: string;
    icon: React.ElementType;
}

const PRIMARY_BRAINS: PrimaryBrainOption[] = [
    {
        id: "Finance & Accounting",
        title: "Finance & Accounting",
        shortName: "Finance",
        description: "Invoice extraction, ledger reconciliation, automated expense approvals & payment matching.",
        icon: Receipt
    },
    {
        id: "Sales & Inbound Leads",
        title: "Sales & Inbound Leads",
        shortName: "Sales",
        description: "Inbound lead qualification, CRM synchronization, contact enrichment & deal alerts.",
        icon: TrendingUp
    },
    {
        id: "HR & Internal Operations",
        title: "HR & Internal Operations",
        shortName: "HR & Operations",
        description: "Employee onboarding workspaces, document signing loops & compliance routing.",
        icon: Users
    },
    {
        id: "Customer Support Triaging",
        title: "Customer Support Triaging",
        shortName: "Support",
        description: "Intelligent ticket categorization, urgent escalation alerts & auto-draft replies.",
        icon: Headphones
    },
    {
        id: "Marketing & Competitor Alerts",
        title: "Marketing & Competitor Alerts",
        shortName: "Marketing",
        description: "Competitor website surveillance, pricing shift alerts & content intelligence.",
        icon: Radar
    }
];

const INDUSTRIES = [
    "Financial Services & Accounting",
    "Legal & Compliance",
    "Management Consulting",
    "Technology & SaaS",
    "Real Estate & Property Management",
    "E-commerce & Retail",
    "Healthcare & Medical",
    "Marketing & Agency",
    "Other Professional Services"
];

const COMPANY_SIZES = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "500+ employees"
];

function OnboardingContent() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // Steps: 1 = Account, 2 = Company, 3 = Primary Brain, 4 = Creation / Ready
    const [step, setStep] = useState(1);
    const [loadingInitial, setLoadingInitial] = useState(true);

    // Step 1: Account
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [jobTitle, setJobTitle] = useState("");

    // Step 2: Company
    const [companyName, setCompanyName] = useState("");
    const [website, setWebsite] = useState("");
    const [industry, setIndustry] = useState("Financial Services & Accounting");
    const [companySize, setCompanySize] = useState("1-10 employees");
    const [country, setCountry] = useState("Latvia");

    // Step 3: Primary Brain (Exactly 1 selectable)
    const [primaryBrain, setPrimaryBrain] = useState("Finance & Accounting");

    // Step 4: Creation & Ready
    const [isCreating, setIsCreating] = useState(false);
    const [creationProgress, setCreationProgress] = useState(0);
    const [isReady, setIsReady] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // 1. Auth Guard & Initial Data Autofill
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
            return;
        }

        if (status === "authenticated") {
            // Fetch existing user and company data from GET /api/setup
            const loadUserData = async () => {
                try {
                    const res = await fetch("/api/setup");
                    if (res.ok) {
                        const data = await res.json();
                        if (data.user) {
                            if (data.user.fullName) setFullName(data.user.fullName);
                            if (data.user.email) setEmail(data.user.email);
                            if (data.user.jobTitle) setJobTitle(data.user.jobTitle);
                        }
                        if (data.company) {
                            if (data.company.companyName) setCompanyName(data.company.companyName);
                            if (data.company.website) setWebsite(data.company.website);
                            if (data.company.industry) setIndustry(data.company.industry);
                            if (data.company.companySize) setCompanySize(data.company.companySize);
                            if (data.company.country) setCountry(data.company.country);
                        }
                        if (data.primaryBrain) {
                            setPrimaryBrain(data.primaryBrain);
                        }
                    }
                } catch (err) {
                    console.error("Failed to load initial setup data:", err);
                } finally {
                    setLoadingInitial(false);
                }
            };
            loadUserData();
        }
    }, [status, router]);

    // Fallback email from session if not yet populated
    useEffect(() => {
        if (session?.user?.email && !email) {
            setEmail(session.user.email);
        }
        if (session?.user?.name && !fullName) {
            setFullName(session.user.name);
        }
    }, [session, email, fullName]);

    // Step Handlers
    const handleNextToCompany = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            setErrorMessage("Please enter your full name.");
            return;
        }
        setErrorMessage("");
        setStep(2);
    };

    const handleNextToBrain = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim()) {
            setErrorMessage("Please enter your company name.");
            return;
        }
        setErrorMessage("");
        setStep(3);
    };

    const handleCreateBrain = async () => {
        setStep(4);
        setIsCreating(true);
        setIsReady(false);
        setCreationProgress(15);
        setErrorMessage("");

        // Progress simulation animation
        const timer1 = setTimeout(() => setCreationProgress(55), 500);
        const timer2 = setTimeout(() => setCreationProgress(85), 1100);

        try {
            // Send setup payload to database
            const res = await fetch("/api/setup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    jobTitle,
                    companyName,
                    website,
                    industry,
                    companySize,
                    country,
                    primaryBrain
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || "Failed to save configuration.");
            }

            setCreationProgress(100);
            setTimeout(() => {
                setIsCreating(false);
                setIsReady(true);
            }, 700);
        } catch (err: any) {
            console.error("Brain creation error:", err);
            setErrorMessage(err.message || "Something went wrong while initializing your brain.");
            setIsCreating(false);
            setStep(3); // return to selection on error
        } finally {
            clearTimeout(timer1);
            clearTimeout(timer2);
        }
    };

    const handleOpenBrain = () => {
        router.push("/dashboard/company-brain");
    };

    const selectedBrainConfig = PRIMARY_BRAINS.find(b => b.id === primaryBrain) || PRIMARY_BRAINS[0];

    if (loadingInitial) {
        return (
            <div className={styles.wrapper}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: "16px" }}>
                    <Loader2 size={28} className={styles.spinning} color="#111827" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#6B7280" }}>Initializing BLONK onboarding...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                {/* ─── Top Header Bar ─── */}
                <div className={styles.headerBar}>
                    <div className={styles.logo}>
                        BLONK<span className={styles.logo_dot} />
                    </div>

                    <div className={styles.stepper}>
                        {[
                            { num: 1, label: "Account" },
                            { num: 2, label: "Company" },
                            { num: 3, label: "Primary Brain" },
                            { num: 4, label: "Ready" }
                        ].map(s => {
                            const isCurrent = step === s.num;
                            const isPassed = step > s.num;
                            return (
                                <div 
                                    key={s.num} 
                                    className={`${styles.stepperStep} ${isCurrent ? styles.stepActive : ""} ${isPassed ? styles.stepCompleted : ""}`}
                                >
                                    <div className={styles.stepCircle} style={{
                                        background: isCurrent || isPassed ? "#111827" : "#F3F4F6",
                                        color: isCurrent || isPassed ? "#FFFFFF" : "#6B7280"
                                    }}>
                                        {isPassed ? <Check size={10} strokeWidth={3} /> : s.num}
                                    </div>
                                    <span className={styles.stepText}>{s.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {errorMessage && (
                    <div style={{
                        maxWidth: "680px",
                        margin: "12px auto 0",
                        width: "100%",
                        padding: "12px 16px",
                        background: "#FEF2F2",
                        border: "1px solid #FCA5A5",
                        borderRadius: "10px",
                        color: "#DC2626",
                        fontSize: "0.82rem",
                        fontWeight: 700
                    }}>
                        {errorMessage}
                    </div>
                )}

                {/* ─── Animated Step Content ─── */}
                <AnimatePresence mode="wait">
                    {/* STEP 1: ACCOUNT */}
                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22 }}
                            className={styles.onboardingCard}
                        >
                            <div className={styles.onboardingHeader}>
                                <div className={styles.stepTag}>
                                    <User size={13} /> Step 01 — Account Identity
                                </div>
                                <h1 className={styles.onboardingTitle}>Personalize your command identity</h1>
                                <p className={styles.onboardingDesc}>
                                    These credentials configure your operator signature across institutional automation nodes.
                                </p>
                            </div>

                            <form onSubmit={handleNextToCompany} className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={styles.inputField}
                                        placeholder="e.g. Alexander Vance"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Work Email</label>
                                    <input
                                        type="email"
                                        disabled
                                        className={`${styles.inputField} ${styles.inputFieldDisabled}`}
                                        value={email || session?.user?.email || ""}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Job Title</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="e.g. Managing Partner, COO, Head of Operations"
                                        value={jobTitle}
                                        onChange={e => setJobTitle(e.target.value)}
                                    />
                                </div>

                                <div className={styles.buttonRow} style={{ justifyContent: "flex-end" }}>
                                    <button type="submit" className={styles.primaryBtn}>
                                        Continue to Company <ArrowRight size={15} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 2: COMPANY */}
                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22 }}
                            className={styles.onboardingCard}
                        >
                            <div className={styles.onboardingHeader}>
                                <div className={styles.stepTag}>
                                    <Building2 size={13} /> Step 02 — Company Organization
                                </div>
                                <h1 className={styles.onboardingTitle}>Set up your firm profile</h1>
                                <p className={styles.onboardingDesc}>
                                    Define your company parameters to align AI decision thresholds and regional compliance rules.
                                </p>
                            </div>

                            <form onSubmit={handleNextToBrain} className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Company Name</label>
                                    <input
                                        type="text"
                                        required
                                        className={styles.inputField}
                                        placeholder="e.g. Vance Capital Advisory"
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Website</label>
                                    <input
                                        type="text"
                                        className={styles.inputField}
                                        placeholder="e.g. https://vanceadvisory.com"
                                        value={website}
                                        onChange={e => setWebsite(e.target.value)}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label className={styles.inputLabel}>Industry</label>
                                    <select
                                        className={styles.selectField}
                                        value={industry}
                                        onChange={e => setIndustry(e.target.value)}
                                    >
                                        {INDUSTRIES.map(ind => (
                                            <option key={ind} value={ind}>{ind}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formRowTwo}>
                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Company Size</label>
                                        <select
                                            className={styles.selectField}
                                            value={companySize}
                                            onChange={e => setCompanySize(e.target.value)}
                                        >
                                            {COMPANY_SIZES.map(sz => (
                                                <option key={sz} value={sz}>{sz}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label className={styles.inputLabel}>Country</label>
                                        <input
                                            type="text"
                                            required
                                            className={styles.inputField}
                                            placeholder="e.g. Latvia, Germany, United States"
                                            value={country}
                                            onChange={e => setCountry(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.buttonRow}>
                                    <button 
                                        type="button" 
                                        onClick={() => { setErrorMessage(""); setStep(1); }}
                                        className={styles.backBtn}
                                    >
                                        <ArrowLeft size={15} /> Back
                                    </button>
                                    <button type="submit" className={styles.primaryBtn}>
                                        Continue to Primary Brain <ArrowRight size={15} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 3: PRIMARY BRAIN */}
                    {step === 3 && (
                        <motion.div
                            key="step-3"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22 }}
                            className={styles.onboardingCard}
                        >
                            <div className={styles.onboardingHeader}>
                                <div className={styles.stepTag}>
                                    <Brain size={13} /> Step 03 — Primary Brain
                                </div>
                                <h1 className={styles.onboardingTitle}>WHAT DO YOU WANT TO AUTOMATE?</h1>
                                <p className={styles.onboardingDesc}>
                                    Select 1 Primary Brain to initialize your core knowledge index and decision policies. Additional modules can be connected later.
                                </p>
                            </div>

                            <div className={styles.brainGrid}>
                                {PRIMARY_BRAINS.map(b => {
                                    const isSelected = primaryBrain === b.id;
                                    const IconComponent = b.icon;
                                    return (
                                        <div
                                            key={b.id}
                                            className={`${styles.brainCard} ${isSelected ? styles.brainCardSelected : ""}`}
                                            onClick={() => setPrimaryBrain(b.id)}
                                        >
                                            <div className={styles.brainIconWrap}>
                                                <IconComponent size={20} />
                                            </div>
                                            <div className={styles.brainMeta}>
                                                <span className={styles.brainCardTitle}>{b.title}</span>
                                                <span className={styles.brainCardDesc}>{b.description}</span>
                                            </div>
                                            <div className={styles.brainCheck}>
                                                <Check size={13} strokeWidth={3} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className={styles.buttonRow}>
                                <button 
                                    type="button" 
                                    onClick={() => { setErrorMessage(""); setStep(2); }}
                                    className={styles.backBtn}
                                >
                                    <ArrowLeft size={15} /> Back
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleCreateBrain} 
                                    className={styles.primaryBtn}
                                >
                                    Create {selectedBrainConfig.shortName} Brain <ArrowRight size={15} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: BRAIN CREATION (LOADING & READY) */}
                    {step === 4 && (
                        <motion.div
                            key="step-4"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.25 }}
                            className={styles.stateCard}
                        >
                            {isCreating ? (
                                <>
                                    <div className={styles.pulseIconCircle}>
                                        <Brain size={28} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#111827", margin: "0 0 6px 0", letterSpacing: "-0.03em" }}>
                                            Creating your {selectedBrainConfig.shortName} Brain...
                                        </h2>
                                        <p style={{ fontSize: "0.84rem", color: "#6B7280", margin: 0 }}>
                                            Provisioning vector index, seeding decision guardrails, and binding corporate memory.
                                        </p>
                                    </div>

                                    <div className={styles.loadingProgressTrack}>
                                        <div 
                                            className={styles.loadingProgressBar} 
                                            style={{ width: `${creationProgress}%` }} 
                                        />
                                    </div>
                                </>
                            ) : isReady ? (
                                <>
                                    <div className={styles.readyBadge}>
                                        <ShieldCheck size={14} /> Sovereign Deployment Verified
                                    </div>

                                    <div>
                                        <h2 style={{ fontSize: "1.65rem", fontWeight: 950, color: "#111827", margin: "0 0 6px 0", letterSpacing: "-0.03em", textTransform: "uppercase" }}>
                                            YOUR {selectedBrainConfig.shortName.toUpperCase()} BRAIN IS READY
                                        </h2>
                                        <p style={{ fontSize: "0.85rem", color: "#6B7280", margin: 0 }}>
                                            Corporate intelligence parameters configured for {companyName || "your organization"}.
                                        </p>
                                    </div>

                                    <div className={styles.readyMetricsGrid}>
                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>Knowledge</span>
                                            <div className={styles.metricValueRow}>
                                                <span className={styles.readyDot} />
                                                <span>Ready</span>
                                            </div>
                                        </div>

                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>Rules</span>
                                            <div className={styles.metricValueRow}>
                                                <span className={styles.readyDot} />
                                                <span>Ready</span>
                                            </div>
                                        </div>

                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>Connected Apps</span>
                                            <div className={styles.metricValueRow}>
                                                <span>0</span>
                                            </div>
                                        </div>

                                        <div className={styles.metricBox}>
                                            <span className={styles.metricLabel}>Automations</span>
                                            <div className={styles.metricValueRow}>
                                                <span>0</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={handleOpenBrain} 
                                        className={styles.openBrainBtn}
                                    >
                                        Open {selectedBrainConfig.shortName} Brain <ArrowRight size={17} />
                                    </button>
                                </>
                            ) : null}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function SetupPage() {
    return (
        <Suspense fallback={
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
                <Loader2 size={24} className={styles.spinning} />
            </div>
        }>
            <OnboardingContent />
        </Suspense>
    );
}
