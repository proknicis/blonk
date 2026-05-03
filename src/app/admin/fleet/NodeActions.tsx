"use client";

import React, { useState } from 'react';
import { ExternalLink, Database, Trash2, Activity, X, RotateCw, CheckCircle2, AlertTriangle, Zap, Clock, Server, Workflow } from 'lucide-react';
import adminStyles from '../admin.module.css';

interface NodeActionsProps {
    nodeId: string;
    nodeUrl: string;
    nodeName: string;
}

export function NodeActions({ nodeId, nodeUrl, nodeName }: NodeActionsProps) {
    const [loading, setLoading] = useState(false);
    const [showDiag, setShowDiag] = useState(false);
    const [diagnostics, setDiagnostics] = useState<any>(null);
    const [diagLoading, setDiagLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to decommission ${nodeName}? This will remove it from the monitoring hub.`)) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/nodes/${nodeId}`, { method: 'DELETE' });
            if (res.ok) window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDiagnostics = async () => {
        setShowDiag(true);
        setDiagnostics(null);
        setDiagLoading(true);
        try {
            const res = await fetch(`/api/admin/nodes/${nodeId}/diagnostics`);
            const json = await res.json();
            setDiagnostics(json);
        } catch (err) {
            setDiagnostics({ error: "Failed to connect to agent." });
        } finally {
            setDiagLoading(false);
        }
    };

    const handleRestart = async () => {
        if (!confirm(`Are you sure you want to restart the n8n service on ${nodeName}?`)) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            alert(`${nodeName} service is rebooting. It will be back online in ~60 seconds.`);
            window.location.reload();
        }, 2000);
    };

    const getHealthColor = (health: string) => {
        if (health === 'healthy') return '#10B981';
        if (health === 'unreachable') return '#EF4444';
        return '#F59E0B';
    };

    const getHealthLabel = (health: string) => {
        if (health === 'healthy') return 'OPERATIONAL';
        if (health === 'unreachable') return 'UNREACHABLE';
        return 'DEGRADED';
    };

    return (
        <div style={{ display: "flex", gap: "10px", justifyContent: 'flex-end' }}>
            <button 
                onClick={handleRestart}
                className={adminStyles.actionIconBtn} 
                title="Restart Service"
                disabled={loading}
                style={{ color: 'var(--accent)' }}
            >
                <RotateCw size={16} className={loading ? adminStyles.spinning : ''} />
            </button>

            <a 
                href={nodeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={adminStyles.actionIconBtn} 
                title="Open Dashboard"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <ExternalLink size={16} />
            </a>
            
            <button 
                onClick={fetchDiagnostics}
                className={adminStyles.actionIconBtn} 
                title="Node Diagnostics"
            >
                <Database size={16} />
            </button>

            <button 
                onClick={handleDelete}
                className={adminStyles.actionIconBtn} 
                title="Decommission Node"
                style={{ color: 'var(--destructive)' }}
                disabled={loading}
            >
                <Trash2 size={16} />
            </button>

            {showDiag && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowDiag(false)}>
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '32px', width: '100%', maxWidth: '640px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: diagnostics?.health === 'healthy' ? '#F0FDF4' : '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {diagnostics?.health === 'healthy' ? 
                                        <CheckCircle2 size={24} color="#10B981" /> : 
                                        <AlertTriangle size={24} color="#EF4444" />
                                    }
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.2rem' }}>{nodeName.startsWith('n8n') ? nodeName : `n8n Instance ${nodeName}`}</h3>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                        {diagnostics?.endpoint || 'Connecting...'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowDiag(false)} style={{ background: 'var(--muted)', border: 'none', borderRadius: '12px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '24px 32px 32px', overflowY: 'auto', flex: 1 }}>
                            {diagLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '16px' }}>
                                    <div className={adminStyles.spinning} style={{ width: '32px', height: '32px' }}>
                                        <Activity size={32} color="var(--accent)" />
                                    </div>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--muted-foreground)' }}>Scanning node infrastructure...</p>
                                </div>
                            ) : diagnostics?.error ? (
                                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '20px', padding: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <AlertTriangle size={24} color="#EF4444" />
                                    <div>
                                        <div style={{ fontWeight: 950, color: '#991B1B', fontSize: '0.9rem' }}>Diagnostic Failure</div>
                                        <div style={{ fontSize: '0.8rem', color: '#B91C1C', marginTop: '4px' }}>{diagnostics.error}{diagnostics.detail ? `: ${diagnostics.detail}` : ''}</div>
                                    </div>
                                </div>
                            ) : diagnostics ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {/* Health Status Banner */}
                                    <div style={{ background: diagnostics.health === 'healthy' ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${diagnostics.health === 'healthy' ? '#BBF7D0' : '#FECACA'}`, borderRadius: '20px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getHealthColor(diagnostics.health), boxShadow: `0 0 12px ${getHealthColor(diagnostics.health)}` }} />
                                            <span style={{ fontWeight: 950, fontSize: '0.75rem', letterSpacing: '0.1em', color: getHealthColor(diagnostics.health) }}>
                                                {getHealthLabel(diagnostics.health)}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                            Last checked: {new Date(diagnostics.scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                        <div style={{ background: 'var(--muted)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                                            <Workflow size={20} color="var(--accent)" style={{ marginBottom: '8px' }} />
                                            <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--foreground)' }}>{diagnostics.workflowCount}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Total Workflows</div>
                                        </div>
                                        <div style={{ background: 'var(--muted)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                                            <Zap size={20} color="#10B981" style={{ marginBottom: '8px' }} />
                                            <div style={{ fontSize: '1.8rem', fontWeight: 950, color: '#10B981' }}>{diagnostics.activeWorkflows}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Active Workflows</div>
                                        </div>
                                        <div style={{ background: 'var(--muted)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                                            <Clock size={20} color={diagnostics.failedExecutions > 0 ? '#EF4444' : 'var(--accent)'} style={{ marginBottom: '8px' }} />
                                            <div style={{ fontSize: '1.8rem', fontWeight: 950, color: diagnostics.failedExecutions > 0 ? '#EF4444' : 'var(--foreground)' }}>{diagnostics.recentExecutions}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Recent Executions</div>
                                        </div>
                                    </div>

                                    {/* Workflow List */}
                                    {diagnostics.workflows?.length > 0 && (
                                        <div>
                                            <h4 style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.12em', color: 'var(--muted-foreground)', marginBottom: '12px' }}>Assigned Workflows</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {diagnostics.workflows.map((wf: any) => (
                                                    <div key={wf.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--muted)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: wf.active ? '#10B981' : '#94A3B8' }} />
                                                            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{wf.name}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <span style={{ fontSize: '0.6rem', fontWeight: 950, padding: '3px 10px', borderRadius: '8px', background: wf.active ? '#F0FDF4' : 'var(--muted)', color: wf.active ? '#10B981' : '#94A3B8', border: `1px solid ${wf.active ? '#BBF7D0' : 'var(--border)'}` }}>
                                                                {wf.active ? 'ACTIVE' : 'IDLE'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
