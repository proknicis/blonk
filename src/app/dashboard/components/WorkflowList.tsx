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
                <div key={i} className={styles.workflowItem}>
                    <div className={styles.workflowInfo}>
                        <strong>{wf.name}</strong>
                        <span>Throughput: {wf.performance} loops/hr</span>
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
