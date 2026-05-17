"use client";

import styles from "./settings.module.css";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, CreditCard, Users, Settings as SettingsIcon, Check, Download, AlertTriangle } from "lucide-react";

function SettingsContent() {
    const [activeTab, setActiveTab] = useState('general');
    const [saved, setSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlan, setCurrentPlan] = useState("Starter");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        firmName: "",
        email: "",
        name: ""
    });
    const [operationalSettings, setOperationalSettings] = useState<Record<string, string>>({
        autonomous_discovery: "true",
        real_time_auditing: "true"
    });
    
    const [aiSettings, setAiSettings] = useState<Record<string, string>>({
        reasoning_effort: "High",
        response_style: "Institutional",
        proactive_analysis: "true"
    });
    const [securitySettings, setSecuritySettings] = useState<Record<string, string>>({
        ip_whitelist: "All Restricted",
        session_timeout: "24h",
        audit_retention: "365 days"
    });

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const success = searchParams.get("success");
        const sessionId = searchParams.get("sessionId");

        if (success === 'true' && sessionId) {
            handleVerification(sessionId);
        } else {
            fetchInitialData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);



    const handleVerification = async (sessionId: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
            const data = await res.json();
            if (data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } finally {
            fetchInitialData();
        }
    };

    const fetchInitialData = async () => {
        try {
            const [userRes, opRes, billRes] = await Promise.all([
                fetch('/api/settings'),
                fetch('/api/settings/operational'),
                fetch('/api/billing')
            ]);

            const userData = await userRes.json();
            const opData = await opRes.json();
            const billData = await billRes.json();

            if (userData && !userData.error) {
                setFormData({
                    firmName: userData.firmName || "",
                    email: userData.email || "",
                    name: userData.name || ""
                });
            }
            if (opData && !opData.error) setOperationalSettings(opData);
            if (billData && !billData.error) {
                setCurrentPlan(billData.plan);
                setInvoices(billData.invoices);
            }
        } catch (error) {
            console.error('Error fetching vault data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const toggleOperational = async (key: string) => {
        const newValue = operationalSettings[key] === "true" ? "false" : "true";
        setOperationalSettings({ ...operationalSettings, [key]: newValue });
        try {
            await fetch('/api/settings/operational', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value: newValue })
            });
        } catch (error) {
            console.error('Error toggling setting:', error);
        }
    };

    const handlePlanSwitch = async (plan: string) => {
        if (plan === currentPlan) return;
        try {
            setIsLoading(true);
            if (plan === 'Institutional') {
                const res = await fetch("/api/stripe/checkout", { 
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: 'Institutional' })
                });
                const data = await res.json().catch(() => null);
                if (data?.url) {
                    window.location.href = data.url;
                    return;
                }
            }
            setCurrentPlan(plan);
        } catch (error) {
            console.error("Plan switch failed", error);
        } finally {
            setIsLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.container} style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontWeight: 950, color: '#94A3B8', letterSpacing: '-0.02em' }}>Initializing sovereign control panel...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    System Profile
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'intelligence' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('intelligence')}
                >
                    AI Orchestration
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security Guardrails
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'billing' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('billing')}
                >
                    Subscription Tiers
                </button>
            </div>

            {activeTab === 'general' && (
                <div className={styles.section}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h2>Configuration & Guardrails</h2>
                            <p className={styles.planDescription}>Manage your administrative vault and autonomous operating parameters.</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--muted)', borderRadius: '14px', border: '1px solid var(--border)' }}>
                            <Shield size={16} color="var(--accent)" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vault Encrypted</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className={styles.field}>
                            <label>Admin Principal Presence</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your Name"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Sovereign Firm Identity</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.firmName}
                                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                                placeholder="Firm Name"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Primary Communication Endpoint</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Email"
                            />
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 950, marginBottom: '24px' }}>Autonomous Logic</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className={styles.toggleField}>
                                <div className={styles.toggleInfo}>
                                    <strong>Subsystem Discovery</strong>
                                    <p>Allow agents to independently provision new specialized loop modules.</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={operationalSettings.autonomous_discovery === "true"}
                                        onChange={() => toggleOperational('autonomous_discovery')}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                            <div className={styles.toggleField}>
                                <div className={styles.toggleInfo}>
                                    <strong>Continuous Ledger Audit</strong>
                                    <p>Real-time oversight for every financial interaction within active loop sectors.</p>
                                </div>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={operationalSettings.real_time_auditing === "true"}
                                        onChange={() => toggleOperational('real_time_auditing')}
                                    />
                                    <span className={styles.slider}></span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button className={styles.btnPrimary} onClick={handleSave}>
                            {saved ? "Synchronized with Vault" : "Commit System Changes"}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'intelligence' && (
                <div className={styles.section}>
                    <h2>AI Logic & Reasoning</h2>
                    <p className={styles.planDescription}>Tune the cognitive output and behavioral patterns of your autonomous fleet.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
                        <div className={styles.field}>
                            <label>Reasoning Intensity</label>
                            <select className={styles.input} value={aiSettings.reasoning_effort} onChange={e => setAiSettings({...aiSettings, reasoning_effort: e.target.value})}>
                                <option>Conservative — Fast & Efficient</option>
                                <option>Moderate — Balanced Precision</option>
                                <option>High — Deep Strategic Analysis</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Executive Response Style</label>
                            <select className={styles.input} value={aiSettings.response_style} onChange={e => setAiSettings({...aiSettings, response_style: e.target.value})}>
                                <option>Institutional — Professional & Concise</option>
                                <option>Technical — Detailed & Data-Centric</option>
                                <option>Advisory — Action-Oriented & Strategic</option>
                            </select>
                        </div>
                        
                        <div className={styles.toggleField}>
                            <div className={styles.toggleInfo}>
                                <strong>Proactive Trend Analysis</strong>
                                <p>Enable AI to automatically scan your logs for efficiency improvements without being prompted.</p>
                            </div>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={aiSettings.proactive_analysis === "true"} onChange={() => setAiSettings({...aiSettings, proactive_analysis: aiSettings.proactive_analysis === "true" ? "false" : "true"})} />
                                <span className={styles.slider}></span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className={styles.section}>
                    <h2>Infrastructure Hardening</h2>
                    <p className={styles.planDescription}>Configure global access controls and data retention policies for the vault.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginTop: '32px' }}>
                        <div className={styles.field}>
                            <label>IP Access Whitelist</label>
                            <input type="text" className={styles.input} value={securitySettings.ip_whitelist} onChange={e => setSecuritySettings({...securitySettings, ip_whitelist: e.target.value})} placeholder="e.g. 192.168.1.1, 10.0.0.1" />
                        </div>
                        <div className={styles.field}>
                            <label>Audit Retention Period</label>
                            <select className={styles.input} value={securitySettings.audit_retention} onChange={e => setSecuritySettings({...securitySettings, audit_retention: e.target.value})}>
                                <option>90 Days</option>
                                <option>365 Days</option>
                                <option>Indefinite (Legal Hold)</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Autonomous Session Timeout</label>
                            <select className={styles.input} value={securitySettings.session_timeout} onChange={e => setSecuritySettings({...securitySettings, session_timeout: e.target.value})}>
                                <option>1 Hour</option>
                                <option>12 Hours</option>
                                <option>24 Hours</option>
                                <option>7 Days</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    <div className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div>
                                <h2>Infrastructure Commitment</h2>
                                <p className={styles.planDescription}>Select the operational capacity that aligns with your firm's administrative volume.</p>
                            </div>
                        </div>

                        <div className={styles.planGrid}>
                            <div className={styles.institutionCard}>
                                <span className={styles.planLabel}>Priority Tier</span>
                                <div className={styles.planPricing}><span className={styles.planAmount}>$833</span><span className={styles.planPeriod}>/mo</span></div>
                                <p className={styles.planDescription}>The definitive operating layer for autonomous personnel management.</p>
                                <ul className={styles.featureList}>
                                    <li className={styles.featureItem}><Check size={18} color="var(--accent)" /> Unlimited Audit Loops</li>
                                    <li className={styles.featureItem}><Check size={18} color="var(--accent)" /> Sovereign Data Backbone</li>
                                    <li className={styles.featureItem}><Check size={18} color="var(--accent)" /> SOC-2 Compliance Core</li>
                                </ul>
                                <button className={`${styles.btnPrimary} ${styles.btnInstitutional}`} onClick={() => handlePlanSwitch('Institutional')} disabled={currentPlan === 'Institutional'}>
                                    {currentPlan === 'Institutional' ? "Active Directive" : "Commit to Institutional"}
                                </button>
                            </div>

                            <div className={styles.infrastructureCard}>
                                <span className={styles.enterpriseBadge}>Limited Allocation</span>
                                <div className={styles.planPricing}><span className={styles.planAmount}>Contact</span></div>
                                <p className={styles.planDescription}>Custom infrastructure scaling for global legal and accounting entities.</p>
                                <ul className={styles.featureList}>
                                    <li className={styles.featureItem}><Check size={18} color="var(--accent)" /> Private Subsystem Mirroring</li>
                                    <li className={styles.featureItem}><Check size={18} color="var(--accent)" /> 24/7 Loop Reliability Engineers</li>
                                    <li className={styles.featureItem}><Check size={18} color="var(--accent)" /> Custom Regulatory Adapters</li>
                                </ul>
                                <button className={`${styles.btnPrimary} ${styles.btnInfrastructure}`} onClick={() => window.open('mailto:architecture@blonk.ai')}>Inquire for Infrastructure</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Transaction Ledger</h2>
                        <table className={styles.billTable}>
                            <thead>
                                <tr>
                                    <th>Ref ID</th>
                                    <th>Commit Date</th>
                                    <th>Allocation</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Audit Log</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length > 0 ? invoices.map(inv => (
                                    <tr key={inv.id}>
                                        <td>{inv.invoiceNumber}</td>
                                        <td>{new Date(inv.date).toLocaleDateString()}</td>
                                        <td style={{ fontWeight: 950, color: 'var(--foreground)' }}>{inv.amount}</td>
                                        <td><span className={styles.statusPaid}>COMMITTED</span></td>
                                        <td style={{ textAlign: 'right' }}><button className={styles.downloadBtn}><Download size={18} /></button></td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px', opacity: 0.5 }}>No historical commitment records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className={styles.container}><p>Initializing sovereign control panel...</p></div>}>
            <SettingsContent />
        </Suspense>
    );
}
