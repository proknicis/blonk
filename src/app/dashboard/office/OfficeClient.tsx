"use client";

import React, { useState, useEffect } from "react";
import styles from "./office.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { X, Activity, BarChart3, Clock, AlertCircle, CheckCircle2, ChevronRight, Zap } from "lucide-react";

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
}

interface FeedItem {
    id: string;
    msg: string;
    detail: string;
    type: string;
    time: string;
}

export default function OfficeClient({ initialWorkflows, initialFeed, userRole }: { initialWorkflows: Workflow[], initialFeed: FeedItem[], userRole: string }) {
    const [workflows] = useState(initialWorkflows);
    const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
    const [workflowLogs, setWorkflowLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

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

    return (
        <div className={styles.officeContainer}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '100px', fontWeight: 950, fontSize: '0.8rem', color: '#fff', border: '1px solid rgba(255,255,255,0.05)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div className={styles.pulseDot} />
                    {workflows.filter((a: any) => a.statusKey === 'running').length} Workflows Running
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '40px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 950, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Active Workflows Grid</h3>
                    {workflows.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>No active workflows. Add one from the Marketplace.</p>
                        </div>
                    ) : (
                        <div className={styles.officeGrid}>
                            {workflows.map((agent) => (
                                <div
                                    key={agent.id}
                                    onClick={() => setSelectedWorkflow(agent)}
                                    className={`${styles.workstation} ${agent.statusKey === 'running' ? styles.workstationActive : ''}`}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', width: '100%' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 950, fontSize: '1.5rem', boxShadow: `0 10px 30px ${agent.color}44` }}>
                                            {agent.initials}
                                        </div>
                                        <div style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            padding: '8px 14px', 
                                            borderRadius: '100px', 
                                            background: agent.statusKey === 'running' ? 'rgba(52, 209, 134, 0.1)' : agent.statusKey === 'failed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.03)', 
                                            color: agent.statusKey === 'running' ? '#34D186' : agent.statusKey === 'failed' ? '#EF4444' : 'rgba(255,255,255,0.4)', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 950, 
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {agent.statusKey === 'running' && <div className={styles.pulseDot} style={{ width: '6px', height: '6px', margin: 0 }} />}
                                            {agent.status}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '40px', textAlign: 'left', width: '100%' }}>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#fff', margin: '0 0 8px 0', letterSpacing: '-0.03em' }}>{agent.name}</h3>
                                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 700 }}>{agent.role}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', marginTop: 'auto', width: '100%' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.1em' }}>Yield</div>
                                            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 950 }}>{agent.tasksCount} <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>ops</span></div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.1em' }}>Recent Sync</div>
                                            <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 950 }}>{isMounted && agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : agent.lastRun ? '...' : 'Never'}</div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ marginTop: '32px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'rgba(255,255,255,0.2)' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>View Performance Metrics</span>
                                        <ChevronRight size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 950, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Activity Feed</h3>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', maxHeight: '800px', overflowY: 'auto', backdropFilter: 'blur(10px)' }}>
                        {initialFeed.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)', fontWeight: 800 }}>No recent activity.</div>
                        ) : initialFeed.map((log: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', paddingBottom: '20px', borderBottom: i !== initialFeed.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: log.type === 'success' ? 'rgba(52, 209, 134, 0.1)' : log.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.type === 'success' ? '#34D186' : log.type === 'error' ? '#EF4444' : '#3B82F6', boxShadow: `0 0 10px ${log.type === 'success' ? '#34D186' : log.type === 'error' ? '#EF4444' : '#3B82F6'}` }} />
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#fff', fontWeight: 800, letterSpacing: '-0.01em' }}>{log.msg}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedWorkflow && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setSelectedWorkflow(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={() => setSelectedWorkflow(null)}>
                                <X size={20} />
                            </button>

                            <div className={styles.modalHeader}>
                                <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: selectedWorkflow.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 950, fontSize: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                        {selectedWorkflow.initials}
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '2.5rem', fontWeight: 950, color: '#fff', margin: 0, letterSpacing: '-0.05em' }}>{selectedWorkflow.name}</h2>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                                            <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>{selectedWorkflow.role}</span>
                                            <div style={{ height: '4px', width: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                                            <span style={{ 
                                                fontSize: '0.85rem', 
                                                fontWeight: 950, 
                                                color: selectedWorkflow.statusKey === 'running' ? '#34D186' : selectedWorkflow.statusKey === 'failed' ? '#EF4444' : 'rgba(255,255,255,0.4)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em'
                                            }}>
                                                {selectedWorkflow.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalBody}>
                                <div className={styles.statsGrid}>
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}><Activity size={14} style={{ marginRight: '8px' }} /> Total Execution Yield</span>
                                        <div className={styles.statValue}>{selectedWorkflow.tasksCount} <span style={{ fontSize: '1rem', color: '#94A3B8' }}>Operations</span></div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}><Clock size={14} style={{ marginRight: '8px' }} /> Last Sync Event</span>
                                        <div className={styles.statValue}>{isMounted && selectedWorkflow.lastRun ? new Date(selectedWorkflow.lastRun).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : selectedWorkflow.lastRun ? '...' : 'Never'}</div>
                                    </div>
                                    <div className={styles.statCard}>
                                        <span className={styles.statLabel}><Zap size={14} style={{ marginRight: '8px' }} /> Deployment Sector</span>
                                        <div className={styles.statValue}>{selectedWorkflow.role.replace(' Workflow', '')}</div>
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#fff', margin: 0 }}>Operational Logs</h3>
                                        <button 
                                            onClick={() => fetchLogs(selectedWorkflow.id)}
                                            style={{ background: 'none', border: 'none', color: '#34D186', fontSize: '0.85rem', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <Activity size={14} /> Refresh Logs
                                        </button>
                                    </div>

                                    {isLoadingLogs ? (
                                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                            <Activity className={styles.pulseDot} style={{ width: '24px', height: '24px', margin: '0 auto 16px auto' }} />
                                            <p style={{ fontWeight: 800 }}>Synchronizing Telemetry...</p>
                                        </div>
                                    ) : workflowLogs.length === 0 ? (
                                        <div style={{ padding: '64px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <AlertCircle size={32} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '16px' }} />
                                            <p style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>No telemetry logs detected for this workflow in the last 48 hours.</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            {workflowLogs.map((log, idx) => (
                                                <div key={idx} className={styles.logItem}>
                                                    <div className={styles.logHeader}>
                                                        <span className={styles.logTime}>{isMounted ? new Date(log.executedAt).toLocaleString() : '...'}</span>
                                                        <span className={styles.logStatus} style={{ 
                                                            background: log.status === 'success' ? '#F0FAF5' : '#FEF2F2',
                                                            color: log.status === 'success' ? '#34D186' : '#EF4444'
                                                        }}>
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                    <div className={styles.logMsg}>{log.message}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {selectedWorkflow.statusKey === 'failed' && userRole !== 'VIEWER' && (
                                    <div style={{ marginTop: 'auto', padding: '32px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '32px', border: '1px solid rgba(239, 68, 68, 0.1)', textAlign: 'center' }}>
                                        <h4 style={{ color: '#EF4444', fontWeight: 950, margin: '0 0 8px 0' }}>System Disruption Detected</h4>
                                        <p style={{ color: 'rgba(239, 68, 68, 0.6)', fontSize: '0.9rem', fontWeight: 700, marginBottom: '20px' }}>This autonomous loop encountered a critical error during its last execution phase.</p>
                                        <button style={{ background: '#EF4444', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '16px', fontWeight: 950, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}>
                                            Force Manual Reboot
                                        </button>
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
