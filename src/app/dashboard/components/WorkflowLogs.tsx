"use client";

import styles from "../page.module.css";
import React, { useState, useEffect } from "react";

export default function WorkflowLogs() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/admin/logs');
                const data = await res.json();
                if (Array.isArray(data)) setLogs(data);
            } catch (error) {
                console.error("Log fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 2000); // 2s refresh as requested
        return () => clearInterval(interval);
    }, []);

    const getStatusStyle = (status: string) => {
        const s = status.toLowerCase();
        if (s === 'success') return { bg: '#E8F9F1', color: '#34D186', icon: '🟢', label: 'Success' };
        if (s === 'running') return { bg: '#FFF9E6', color: '#FFB038', icon: '🟡', label: 'Running', pulse: true };
        if (s === 'error') return { bg: '#FFEDED', color: '#FF5252', icon: '🔴', label: 'Error' };
        return { bg: '#F1F2F6', color: '#57606F', icon: '⚪', label: status };
    };

    if (isLoading) return <div className={styles.loading}>Connecting to Loop Monitor...</div>;

    return (
        <div className={styles.card} style={{ marginTop: '24px', border: '1px solid #E2E8F0' }}>
            <div className={styles.cardHeader} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                <div>
                    <h2 className={styles.cardTitle}>Live Loop Monitor</h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>Real-time execution history (Auto-refresh: 2s)</p>
                </div>
                <div className={styles.pulseDot} style={{ background: '#34D186' }} />
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className={styles.historyTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 1 }}>
                        <tr style={{ textAlign: 'left', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8' }}>
                            <th style={{ padding: '12px 20px' }}>Loop Configuration</th>
                            <th style={{ padding: '12px 20px' }}>Status</th>
                            <th style={{ padding: '12px 20px' }}>Internal Payload</th>
                            <th style={{ padding: '12px 20px', textAlign: 'right' }}>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => {
                            const state = getStatusStyle(log.status);
                            return (
                                <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ fontSize: '1.2rem' }}>⚙️</div>
                                            <strong>{log.workflowName}</strong>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            background: state.bg,
                                            color: state.color,
                                            border: `1px solid ${state.color}22`
                                        }}>
                                            <span style={{ fontSize: '0.5rem' }}>{state.icon}</span>
                                            {state.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', maxWidth: '300px' }}>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: '#475569',
                                            background: '#F1F5F9',
                                            padding: '8px 12px',
                                            borderRadius: '6px',
                                            fontFamily: 'monospace',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            border: '1px solid #E2E8F0'
                                        }} title={log.result}>
                                            {log.result && (log.result.startsWith('{') || log.result.startsWith('['))
                                                ? `📦 DATA: ${log.result.substring(0, 50)}${log.result.length > 50 ? '...' : ''}`
                                                : log.result || "No metadata received"}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.75rem', color: '#94A3B8' }}>
                                        {new Date(log.executedAt).toLocaleTimeString()}
                                    </td>
                                </tr>
                            );
                        })}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📡</div>
                                    Awaiting first cloud execution...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
