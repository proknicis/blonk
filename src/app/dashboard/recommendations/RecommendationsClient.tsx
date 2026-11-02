"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, CheckCheck, AlertTriangle, Bookmark, PlusCircle } from "lucide-react";
import styles from "./recommendations.module.css";

interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    requirements: any;
    status: string;
}

type CardStatus = "idle" | "queuing" | "queued" | "error";

const DEFAULT_BLUEPRINTS = [
    {
        id: "blue-1",
        name: "Sovereign Client Onboarding Setup",
        category: "Operations",
        description: "Orchestrates workspace provisioning, welcome channels, and audit files once a service contract is signed.",
        fit: 98, impact: "Saves 15h/mo", complexity: "Medium",
        tools: ["Slack", "Google Drive", "Gmail"],
    },
    {
        id: "blue-2",
        name: "CV Processing & Interview Scheduler",
        category: "Recruiting",
        description: "Uses sovereign LLM to scan incoming CVs, extract key metrics, match candidates to vacancies, and coordinate calendar availability.",
        fit: 95, impact: "Saves 24h/mo", complexity: "High",
        tools: ["Gmail", "OpenAI", "Google Calendar"],
    },
    {
        id: "blue-3",
        name: "Auto-billing Reconciliation Loop",
        category: "Finance",
        description: "Reconciles billing ledger exports with bank statements, matches transactions automatically, and flags anomalous payouts.",
        fit: 96, impact: "Saves 20h/mo", complexity: "Medium",
        tools: ["Stripe", "Gmail", "Google Sheets"],
    },
    {
        id: "blue-4",
        name: "Competitor Intelligence Digest",
        category: "Marketing",
        description: "Monitors target market updates, scrapes industry publications, summarizes news with LLM, and posts digests to internal channels.",
        fit: 78, impact: "Saves 12h/mo", complexity: "Medium",
        tools: ["OpenAI", "Slack", "RSS Reader"],
    },
];

export default function RecommendationsClient({ initialTemplates }: { initialTemplates: Template[] }) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [cardStatus, setCardStatus] = useState<Record<string, { state: CardStatus; message?: string }>>({});
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

    const blueprints = useMemo(() => {
        const list = [...DEFAULT_BLUEPRINTS];
        initialTemplates.forEach(t => {
            if (!list.some(item => item.name.toLowerCase() === t.name.toLowerCase())) {
                let reqTools: string[] = [];
                try {
                    const parsed = typeof t.requirements === "string" ? JSON.parse(t.requirements) : t.requirements;
                    if (Array.isArray(parsed)) reqTools = parsed.map((p: any) => p.name || p.service || "Connector");
                } catch (_) {}
                list.push({
                    id: t.id, name: t.name,
                    category: t.category || "Operations",
                    description: t.description || "Bespoke automation pipeline blueprint.",
                    fit: 90, impact: "Saves 10–15h/mo", complexity: "Medium",
                    tools: reqTools.length > 0 ? reqTools : ["API Gateway"],
                });
            }
        });
        return list;
    }, [initialTemplates]);

    const categories = useMemo(() => {
        const cats = new Set(blueprints.map(b => b.category));
        return ["all", ...Array.from(cats)];
    }, [blueprints]);

    const filteredBlueprints = useMemo(() =>
        selectedCategory === "all"
            ? blueprints
            : blueprints.filter(b => b.category.toLowerCase() === selectedCategory.toLowerCase()),
    [blueprints, selectedCategory]);

    // Wire to /api/orders — creates a real order record in the DB
    const handleDeployToQueue = async (id: string, name: string) => {
        setCardStatus(prev => ({ ...prev, [id]: { state: "queuing" } }));
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workflowName: name, price: 0, templateId: id }),
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setCardStatus(prev => ({
                    ...prev,
                    [id]: {
                        state: "queued",
                        message: `Order #${(data.orderId || "").toString().slice(0, 8).toUpperCase()} created. Go to Credentials Vault to link required tokens.`,
                    },
                }));
            } else {
                setCardStatus(prev => ({
                    ...prev,
                    [id]: { state: "error", message: data.error || "Failed to create order." },
                }));
            }
        } catch (err: any) {
            setCardStatus(prev => ({
                ...prev,
                [id]: { state: "error", message: err.message || "Network error reaching orders endpoint." },
            }));
        }
    };

    const toggleBookmark = (id: string) => {
        setBookmarked(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    return (
        <main className={styles.container} aria-label="AI Automation Recommendations Panel">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>AI Solution Plan Matcher</h1>
                    <p className={styles.subtitle}>Ranked automation plans generated dynamically to target manual bottlenecks in your setup profile.</p>
                </div>
                <Link href="/dashboard/registry" className={styles.btnPrimary} aria-label="Submit a request for a custom automation design">
                    <PlusCircle size={16} aria-hidden="true" /> Request Custom Loop
                </Link>
            </header>

            {/* Category filter */}
            <div style={{ display: "flex", gap: "10px", margin: "16px 0 24px 0", flexWrap: "wrap" }} role="tablist" aria-label="Blueprint categories">
                {categories.map(cat => (
                    <button
                        key={cat}
                        role="tab"
                        aria-selected={selectedCategory === cat}
                        className={styles.btnSecondary}
                        style={{
                            background:  selectedCategory === cat ? "#ECFDF5" : "#FFFFFF",
                            borderColor: selectedCategory === cat ? "#10B981" : "#E2E8F0",
                            color:       selectedCategory === cat ? "#059669" : "#475569",
                        }}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Blueprints grid */}
            <div className={styles.grid}>
                {filteredBlueprints.map(blueprint => {
                    const status   = cardStatus[blueprint.id];
                    const isQueuing = status?.state === "queuing";
                    const isQueued  = status?.state === "queued";
                    const isError   = status?.state === "error";
                    const isMarked  = bookmarked.has(blueprint.id);

                    return (
                        <article
                            key={blueprint.id}
                            className={styles.card}
                            tabIndex={0}
                            aria-label={`Blueprint: ${blueprint.name}, ${blueprint.fit}% fit`}
                        >
                            <div className={styles.cardHeader}>
                                <span className={styles.fitBadge}>
                                    <Sparkles size={12} aria-hidden="true" /> {blueprint.fit}% Fit Score
                                </span>
                                <span className={styles.categoryLabel}>{blueprint.category}</span>
                            </div>

                            <h3 className={styles.cardTitle}>{blueprint.name}</h3>
                            <p className={styles.cardDesc}>{blueprint.description}</p>

                            <div className={styles.metrics}>
                                <div className={styles.metricRow}>
                                    <span className={styles.metricLabel}>Operational Impact</span>
                                    <span className={styles.metricVal}>{blueprint.impact}</span>
                                </div>
                                <div className={styles.metricRow}>
                                    <span className={styles.metricLabel}>Complexity</span>
                                    <span className={`${styles.complexityBadge} ${
                                        blueprint.complexity === "Low"  ? styles.complexLow  :
                                        blueprint.complexity === "High" ? styles.complexHigh : styles.complexMedium
                                    }`}>{blueprint.complexity}</span>
                                </div>
                            </div>

                            <div className={styles.toolsWrapper}>
                                <span className={styles.toolsLabel}>Required integrations</span>
                                <div className={styles.toolBadges}>
                                    {blueprint.tools.map((t, idx) => (
                                        <span key={idx} className={styles.toolBadge}>{t}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Inline queue result — replaces alert() */}
                            {(isQueued || isError) && (
                                <div
                                    style={{
                                        display: "flex", alignItems: "flex-start", gap: "8px",
                                        background: isQueued ? "#ECFDF5" : "#FEF2F2",
                                        border: `1px solid ${isQueued ? "#D1FAE5" : "#FEE2E2"}`,
                                        color: isQueued ? "#065F46" : "#991B1B",
                                        borderRadius: "8px", padding: "10px 12px",
                                        fontSize: "0.78rem", fontWeight: 600, lineHeight: 1.45,
                                        marginBottom: "12px",
                                    }}
                                    role="status"
                                    aria-live="polite"
                                >
                                    {isQueued
                                        ? <CheckCheck size={13} aria-hidden="true" style={{ flexShrink: 0, marginTop: "1px" }} />
                                        : <AlertTriangle size={13} aria-hidden="true" style={{ flexShrink: 0, marginTop: "1px" }} />}
                                    <span>{status?.message}</span>
                                </div>
                            )}

                            <div className={styles.cardActions}>
                                <button
                                    className={styles.btnPrimary}
                                    onClick={() => handleDeployToQueue(blueprint.id, blueprint.name)}
                                    disabled={isQueuing || isQueued}
                                    aria-label={`Deploy "${blueprint.name}" to automation queue`}
                                    aria-busy={isQueuing}
                                >
                                    {isQueuing ? "Queuing..." : isQueued ? "Queued" : "Deploy to Queue"}
                                </button>
                                <button
                                    className={styles.btnSecondary}
                                    onClick={() => toggleBookmark(blueprint.id)}
                                    aria-label={isMarked ? `Remove "${blueprint.name}" from bookmarks` : `Bookmark "${blueprint.name}"`}
                                    aria-pressed={isMarked}
                                    style={isMarked ? { borderColor: "#10B981", color: "#059669", background: "#ECFDF5" } : {}}
                                >
                                    <Bookmark size={13} aria-hidden="true" fill={isMarked ? "#059669" : "none"} />
                                    {isMarked ? "Saved" : "Bookmark"}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>
        </main>
    );
}
