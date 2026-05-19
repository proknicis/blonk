"use client";

import React, { useState, useEffect } from "react";
import styles from "./office.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { X, Activity, ChevronRight, Zap, Filter, MoreHorizontal, Settings, Pause, Play, AlertTriangle, CheckCircle2, Clock, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

interface AppIcon {
    name: string;
    color: string;
}

interface Workflow {
    id: string;
    name: string;
    role: string;
    status: string;
    statusKey: string;
    initials: string;
    color: string;
    lastRun: string | null;
    tasksCount: number;
    runsToday: number;
    successRate: string;
    apps: AppIcon[];
}

interface FeedItem {
    id: string;
    msg: string;
    detail: string;
    type: string;
    time: string;
    stats: string;
}

export default function OfficeClient({ initialWorkflows, initialFeed, userRole }: { initialWorkflows: Workflow[], initialFeed: FeedItem[], userRole: string }) {
    const router = useRouter();
    const [workflows, setWorkflows] = useState(initialWorkflows);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (selectedWorkflow) {
            fetchLogs(selectedWorkflow.id);
        }
    }, [selectedWorkflow]);

    const fetchLogs = async (id: string) => {
        setIsLoadingLogs(true);
        try {
            const res = await fetch(`/api/admin/logs?workflowId=${id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setWorkflowLogs(data);
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const updateWorkflowState = async (workflow: Workflow, action: 'start' | 'end') => {
        const previous = [...workflows];
        const nextStatus = action === 'start' ? 'running' : 'idle';
        setWorkflows(current => current.map(item => item.id === workflow.id ? {
            ...item,
            status: action === 'start' ? 'Running' : 'Paused',
            statusKey: nextStatus,
        } : item));
        try {
            const res = await fetch('/api/workflows/run', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workflowId: workflow.id, action }),
            });
            if (!res.ok) {
                setWorkflows(previous);
            }
        } catch {
            setWorkflows(previous);
        }
    };

    const filteredWorkflows = workflows.filter(w => {
        if (filter === 'all') return true;
        return w.statusKey === filter;
    });

    const stats = {
        running: workflows.filter(w => w.statusKey === 'running').length,
        failed: workflows.filter(w => w.statusKey === 'failed').length,
        needs_setup: workflows.filter(w => w.statusKey === 'needs_setup').length,
        total: workflows.length
    };

    return (
        <div className={styles.officeContainer}>
            {/* Header Area */}
            <div className={styles.headerArea}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.headerTitle}>Workflows</h1>
                    <p className={styles.headerSubtitle}>Monitor and manage your automated workflows</p>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.filterBar}>
                        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} label="All" />
                        <FilterButton active={filter === 'running'} onClick={() => setFilter('running')} color="#10B981" label="Running" />
                        <FilterButton active={filter === 'failed'} onClick={() => setFilter('failed')} color="#EF4444" label="Failed" />
                        <FilterButton active={filter === 'needs_setup'} onClick={() => setFilter('needs_setup')} color="#F59E0B" label="Needs Setup" />
                    </div>
                </div>
            </div>

            {/* Stats Strip */}
            <div className={styles.statsStrip}>
                <StatCard icon={<Play size={20} color="#10B981" />} iconBg="#ECFDF5" count={stats.running} label="Running" />
                <StatCard icon={<AlertTriangle size={20} color="#EF4444" />} iconBg="#FEF2F2" count={stats.failed} label="Failed" />
                <StatCard icon={<Settings size={20} color="#F59E0B" />} iconBg="#FFFBEB" count={stats.needs_setup} label="Needs Setup" />
                <StatCard icon={<Activity size={20} color="#64748B" />} iconBg="#F1F5F9" count={stats.total} label="Total" />
            </div>

            {/* Main Content */}
            <div className={styles.mainLayout}>
                {/* Active Workflows Area */}
                <div className={styles.workflowsArea}>
                    <div className={styles.sectionHeader}>
                        <h3 className={styles.sectionTitle}>Active Workflows</h3>
                        <span className={styles.sectionCount}>{filteredWorkflows.length} workflows</span>
                    </div>
                    <div className={styles.workflowGrid}>
                        {filteredWorkflows.map(wf => (
                            <div key={wf.id} className={styles.workflowCard}>
                                <div className={styles.workflowHeader}>
                                    <div className={styles.workflowAvatar} style={{ background: wf.color }}>
                                        {wf.initials}
                                    </div>
                                    <div className={styles.workflowInfo}>
                                        <div className={styles.workflowName}>{wf.name}</div>
                                        <div className={styles.workflowRole}>{wf.role}</div>
                                    </div>
                                    <div className={`${styles.statusBadge} ${styles[wf.statusKey]}`}>
                                        {wf.status}
                                    </div>
                                </div>
                                
                                <p className={styles.workflowDescription}>
                                    {wf.role === 'Analytics Workflow' ? "Generates daily reports and delivers to stakeholders via email." : 
                                     wf.role === 'Operations Workflow' ? "Monitors data systems and triggers alerts on anomalies or failures." : 
                                     wf.role === 'Finance Workflow' ? "Reconciles transactions and flags discrepancies for review." : "Syncs critical datasets between warehouse and downstream systems."}
                                </p>
                                
                                <div className={styles.workflowMetrics}>
                                    <div className={styles.metric}>
                                        <div className={styles.metricLabel}>Runs Today</div>
                                        <div className={styles.metricValue}>{wf.runsToday}</div>
                                    </div>
                                    <div className={styles.metric}>
                                        <div className={styles.metricLabel}>Success Rate</div>
                                        <div className={styles.metricValue} style={{ color: wf.statusKey === 'failed' ? '#EF4444' : '#10B981' }}>{wf.successRate}</div>
                                    </div>
                                    <div className={styles.metric}>
                                        <div className={styles.metricLabel}>Last Run</div>
                                        <div className={styles.metricValue}>
                                            {wf.statusKey === 'needs_setup' ? 'Never' : '5m ago'}
                                            {wf.statusKey !== 'needs_setup' && <div className={`${styles.statusDot} ${styles[wf.statusKey]}`} />}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.connectedApps}>
                                    <div className={styles.appsLabel}>Connected Apps</div>
                                    <div className={styles.appsList}>
                                        {wf.apps.map((app, idx) => (
                                            <div key={idx} className={styles.appIcon} style={{ background: app.color, marginLeft: idx > 0 ? '-8px' : '0' }}>
                                                {app.name[0]}
                                            </div>
                                        ))}
                                        <div className={styles.appIcon} style={{ background: '#F1F5F9', color: '#64748B', marginLeft: '-8px' }}>
                                            +{wf.runsToday % 3 + 1}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.workflowActions}>
                                    <button onClick={() => setSelectedWorkflow(wf)} className={styles.btnPrimary}>
                                        Open <ChevronRight size={14} />
                                    </button>
                                    <button onClick={() => wf.statusKey === 'needs_setup' ? router.push('/dashboard/registry') : updateWorkflowState(wf, wf.statusKey === 'running' ? 'end' : 'start')} className={styles.btnSecondary}>
                                        {wf.statusKey === 'needs_setup' ? <><Settings size={14} /> Setup</> : wf.statusKey === 'running' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
                                    </button>
                                    <button onClick={() => router.push('/dashboard/registry')} className={styles.btnSecondary}>
                                        <Settings size={14} /> Settings
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed Area */}
                <div className={styles.feedArea}>
                    <div className={styles.feedCard}>
                        <div className={styles.feedHeader}>
                            <div className={styles.feedTitle}>
                                <Activity size={16} /> Activity Feed
                            </div>
                        </div>

                        <div className={styles.feedList}>
                            {initialFeed.map((log, i) => (
                                <div key={i} className={styles.feedItem}>
                                    <div className={`${styles.feedIcon} ${styles[log.type]}`}>
                                        {log.type === 'success' ? <CheckCircle2 size={16} /> : (log.type === 'failed' ? <X size={16} /> : <AlertTriangle size={16} />)}
                                    </div>
                                    <div className={styles.feedContent}>
                                        <div className={styles.feedHeaderRow}>
                                            <div className={styles.feedMessage}>{log.msg}</div>
                                            <div className={styles.feedTime}>{log.time}</div>
                                        </div>
                                        <div className={styles.feedStats}>{log.stats}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className={styles.feedFooter}>
                            <span className={styles.viewAllLink}>View all activity <ChevronRight size={14} /></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedWorkflow && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setSelectedWorkflow(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={() => setSelectedWorkflow(null)}>
                                <X size={20} />
                            </button>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalTitle}>{selectedWorkflow.name}</div>
                                <div className={styles.modalSubtitle}>Workflow execution logs and details</div>
                            </div>
                            <div className={styles.modalBody}>
                                {isLoadingLogs ? (
                                    <div className={styles.loadingState}>
                                        <Clock size={32} color="#94A3B8" />
                                        <p>Loading logs...</p>
                                    </div>
                                ) : workflowLogs.length > 0 ? (
                                    <div className={styles.logsList}>
                                        {workflowLogs.map((log, i) => (
                                            <div key={i} className={styles.logItem}>
                                                <div className={styles.logHeader}>
                                                    <div className={styles.logTime}>{new Date(log.createdAt).toLocaleString()}</div>
                                                </div>
                                                <div className={styles.logMsg}>{log.result?.message || log.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={styles.emptyLogs}>
                                        <FileText size={32} color="#94A3B8" />
                                        <p>No logs available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}

function FilterButton({ active, onClick, color, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={`${styles.filterButton} ${active ? styles.filterButtonActive : ''}`}
            style={{ color: active ? (color || '#10B981') : '#64748B', background: active ? (color ? `${color}15` : '#ECFDF5') : 'transparent' }}
        >
            {label}
        </button>
    )
}

function StatCard({ icon, iconBg, count, label }: any) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: iconBg }}>
                {icon}
            </div>
            <div className={styles.statInfo}>
                <div className={styles.statCount}>{count}</div>
                <div className={styles.statLabel}>{label}</div>
            </div>
        </div>
    )
}
