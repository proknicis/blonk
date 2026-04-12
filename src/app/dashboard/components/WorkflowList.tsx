"use client";

import styles from "../page.module.css";
import React, { useState } from "react";

export default function WorkflowList({ workflows }: { workflows: any[] }) {
    const [runningId, setRunningId] = useState<string | null>(null);

    const runWorkflow = async (wf: any, actionType: 'START' | 'STOP') => {
        if (!wf.n8nWebhookUrl) {
            alert("No n8n webhook linked for this workflow. Please configure it in the Admin Panel.");
            return;
        }

        const actionLabel = actionType === 'START' ? 'Force Start' : 'Force End';
        setRunningId(`${wf.id}-${actionType}`);
        
        try {
            const res = await fetch('/api/admin/proxy-trigger', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: wf.n8nWebhookUrl,
                    payload: {
                        user: 'nikolass',
                        action: `${actionLabel}: ${wf.name}`,
                        type: actionType,
                        source: 'BLONK_Dashboard',
                        workflowName: wf.name,
                        workflowId: wf.id,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            const result = await res.json();

            if (result.success) {
                alert(`Successfully executed ${actionLabel} for loop: ${wf.name}`);
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
                
                return (
                    <div key={i} className={styles.workflowItem}>
                        <div className={styles.workflowHeader}>
                            <div className={styles.workflowInfo}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                    <div className={isOnline ? styles.activeDot : ''} style={!isOnline ? { width: '8px', height: '8px', borderRadius: '2px', background: 'var(--muted)' } : {}} />
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
                                    <div className={styles.statusText} style={{ color: isOnline ? 'var(--accent)' : 'var(--muted-foreground)' }}>
                                        {displayStatus}
                                    </div>
                                    <div className={styles.statusSubtext}>Live Status</div>
                                </div>
                                
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
                            </div>
                        </div>

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
