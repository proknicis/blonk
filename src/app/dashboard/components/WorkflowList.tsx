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
                                        alert("Loop ID copied to clipboard! Paste this into your n8n 'workflowId' field.");
                                    }}
                                    style={{ background: '#F1F5F9', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', cursor: 'pointer' }}
                                    title="Copy Unique ID for n8n"
                                >
                                    #{wf.id?.substring(0, 8) || '...'} 📋
                                </button>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Throughput: {wf.performance || '0'} loops/hr</span>
                                {wf.tasksCount !== undefined && (
                                    <span style={{ fontSize: '0.8rem', color: '#34D186', fontWeight: 800 }}>Total Done: {wf.tasksCount}</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.workflowStatus}>
                            <button
                                className={styles.runBtn}
                                onClick={() => wf.n8nWebhookUrl ? runWorkflow(wf) : alert(`This loop is in fully autonomous mode (ID: ${wf.id}). Use this ID in n8n for updates!`)}
                                disabled={runningId === wf.id}
                                title={wf.n8nWebhookUrl ? "Run Autonomous Loop" : "ID Linked - Autonomous Sync Active"}
                            >
                                {runningId === wf.id ? "..." : (wf.n8nWebhookUrl ? "▶" : "🆔")}
                            </button>
                            <span className={`${styles.statusPill} ${statusClass}`}>
                                {displayStatus}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
