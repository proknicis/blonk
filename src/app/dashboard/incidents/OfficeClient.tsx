"use client";

import React, { useState, useEffect, useMemo } from "react";
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
    Play,
    Pause,
    Settings,
    MoreHorizontal,
    Search,
    Filter,
    ArrowUpRight,
    Zap,
    X,
    Check,
    Clock,
    Layout,
    Database,
    Globe,
    Shield,
    TrendingUp,
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
    createdAt?: string;
    runsToday: number;
    successRate: string;
    lastRun: string;
    description: string;
    icon?: string;
    color?: string;
    apps: { name: string; icon: string }[];
};

type FeedItem = {
    id: string;
    msg: string;
    detail: string;
    type: string;
    time: string;
    stats: string;
};

// Mock helper to get icons/initials for workflows if not provided by template
const getWorkflowMeta = (name: string, templateIcon?: string, templateColor?: string) => {
    if (templateIcon && templateColor) {
        return { initials: templateIcon.substring(0, 2).toUpperCase(), color: templateColor };
    }
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const color = colors[Math.abs(name.length % colors.length)];
    return { initials, color };
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
    
    const [filter, setFilter] = useState("All");
    const [sortBy, setSortBy] = useState("Last run");
    const [searchQuery, setSearchQuery] = useState("");

    // Process orders with real data
    const processedOrders = useMemo(() => {
        return orders.map(order => {
            const isRunning = order.status === 'Active' || order.status === 'Running' || order.status === 'Ready';
            const isFailed = order.status === 'Failed' || order.status === 'Error';
            const needsSetup = order.status === 'Awaiting_Credentials' || order.status === 'WAITING_CREDENTIALS';
            
            let statusLabel = "PROVISIONING";
            if (isRunning) statusLabel = "RUNNING";
            if (isFailed) statusLabel = "FAILED";
            if (needsSetup) statusLabel = "NEEDS SETUP";

            return {
                ...order,
                statusLabel,
                type: order.orderNumber === "INSTALLED" ? "Operational Workflow" : "Provisioning Pipeline"
            };
        });
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return processedOrders.filter(o => {
            const matchesFilter = filter === "All" || o.statusLabel === filter.toUpperCase();
            const matchesSearch = o.workflowName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [processedOrders, filter, searchQuery]);

    const stats = useMemo(() => {
        return {
            running: processedOrders.filter(o => o.statusLabel === 'RUNNING').length,
            failed: processedOrders.filter(o => o.statusLabel === 'FAILED').length,
            needsSetup: processedOrders.filter(o => o.statusLabel === 'NEEDS SETUP').length,
            total: processedOrders.length
        };
    }, [processedOrders]);

    useEffect(() => {
        if (highlightId) {
            const el = document.getElementById(`order-${highlightId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightId]);

    return (
        <div className={styles.officeContainer}>
            <style jsx global>{`
                @keyframes glow {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); border-color: #10B981; }
                    50% { box-shadow: 0 0 30px 10px rgba(16, 185, 129, 0.2); border-color: #10B981; }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); border-color: #10B981; }
                }
                .highlight-glow {
                    animation: glow 2s infinite ease-in-out;
                    border: 2px solid #10B981 !important;
                }
            `}</style>

            {/* HEADER AREA */}
            <div className={styles.headerArea}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.headerTitle}>My Workflows</h1>
                    <p className={styles.headerSubtitle}>Manage and monitor your institutional automation fleet.</p>
                </div>

                <div style={{ flex: 1, maxWidth: '400px', position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text" 
                        placeholder="Search systems, loops, or co-pilots..." 
                        style={{ 
                            width: '100%', 
                            height: '48px', 
                            padding: '0 16px 0 48px', 
                            borderRadius: '12px', 
                            border: '1px solid #E2E8F0',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            outline: 'none'
                        }}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <div className={styles.statusSummary}>
                    <div className={styles.summaryItem}>
                        <div className={styles.summaryIcon}><Play size={16} color="#10B981" /></div>
                        <div>
                            <div className={styles.summaryValue}>{stats.running}</div>
                            <div className={styles.summaryLabel}>Running</div>
                        </div>
                    </div>
                    <div className={styles.summaryItem}>
                        <div className={styles.summaryIcon}><X size={16} color="#EF4444" /></div>
                        <div>
                            <div className={styles.summaryValue}>{stats.failed}</div>
                            <div className={styles.summaryLabel}>Failed</div>
                        </div>
                    </div>
                    <div className={styles.summaryItem}>
                        <div className={styles.summaryIcon}><AlertTriangle size={16} color="#F59E0B" /></div>
                        <div>
                            <div className={styles.summaryValue}>{stats.needsSetup}</div>
                            <div className={styles.summaryLabel}>Needs Setup</div>
                        </div>
                    </div>
                    <div className={styles.divider} />
                    <div className={styles.summaryItem}>
                        <div>
                            <div className={styles.summaryValue}>{stats.total}</div>
                            <div className={styles.summaryLabel}>Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROLS ROW */}
            <div className={styles.controlsRow}>
                <div className={styles.filterGroup}>
                    <button onClick={() => setFilter("All")} className={`${styles.filterBtn} ${filter === "All" ? styles.filterBtnActive : ""}`}>
                        <Layout size={14} /> All
                    </button>
                    <button onClick={() => setFilter("Running")} className={`${styles.filterBtn} ${filter === "Running" ? styles.filterBtnActive : ""}`}>
                        <div className={styles.filterDot} style={{ background: '#10B981' }} /> Running
                    </button>
                    <button onClick={() => setFilter("Failed")} className={`${styles.filterBtn} ${filter === "Failed" ? styles.filterBtnActive : ""}`}>
                        <div className={styles.filterDot} style={{ background: '#EF4444' }} /> Failed
                    </button>
                    <button onClick={() => setFilter("Needs Setup")} className={`${styles.filterBtn} ${filter === "Needs Setup" ? styles.filterBtnActive : ""}`}>
                        <div className={styles.filterDot} style={{ background: '#F59E0B' }} /> Needs setup
                    </button>
                </div>

                <div className={styles.sortGroup}>
                    <span className={styles.sortLabel}>Sort by</span>
                    <select className={styles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                        <option>Last run</option>
                        <option>Name</option>
                        <option>Success rate</option>
                    </select>
                </div>
            </div>

            {/* MAIN LAYOUT */}
            <div className={styles.mainLayout}>
                {/* WORKFLOWS GRID */}
                <div className={styles.workflowsArea}>
                    <div className={styles.areaHeader}>Active Workflows</div>
                    
                    {filteredOrders.length === 0 ? (
                        <div style={{ padding: 48, textAlign: "center", background: "#fff", borderRadius: 24, border: "1px solid #E2E8F0" }}>
                            <p style={{ fontWeight: 800, color: "#64748B", marginBottom: 16 }}>No workflows matching your criteria.</p>
                            <button type="button" style={{ 
                                padding: '12px 24px', 
                                background: '#0F172A', 
                                color: '#FFF', 
                                borderRadius: '12px', 
                                border: 'none', 
                                fontWeight: 900,
                                cursor: 'pointer'
                            }} onClick={() => router.push("/dashboard/marketplace")}>
                                Browse Marketplace
                            </button>
                        </div>
                    ) : (
                        <div className={styles.workflowGrid}>
                            {filteredOrders.map((order) => {
                                const { initials, color } = getWorkflowMeta(order.workflowName, order.icon, order.color);
                                const isHighlighted = highlightId === order.templateId || highlightId === order.id;
                                
                                return (
                                    <div 
                                        key={order.id} 
                                        id={`order-${order.id}`}
                                        className={`${styles.workflowCard} ${isHighlighted ? 'highlight-glow' : ''}`}
                                    >
                                        <div className={styles.cardHeader}>
                                            <div className={styles.cardIdentity}>
                                                <div className={styles.cardIcon} style={{ background: color }}>{initials}</div>
                                                <div className={styles.cardNameGroup}>
                                                    <div className={styles.cardName}>{order.workflowName}</div>
                                                    <div className={styles.cardType}>{order.type}</div>
                                                </div>
                                            </div>
                                            <div className={styles.cardBadgeGroup}>
                                                <span className={`${styles.statusBadge} ${styles[order.statusLabel.toLowerCase().replace(' ', '')]}`}>
                                                    {order.statusLabel}
                                                </span>
                                                <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <p className={styles.cardDesc}>{order.description}</p>

                                        <div className={styles.cardMetrics}>
                                            <div className={styles.metricItem}>
                                                <span className={styles.metricLabel}>Runs Today</span>
                                                <span className={styles.metricValue}>{order.runsToday}</span>
                                            </div>
                                            <div className={styles.metricItem}>
                                                <span className={styles.metricLabel}>Success Rate</span>
                                                <span className={styles.metricValue} style={{ color: '#10B981' }}>{order.successRate}</span>
                                            </div>
                                            <div className={styles.metricItem}>
                                                <span className={styles.metricLabel}>Last Run</span>
                                                <span className={styles.metricValue}>
                                                    {order.lastRun}
                                                    {order.lastRun !== "Never" && (
                                                        <span className={styles.lastRunDot} style={{ background: order.statusLabel === 'RUNNING' ? '#10B981' : '#EF4444' }} />
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.connectedApps}>
                                            <div className={styles.appsTitle}>Connected Apps</div>
                                            <div className={styles.appsList}>
                                                {order.apps.length > 0 ? (
                                                    order.apps.map(app => (
                                                        <div key={app.name} className={styles.appIcon} title={app.name}>
                                                            <img src={app.icon} alt={app.name} />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Standard Node</div>
                                                )}
                                                {order.apps.length > 3 && <span className={styles.moreApps}>+{order.apps.length - 3}</span>}
                                            </div>
                                        </div>

                                        <div className={styles.cardActions}>
                                            <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => order.n8nWorkflowId && window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/api/n8n/proxy/${order.n8nWorkflowId}`, '_blank')}>
                                                Open <ArrowUpRight size={14} />
                                            </button>
                                            <button className={styles.actionBtn}>
                                                {order.statusLabel === 'RUNNING' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
                                            </button>
                                            <button className={styles.actionBtn}>
                                                <Settings size={14} /> Settings
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* SIDEBAR / ACTIVITY FEED */}
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.sidebarTitle}>
                            <Activity size={16} /> Activity Feed
                        </div>
                        <a href="#" className={styles.viewAll}>View all</a>
                    </div>

                    <div className={styles.activityList}>
                        {initialFeed.slice(0, 8).map((item) => (
                            <div key={item.id} className={styles.activityItem}>
                                <div className={styles.activityIcon} style={{ 
                                    background: item.type === 'success' ? '#ECFDF5' : item.type === 'warning' ? '#FFFBEB' : '#FEF2F2' 
                                }}>
                                    {item.type === 'success' ? <Check size={14} color="#10B981" /> : item.type === 'warning' ? <AlertTriangle size={14} color="#F59E0B" /> : <X size={14} color="#EF4444" />}
                                </div>
                                <div className={styles.activityContent}>
                                    <div className={styles.activityWorkflow}>{item.msg}</div>
                                    <div className={styles.activityStatus}>{item.detail}</div>
                                    <div className={styles.activityTime}>{item.time}</div>
                                </div>
                            </div>
                        ))}
                        
                        {initialFeed.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 700 }}>
                                No recent activity.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

