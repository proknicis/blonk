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
    orderType?: string;
    customDetails?: any;
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
        const sorted = orders.map(order => {
            const isRunning = order.status === 'Active' || order.status === 'Running' || order.status === 'Ready';
            const isFailed = order.status === 'Failed' || order.status === 'Error';
            const needsSetup = order.status === 'Awaiting_Credentials' || order.status === 'WAITING_CREDENTIALS';
            
            let statusLabel = "PROVISIONING";
            if (order.orderType === 'Custom Request') statusLabel = "UNDER REVIEW";
            else if (isRunning) statusLabel = "RUNNING";
            else if (isFailed) statusLabel = "FAILED";
            else if (needsSetup) statusLabel = "NEEDS SETUP";

            return {
                ...order,
                statusLabel,
                type: order.orderType === 'Custom Request' 
                    ? "Custom Workflow Request" 
                    : (order.orderNumber === "INSTALLED" ? "Operational Workflow" : "Deployment Pipeline")
            };
        });
        return sorted;
    }, [orders]);

    const newestOrderByTemplate = useMemo(() => {
        if (!highlightId) return null;
        // If highlightId is a templateId, find the newest order for it
        const matching = processedOrders.filter(o => o.templateId === highlightId);
        if (matching.length > 0) {
            return matching.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0].id;
        }
        return highlightId; // Assume it's a direct order ID
    }, [processedOrders, highlightId]);

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
        if (newestOrderByTemplate) {
            const el = document.getElementById(`order-${newestOrderByTemplate}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [newestOrderByTemplate]);

    return (
        <div className={styles.officeContainer}>
            <style jsx global>{`
                @keyframes highlight {
                    0% { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
                    50% { border-color: #10B981; box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.2); }
                    100% { border-color: #10B981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
                }
                .highlight-glow {
                    animation: highlight 2s ease-in-out 3; /* Pulse only 3 times then stop */
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
                                const isHighlighted = newestOrderByTemplate === order.id;
                                
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
                                                    <div className={styles.cardType}>
                                                        {order.statusLabel === 'RUNNING' ? 'Operational Workflow' : 'Deployment Pipeline'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.cardBadgeGroup}>
                                                {isHighlighted && (
                                                    <span style={{ 
                                                        background: '#10B981', 
                                                        color: '#FFF', 
                                                        padding: '4px 8px', 
                                                        borderRadius: '6px', 
                                                        fontSize: '0.6rem', 
                                                        fontWeight: 950,
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        Just Added
                                                    </span>
                                                )}
                                                <span className={`${styles.statusBadge} ${styles[order.statusLabel.toLowerCase().replace(' ', '')]}`}>
                                                    {order.statusLabel}
                                                </span>
                                                <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        {order.orderType === 'Custom Request' ? (
                                            /* CUSTOM REQUEST VIEW */
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div style={{ 
                                                    background: '#EFF6FF', 
                                                    border: '1px solid #BFDBFE', 
                                                    padding: '16px', 
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 12
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Clock size={16} color="#3B82F6" className="spin" style={{ animationDuration: '4s' }} />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1E40AF' }}>Under Review</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1E3A8A', lineHeight: 1.4 }}>
                                                        We have successfully received your custom workflow request. Our team is currently reviewing your requirements, and we will contact you shortly about the deployment details.
                                                    </p>
                                                </div>

                                                {order.customDetails && (
                                                    <div style={{ 
                                                        background: '#F8FAFC', 
                                                        border: '1px solid #E2E8F0', 
                                                        padding: '14px', 
                                                        borderRadius: '14px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 10
                                                    }}>
                                                        {order.customDetails.description && (
                                                            <div>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Description</span>
                                                                <p style={{ fontSize: '0.75rem', fontWeight: 650, color: '#334155', marginTop: 2 }}>{order.customDetails.description}</p>
                                                            </div>
                                                        )}
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                                            {order.customDetails.category && (
                                                                <div>
                                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Category</span>
                                                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{order.customDetails.category}</p>
                                                                </div>
                                                            )}
                                                            {order.customDetails.urgency && (
                                                                <div>
                                                                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Urgency</span>
                                                                    <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0F172A', marginTop: 2, textTransform: 'capitalize' }}>{order.customDetails.urgency}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {order.customDetails.tools && (
                                                            <div>
                                                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Integrations Requested</span>
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                                                    {order.customDetails.tools.split(',').map((tool: string, idx: number) => (
                                                                        <span key={idx} style={{ 
                                                                            background: '#F1F5F9', 
                                                                            color: '#475569', 
                                                                            padding: '3px 8px', 
                                                                            borderRadius: '6px', 
                                                                            fontSize: '0.65rem', 
                                                                            fontWeight: 750 
                                                                        }}>{tool.trim()}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : order.statusLabel === 'PROVISIONING' || order.statusLabel === 'NEEDS SETUP' ? (
                                            /* DEPLOYMENT PIPELINE VIEW */
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {order.checklist.map((step, i) => (
                                                        <div key={i} style={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            gap: 10,
                                                            opacity: step.done || step.current ? 1 : 0.4
                                                        }}>
                                                            {step.done ? (
                                                                <Check size={14} color="#10B981" style={{ background: '#ECFDF5', borderRadius: '50%', padding: 2 }} />
                                                            ) : step.current ? (
                                                                <Loader2 size={14} color="#3B82F6" className="spin" />
                                                            ) : (
                                                                <Circle size={14} color="#94A3B8" />
                                                            )}
                                                            <span style={{ 
                                                                fontSize: '0.8rem', 
                                                                fontWeight: step.current ? 800 : 600,
                                                                color: step.current ? '#0F172A' : '#64748B'
                                                            }}>
                                                                {step.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {order.needsCredentials && (
                                                    <div style={{ 
                                                        background: '#FFFBEB', 
                                                        border: '1px solid #FEF3C7', 
                                                        padding: '12px', 
                                                        borderRadius: '12px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 8
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <AlertTriangle size={14} color="#F59E0B" />
                                                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400E' }}>Configuration Required</span>
                                                        </div>
                                                        <button 
                                                            onClick={() => router.push('/dashboard/integrations')}
                                                            style={{ 
                                                                width: '100%',
                                                                padding: '8px',
                                                                background: '#F59E0B',
                                                                color: '#FFF',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 900,
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Setup Integrations
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* OPERATIONAL VIEW */
                                            <>
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
                                            </>
                                        )}

                                        {order.orderType === 'Custom Request' ? (
                                            <div className={styles.cardActions}>
                                                <button 
                                                    className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
                                                    onClick={() => router.push('/dashboard/support')}
                                                    style={{ gridColumn: 'span 3', width: '100%' }}
                                                >
                                                    <MessageSquare size={14} /> Contact Support
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={styles.cardActions}>
                                                <button 
                                                    className={`${styles.actionBtn} ${order.statusLabel === 'RUNNING' ? styles.actionBtnPrimary : ''}`} 
                                                    onClick={() => order.n8nWorkflowId && window.open(`${process.env.NEXT_PUBLIC_BASE_URL}/api/n8n/proxy/${order.n8nWorkflowId}`, '_blank')}
                                                    disabled={order.statusLabel === 'PROVISIONING'}
                                                    style={{ opacity: order.statusLabel === 'PROVISIONING' ? 0.5 : 1 }}
                                                >
                                                    Open <ArrowUpRight size={14} />
                                                </button>
                                                <button className={styles.actionBtn} disabled={order.statusLabel === 'PROVISIONING'} style={{ opacity: order.statusLabel === 'PROVISIONING' ? 0.5 : 1 }}>
                                                    {order.statusLabel === 'RUNNING' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
                                                </button>
                                                <button className={styles.actionBtn}>
                                                    <Settings size={14} /> Settings
                                                </button>
                                            </div>
                                        )}
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

