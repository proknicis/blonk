"use client";

import React, { useState, useEffect } from "react";
import styles from "./office.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { X, Activity, BarChart3, Clock, AlertCircle, CheckCircle2, ChevronRight, Zap, Sparkles, Filter, MoreHorizontal, Settings, Pause, Play, AlertTriangle } from "lucide-react";

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
    const [workflows] = useState(initialWorkflows);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, background: '#fff', padding: 6, borderRadius: 100, border: '1px solid #E2E8F0' }}>
                    <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<div style={{ width: 14, height: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}><div style={{background: filter==='all'?'#10B981':'#94A3B8', borderRadius: 2}}/><div style={{background: filter==='all'?'#10B981':'#94A3B8', borderRadius: 2}}/><div style={{background: filter==='all'?'#10B981':'#94A3B8', borderRadius: 2}}/><div style={{background: filter==='all'?'#10B981':'#94A3B8', borderRadius: 2}}/></div>} label="All" />
                    <FilterButton active={filter === 'running'} onClick={() => setFilter('running')} color="#10B981" label="Running" />
                    <FilterButton active={filter === 'failed'} onClick={() => setFilter('failed')} color="#EF4444" label="Failed" />
                    <FilterButton active={filter === 'needs_setup'} onClick={() => setFilter('needs_setup')} color="#F59E0B" label="Needs setup" />
                </div>
                
                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B', display: 'flex', gap: 8, alignItems: 'center' }}>
                        Sort by <select style={{ border: 'none', background: 'transparent', fontWeight: 800, color: '#0F172A', outline: 'none' }}><option>Last run</option></select>
                    </div>
                    
                    {/* Status Summary Strip */}
                    <div style={{ display: 'flex', gap: 24, background: '#fff', padding: '10px 24px', borderRadius: 100, border: '1px solid #E2E8F0', borderLeft: '3px solid #EF4444' }}>
                        <StatItem icon={<Play size={14} color="#10B981"/>} count={stats.running} label="RUNNING" />
                        <StatItem icon={<X size={14} color="#EF4444"/>} count={stats.failed} label="FAILED" />
                        <StatItem icon={<AlertCircle size={14} color="#F59E0B"/>} count={stats.needs_setup} label="NEEDS SETUP" />
                        <StatItem count={stats.total} label="TOTAL" />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', alignItems: 'start' }}>
                
                {/* Active Workflows Area */}
                <div>
                    <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Active Workflows</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        {filteredWorkflows.map(wf => (
                            <div key={wf.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ width: 44, height: 44, borderRadius: 12, background: wf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.2rem' }}>
                                            {wf.initials}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em', marginBottom: 2 }}>{wf.name}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{wf.role}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                        <div style={{ padding: '4px 10px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', ...getStatusStyle(wf.statusKey) }}>
                                            {wf.status}
                                        </div>
                                        <button style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>
                                
                                <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                                    {wf.role === 'Analytics Workflow' ? "Generates daily reports and delivers to stakeholders via email." : 
                                     wf.role === 'Operations Workflow' ? "Monitors data systems and triggers alerts on anomalies or failures." : 
                                     wf.role === 'Finance Workflow' ? "Reconciles transactions and flags discrepancies for review." : "Syncs critical datasets between warehouse and downstream systems."}
                                </p>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderTop: '1px solid #F1F5F9', borderBottom: '1px solid #F1F5F9', padding: '16px 0', gap: 16 }}>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Runs Today</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>{wf.runsToday}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Success Rate</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: wf.statusKey === 'failed' ? '#EF4444' : (wf.statusKey === 'needs_setup' ? '#0F172A' : '#10B981') }}>{wf.successRate}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Last Run</div>
                                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {wf.statusKey === 'needs_setup' ? 'Never' : '5m ago'} 
                                            {wf.statusKey !== 'needs_setup' && <div style={{width: 6, height: 6, borderRadius: '50%', background: wf.statusKey === 'failed' ? '#EF4444' : '#10B981'}}/>}
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Connected Apps</div>
                                    <div style={{ display: 'flex' }}>
                                        {wf.apps.map((app, idx) => (
                                            <div key={idx} style={{ width: 28, height: 28, borderRadius: '50%', background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.6rem', fontWeight: 900, border: '2px solid #fff', zIndex: 10 - idx, marginLeft: idx > 0 ? -8 : 0 }}>
                                                {app.name[0]}
                                            </div>
                                        ))}
                                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontSize: '0.65rem', fontWeight: 800, border: '2px solid #fff', zIndex: 0, marginLeft: -8 }}>
                                            +{wf.runsToday % 3 + 1}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                    <button style={{ flex: 1, padding: '10px', background: '#0F172A', color: '#fff', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        Open <ChevronRight size={14} />
                                    </button>
                                    <button style={{ flex: 1, padding: '10px', background: '#fff', color: '#475569', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        {wf.statusKey === 'needs_setup' ? <><Settings size={14} /> Setup</> : <><Pause size={14} /> Pause</>}
                                    </button>
                                    <button style={{ flex: 1, padding: '10px', background: '#fff', color: '#475569', borderRadius: 8, fontSize: '0.75rem', fontWeight: 800, border: '1px solid #E2E8F0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                        <Settings size={14} /> Settings
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Feed Area */}
                <div>
                    <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #E2E8F0', padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                <Activity size={16} /> Activity Feed
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', cursor: 'pointer' }}>View all</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {initialFeed.map((log, i) => (
                                <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', paddingBottom: 20, borderBottom: i < initialFeed.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: log.type === 'success' ? '#10B981' : (log.type === 'failed' ? '#EF4444' : '#F59E0B'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                                        {log.type === 'success' ? <CheckCircle2 size={16} /> : (log.type === 'failed' ? <X size={16} /> : <AlertTriangle size={16} />)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{log.msg}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94A3B8' }}>{log.time}</div>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 4 }}>{log.stats}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}

function FilterButton({ active, onClick, icon, color, label }: any) {
    return (
        <button 
            onClick={onClick}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 100, border: 'none', background: active ? '#ECFDF5' : 'transparent', color: active ? '#10B981' : '#64748B', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
        >
            {icon ? icon : <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />}
            {label}
        </button>
    )
}

function StatItem({ icon, count, label }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {icon}
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0F172A' }}>{count}</span>
            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        </div>
    )
}

function getStatusStyle(statusKey: string) {
    if (statusKey === 'running') return { color: '#10B981', background: '#ECFDF5' };
    if (statusKey === 'failed') return { color: '#EF4444', background: '#FEF2F2' };
    if (statusKey === 'needs_setup') return { color: '#F59E0B', background: '#FFFBEB' };
    return { color: '#64748B', background: '#F1F5F9' };
}
