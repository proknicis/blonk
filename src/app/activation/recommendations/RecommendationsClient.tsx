"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import styles from "../activation.module.css";

interface Blueprint {
    id: string;
    name: string;
    department: string;
    outcome: string;
    whyMatch: string;
    systems: string[];
    complexity: "Easy" | "Medium" | "High";
    fit: number;
}

export default function RecommendationsClient() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        async function fetchState() {
            try {
                const res = await fetch("/api/activation");
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                    setSelectedId(data.user.selectedWorkflowId || null);
                }
            } catch (err) {
                console.error("Failed to load user setup profile:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchState();
    }, []);

    const getBlueprints = (role: string): Blueprint[] => {
        const normalized = (role || "").toLowerCase();
        if (normalized.includes("sales")) {
            return [
                {
                    id: "sales-inbound",
                    name: "Autonomous Inbound Qualification & Scoring",
                    department: "Sales & CRM",
                    outcome: "Saves ~20 hours/month of prospecting by auto-scoring signups.",
                    whyMatch: "Directly solves lead filtering delay bottleneck specified in setup.",
                    systems: ["Gmail", "Hubspot", "Slack"],
                    complexity: "Medium",
                    fit: 98
                },
                {
                    id: "sales-enrich",
                    name: "Contact Enrichment Loop",
                    department: "Sales & Growth",
                    outcome: "Enriches leads with public bios (LinkedIn, GitHub) instantly.",
                    whyMatch: "Speeds up profile search time context for sales personnel.",
                    systems: ["Gmail", "Slack"],
                    complexity: "Easy",
                    fit: 88
                },
                {
                    id: "sales-sync",
                    name: "CRM Outbound Sync & Opportunity Sync",
                    department: "Operations",
                    outcome: "Guarantees data sync accuracy across multi-source pipelines.",
                    whyMatch: "Addresses CRM data fragmentation issues.",
                    systems: ["Hubspot", "Slack"],
                    complexity: "High",
                    fit: 82
                }
            ];
        } else if (normalized.includes("finance")) {
            return [
                {
                    id: "fin-reconcile",
                    name: "Automated Ledger Reconciliation Loop",
                    department: "Accounting & Audit",
                    outcome: "Matches Stripe log events with banking entries, auto-resolving line items.",
                    whyMatch: "Addresses payment variance audits and duplicate checks.",
                    systems: ["Stripe", "Gmail", "Google Sheets"],
                    complexity: "Medium",
                    fit: 96
                },
                {
                    id: "fin-parse",
                    name: "PDF Invoice Parser & Data Extractor",
                    department: "Finance Operations",
                    outcome: "Scans PDFs and maps variables directly into operational sheets.",
                    whyMatch: "Resolves manual copy-paste overhead bottlenecks.",
                    systems: ["Gmail", "Google Sheets"],
                    complexity: "Easy",
                    fit: 90
                },
                {
                    id: "fin-remind",
                    name: "Dormant Balance automated reminders",
                    department: "Support & Accounts",
                    outcome: "Monitors payment windows and issues email pings automatically.",
                    whyMatch: "Maintains optimal cash-flow cycles for accounts.",
                    systems: ["Stripe", "Gmail"],
                    complexity: "Easy",
                    fit: 78
                }
            ];
        } else {
            return [
                {
                    id: "ops-setup",
                    name: "Client Onboarding & Workspace Setup",
                    department: "Operations",
                    outcome: "Provisions Slack channels, Drive folders, and Notion boards on contract sign.",
                    whyMatch: "Resolves client delivery delay bottlenecks.",
                    systems: ["Slack", "Google Drive", "Notion"],
                    complexity: "Medium",
                    fit: 95
                },
                {
                    id: "ops-audit",
                    name: "Operational Audit & System Telemetry Logger",
                    department: "Compliance",
                    outcome: "Gathers weekly connection metrics and checks node configurations.",
                    whyMatch: "Secures data privacy compliance.",
                    systems: ["Slack", "Google Drive"],
                    complexity: "Easy",
                    fit: 85
                },
                {
                    id: "ops-helpdesk",
                    name: "Helpdesk Query Response Draft Assistant",
                    department: "Client Success",
                    outcome: "Indexes incoming emails and drafts KB-informed response options.",
                    whyMatch: "Reduces client ticket triage response times.",
                    systems: ["Gmail", "Slack"],
                    complexity: "Medium",
                    fit: 80
                }
            ];
        }
    };

    const blueprints = getBlueprints(profile?.aiEmployee);

    const handleSelect = (id: string) => {
        setSelectedId(id);
    };

    const handleConfirmBlueprint = async () => {
        if (!selectedId) return;
        setUpdating(true);
        try {
            const res = await fetch("/api/activation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "WORKFLOW_SELECTED",
                    selectedWorkflowId: selectedId,
                    metadata: {
                        selectedWorkflowName: blueprints.find(b => b.id === selectedId)?.name,
                        requiredSystems: blueprints.find(b => b.id === selectedId)?.systems
                    }
                })
            });

            if (res.ok) {
                router.push("/activation/connect");
            }
        } catch (err) {
            console.error("Failed to select blueprint:", err);
        } finally {
            setUpdating(false);
        }
    };

    const handleRequestCustom = async () => {
        setUpdating(true);
        try {
            const res = await fetch("/api/activation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "CUSTOM_REQUEST_SUBMITTED",
                    metadata: { customRequested: true }
                })
            });

            if (res.ok) {
                await fetch("/api/orders", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        workflowName: `Custom ${profile?.aiEmployee || 'Operations'} Loop`,
                        price: 0,
                        templateId: null
                    })
                });
                router.push("/dashboard");
            }
        } catch (err) {
            console.error("Failed to register custom request:", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className={styles.loadingInner}>
                <p>Decoding system settings...</p>
            </div>
        );
    }

    return (
        <main className={styles.container} aria-label="Compare recommended blueprint alternatives">
            <div className={styles.stepper}>
                <span className={styles.step}>1. Analysis</span>
                <span className={`${styles.step} ${styles.stepActive}`}>2. Blueprints</span>
                <span className={styles.step}>3. Connections</span>
                <span className={styles.step}>4. Readiness</span>
                <span className={styles.step}>5. Launch</span>
            </div>

            <header className={styles.header}>
                <h1 className={styles.title}>Choose Your Workflow</h1>
                <p className={styles.subtitle}>
                    Select the initial automation blueprint you want BLONK to provision on your sovereign node cluster.
                </p>
            </header>

            <div className={styles.blueprintsGrid}>
                {blueprints.map(bp => {
                    const isSelected = selectedId === bp.id;
                    return (
                        <button
                            key={bp.id}
                            className={`${styles.bpCard} ${isSelected ? styles.bpCardActive : ""}`}
                            onClick={() => handleSelect(bp.id)}
                            aria-pressed={isSelected}
                            aria-label={`Select blueprint: ${bp.name}. Fit score ${bp.fit}%.`}
                        >
                            <div className={styles.bpHeader}>
                                <span className={styles.bpDept}>{bp.department}</span>
                                <span className={`${styles.bpComplexity} ${styles[`complexity_${bp.complexity.toLowerCase()}`]}`}>
                                    {bp.complexity} Complexity
                                </span>
                            </div>

                            <h3 className={styles.bpTitle}>{bp.name}</h3>
                            <p className={styles.bpDesc}>{bp.outcome}</p>

                            <div className={styles.bpOutcome}>
                                <strong style={{ fontSize: "0.7rem", color: "#64748B", textTransform: "uppercase" }}>Matching reason:</strong>
                                <p style={{ fontSize: "0.78rem", color: "#334155", marginTop: "2px" }}>{bp.whyMatch}</p>
                            </div>

                            <div className={styles.bpRequirements}>
                                <span className={styles.bpReqLabel}>Required Systems</span>
                                <div className={styles.bpTags}>
                                    {bp.systems.map((sys, idx) => (
                                        <span key={idx} className={styles.bpTag}>{sys}</span>
                                    ))}
                                </div>
                            </div>
                        </button>
                    );
                })}

                <div className={styles.bpCard} style={{ background: "#F8FAFC", borderStyle: "dashed" }}>
                    <div className={styles.bpHeader}>
                        <span className={styles.bpDept}>Bespoke Engineering</span>
                        <span className={styles.bpComplexity} style={{ color: "#10B981" }}>Custom</span>
                    </div>
                    <h3 className={styles.bpTitle}>Bespoke Integration Request</h3>
                    <p className={styles.bpDesc}>
                        Need an automation with tools not listed or a highly customized operational layout?
                        Submit details directly to our engineering desk.
                    </p>
                    <button
                        className={styles.btnSecondary}
                        onClick={handleRequestCustom}
                        disabled={updating}
                        style={{ marginTop: "auto" }}
                        aria-label="Request custom integration workflow from engineering desk"
                    >
                        Request Custom Loop
                    </button>
                </div>
            </div>

            <footer className={styles.ctaRow}>
                <button
                    className={styles.btnSecondary}
                    onClick={() => router.push("/activation")}
                    aria-label="Back to analysis view"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    className={styles.btnPrimary}
                    onClick={handleConfirmBlueprint}
                    disabled={!selectedId || updating}
                    aria-label="Confirm blueprint and proceed to connections"
                >
                    {updating ? "Processing..." : "Select & Continue"} <ArrowRight size={16} />
                </button>
            </footer>
        </main>
    );
}
