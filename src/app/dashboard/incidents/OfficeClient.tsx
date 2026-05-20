"use client";

import React, { useState, useEffect } from "react";
import styles from "./office.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CheckCircle2,
    Circle,
    Loader2,
    AlertTriangle,
    ExternalLink,
    BookOpen,
    MessageSquare,
    Link2,
    Activity,
    ChevronRight,
} from "lucide-react";

type CheckItem = { label: string; done: boolean; current: boolean };

export type OrderCard = {
    id: string;
    orderNumber: string;
    workflowName: string;
    status: string;
    checklist: CheckItem[];
    needsCredentials: boolean;
    isComplete: boolean;
    serverName?: string;
    serverStatus?: string;
    logs: { message: string; at?: string; level?: string }[];
    n8nWorkflowId?: string;
    workflowId?: string;
    templateId?: string;
};

type FeedItem = {
    id: string;
    msg: string;
    detail: string;
    type: string;
    time: string;
    stats: string;
};

export default function OfficeClient({
    orders,
    initialFeed,
}: {
    orders: OrderCard[];
    initialFeed: FeedItem[];
    userRole: string;
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightId = searchParams.get("highlight");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        if (highlightId) {
            const orderToHighlight = orders.find(o => o.templateId === highlightId || o.id === highlightId);
            if (orderToHighlight) {
                setExpandedId(orderToHighlight.id);
                // Scroll to the highlighted item
                setTimeout(() => {
                    const el = document.getElementById(`order-${orderToHighlight.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        } else if (orders.length > 0) {
            setExpandedId(orders[0].id);
        }
    }, [highlightId, orders]);

    return (
        <div className={styles.officeContainer}>
            <style jsx global>{`
                @keyframes glow {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); border-color: #10B981; }
                    50% { box-shadow: 0 0 30px 10px rgba(16, 185, 129, 0.2); border-color: #10B981; }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); border-color: #10B981; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .highlight-glow {
                    animation: glow 2s infinite ease-in-out;
                    border: 2px solid #10B981 !important;
                }
            `}</style>
            <div className={styles.headerArea}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.headerTitle}>My Workflows</h1>
                    <p className={styles.headerSubtitle}>Track order progress from payment to go-live</p>
                </div>
                <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => router.push("/dashboard/marketplace")}
                >
                    Order workflow
                </button>
            </div>

            {orders.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center", background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0" }}>
                    <p style={{ fontWeight: 800, color: "#64748B", marginBottom: 16 }}>No active orders yet.</p>
                    <button type="button" className={styles.btnPrimary} onClick={() => router.push("/dashboard/marketplace")}>
                        Browse Marketplace
                    </button>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {orders.map((order) => {
                        const isHighlighted = highlightId === order.templateId || highlightId === order.id;
                        return (
                            <div
                                key={order.id}
                                id={`order-${order.id}`}
                                className={`${styles.workflowCard} ${isHighlighted ? 'highlight-glow' : ''}`}
                                style={{ cursor: "pointer" }}
                                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                            >
                            <div className={styles.workflowHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#94A3B8" }}>
                                            Order {order.orderNumber}
                                        </div>
                                        <div className={styles.workflowName}>{order.workflowName}</div>
                                    </div>
                                    {isHighlighted && (
                                        <span style={{ 
                                            background: '#10B981', 
                                            color: '#FFF', 
                                            padding: '4px 10px', 
                                            borderRadius: '100px', 
                                            fontSize: '0.65rem', 
                                            fontWeight: 950,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            New
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={styles.statusBadge}
                                    style={{
                                        background: order.isComplete ? "#ECFDF5" : order.needsCredentials ? "#FFFBEB" : "#EFF6FF",
                                        color: order.isComplete ? "#059669" : order.needsCredentials ? "#D97706" : "#2563EB",
                                    }}
                                >
                                    {order.status.replace(/_/g, " ")}
                                </span>
                            </div>

                            {(expandedId === order.id || orders.length === 1) && (
                                <>
                                    <ul style={{ listStyle: "none", padding: 0, margin: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                                        {order.checklist.map((step) => (
                                            <li key={step.label} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700, fontSize: "0.88rem", color: step.done ? "#059669" : step.current ? "#2563EB" : "#94A3B8" }}>
                                                {step.done ? <CheckCircle2 size={18} color="#10B981" /> : step.current ? <Loader2 size={18} className="spin" /> : <Circle size={18} />}
                                                {step.label}
                                            </li>
                                        ))}
                                    </ul>

                                    {order.needsCredentials && (
                                        <div style={{ padding: 16, background: "#FFFBEB", borderRadius: 14, border: "1px solid #FDE68A", marginBottom: 12 }}>
                                            <strong style={{ display: "block", marginBottom: 8 }}>Action Required</strong>
                                            <p style={{ margin: "0 0 12px", fontSize: "0.88rem", color: "#92400E" }}>
                                                Connect integrations to continue.
                                            </p>
                                            <button
                                                type="button"
                                                className={styles.btnPrimary}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push("/dashboard/integrations");
                                                }}
                                            >
                                                <Link2 size={16} /> Connect Integrations
                                            </button>
                                        </div>
                                    )}

                                    {order.isComplete && (
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
                                            <p style={{ width: "100%", fontWeight: 950, color: "#059669", margin: 0 }}>Your workflow is ready.</p>
                                            {order.n8nWorkflowId && (
                                                <button type="button" className={styles.btnSecondary} onClick={(e) => e.stopPropagation()}>
                                                    <ExternalLink size={14} /> Open n8n
                                                </button>
                                            )}
                                            <button type="button" className={styles.btnSecondary} onClick={(e) => e.stopPropagation()}>
                                                <BookOpen size={14} /> View Documentation
                                            </button>
                                            <button type="button" className={styles.btnSecondary} onClick={(e) => { e.stopPropagation(); router.push("/dashboard/support"); }}>
                                                <MessageSquare size={14} /> Contact Support
                                            </button>
                                        </div>
                                    )}

                                    {order.logs.length > 0 && (
                                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #F1F5F9" }}>
                                            <div style={{ fontSize: "0.7rem", fontWeight: 900, color: "#94A3B8", marginBottom: 8 }}>ACTIVITY</div>
                                            {order.logs.map((log, i) => (
                                                <div key={i} style={{ fontSize: "0.8rem", color: "#475569", marginBottom: 4 }}>
                                                    {log.at ? new Date(log.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}{" "}
                                                    {log.message}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )})}
                </div>
            )}

            {initialFeed.length > 0 && (
                <div className={styles.feedCard} style={{ marginTop: 24 }}>
                    <div className={styles.feedHeader}>
                        <div className={styles.feedTitle}>
                            <Activity size={16} /> Notifications
                        </div>
                    </div>
                    <div className={styles.feedList}>
                        {initialFeed.slice(0, 5).map((log) => (
                            <div key={log.id} className={styles.feedItem}>
                                <div className={styles.feedContent}>
                                    <div className={styles.feedMessage}>{log.msg}</div>
                                    <div className={styles.feedStats}>{log.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
