"use client";

import React, { useState } from "react";
import { CreditCard, Download, RefreshCw, CheckCircle, AlertTriangle, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./billing.module.css";

// ─── Plan configuration ───────────────────────────────────────────────────────
const PLAN_CONFIG: Record<string, { label: string; price: number; currency: string; description: string }> = {
    professional: { label: "Professional", price: 290, currency: "€", description: "Private n8n instance · Custom domain · SLA included · Dedicated VPS" },
    growth:       { label: "Growth",       price: 490, currency: "€", description: "2x execution limit · Priority SLA · Multi-environment · 10 seats" },
    enterprise:   { label: "Enterprise",   price: 0,   currency: "€", description: "Unlimited executions · Custom SLA · On-premise deployment · Unlimited seats" },
};

interface UsageMetric { used: number; limit: number; }

interface BillingClientProps {
    plan: string;
    teamName: string;
    memberSince: string;
    usage: {
        workflows: UsageMetric;
        activeWorkflows: UsageMetric;
        executions: UsageMetric;
        seats: UsageMetric;
    };
    invoices: Array<{
        id: string;
        period: string;
        amount: string;
        date: string;
        status: string;
    }>;
}

// ─── Usage bar ────────────────────────────────────────────────────────────────
function UsageBar({ label, metric }: { label: string; metric: UsageMetric }) {
    const pct = metric.limit > 0 ? Math.min(100, Math.round((metric.used / metric.limit) * 100)) : 0;
    const isWarn = pct >= 80 && pct < 90;
    const isCrit = pct >= 90;
    const fillClass = isCrit ? styles.usageFillCrit : isWarn ? styles.usageFillWarn : styles.usageFill;
    const warnColor = isCrit ? "#EF4444" : isWarn ? "#F59E0B" : undefined;

    return (
        <div className={styles.usageRow}>
            <span className={styles.usageLabel}>{label}</span>
            <div
                className={styles.usageBar}
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${label}: ${metric.used} of ${metric.limit} (${pct}%)`}
            >
                <div className={`${styles.usageFill} ${fillClass}`} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.usageCount} style={{ color: warnColor }}>
                {metric.used.toLocaleString()} / {metric.limit.toLocaleString()}
                {isWarn && <span className={styles.warnLabel}> · Needs Attention</span>}
                {isCrit && <span className={styles.critLabel}> · Critical</span>}
            </span>
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BillingClient({ plan, teamName, memberSince, usage, invoices }: BillingClientProps) {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const planKey = (plan || "professional").toLowerCase();
    const config = PLAN_CONFIG[planKey] ?? PLAN_CONFIG["professional"];
    const isEnterprise = planKey === "enterprise";

    const since = new Date(memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const nextBilling = new Date();
    nextBilling.setMonth(nextBilling.getMonth() + 1);
    nextBilling.setDate(1);
    const nextBillingStr = nextBilling.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    // Determine if any usage metric exceeds 80%
    const usageItems = [
        { key: "workflows", ...usage.workflows },
        { key: "activeWorkflows", ...usage.activeWorkflows },
        { key: "executions", ...usage.executions },
        { key: "seats", ...usage.seats },
    ];
    const atRiskItems = usageItems.filter(u => u.limit > 0 && u.used / u.limit >= 0.8);
    const hasCritical = atRiskItems.some(u => u.used / u.limit >= 0.9);

    const handleRefresh = () => {
        setRefreshing(true);
        router.refresh();
        setTimeout(() => setRefreshing(false), 1500);
    };

    return (
        <main className={styles.container} aria-label="Billing and Subscription">
            {/* Usage warning banner */}
            {atRiskItems.length > 0 && (
                <div
                    className={hasCritical ? styles.warnBannerCrit : styles.warnBanner}
                    role="alert"
                    aria-live="polite"
                >
                    <AlertTriangle size={16} aria-hidden="true" />
                    <div>
                        <strong>{hasCritical ? "Critical:" : "Needs Attention:"}</strong>{" "}
                        {atRiskItems.length === 1
                            ? `Your ${atRiskItems[0].key} usage is at ${Math.round((atRiskItems[0].used / atRiskItems[0].limit) * 100)}% of plan limit.`
                            : `${atRiskItems.length} resource metrics are approaching plan limits.`}{" "}
                        {!isEnterprise && "Consider upgrading your plan."}
                    </div>
                </div>
            )}

            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Billing &amp; Subscription</h1>
                    <p className={styles.subtitle}>
                        Plan usage, invoices, and payment method for <strong>{teamName}</strong>. Member since {since}.
                    </p>
                </div>
                <button
                    className={styles.btnSecondary}
                    onClick={handleRefresh}
                    aria-label="Refresh billing data from server"
                    disabled={refreshing}
                >
                    <RefreshCw size={14} aria-hidden="true" style={refreshing ? { animation: "spin 1s linear infinite" } : {}} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </header>

            {/* KPI summary row */}
            <div className={styles.summaryRow}>
                <div className={`${styles.summaryCard} ${styles.accentCard}`}>
                    <div className={styles.summaryLabel}>Current Plan</div>
                    <div className={styles.summaryValue}>{config.label}</div>
                    <div className={styles.summaryHint}>Sovereign infrastructure tier</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>Monthly Cost</div>
                    <div className={styles.summaryValue}>
                        {isEnterprise ? "Custom" : `${config.currency}${config.price.toLocaleString()}`}
                    </div>
                    <div className={styles.summaryHint}>
                        {isEnterprise ? "Contact for invoicing" : `Next billing: ${nextBillingStr}`}
                    </div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>Executions This Month</div>
                    <div className={styles.summaryValue}>{usage.executions.used.toLocaleString()}</div>
                    <div className={styles.summaryHint}>of {usage.executions.limit.toLocaleString()} included</div>
                </div>
                <div className={styles.summaryCard}>
                    <div className={styles.summaryLabel}>Team Seats</div>
                    <div className={styles.summaryValue}>{usage.seats.used} / {usage.seats.limit}</div>
                    <div className={styles.summaryHint}>Active users</div>
                </div>
            </div>

            {/* Active plan */}
            <section className={styles.section} aria-labelledby="plan-heading">
                <div className={styles.sectionTitle} id="plan-heading">Active Plan</div>
                <div className={styles.planCard}>
                    <div>
                        <div className={styles.planName}>{config.label} — Sovereign Deployment</div>
                        <div className={styles.planDetail}>{config.description}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className={styles.planBadge} aria-label="Plan status: Active">
                            <CheckCircle size={12} aria-hidden="true" /> Ready
                        </span>
                        {!isEnterprise && (
                            <a href="mailto:support@blonk.io?subject=Plan Upgrade Request" className={styles.upgradeLink} aria-label="Contact BLONK to upgrade your plan">
                                Upgrade Plan <ArrowUpRight size={13} aria-hidden="true" />
                            </a>
                        )}
                    </div>
                </div>
            </section>

            {/* Resource usage */}
            <section className={styles.section} aria-labelledby="usage-heading">
                <div className={styles.sectionTitle} id="usage-heading">Resource Usage</div>
                <div className={styles.usageList} role="list" aria-label="Resource usage metrics">
                    <UsageBar label="Total Workflows" metric={usage.workflows} />
                    <UsageBar label="Active Workflows" metric={usage.activeWorkflows} />
                    <UsageBar label="Executions / Month" metric={usage.executions} />
                    <UsageBar label="Team Seats" metric={usage.seats} />
                </div>
            </section>

            {/* Payment method */}
            <section className={styles.section} aria-labelledby="payment-heading">
                <div className={styles.sectionTitle} id="payment-heading">Payment Method</div>
                <div className={styles.paymentCard}>
                    <div className={styles.paymentInfo}>
                        <div className={styles.paymentIcon} aria-hidden="true">PAY</div>
                        <div>
                            <div className={styles.paymentLabel}>Revolut Pay</div>
                            <div className={styles.paymentSub}>Linked business account · Auto-renews monthly</div>
                        </div>
                    </div>
                    <a
                        href="mailto:support@blonk.io?subject=Update Payment Method"
                        className={styles.btnSecondary}
                        aria-label="Request payment method update via support"
                    >
                        <CreditCard size={14} aria-hidden="true" /> Update Method
                    </a>
                </div>
            </section>

            {/* Invoice history */}
            <section className={styles.section} aria-labelledby="invoices-heading">
                <div className={styles.sectionTitle} id="invoices-heading">Invoice History</div>
                <table className={styles.invoiceTable} aria-label="Invoice history">
                    <thead>
                        <tr>
                            <th scope="col">Invoice</th>
                            <th scope="col">Period</th>
                            <th scope="col">Amount</th>
                            <th scope="col">Date</th>
                            <th scope="col">Status</th>
                            <th scope="col"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "48px 24px", color: "var(--muted-foreground)" }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--foreground)", display: "block", marginBottom: "4px" }}>No billing history available</span>
                                    <span style={{ fontSize: "0.75rem" }}>Invoice receipts will appear here after your first billing cycle or template purchase.</span>
                                </td>
                            </tr>
                        ) : (
                            invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td style={{ fontWeight: 700, color: "#0F172A", fontVariantNumeric: "tabular-nums" }}>{inv.id}</td>
                                    <td>{inv.period}</td>
                                    <td style={{ fontWeight: 700 }}>{inv.amount}</td>
                                    <td>{inv.date}</td>
                                    <td><span className={styles.statusPaid}>{inv.status}</span></td>
                                    <td>
                                        <a
                                            href={`mailto:support@blonk.io?subject=Invoice ${inv.id} PDF Request`}
                                            className={styles.downloadLink}
                                            aria-label={`Request PDF for invoice ${inv.id}`}
                                        >
                                            <Download size={11} aria-hidden="true" style={{ display: "inline", marginRight: "4px" }} />
                                            PDF
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <p className={styles.invoiceNote}>
                    For full billing history or custom invoice requests, contact{" "}
                    <a href="mailto:billing@blonk.io" className={styles.downloadLink}>billing@blonk.io</a>.
                </p>
            </section>
        </main>
    );
}
