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
                    <div key={i} className={styles.workflowItem} style={{ marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '16px' }}>
                        <div className={styles.workflowInfo}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <strong>{wf.name}</strong>
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
                                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '4px', padding: '6px 8px', fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                    title="Copy Unique ID for n8n"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    #{wf.id?.substring(0, 8) || '...'}
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                    <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 900 }}>{wf.performance?.replace(/loops\/hr/gi, '') || '0'} OPS/HR</span>
                                </div>
                                {wf.tasksCount !== undefined && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        <span style={{ fontSize: '0.7rem', color: '#34D186', fontWeight: 900 }}>TOTAL DONE: {wf.tasksCount}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={styles.workflowStatus}>
                            <button
                                className={styles.runBtn}
                                onClick={() => wf.n8nWebhookUrl ? runWorkflow(wf) : alert(`This loop is in fully autonomous mode (ID: ${wf.id}).`)}
                                disabled={runningId === wf.id}
                                title={wf.n8nWebhookUrl ? "Run Autonomous Loop" : "ID Linked - Autonomous Sync Active"}
                            >
                                {runningId === wf.id ? "..." : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                )}
                            </button>
                            <span className={`${styles.statusPill} ${statusClass}`} style={{ fontSize: '0.65rem', padding: '4px 12px' }}>
                                {displayStatus}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
