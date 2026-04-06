"use client";

import styles from "../page.module.css";
import React, { useState } from "react";

export default function WorkflowList({ workflows }: { workflows: any[] }) {
    const [runningId, setRunningId] = useState<string | null>(null);

    const runWorkflow = async (wf: any) => {
        if (!wf.n8nWebhookUrl) {
            alert("No n8n webhook linked for this workflow. Please configure it in the Admin Panel.");
            return;
        }

        setRunningId(wf.id);
        try {
            const res = await fetch('/api/admin/proxy-trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: wf.n8nWebhookUrl,
                    payload: {
                        user: 'nikolass',
                        action: `Triggered ${wf.name}`,
                        source: 'BLONK_Dashboard',
                        workflowName: wf.name,
                        workflowId: wf.id,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            const result = await res.json();

            if (result.success) {
                alert(`Successfully triggered loop: ${wf.name}`);
            } else {
                alert(`Trigger Error: ${result.status}\nBody: ${result.data || 'No response'}`);
            }
        } catch (error) {
            console.error("Trigger error:", error);
            alert("System Error: Failed to reach the back-end proxy.");
        } finally {
            setRunningId(null);
        }
    };

    return (
        <div className={styles.workflowList}>
            {workflows.map((wf, i) => {
                const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
                const lastUpdate = wf.lastRun ? new Date(wf.lastRun) : null;
                const isStale = lastUpdate && lastUpdate < tenMinutesAgo;
                const isOnline = wf.status === 'Active' || wf.status === 'Success' || wf.status === 'Completed';
                
                const displayStatus = (isOnline && isStale) ? 'Standby' : (wf.status || 'Passive');
                const statusClass = (isOnline && !isStale) ? styles.statusSuccess : styles.statusPaused;

                return (
                    <div key={i} className={styles.workflowItem} style={{ 
                        background: '#FFFFFF',
                        border: '1px solid #EAEAEA',
                        borderRadius: '20px',
                        padding: '24px',
                        marginBottom: '16px',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className={styles.workflowInfo}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: isOnline ? '#34D186' : '#94A3B8' }} />
                                    <strong style={{ fontSize: '1.25rem', fontWeight: 950, letterSpacing: '-0.04em', color: '#0A0A0A' }}>{wf.name}</strong>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Autonomous Loop</span>
                                </div>
                                <button 
                                    onClick={() => {
                                        const text = wf.id;
                                        if (navigator.clipboard && navigator.clipboard.writeText) {
                                            navigator.clipboard.writeText(text);
                                        } else {
                                            const textArea = document.createElement("textarea");
                                            textArea.value = text;
                                            document.body.appendChild(textArea);
                                            textArea.select();
                                            document.execCommand("copy");
                                            document.body.removeChild(textArea);
                                        }
                                        alert("Loop ID copied to clipboard!");
                                    }}
                                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '100px', padding: '6px 14px', fontSize: '0.65rem', fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    {wf.id?.substring(0, 8) || '...'}
                                </button>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 950, color: isOnline ? '#34D186' : '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                        {displayStatus}
                                    </div>
                                    <div style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748B' }}>Live Status</div>
                                </div>
                                <button
                                    className={styles.runBtn}
                                    onClick={() => wf.n8nWebhookUrl ? runWorkflow(wf) : alert(`This loop is in fully autonomous mode.`)}
                                    disabled={runningId === wf.id}
                                    style={{ width: '48px', height: '48px', borderRadius: '14px' }}
                                >
                                    {runningId === wf.id ? "..." : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(3, 1fr)', 
                            gap: '12px',
                            padding: '16px',
                            background: '#F8FAFC',
                            borderRadius: '16px',
                            border: '1px solid #E2E8F0'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Throughput</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#0A0A0A' }}>{wf.performance?.replace(/loops\/hr/gi, '') || '0'} <span style={{ opacity: 0.4 }}>OPS/HR</span></div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Autonomous Yield</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#34D186' }}>{wf.tasksCount || '0'} <span style={{ opacity: 0.4 }}>DONE</span></div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>Uptime Reliability</div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 950, color: '#0A0A0A' }}>100%</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
