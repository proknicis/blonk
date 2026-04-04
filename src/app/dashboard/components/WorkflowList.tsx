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
            {workflows.map((wf, i) => (
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
                                #{wf.id.substring(0, 8)} 📋
                            </button>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Throughput: {wf.performance} loops/hr</span>
                    </div>
                    <div className={styles.workflowStatus}>
                        <button
                            className={styles.runBtn}
                            onClick={() => runWorkflow(wf)}
                            disabled={runningId === wf.id}
                            title={wf.n8nWebhookUrl ? "Run Autonomous Loop" : "Webhook not configured"}
                        >
                            {runningId === wf.id ? "..." : (wf.n8nWebhookUrl ? "▶" : "⚠")}
                        </button>
                        <span className={`${styles.statusPill} ${wf.status === 'Active' ? styles.statusSuccess : styles.statusPaused}`}>
                            {wf.status}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
