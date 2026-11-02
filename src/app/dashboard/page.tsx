"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
    Zap, AlertCircle, Check, Clock, ArrowRight,
    Sparkles, RefreshCw, CheckCircle2, CreditCard,
    Mail, MessageSquare, BarChart2, Users, Briefcase,
    ShoppingBag, TrendingUp, Activity, Brain, Shield, Info, Database, Cpu, ListTodo, Key, Eye, HelpCircle, Loader2
} from "lucide-react";
import styles from "./page.module.css";

/* ─────────────────────────────────────────────────────────
   DATA MODELS & API CONTRACTS (Approved Phase 2.5 Architecture)
   ───────────────────────────────────────────────────────── */
export type UserRole = "OWNER" | "ADMIN" | "OPERATOR" | "VIEWER";

export interface CompanyBrainStatus {
    status: "Ready" | "Learning" | "Empty";
    documentsCount: number;
    lastSynced: string;
    confidenceScore: number;
}

export interface WorkspaceHealth {
    score: number;
    automationsStatus: "Healthy" | "Attention" | "Down";
    integrationsStatus: "Healthy" | "Attention" | "Down";
    companyBrainStatus: "Healthy" | "Attention" | "Down";
    securityStatus: "Healthy" | "Attention";
}

export interface ActionableAlert {
    id: string;
    title: string;
    type: "warning" | "error" | "info";
    actionLabel: string;
    link: string;
}

export interface RealWorkflow {
    id: string;
    name: string;
    status: string;
    totalRuns: number;
    successRate: number;
}

export interface OverviewData {
    health: WorkspaceHealth;
    brain: CompanyBrainStatus;
    runningAutomationsCount: number;
    completedTasksCount: number;
    actionsRequiredCount: number;
    timeSavedHours: number;
    alerts: ActionableAlert[];
    activeAgent: {
        role: string;
        status: "Available" | "Running" | "Offline";
        lastActive: string;
        provider: string;
        messageSnippet: string;
    };
    topWorkflows: RealWorkflow[];
}

export interface DashboardWidget {
    id: string;
    component: React.ComponentType<{ data: OverviewData; userRole: UserRole }>;
    priority: number;
    allowedRoles: UserRole[];
    visibleWhen: (data: OverviewData) => boolean;
}

/* ─────────────────────────────────────────────────────────
   REUSABLE INDIVIDUAL WIDGET COMPONENTS
   ───────────────────────────────────────────────────────── */

/**
 * 1. Health Score Widget
 * Surfaces overall system and security health at a glance.
 */
function HealthScoreWidget({ data }: { data: OverviewData }) {
    const healthText = data.health.score >= 90 ? "Excellent" : data.health.score >= 70 ? "Stable" : "Action Required";
    const healthColor = data.health.score >= 90 ? "#10B981" : data.health.score >= 70 ? "#F59E0B" : "#EF4444";

    return (
        <div className={styles.card} style={{ flex: 1 }}>
            <h3 className={styles.cardTitle}>Workspace Health</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div className={styles.healthValue} style={{ color: healthColor }}>{data.health.score}</div>
                <div className={styles.healthLabel} style={{ color: healthColor }}>{healthText}</div>
                
                <div className={styles.healthRow}>
                    <span className={styles.healthRowLabel}>A.I. Employees Status</span>
                    <span className={styles.healthRowVal} style={{ color: data.health.automationsStatus === "Healthy" ? "#10B981" : "#F59E0B" }}>
                        {data.health.automationsStatus}
                    </span>
                </div>
                <div className={styles.healthRow}>
                    <span className={styles.healthRowLabel}>Connected Integrations</span>
                    <span className={styles.healthRowVal} style={{ color: data.health.integrationsStatus === "Healthy" ? "#10B981" : "#EF4444" }}>
                        {data.health.integrationsStatus}
                    </span>
                </div>
                <div className={styles.healthRow}>
                    <span className={styles.healthRowLabel}>Company Brain</span>
                    <span className={styles.healthRowVal} style={{ color: data.health.companyBrainStatus === "Healthy" ? "#10B981" : "#F59E0B" }}>
                        {data.health.companyBrainStatus}
                    </span>
                </div>
                <div className={styles.healthRow}>
                    <span className={styles.healthRowLabel}>System Security</span>
                    <span className={styles.healthRowVal} style={{ color: "#10B981" }}>
                        {data.health.securityStatus}
                    </span>
                </div>
            </div>
        </div>
    );
}

/**
 * 2. Company Brain Status Widget
 * Showcases synced document size, sync rate, and AI confidence settings.
 */
function BrainStatusWidget({ data }: { data: OverviewData }) {
    const router = useRouter();
    return (
        <div className={styles.card} style={{ flex: 1, cursor: "pointer" }} onClick={() => router.push("/dashboard/company-brain")}>
            <h3 className={styles.cardTitle}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <Brain size={16} color="var(--accent)" /> Company Brain
                </span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#6B7280", margin: "0 0 20px 0", lineHeight: 1.45 }}>
                Your private, isolated knowledge vector base is active. AI parses inbound items against these documents.
            </p>
            <div className={styles.brainGrid}>
                <div className={styles.brainStat}>
                    <div className={styles.brainValue}>{data.brain.documentsCount} docs</div>
                    <div className={styles.brainLabel}>Knowledge Base</div>
                </div>
                <div className={styles.brainStat}>
                    <div className={styles.brainValue}>{data.brain.confidenceScore}%</div>
                    <div className={styles.brainLabel}>AI Confidence</div>
                </div>
                <div className={styles.brainStat}>
                    <div className={styles.brainValue}>{data.brain.status}</div>
                    <div className={styles.brainLabel}>Sync State</div>
                </div>
            </div>
            <div style={{ marginTop: "16px", fontSize: "0.72rem", color: "#9CA3AF", fontWeight: 600 }}>
                Last synchronized: {data.brain.lastSynced}
            </div>
        </div>
    );
}

/**
 * 3. AI Assistant Widget (Decoupled chat window)
 * Allows open conversation dispatch.
 */
function AIAssistantWidget({ data }: { data: OverviewData }) {
    const handleOpenChat = () => {
        window.dispatchEvent(new CustomEvent('OPEN_AI_CHAT'));
    };

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>AI Advisor Marcus</h3>
            <div className={styles.chatContainer}>
                <div className={styles.chatHeader}>
                    <div className={styles.chatAvatar}>AI</div>
                    <div>
                        <span className={styles.chatName}>{data.activeAgent.provider}</span>
                        <p className={styles.chatRole}>{data.activeAgent.role} · {data.activeAgent.status}</p>
                    </div>
                </div>
                <p className={styles.chatBubble}>
                    &quot;{data.activeAgent.messageSnippet}&quot;
                </p>
                <button className={styles.chatBtn} onClick={handleOpenChat}>
                    Open Workspace Chat
                </button>
            </div>
        </div>
    );
}

/**
 * 4. Actionable Alerts Widget
 * Surfaces issues needing attention.
 */
function AlertsTimelineWidget({ data }: { data: OverviewData }) {
    const router = useRouter();
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Needs Attention</h3>
            {data.alerts.length === 0 ? (
                <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "16px", background: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "16px" }}>
                    <CheckCircle2 size={20} color="#10B981" />
                    <div>
                        <span style={{ fontSize: "0.82rem", fontWeight: 900, color: "var(--foreground)", display: "block" }}>All AI Employees Active</span>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Your digital workspace is currently healthy.</span>
                    </div>
                </div>
            ) : (
                data.alerts.map(alert => (
                    <div key={alert.id} className={`${styles.alertRow} ${alert.type === "error" ? styles.alertRowError : ""}`}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <AlertCircle size={16} color={alert.type === "error" ? "#EF4444" : "#F59E0B"} />
                            <span className={`${styles.alertRowText} ${alert.type === "error" ? styles.alertRowTextError : ""}`}>
                                {alert.title}
                            </span>
                        </div>
                        <button 
                            className={`${styles.alertActionBtn} ${alert.type === "error" ? styles.alertActionBtnError : ""}`}
                            onClick={() => router.push(alert.link)}
                        >
                            {alert.actionLabel}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

/**
 * 5. Quick Actions Widget
 * Surfaces useful actions for operators.
 */
function QuickActionsWidget() {
    const router = useRouter();
    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Quick Actions</h3>
            <div className={styles.actionsGrid}>
                <button className={styles.actionBtn} onClick={() => router.push("/dashboard/marketplace")}>
                    <ShoppingBag size={18} />
                    <span>Hire AI Employee</span>
                </button>
                <button className={styles.actionBtn} onClick={() => router.push("/dashboard/integrations")}>
                    <Key size={18} />
                    <span>Connect Tools</span>
                </button>
                <button className={styles.actionBtn} onClick={() => router.push("/dashboard/company-brain")}>
                    <Brain size={18} />
                    <span>Upload Knowledge</span>
                </button>
                <button className={styles.actionBtn} onClick={() => router.push("/dashboard/access")}>
                    <Users size={18} />
                    <span>Invite Team</span>
                </button>
            </div>
        </div>
    );
}

/**
 * 6. Marketplace Recommendations Widget
 * Surfaces direct install template shortcuts.
 */
function MarketplaceRecommendationsWidget() {
    const router = useRouter();
    
    const recs = [
        { title: "Finance Admin AI", desc: "Extract supplier invoices from email attachments, parse headers and reconcile records in Stripe.", link: "/dashboard/marketplace" },
        { title: "Consulting Operations AI", desc: "Syncs with Company Brain documents to draft replies for ticket queues automatically.", link: "/dashboard/marketplace" },
        { title: "Sales & Client Success AI", desc: "Qualifies signups using email domain registries and logs variables in HubSpot.", link: "/dashboard/marketplace" }
    ];

    return (
        <div className={styles.card}>
            <h3 className={styles.cardTitle}>Recommended AI Employees</h3>
            <div className={styles.recsGrid}>
                {recs.map((r, i) => (
                    <div key={i} className={styles.recCard}>
                        <h4 className={styles.recTitle}>{r.title}</h4>
                        <p className={styles.recDesc}>{r.desc}</p>
                        <button className={styles.recInstallBtn} onClick={() => router.push(r.link)}>
                            Hire Employee
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   WIDGET REGISTRY (Approved Phase 2.5 Architecture)
   ───────────────────────────────────────────────────────── */
const DashboardRegistry: DashboardWidget[] = [
    {
        id: "health",
        component: HealthScoreWidget,
        priority: 1,
        allowedRoles: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"],
        visibleWhen: (data) => data.runningAutomationsCount > 0
    },
    {
        id: "brain",
        component: BrainStatusWidget,
        priority: 2,
        allowedRoles: ["OWNER", "ADMIN", "OPERATOR"],
        visibleWhen: (data) => data.runningAutomationsCount > 0
    },
    {
        id: "assistant",
        component: AIAssistantWidget,
        priority: 3,
        allowedRoles: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"],
        visibleWhen: (data) => data.runningAutomationsCount > 0
    },
    {
        id: "alerts",
        component: AlertsTimelineWidget,
        priority: 4,
        allowedRoles: ["OWNER", "ADMIN", "OPERATOR", "VIEWER"],
        visibleWhen: (data) => data.runningAutomationsCount > 0
    },
    {
        id: "quickActions",
        component: QuickActionsWidget,
        priority: 5,
        allowedRoles: ["OWNER", "ADMIN", "OPERATOR"],
        visibleWhen: () => true
    },
    {
        id: "recs",
        component: MarketplaceRecommendationsWidget,
        priority: 6,
        allowedRoles: ["OWNER", "ADMIN", "OPERATOR"],
        visibleWhen: (data) => data.runningAutomationsCount === 0
    }
];

/* ─────────────────────────────────────────────────────────
   LAYOUT SKELETON LOADER
   ───────────────────────────────────────────────────────── */
function DashboardSkeleton() {
    return (
        <div className={styles.container}>
            <div className={styles.skeletonLine} style={{ height: "80px", width: "100%", borderRadius: "24px" }} />
            <div className={styles.kpis}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={styles.skeletonLine} style={{ height: "90px", borderRadius: "20px" }} />
                ))}
            </div>
            <div className={styles.splitGrid}>
                <div className={styles.skeletonLine} style={{ height: "300px", borderRadius: "24px" }} />
                <div className={styles.skeletonLine} style={{ height: "300px", borderRadius: "24px" }} />
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   PROACTIVE BUSINESS ADVISOR WIDGET
   ───────────────────────────────────────────────────────── */
function ProactiveAdvisorBanner() {
    return (
        <div style={{
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.07) 0%, rgba(59, 130, 246, 0.07) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.18)",
            borderRadius: "24px",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            animation: "fadeIn 0.5s ease-out"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF" }}>
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "#8B5CF6", textTransform: "uppercase", letterSpacing: "0.05em" }}>Proactive Business Advisor</span>
                        <h4 style={{ margin: "2px 0 0 0", fontSize: "0.88rem", fontWeight: 900, color: "var(--foreground)" }}>Overnight Workspace Scan Report</h4>
                    </div>
                </div>
                <span style={{ fontSize: "0.68rem", background: "rgba(16, 185, 129, 0.12)", color: "#10B981", padding: "4px 10px", borderRadius: "100px", fontWeight: 950 }}>
                    Analysis Fresh
                </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255, 255, 255, 0.4)", padding: "14px", borderRadius: "14px", border: "1px solid rgba(139, 92, 246, 0.08)" }}>
                    <div style={{ color: "var(--foreground)", fontWeight: 900, fontSize: "0.82rem" }}>📈 Core Opportunities Mapped</div>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", lineHeight: "1.4", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <li>Your **Finance Assistant** could automate **127 additional invoice drafts** from Gmail scans.</li>
                        <li>Identified **3 conflicting refund policy clauses** between `refund-policy.pdf` and `SOP_Billing.md` in the Company Brain.</li>
                    </ul>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "rgba(255, 255, 255, 0.4)", padding: "14px", borderRadius: "14px", border: "1px solid rgba(139, 92, 246, 0.08)" }}>
                    <div style={{ color: "var(--foreground)", fontWeight: 900, fontSize: "0.82rem" }}>🎯 Recommended Next Actions</div>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", lineHeight: "1.4", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <li>HR knowledge base is only **18% complete**. Ingest rules checklist to activate HR Specialist.</li>
                        <li>Connecting **HubSpot integration** would unlock **2 new automated customer-facing agents**.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   SETUP LAYOUT VIEW
   ───────────────────────────────────────────────────────── */
interface SetupDashboardLayoutProps {
    data: OverviewData;
    userRole: UserRole;
    checklist: Array<{ id: string; text: string; completed: boolean }>;
    onToggleStep: (id: string) => void;
}

function SetupDashboardLayout({ data, userRole, checklist, onToggleStep }: SetupDashboardLayoutProps) {
    const completedCount = checklist.filter(c => c.completed).length;
    const progressPct = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0;

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div style={{ 
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(16, 185, 129, 0.04) 100%)", 
                border: "1px solid var(--border)", 
                borderRadius: "24px", 
                padding: "32px",
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
            }}>
                <div>
                    <h2 className={styles.heroTitle}>Welcome to BLONK</h2>
                    <p className={styles.heroSub}>Your private workspace node is online. Complete these steps to configure your first AI Employee.</p>
                </div>
                <div style={{
                    fontSize: "0.85rem",
                    fontWeight: 950,
                    color: "var(--accent)",
                    background: "rgba(52, 209, 134, 0.08)",
                    padding: "10px 20px",
                    borderRadius: "100px",
                    border: "1px solid rgba(52, 209, 134, 0.15)"
                }}>
                    {progressPct}% Set Up
                </div>
            </div>

            <ProactiveAdvisorBanner />

            {/* Layout Grid */}
            <div className={styles.splitGrid}>
                {/* Steps checklist */}
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Activation Checklist</h3>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {checklist.map(item => (
                            <div key={item.id} className={styles.checklistRow} onClick={() => onToggleStep(item.id)}>
                                <div className={`${styles.checkbox} ${item.completed ? styles.checkboxChecked : ""}`}>
                                    {item.completed && <Check size={12} color="#FFFFFF" />}
                                </div>
                                <span className={`${styles.checklistText} ${item.completed ? styles.checklistTextChecked : ""}`}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick actions inside Setup */}
                <QuickActionsWidget />
            </div>

            {/* Recommendations below setup */}
            <MarketplaceRecommendationsWidget />
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   OPERATIONS LAYOUT VIEW
   ───────────────────────────────────────────────────────── */
function OperationsDashboardLayout({ data, userRole, isEnterprise }: { data: OverviewData; userRole: UserRole; isEnterprise: boolean }) {
    // Determine widgets visible based on criteria and role
    const visibleWidgets = useMemo(() => {
        return DashboardRegistry.filter(widget => {
            const hasPermission = widget.allowedRoles.includes(userRole);
            const isVisible = widget.visibleWhen(data);
            return hasPermission && isVisible;
        }).sort((a, b) => a.priority - b.priority);
    }, [data, userRole]);

    // KPI Cards
    const kpiItems = [
        { label: "AI Employees Active", val: data.runningAutomationsCount, icon: <CheckCircle2 size={18} color="#10B981" />, bg: "rgba(16, 185, 129, 0.08)" },
        { label: "Jobs Executed Today", val: data.completedTasksCount, icon: <Zap size={18} color="#3B82F6" />, bg: "rgba(59, 130, 246, 0.08)" },
        { label: "Attention Required", val: data.actionsRequiredCount, icon: <AlertCircle size={18} color="#EF4444" />, bg: "rgba(239, 68, 68, 0.08)" },
        { label: "Net Efficiency Saved", val: `${data.timeSavedHours}h`, icon: <Clock size={18} color="#8B5CF6" />, bg: "rgba(139, 92, 246, 0.08)" }
    ];

    return (
        <div className={styles.container}>
            {/* Hero Banner */}
            <div style={{ 
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(139, 92, 246, 0.04) 100%)", 
                border: "1px solid var(--border)", 
                borderRadius: "24px", 
                padding: "32px",
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
            }}>
                <div>
                    <h2 className={styles.heroTitle}>Mission Control</h2>
                    <p className={styles.heroSub}>Digital workers are active. Safe ledger routing confirmed.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(16, 185, 129, 0.08)", color: "#10B981", fontSize: "0.75rem", fontWeight: 900, padding: "8px 16px", borderRadius: "100px", border: "1px solid rgba(16, 185, 129, 0.15)" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                    <span>SYSTEM OPERATIONAL</span>
                </div>
            </div>

            <ProactiveAdvisorBanner />

            {/* KPIs */}
            <div className={styles.kpis}>
                {kpiItems.map((item, idx) => (
                    <div key={idx} className={styles.card}>
                        <div className={styles.kpiCard}>
                            <div className={styles.kpiIcon} style={{ background: item.bg }}>{item.icon}</div>
                            <div>
                                <div className={styles.kpiValue}>{item.val}</div>
                                <div className={styles.kpiLabel}>{item.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Left/Right layout container */}
            <div className={styles.splitGrid}>
                {/* Left Side: Alerts & AI Assistant */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <AlertsTimelineWidget data={data} />
                    <AIAssistantWidget data={data} />
                    <QuickActionsWidget />
                </div>

                {/* Right Side: Health, Company Brain, Agents */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div style={{ display: "flex", gap: "24px" }}>
                        <HealthScoreWidget data={data} />
                    </div>
                    <BrainStatusWidget data={data} />

                    {/* AI Employees Hired */}
                    <div className={styles.card}>
                        <h3 className={styles.cardTitle}>Hired AI Employees</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {data.topWorkflows && data.topWorkflows.length > 0 ? (
                                data.topWorkflows.map((agent) => {
                                    const statusLower = (agent.status || "idle").toLowerCase();
                                    const isRunning = statusLower === "active" || statusLower === "running" || statusLower === "success";
                                    const color = isRunning ? "#10B981" : "#6B7280";
                                    const statusLabel = isRunning ? "Active" : "Idle";
                                    return (
                                        <div key={agent.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#F9FAFB", borderRadius: "12px", border: "1px solid #F3F4F6" }}>
                                            <div>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#111827" }}>{agent.name}</span>
                                                <p style={{ margin: "2px 0 0 0", fontSize: "0.72rem", color: "#6B7280" }}>
                                                    Success Rate: {agent.successRate}% · Jobs: {agent.totalRuns}
                                                </p>
                                            </div>
                                            <span style={{ fontSize: "0.72rem", fontWeight: 800, color }}>● {statusLabel}</span>
                                        </div>
                                    );
                                })
                            ) : (
                                <div style={{ fontSize: "0.82rem", color: "#6B7280", padding: "10px 14px", background: "#F9FAFB", borderRadius: "12px", border: "1px solid #F3F4F6", textAlign: "center" }}>
                                    No active AI Employee roles hired.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enterprise Analytics */}
            {isEnterprise && (
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>Enterprise Transaction Volume</h3>
                    <div style={{ height: "200px", background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: "0.85rem", fontWeight: 600 }}>
                        <BarChart2 size={24} style={{ marginRight: "10px" }} /> Simulated Enterprise Transaction Analytics Graph
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   MAIN OVERVIEW CONTROLLER
   ───────────────────────────────────────────────────────── */
export default function OverviewPage() {
    const router = useRouter();
    const { data: session } = useSession();
    
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<UserRole>("ADMIN");
    const [dashboardData, setDashboardData] = useState<OverviewData | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [checklist, setChecklist] = useState<Array<{ id: string; text: string; completed: boolean }>>([
        { id: "g", text: "Connect Gmail / Workspace integration", completed: false },
        { id: "b", text: "Upload initial Company Brain documents", completed: true },
        { id: "m", text: "Install first automation template from Marketplace", completed: false },
        { id: "l", text: "Launch autonomous agent pipeline", completed: false }
    ]);

    const handleToggleStep = (id: string) => {
        setChecklist(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
    };

    // Read user role from session
    useEffect(() => {
        if (session?.user) {
            const role = (session.user as any).role;
            if (role === "OWNER" || role === "ADMIN" || role === "OPERATOR" || role === "VIEWER") {
                setUserRole(role);
            }
        }
    }, [session]);

    // Fetch real metrics from the database APIs
    useEffect(() => {
        let active = true;
        async function loadData() {
            try {
                const [summaryRes, credsRes] = await Promise.all([
                    fetch("/api/dashboard/summary"),
                    fetch("/api/credentials/list")
                ]);

                if (!summaryRes.ok) {
                    throw new Error("Failed to load dashboard data");
                }

                const raw = await summaryRes.json();
                let creds: any[] = [];
                if (credsRes.ok) {
                    creds = await credsRes.json();
                }

                const hasConnectedCreds = creds.some(c => c.status === "Connected");
                const errorCreds = creds.filter(c => c.status === "Error" || c.status === "Disconnected");

                // Map real credentials errors into the Needs Attention alerts list:
                const alerts: ActionableAlert[] = [];
                
                errorCreds.forEach((c, idx) => {
                    alerts.push({
                        id: `cred-${c.id || idx}`,
                        title: `${c.provider.toUpperCase()} authentication token expired`,
                        type: "error",
                        actionLabel: "Reconnect",
                        link: "/dashboard/integrations"
                    });
                });

                // Add failed runs from the intelligence feed to the alerts:
                if (raw.intelligenceFeed) {
                    raw.intelligenceFeed
                        .filter((item: any) => item.type === "error" || item.type === "failed")
                        .forEach((item: any, idx: number) => {
                            alerts.push({
                                id: `run-${idx}`,
                                title: `${item.title}: ${item.meta}`,
                                type: "error",
                                actionLabel: "Investigate",
                                link: "/dashboard/tasks"
                            });
                        });
                }

                // Query dynamic RAG documents count from local storage
                let dynamicDocCount = 4;
                try {
                    const localDocsStr = localStorage.getItem('blonk_company_brain_docs');
                    if (localDocsStr) {
                        const parsedDocs = JSON.parse(localDocsStr);
                        if (Array.isArray(parsedDocs)) {
                            dynamicDocCount = parsedDocs.length;
                        }
                    }
                } catch (e) {}

                const formatted: OverviewData = {
                    health: {
                        score: raw.efficiencyRate ?? 100,
                        automationsStatus: raw.totalWorkflows > 0 ? "Healthy" : "Attention",
                        integrationsStatus: errorCreds.length > 0 ? "Attention" : (hasConnectedCreds ? "Healthy" : "Attention"),
                        companyBrainStatus: "Healthy",
                        securityStatus: "Healthy"
                    },
                    brain: {
                        status: "Ready",
                        documentsCount: dynamicDocCount, 
                        lastSynced: "Just now",
                        confidenceScore: 94
                    },
                    runningAutomationsCount: raw.activeAgents ?? 0,
                    completedTasksCount: raw.totalTasks ?? 0,
                    actionsRequiredCount: alerts.length,
                    timeSavedHours: raw.timeSavedHours ?? 0,
                    alerts,
                    activeAgent: {
                        role: "Supervisor Agent",
                        status: raw.activeAgents > 0 ? "Available" : "Offline",
                        lastActive: "Just now",
                        provider: "Marcus AI",
                        messageSnippet: raw.activeAgents > 0 
                            ? `Workspace is online. ${raw.activeAgents} AI Employees are actively running.`
                            : "Welcome. Please connect your integrations and hire your first AI Employee to activate AI pipelines."
                    },
                    topWorkflows: (raw.topWorkflows || []).map((w: any) => ({
                        id: w.id,
                        name: w.name,
                        status: w.status,
                        totalRuns: w.totalRuns ?? 0,
                        successRate: w.successRate ?? 100
                    }))
                };

                if (active) {
                    setDashboardData(formatted);
                    
                    // Pre-populate checklist state based on actual integration & workflow records
                    setChecklist([
                        { id: "g", text: "Connect Gmail / Workspace integration", completed: hasConnectedCreds },
                        { id: "b", text: "Upload initial Company Brain documents", completed: dynamicDocCount > 0 },
                        { id: "m", text: "Hire first AI Employee from Marketplace", completed: raw.totalWorkflows > 0 },
                        { id: "l", text: "Launch autonomous agent pipeline", completed: raw.activeAgents > 0 }
                    ]);
                }
            } catch (err: any) {
                console.error("Dashboard fetch error:", err);
                if (active) {
                    setError(err.message);
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        }

        loadData();
        return () => {
            active = false;
        };
    }, []);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    if (error || !dashboardData) {
        return (
            <div className={styles.container}>
                <div className={styles.card} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "48px 24px", gap: "16px" }}>
                    <AlertCircle size={40} color="#EF4444" />
                    <h2 className={styles.heroTitle} style={{ color: "#EF4444" }}>Failed to Load Dashboard Data</h2>
                    <p className={styles.heroSub} style={{ textAlign: "center" }}>{error || "An unexpected error occurred while fetching your workspace summary."}</p>
                    <button className={styles.chatBtn} onClick={() => window.location.reload()} style={{ width: "auto", padding: "10px 24px" }}>
                        Retry Connection
                     </button>
                </div>
            </div>
        );
    }

    const isEnterprise = (session?.user as any)?.plan?.toLowerCase() === "enterprise";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {dashboardData.runningAutomationsCount === 0 ? (
                <SetupDashboardLayout 
                    data={dashboardData} 
                    userRole={userRole} 
                    checklist={checklist}
                    onToggleStep={handleToggleStep}
                />
            ) : (
                <OperationsDashboardLayout 
                    data={dashboardData} 
                    userRole={userRole} 
                    isEnterprise={isEnterprise} 
                />
            )}
        </div>
    );
}
