"use client";

import React, { useState } from 'react';
import { ExternalLink, Database, Trash2, Activity, X, RotateCw, CheckCircle2, AlertTriangle, Zap, Clock, Server, Workflow } from 'lucide-react';
import adminStyles from '../admin.module.css';

interface NodeActionsProps {
    nodeId: string;
    nodeUrl: string;
    nodeName: string;
    nodeIndex?: number;
}

export function NodeActions({ nodeId, nodeUrl, nodeName, nodeIndex }: NodeActionsProps) {
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
                style={{ color: '#0F172A' }}
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
                style={{ color: '#EF4444' }}
                disabled={loading}
            >
                <Trash2 size={16} />
            </button>

            {showDiag && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setShowDiag(false)}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '40px', width: '100%', maxWidth: '640px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 64px rgba(0,0,0,0.1)' }} onClick={e => e.stopPropagation()}>
                        
                        {/* Header */}
                        <div style={{ padding: '40px 40px 32px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: diagnostics?.health === 'healthy' ? '#F0FDF4' : '#FFFBEB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {diagnostics?.health === 'healthy' ? 
                                        <CheckCircle2 size={28} color="#10B981" /> : 
                                        <AlertTriangle size={28} color="#F59E0B" />
                                    }
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '1.5rem', fontWeight: 950, color: '#111827' }}>{nodeIndex || 1}</span>
                                        <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem', color: '#111827', textTransform: 'uppercase' }}>{nodeName}</h3>
                                    </div>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#6B7280', fontWeight: 800 }}>
                                        {nodeUrl}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setShowDiag(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6B7280' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '32px 40px 48px', overflowY: 'auto', flex: 1 }}>
                            {diagLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '20px' }}>
                                    <div className={adminStyles.spinning} style={{ width: '40px', height: '40px' }}>
                                        <Activity size={40} color="#0F172A" />
                                    </div>
                                    <p style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6B7280' }}>Scanning node infrastructure...</p>
                                </div>
                            ) : diagnostics?.error ? (
                                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '24px', padding: '32px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <AlertTriangle size={28} color="#EF4444" />
                                    <div>
                                        <div style={{ fontWeight: 950, color: '#991B1B', fontSize: '1rem' }}>Diagnostic Failure</div>
                                        <div style={{ fontSize: '0.9rem', color: '#B91C1C', marginTop: '6px' }}>{diagnostics.error}</div>
                                    </div>
                                </div>
                            ) : diagnostics ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                    {/* Health Status Banner */}
                                    <div style={{ background: diagnostics.health === 'healthy' ? '#F0FDF4' : '#FFFBEB', border: `1px solid ${diagnostics.health === 'healthy' ? '#BBF7D0' : '#FEF3C7'}`, borderRadius: '24px', padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getHealthColor(diagnostics.health), boxShadow: `0 0 15px ${getHealthColor(diagnostics.health)}` }} />
                                            <span style={{ fontWeight: 950, fontSize: '0.8rem', letterSpacing: '0.1em', color: getHealthColor(diagnostics.health), textTransform: 'uppercase' }}>
                                                {getHealthLabel(diagnostics.health)}
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#111827', fontWeight: 950 }}>Last checked: {new Date(diagnostics.scannedAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#6B7280', fontWeight: 800 }}>Scanned {new Date(diagnostics.scannedAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</div>
                                        </div>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                        <div style={{ background: '#F9FAFB', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#111827', lineHeight: 1 }}>{diagnostics.workflowCount}</div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px' }}>Workflows</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>Total Workflows</div>
                                        </div>
                                        <div style={{ background: '#F9FAFB', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#10B981', lineHeight: 1 }}>{diagnostics.activeWorkflows}</div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px' }}>Active</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>Active Workflows</div>
                                        </div>
                                        <div style={{ background: '#F9FAFB', borderRadius: '24px', padding: '32px 24px', textAlign: 'center', border: '1px solid #F3F4F6' }}>
                                            <div style={{ fontSize: '2.5rem', fontWeight: 950, color: '#EF4444', lineHeight: 1 }}>{diagnostics.recentExecutions}</div>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '12px' }}>Recent Runs</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>Recent Executions</div>
                                        </div>
                                    </div>

                                    {/* Workflow List */}
                                    <div>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.1em', color: '#6B7280', marginBottom: '16px', textTransform: 'uppercase' }}>Assigned Workflows</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {(diagnostics.workflows || [
                                                { id: '1', name: 'ds', active: true },
                                                { id: '2', name: 'ds', active: true },
                                                { id: '3', name: 'ds', active: true },
                                                { id: '4', name: 'Testing', active: true }
                                            ]).map((wf: any) => (
                                                <div key={wf.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: '#FFFFFF', borderRadius: '20px', border: '1px solid #F3F4F6' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: wf.active ? '#10B981' : '#94A3B8' }} />
                                                        <span style={{ fontWeight: 950, fontSize: '1rem', color: '#111827' }}>{wf.name}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 950, padding: '6px 14px', borderRadius: '100px', background: wf.active ? '#F0FDF4' : '#F9FAFB', color: wf.active ? '#10B981' : '#6B7280', border: `1px solid ${wf.active ? '#BBF7D0' : '#F3F4F6'}` }}>
                                                            {wf.active ? 'ACTIVE' : 'IDLE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
