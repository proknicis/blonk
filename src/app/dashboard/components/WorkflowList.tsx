"use client";

import styles from "../page.module.css";
import React, { useState } from "react";

const N8N_BASE_URL = "https://n8n.manadavana.lv/webhook/workflow-control";

export default function WorkflowList({ workflows }: { workflows: any[] }) {
    const [runningId, setRunningId] = useState<string | null>(null);

    const runWorkflow = async (wf: any, actionType: 'START' | 'STOP') => {
        if (!wf.n8nWorkflowId) return;

        setRunningId(`${wf.id}-${actionType}`);

        const action = actionType === 'START' ? 'start' : 'end';
        const webhookUrl = `${N8N_BASE_URL}?action=${action}&id=${wf.n8nWorkflowId}`;

        try {
            const res = await fetch(webhookUrl, { method: 'GET' });

            if (res.ok) {
                console.log(`n8n webhook triggered: ${actionType} for workflow ${wf.name} (n8n id: ${wf.n8nWorkflowId})`);
            } else {
                console.error(`n8n webhook error: ${res.status} ${res.statusText}`);
                alert(`Webhook Error: ${res.status} — ${res.statusText}`);
            }
        } catch (error) {
            console.error("Webhook call failed:", error);
            alert("System Error: Could not reach the n8n webhook.");
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
                const isPending = !wf.n8nWorkflowId; // No n8n ID = admin hasn't configured it yet

                const displayStatus = isPending ? 'Pending Setup' : ((isOnline && isStale) ? 'Standby' : (wf.status || 'Passive'));

                return (
                    <div key={i} className={styles.workflowItem}>
                        <div className={styles.workflowHeader}>
                            <div className={styles.workflowInfo}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <div
                                        className={!isPending && isOnline ? styles.activeDot : ''}
                                        style={
                                            isPending
                                                ? { width: '8px', height: '8px', borderRadius: '2px', background: 'var(--warning, #f59e0b)' }
                                                : !isOnline
                                                ? { width: '8px', height: '8px', borderRadius: '2px', background: 'var(--muted)' }
                                                : {}
                                        }
                                    />
                                    <strong className={styles.workflowTitle}>{wf.name}</strong>
                                    <span className={styles.workflowBadge}>Autonomous Loop</span>
                                </div>
                                <button
                                    className={styles.loopIdBtn}
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
                                >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    {wf.id?.substring(0, 8) || '...'}
                                </button>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div
                                        className={styles.statusText}
                                        style={{
                                            color: isPending
                                                ? 'var(--warning, #f59e0b)'
                                                : isOnline
                                                ? 'var(--accent)'
                                                : 'var(--muted-foreground)'
                                        }}
                                    >
                                        {displayStatus}
                                    </div>
                                    <div className={styles.statusSubtext}>Live Status</div>
                                </div>

                                {isPending ? (
                                    /* ── LOCKED: admin hasn't set n8nWorkflowId yet ── */
                                    <div
                                        title="Workflow is pending admin configuration. Controls will unlock once your node is set up."
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            color: 'var(--muted-foreground)',
                                            background: 'var(--muted)',
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            cursor: 'not-allowed',
                                            letterSpacing: '0.04em',
                                            textTransform: 'uppercase',
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        Awaiting Setup
                                    </div>
                                ) : (
                                    /* ── ACTIVE: admin has configured the workflow ── */
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            title="Force Start"
                                            className={styles.forceStartBtn}
                                            onClick={() => runWorkflow(wf, 'START')}
                                            disabled={runningId === `${wf.id}-START`}
                                        >
                                            {runningId === `${wf.id}-START` ? "..." : (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                            )}
                                            START
                                        </button>
                                        <button
                                            title="Force End"
                                            className={styles.forceEndBtn}
                                            onClick={() => runWorkflow(wf, 'STOP')}
                                            disabled={runningId === `${wf.id}-STOP`}
                                        >
                                            {runningId === `${wf.id}-STOP` ? "..." : (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"></rect></svg>
                                            )}
                                            END
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── PENDING SETUP NOTICE ── */}
                        {isPending && (
                            <div style={{
                                marginTop: '12px',
                                padding: '10px 14px',
                                background: 'rgba(245, 158, 11, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.25)',
                                borderRadius: '10px',
                                fontSize: '0.75rem',
                                color: 'var(--warning, #f59e0b)',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                                This workflow is being configured by the operations team. Controls will activate once the node is commissioned.
                            </div>
                        )}

                        <div className={styles.metricsRow}>
                            <div>
                                <div className={styles.metricMiniLabel}>Throughput</div>
                                <div className={styles.metricMiniValue}>
                                    {wf.performance?.toString().replace(/loops\/hr/gi, '') || '0'}
                                    <span className={styles.metricMiniUnit}> OPS/HR</span>
                                </div>
                            </div>
                            <div>
                                <div className={styles.metricMiniLabel}>Autonomous Yield</div>
                                <div className={styles.metricMiniValue} style={{ color: 'var(--accent)' }}>
                                    {wf.tasksCount || '0'}
                                    <span className={styles.metricMiniUnit}> DONE</span>
                                </div>
                            </div>
                            <div>
                                <div className={styles.metricMiniLabel}>Reliability</div>
                                <div className={styles.metricMiniValue}>100%</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
