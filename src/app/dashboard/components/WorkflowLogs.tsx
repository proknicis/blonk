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
        if (s === 'success') return { bg: '#F0FAF5', color: '#34D186', icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>, label: 'Success' };
        if (s === 'running' || s === 'analyzing') return { bg: '#FFF9E6', color: '#FFB038', icon: <div className={styles.pulseDot} style={{ width: 8, height: 8, background: '#FFB038' }} />, label: 'Active', pulse: true };
        if (s === 'error') return { bg: '#FFEDED', color: '#FF5252', icon: <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>, label: 'Error' };
        return { bg: '#F8FAFC', color: '#64748B', icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8' }} />, label: status };
    };

    if (isLoading) return <div className={styles.loading}>Connecting to Loop Monitor...</div>;

    return (
        <div className={styles.card} style={{ marginTop: '24px', border: '1px solid #E2E8F0', padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '32px 40px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 className={styles.cardTitle} style={{ fontSize: '1.25rem' }}>Live Loop Monitor</h2>
                    <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '4px', fontWeight: 800 }}>REAL-TIME EXECUTION HISTORY [2S REFRESH]</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#F8FAFC', borderRadius: '100px', border: '1px solid #E2E8F0' }}>
                    <div className={styles.pulseDot} style={{ background: '#34D186', width: 10, height: 10 }} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#64748B', letterSpacing: '0.05em' }}>GATEWAY ACTIVE</span>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className={styles.historyTable} style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#F8FAFC' }}>
                        <tr style={{ textAlign: 'left', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94A3B8' }}>
                            <th style={{ padding: '16px 40px', fontWeight: 950 }}>Autonomous Node</th>
                            <th style={{ padding: '16px 20px', fontWeight: 950 }}>Integrity State</th>
                            <th style={{ padding: '16px 20px', fontWeight: 950 }}>Internal Meta-Payload</th>
                            <th style={{ padding: '16px 40px', textAlign: 'right', fontWeight: 950 }}>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => {
                            const state = getStatusStyle(log.status);
                            return (
                                <tr key={log.id} style={{ borderBottom: '1px solid #F8FAFC', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '24px 40px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                                            </div>
                                            <strong style={{ fontSize: '0.95rem', fontWeight: 900, color: '#111' }}>{log.workflowName}</strong>
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 20px' }}>
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px 14px',
                                            borderRadius: '100px',
                                            fontSize: '0.65rem',
                                            fontWeight: 950,
                                            background: state.bg,
                                            color: state.color,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            border: `1px solid ${state.color}22`
                                        }}>
                                            {state.icon}
                                            {state.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '24px 20px', maxWidth: '300px' }}>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: '#475569',
                                            background: '#F8FAFC',
                                            padding: '10px 16px',
                                            borderRadius: '8px',
                                            fontFamily: 'JetBrains Mono, monospace',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            border: '1px solid #E2E8F0',
                                            fontWeight: 600
                                        }} title={log.result}>
                                            {log.result && (log.result.startsWith('{') || log.result.startsWith('['))
                                                ? `RAW LOG: ${log.result.substring(0, 60)}${log.result.length > 60 ? '...' : ''}`
                                                : log.result || "Awaiting fleet metrics..."}
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 40px', textAlign: 'right', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>
                                        {new Date(log.executedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </td>
                                </tr>
                            );
                        })}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ textAlign: 'center', padding: '80px', color: '#94A3B8' }}>
                                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                                        <div className={styles.pulseDot} style={{ width: 48, height: 48, background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Fleet Standby • Awaiting Signal...
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
