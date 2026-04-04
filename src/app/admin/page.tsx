"use client";

import styles from "../dashboard/page.module.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminControlPage() {
    // Only one view now: Workflow Instances (Provisioning)
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [configWorkflow, setConfigWorkflow] = useState<any>(null);
    const [configStep, setConfigStep] = useState(1);

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows');
            const data = await res.json();
            if (Array.isArray(data)) setWorkflows(data);
        } catch (error) { console.error(error); } finally { setIsLoadingWorkflows(false); }
    };

    const updateWebhook = async (id: string, url: string) => {
        setSavingId(id);
        try {
            await fetch('/api/admin/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, n8nWebhookUrl: url })
            });
            fetchWorkflows();
            setConfigWorkflow(null);
            setConfigStep(1);
        } catch (error) { console.error(error); } finally { setSavingId(null); }
    };

    const deleteWorkflow = async (id: string) => {
        if (!confirm("Permanently delete this instance? This cannot be undone.")) return;
        try {
            // Reusing the DELETE pattern for workflows if route exists, 
            // otherwise we'll just implement a simple DELETE handler.
            const res = await fetch(`/api/admin/workflows?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchWorkflows();
        } catch (error) { console.error(error); }
    };

    return (
        <div className={styles.dashboard}>
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.03em' }}>
                    Active Loop Provisioning
                </h1>
                <p style={{ margin: '8px 0 0', color: '#64748B', fontWeight: 600 }}>Manage production deployments and client node links.</p>
            </header>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <div>
                        <h2 className={styles.cardTitle}>Fleet Management</h2>
                        <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem' }}>Track, calibrate, and sync autonomous loops with your Cloud nodes.</p>
                    </div>
                </div>

                {isLoadingWorkflows ? (
                    <div className={styles.loading}>Accessing secure registry...</div>
                ) : (
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>Loop Detail</th>
                                <th>Requested By</th>
                                <th>Deployment Status</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workflows.map(wf => (
                                <tr key={wf.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ fontWeight: 850, color: '#0F172A', fontSize: '0.95rem' }}>{wf.name}</div>
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
                                                        style={{ background: '#F1F5F9', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '0.6rem', fontWeight: 900, color: '#94A3B8', cursor: 'pointer' }}
                                                        title="Copy ID for n8n"
                                                    >
                                                        #{wf.id.substring(0, 8)}
                                                    </button>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{wf.sector}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '28px', height: '28px', background: '#0F172A', color: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>
                                                {wf.requestedBy?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1E293B' }}>{wf.requestedBy || "Client User"}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>Provisioning Request</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '6px 14px',
                                            borderRadius: '24px',
                                            fontSize: '0.75rem',
                                            fontWeight: 900,
                                            background: wf.status === 'Pending' ? '#FFFBEB' : '#ECFDF5',
                                            color: wf.status === 'Pending' ? '#B45309' : '#059669',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }}></span>
                                            {wf.status === 'Active' ? 'SYNCED' : 'AWAITING NODE'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                className={styles.btnOutline}
                                                style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, borderColor: wf.status === 'Pending' ? '#0F172A' : '#E2E8F0', color: wf.status === 'Pending' ? '#0F172A' : '#64748B', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                                                onClick={() => { setConfigWorkflow(wf); setConfigStep(1); }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                                                Configure
                                            </button>
                                            <button 
                                                className={styles.btnOutline}
                                                style={{ padding: '10px', borderRadius: '12px', borderColor: '#FEE2E2', color: '#EF4444' }}
                                                onClick={() => deleteWorkflow(wf.id)}
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* CONFIG MODAL */}
            {configWorkflow && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '640px', borderRadius: '32px', boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden', border: '1px solid #F1F5F9' }}>
                        {/* Modal Header */}
                        <div style={{ background: '#0F172A', padding: '32px 40px', color: 'white' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.03em' }}>Production Sync</h3>
                                    <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Loop: {configWorkflow.name}</p>
                                </div>
                                <button onClick={() => setConfigWorkflow(null)} style={{ background: '#ffffff08', border: 'none', color: 'white', cursor: 'pointer', padding: '10px', borderRadius: '14px', transition: 'all 0.2s' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>

                            {/* Wizard Progress */}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '40px' }}>
                                {[1, 2, 3].map(s => (
                                    <div key={s} style={{ flex: 1, height: '6px', background: configStep >= s ? '#34D186' : 'rgba(255,255,255,0.1)', borderRadius: '12px', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}></div>
                                ))}
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '40px', maxHeight: '55vh', overflowY: 'auto' }}>
                            {configStep === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34D186' }}></div>
                                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#0F172A', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calibration Parameters</h4>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        {configWorkflow.inputs ? (
                                            (() => {
                                                let data = {};
                                                try {
                                                    data = typeof configWorkflow.inputs === 'string' 
                                                        ? JSON.parse(configWorkflow.inputs) 
                                                        : configWorkflow.inputs;
                                                    // Handle double-stringification if present
                                                    if (typeof data === 'string') data = JSON.parse(data);
                                                } catch (e) { data = {}; }
                                                
                                                return Object.entries(data || {}).map(([key, val]: any) => (
                                                    <div key={key} style={{ background: '#F8FAFC', padding: '20px', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                                        <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 900, color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{key}</label>
                                                        <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', fontFamily: 'monospace', wordBreak: 'break-all', background: 'white', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>{String(val)}</div>
                                                    </div>
                                                ));
                                            })()
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '40px', border: '2px dashed #F1F5F9', borderRadius: '24px' }}>
                                                <p style={{ fontSize: '0.95rem', color: '#94A3B8', fontWeight: 600, margin: 0 }}>No custom data provided for this instance.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {configStep === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: 900, marginBottom: '14px', fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>n8n Backend Endpoint</label>
                                        <input 
                                            className={styles.searchInput} 
                                            style={{ padding: '20px', borderRadius: '20px', background: '#F8FAFC', border: '2px solid #E2E8F0', transition: 'all 0.3s', fontSize: '1rem', fontWeight: 600 }}
                                            value={configWorkflow.n8nWebhookUrl || ""}
                                            onChange={(e) => setConfigWorkflow({...configWorkflow, n8nWebhookUrl: e.target.value})}
                                            placeholder="Paste the production webhook URL..."
                                        />
                                    </div>
                                    
                                    <div style={{ background: '#F0F9FF', padding: '24px', borderRadius: '24px', border: '1px solid #BAE6FD', display: 'flex', gap: '16px' }}>
                                        <div style={{ width: '40px', height: '40px', background: '#BAE6FD', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0369A1" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#0369A1', lineHeight: '1.6', fontWeight: 600 }}>
                                            Deployment Note: Ensure the n8n workflow is set to <strong>Active</strong> before linking. The site will begin polling for performance metrics immediately after calibration.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {configStep === 3 && (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '96px', height: '96px', background: '#ECFDF5', color: '#34D186', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    </div>
                                    <h4 style={{ margin: 0, fontSize: '1.75rem', color: '#0F172A', fontWeight: 950, letterSpacing: '-0.03em' }}>Node Ready</h4>
                                    <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: '340px', margin: '16px auto 0', lineHeight: '1.6', fontWeight: 600 }}>The loop is calibrated and ready for production transmission. Activating will notify the client.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '32px 40px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', background: '#F8FAFC' }}>
                            <button 
                                className={styles.btnOutline} 
                                style={{ padding: '14px 28px', borderRadius: '16px', fontWeight: 850, borderColor: '#E2E8F0', color: '#64748B', fontSize: '0.9rem' }}
                                onClick={() => configStep > 1 ? setConfigStep(prev => prev - 1) : setConfigWorkflow(null)}
                            >
                                {configStep === 1 ? 'Cancel Calibration' : 'Previous Step'}
                            </button>
                            <button 
                                className={styles.btnDark} 
                                style={{ background: configStep === 3 ? '#34D186' : '#0F172A', minWidth: '160px', borderRadius: '16px', fontWeight: 850, padding: '14px 28px', transition: 'all 0.3s', fontSize: '0.9rem' }}
                                onClick={() => {
                                    if (configStep < 3) setConfigStep(prev => prev + 1);
                                    else updateWebhook(configWorkflow.id, configWorkflow.n8nWebhookUrl);
                                }}
                                disabled={savingId === configWorkflow.id || (configStep === 2 && !configWorkflow.n8nWebhookUrl)}
                            >
                                {savingId === configWorkflow.id ? "Syncing..." : (configStep === 3 ? 'Finalize & Activate' : 'Next Step')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
