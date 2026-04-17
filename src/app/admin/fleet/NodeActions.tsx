"use client";

import React, { useState } from 'react';
import { ExternalLink, Database, Trash2, Power, Settings2, Activity, X } from 'lucide-react';
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
        try {
            const res = await fetch(`/api/admin/nodes/${nodeId}/diagnostics`);
            const json = await res.json();
            setDiagnostics(json);
        } catch (err) {
            setDiagnostics({ error: "Failed to connect to agent." });
        }
    };

    return (
        <div style={{ display: "flex", gap: "10px", justifyContent: 'flex-end' }}>
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '32px', width: '100%', maxWidth: '600px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-premium)', animation: 'fadeInScale 0.3s ease-out' }}>
                        <div style={{ padding: '32px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Activity size={24} color="var(--accent)" />
                                <h3 style={{ margin: 0, fontWeight: 950 }}>{nodeName} Diagnostics</h3>
                            </div>
                            <button onClick={() => setShowDiag(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
                            <div style={{ background: '#000', borderRadius: '16px', padding: '20px', border: '1px solid #333' }}>
                                <pre style={{ color: '#0f0', fontSize: '0.8rem', whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {diagnostics ? JSON.stringify(diagnostics, null, 2) : 'Scanning node...'}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
