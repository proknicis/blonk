"use client";

import styles from "../page.module.css";
import React, { useState } from "react";

const N8N_BASE_URL = "https://n8n.manadavana.lv/webhook/workflow-control";

// ── Derive lifecycle stage from workflow data ──────────────────────────────
type Stage = 'ordered' | 'setup' | 'ready';

function getStage(wf: any): Stage {
    if (wf.n8nWorkflowId) return 'ready';
    if (wf.status === 'Syncing' || wf.status === 'Connecting' || wf.status === 'Initializing') return 'setup';
    return 'ordered';
}

// ── Small inline SVG icons ─────────────────────────────────────────────────
const IconCheck = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const IconClock = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const IconZap = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const IconLock = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const IconPlay = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const IconStop = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" /></svg>
);
const IconCopy = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

// ── Stage config ────────────────────────────────────────────────────────────
const STAGES: { key: Stage; label: string; sublabel: string }[] = [
    { key: 'ordered', label: 'Ordered',   sublabel: 'Request received' },
    { key: 'setup',   label: 'Setup',     sublabel: 'Being configured' },
    { key: 'ready',   label: 'Ready',     sublabel: 'Controls active'  },
];

const STAGE_ORDER: Record<Stage, number> = { ordered: 0, setup: 1, ready: 2 };

function stageColor(s: Stage) {
    if (s === 'ready')   return 'var(--accent)';
    if (s === 'setup')   return '#a78bfa'; // soft purple for "in progress"
    return 'var(--muted-foreground)';
}

// ── Lifecycle tracker strip ─────────────────────────────────────────────────
function LifecycleTracker({ stage }: { stage: Stage }) {
    const current = STAGE_ORDER[stage];
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 0,
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '10px 16px',
            overflow: 'hidden',
        }}>
            {STAGES.map((s, idx) => {
                const done    = STAGE_ORDER[s.key] < current;
                const active  = STAGE_ORDER[s.key] === current;
                const pending = STAGE_ORDER[s.key] > current;
                const color   = done ? 'var(--accent)' : active ? stageColor(s.key) : 'var(--border)';

                return (
                    <React.Fragment key={s.key}>
                        {/* connector line */}
                        {idx > 0 && (
                            <div style={{
                                flex: 1,
                                height: '2px',
                                background: done || active ? color : 'var(--border)',
                                transition: 'background 0.4s ease',
                                minWidth: '20px',
                            }} />
                        )}

                        {/* step node */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                            <div style={{
                                width: '26px', height: '26px',
                                borderRadius: '50%',
                                border: `2px solid ${color}`,
                                background: done ? 'var(--accent)' : active ? `${stageColor(s.key)}22` : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: done ? 'var(--card)' : color,
                                boxShadow: active ? `0 0 10px ${stageColor(s.key)}55` : 'none',
                                position: 'relative',
                                transition: 'all 0.4s ease',
                            }}>
                                {done
                                    ? <IconCheck />
                                    : active && s.key === 'setup'
                                    ? <IconClock />
                                    : active && s.key === 'ready'
                                    ? <IconZap />
                                    : <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>{idx + 1}</span>
                                }
                                {/* pulse ring on active */}
                                {active && (
                                    <span style={{
                                        position: 'absolute', inset: '-5px',
                                        borderRadius: '50%',
                                        border: `1.5px solid ${stageColor(s.key)}`,
                                        animation: 'lifecyclePulse 2s infinite',
                                        opacity: 0.4,
                                    }} />
                                )}
                            </div>
                            <div style={{
                                fontSize: '0.6rem', fontWeight: 900,
                                color: pending ? 'var(--muted-foreground)' : color,
                                textTransform: 'uppercase', letterSpacing: '0.07em',
                                opacity: pending ? 0.5 : 1,
                                whiteSpace: 'nowrap',
                            }}>{s.label}</div>
                            <div style={{
                                fontSize: '0.55rem', fontWeight: 700,
                                color: 'var(--muted-foreground)',
                                opacity: pending ? 0.35 : 0.65,
                                whiteSpace: 'nowrap',
                            }}>{s.sublabel}</div>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function WorkflowList({ workflows }: { workflows: any[] }) {
    const [runningId, setRunningId] = useState<string | null>(null);

    const runWorkflow = async (wf: any, actionType: 'START' | 'STOP') => {
        if (!wf.n8nWorkflowId) return;
        setRunningId(`${wf.id}-${actionType}`);
        const action = actionType === 'START' ? 'start' : 'end';
        const url = `${N8N_BASE_URL}?action=${action}&id=${wf.n8nWorkflowId}`;
        try {
            const res = await fetch(url, { method: 'GET' });
            if (!res.ok) alert(`Webhook Error: ${res.status} — ${res.statusText}`);
        } catch {
            alert("System Error: Could not reach the n8n webhook.");
        } finally {
            setRunningId(null);
        }
    };

    const copyId = (id: string) => {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(id);
        } else {
            const t = document.createElement('textarea');
            t.value = id; document.body.appendChild(t); t.select();
            document.execCommand('copy'); document.body.removeChild(t);
        }
        alert('Loop ID copied!');
    };

    return (
        <>
            {/* pulse keyframe injected once */}
            <style>{`
                @keyframes lifecyclePulse {
                    0%   { transform: scale(1);   opacity: 0.4; }
                    50%  { transform: scale(1.7); opacity: 0.1; }
                    100% { transform: scale(1);   opacity: 0.4; }
                }
            `}</style>

            <div className={styles.workflowList}>
                {workflows.map((wf, i) => {
                    const stage   = getStage(wf);
                    const isReady = stage === 'ready';
                    const isOnline = wf.status === 'Active' || wf.status === 'Success' || wf.status === 'Completed';

                    // border accent by stage
                    const cardBorderColor =
                        stage === 'ready'   ? undefined :
                        stage === 'setup'   ? 'rgba(167,139,250,0.35)' :
                        'rgba(245,158,11,0.25)';

                    return (
                        <div
                            key={i}
                            className={styles.workflowItem}
                            style={cardBorderColor ? { borderColor: cardBorderColor } : undefined}
                        >
                            {/* ── TOP ROW ─────────────────────────────── */}
                            <div className={styles.workflowHeader}>
                                <div className={styles.workflowInfo}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        {/* status dot */}
                                        {isReady && isOnline
                                            ? <div className={styles.activeDot} />
                                            : <div style={{
                                                width: '8px', height: '8px', borderRadius: '2px',
                                                background: stage === 'setup' ? '#a78bfa'
                                                    : stage === 'ordered' ? '#f59e0b'
                                                    : 'var(--muted)',
                                              }} />
                                        }
                                        <strong className={styles.workflowTitle}>{wf.name}</strong>
                                        <span className={styles.workflowBadge}>Autonomous Loop</span>
                                    </div>

                                    {/* copy-ID pill */}
                                    <button className={styles.loopIdBtn} onClick={() => copyId(wf.id)}>
                                        <IconCopy />
                                        {wf.id?.substring(0, 8) || '...'}
                                    </button>
                                </div>

                                {/* ── CONTROLS / LOCKED ── */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    {/* status label */}
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={styles.statusText} style={{
                                            color: stage === 'ready' && isOnline ? 'var(--accent)'
                                                : stage === 'setup'   ? '#a78bfa'
                                                : stage === 'ordered' ? '#f59e0b'
                                                : 'var(--muted-foreground)',
                                        }}>
                                            {stage === 'ready'
                                                ? (isOnline ? 'Active' : (wf.status || 'Ready'))
                                                : stage === 'setup' ? 'Being Configured'
                                                : 'Pending Setup'}
                                        </div>
                                        <div className={styles.statusSubtext}>Live Status</div>
                                    </div>

                                    {isReady ? (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className={styles.forceStartBtn}
                                                title="Start workflow"
                                                onClick={() => runWorkflow(wf, 'START')}
                                                disabled={!!runningId}
                                            >
                                                {runningId === `${wf.id}-START` ? '...' : <><IconPlay /> START</>}
                                            </button>
                                            <button
                                                className={styles.forceEndBtn}
                                                title="End workflow"
                                                onClick={() => runWorkflow(wf, 'STOP')}
                                                disabled={!!runningId}
                                            >
                                                {runningId === `${wf.id}-STOP` ? '...' : <><IconStop /> END</>}
                                            </button>
                                        </div>
                                    ) : (
                                        <div title="Controls unlock once admin commissions this node" style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            fontSize: '0.68rem', fontWeight: 800,
                                            color: 'var(--muted-foreground)',
                                            background: 'var(--muted)',
                                            padding: '8px 14px', borderRadius: '10px',
                                            cursor: 'not-allowed', letterSpacing: '0.04em',
                                            textTransform: 'uppercase',
                                        }}>
                                            <IconLock /> Locked
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── LIFECYCLE TRACKER ────────────────────── */}
                            <LifecycleTracker stage={stage} />

                            {/* ── METRICS ──────────────────────────────── */}
                            <div className={styles.metricsRow} style={!isReady ? { opacity: 0.45, pointerEvents: 'none' } : undefined}>
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
        </>
    );
}
