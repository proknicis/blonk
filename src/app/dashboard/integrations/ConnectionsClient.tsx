"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, LayoutGrid, Search, ArrowRight, ShieldCheck, Info, MoreHorizontal } from "lucide-react";
import styles from "./connections.module.css";

interface Connection {
    id: string;
    app: string;
    category: string;
    status: string;
    statusKey: string;
    workflows: string[];
    lastChecked: string;
    health: string;
    action: string;
    color: string;
}

interface AttentionItem {
    id: string;
    app: string;
    issue: string;
    time: string;
    color: string;
}

export default function ConnectionsClient({ initialConnections, needsAttention, pendingWorkflows = [] }: { initialConnections: Connection[], needsAttention: AttentionItem[], pendingWorkflows?: string[] }) {
    const router = useRouter();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState("");

    const filteredConnections = useMemo(() => {
        const term = search.trim().toLowerCase();
        return initialConnections.filter(conn => {
            const matchesFilter = filter === 'All' || (filter === 'Connected' ? conn.statusKey === 'connected' : conn.statusKey !== 'connected');
            const matchesSearch = !term || [conn.app, conn.category, conn.status, conn.health, ...conn.workflows].some(value => value.toLowerCase().includes(term));
            return matchesFilter && matchesSearch;
        });
    }, [filter, initialConnections, search]);

    const connectedCount = initialConnections.filter(conn => conn.statusKey === 'connected').length;
    const notConnectedCount = initialConnections.filter(conn => conn.statusKey === 'not_connected').length;
    const issueCount = initialConnections.length - connectedCount - notConnectedCount;

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Connections</h1>
                <p className={styles.headerSubtitle}>
                    Manage connected apps, credentials, and integration health.
                </p>
                {pendingWorkflows.length > 0 && (
                    <div style={{ marginTop: 16, padding: '14px 18px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 14, fontSize: '0.88rem', fontWeight: 700, color: '#92400E' }}>
                        Connect apps below for: <strong>{pendingWorkflows.join(', ')}</strong>. Credentials are saved here and used when admin finishes setup.
                    </div>
                )}
            </div>

            {/* Health Summary Strip */}
            <div className={styles.healthStrip}>
                <HealthCard icon={<CheckCircle2 size={24} color="#10B981" />} iconBg="#ECFDF5" count={connectedCount} label="Connected" />
                <HealthCard icon={<AlertTriangle size={24} color="#F59E0B" />} iconBg="#FFFBEB" count={0} label="Needs Reconnect" />
                <HealthCard icon={<XCircle size={24} color="#EF4444" />} iconBg="#FEF2F2" count={issueCount} label="Issues" />
                <HealthCard icon={<LayoutGrid size={24} color="#64748B" />} iconBg="#F1F5F9" count={initialConnections.length} label="Total Apps" />
            </div>

            <div className={styles.mainLayout}>
                {/* Left Column - Main Table */}
                <div className={styles.leftColumn}>
                    {/* Filters & Search */}
                    <div className={styles.filterBar}>
                        <div className={styles.filterGroup}>
                            <div className={styles.filterPills}>
                                <FilterPill active={filter === 'All'} onClick={() => setFilter('All')} label="All" />
                                <FilterPill active={filter === 'Connected'} onClick={() => setFilter('Connected')} label="Connected" color="#10B981" />
                                <FilterPill active={filter === 'Issues'} onClick={() => setFilter('Issues')} label="Issues" color="#EF4444" />
                            </div>
                        </div>
                        
                        <div className={styles.filterGroup}>
                            <div className={styles.searchBox}>
                                <Search size={16} color="#94A3B8" />
                                <input 
                                    placeholder="Search connections..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                />
                            </div>
                            <span 
                                className={styles.clearFilters} 
                                onClick={() => { setSearch(""); setFilter("All"); }}
                            >
                                Clear filters
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={styles.tableContainer}>
                        <table className={styles.connectionsTable}>
                            <thead>
                                <tr>
                                    <th>ALL CONNECTIONS<br/>APP</th>
                                    <th><br/>STATUS</th>
                                    <th><br/>USED IN WORKFLOWS</th>
                                    <th><br/>LAST CHECKED</th>
                                    <th style={{ textAlign: 'right' }}><br/>ACTION</th>
                                    <th style={{ width: 40 }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredConnections.map((conn, i) => (
                                    <tr key={conn.id}>
                                        <td>
                                            <div className={styles.appCell}>
                                                <div className={styles.appIcon} style={{ background: conn.color }}>
                                                    {conn.app[0]}
                                                </div>
                                                <div className={styles.appInfo}>
                                                    <div className={styles.appName}>{conn.app}</div>
                                                    <div className={styles.appCategory}>{conn.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.statusText} style={{ color: getStatusColor(conn.statusKey) }}>
                                                {conn.status}
                                            </div>
                                            <div className={styles.statusSub}>
                                                {conn.health === 'Healthy' ? 'Healthy' : conn.health === 'Not connected' ? 'Not set up' : conn.health === 'Reconnect needed' ? 'Re-auth required' : 'Token expired'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.workflowList}>
                                                {conn.workflows.map((w, j) => (
                                                    <div key={j} className={styles.workflowTag}>
                                                        {w.startsWith('+') ? <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800, color: '#64748B' }}>{w}</span> : w}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>{conn.lastChecked}</div>
                                            <div className={styles.statusSub} style={{ color: getStatusColor(conn.statusKey), display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {conn.health} {conn.statusKey !== 'connected' && conn.statusKey !== 'not_connected' && <div style={{width: 6, height: 6, borderRadius: '50%', background: getStatusColor(conn.statusKey)}}/>}
                                                {conn.statusKey === 'connected' && <div style={{width: 6, height: 6, borderRadius: '50%', background: '#10B981'}}/>}
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button 
                                                className={styles.actionButton}
                                                onClick={() => router.push('/dashboard/access')}
                                            >
                                                {conn.action}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right', paddingRight: 24 }}>
                                            <MoreHorizontal size={16} color="#94A3B8" style={{ cursor: 'pointer' }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.tableFooter}>
                        <span className={styles.showingText}>
                            Showing {filteredConnections.length} of {initialConnections.length} connections
                        </span>
                    </div>
                </div>

                {/* Right Column - Needs Attention Panel */}
                <div className={styles.rightColumn}>
                    <div className={styles.attentionCard}>
                        <div className={styles.attentionHeader}>
                            <div className={styles.attentionTitle}>
                                <AlertTriangle size={14} /> NEEDS ATTENTION
                            </div>
                            <div className={styles.attentionBadge}>
                                {needsAttention.length}
                            </div>
                        </div>

                        <div className={styles.attentionList}>
                            {needsAttention.map((item, i) => (
                                <div key={i} className={styles.attentionItem}>
                                    <div className={styles.attentionItemHeader}>
                                        <div className={styles.attentionItemInfo}>
                                            <div className={styles.attentionItemIcon} style={{ background: item.color }}>
                                                {item.app[0]}
                                            </div>
                                            <div>
                                                <div className={styles.attentionItemName}>{item.app}</div>
                                                <div className={styles.attentionItemIssue}>{item.issue}</div>
                                            </div>
                                        </div>
                                        <span className={styles.attentionItemTime}>{item.time}</span>
                                    </div>
                                    <button 
                                        className={styles.configureButton}
                                        onClick={() => router.push('/dashboard/access')}
                                    >
                                        Configure
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.viewAllButton}>
                            <span className={styles.viewAllLink}>
                                View all issues <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>

                    <div className={styles.infoCard}>
                        <div className={styles.infoCardHeader}>
                            <ShieldCheck size={20} color="#10B981" />
                            <span className={styles.infoCardTitle}>Secure & Private</span>
                        </div>
                        <p className={styles.infoCardText}>
                            Your credentials are encrypted and stored securely. We never share access without your permission.
                        </p>
                        <span className={styles.infoCardLink}>
                            Learn more about security <ArrowRight size={12} />
                        </span>
                    </div>

                    <div className={styles.infoCardGray}>
                        <div className={styles.infoCardHeader}>
                            <Info size={20} color="#3B82F6" />
                            <span className={styles.infoCardTitle}>Permission Notes</span>
                        </div>
                        <p className={styles.infoCardText}>
                            Some apps may require additional scopes to enable advanced features in your workflows.
                        </p>
                        <span className={styles.infoCardLinkBlue}>
                            View permission guide <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HealthCard({ icon, iconBg, count, label }: any) {
    return (
        <div className={styles.healthCard}>
            <div className={styles.healthIcon} style={{ background: iconBg }}>
                {icon}
            </div>
            <div className={styles.healthInfo}>
                <div className={styles.healthCount}>{count}</div>
                <div className={styles.healthLabel}>{label}</div>
            </div>
        </div>
    )
}

function FilterPill({ active, onClick, label, color }: any) {
    return (
        <button 
            onClick={onClick}
            className={`${styles.filterPill} ${active ? styles.filterPillActive : ''}`}
            style={{ color: active ? (color || '#0F172A') : '#64748B', background: active ? (color ? `${color}15` : '#F1F5F9') : 'transparent' }}
        >
            {label}
        </button>
    )
}

function getStatusColor(statusKey: string) {
    if (statusKey === 'connected') return '#10B981';
    if (statusKey === 'expired') return '#EF4444';
    if (statusKey === 'needs_reconnect') return '#F59E0B';
    return '#64748B';
}
