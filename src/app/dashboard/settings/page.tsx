"use client";

import styles from "./settings.module.css";
import React, { useState, useEffect } from "react";

export default function SettingsPage() {
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

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const success = query.get('success');
        const sessionId = query.get('sessionId');

        if (success === 'true' && sessionId) {
            handleVerification(sessionId);
        } else {
            fetchInitialData();
        }
    }, []);

    const handleVerification = async (sessionId: string) => {
        try {
            setIsLoading(true);
            const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
            const data = await res.json();
            
            if (data.success) {
                // Successfully verified and upgraded
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error("Stripe verification protocol failure", error);
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
            if (opData && !opData.error) {
                setOperationalSettings(opData);
            }
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
            
            // Only Professional plan currently has a checkout route
            if (plan === 'Professional') {
                const res = await fetch('/api/stripe/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        priceId: "price_placeholder_id" // In production this comes from env or DB
                    })
                });
                
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error(data.error || "Checkout failed");
                }
                return;
            }

            // For Starter (Free), we might just update the DB directly (not implemented here)
            setCurrentPlan(plan);
            setIsLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Protocol switch failed", error);
            setIsLoading(false);
            alert("Payment protocol handshake failed. Please verify configuration.");
        }
    };

    if (isLoading) {
        return <div className={styles.container}><p>Synchronizing vault parameters...</p></div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>System Control</h1>
                <p>Manage your firm parameters, operational guardrails and billing history.</p>
            </div>

            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === 'general' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('general')}
                >
                    Firm Identity
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'billing' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('billing')}
                >
                    Billing & Plans
                </button>
            </div>

            {activeTab === 'general' ? (
                <>
                    <div className={styles.section}>
                        <h2>Identity & Access</h2>
                        <div className={styles.field}>
                            <label>Full Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Firm Name</label>
                            <input
                                type="text"
                                className={styles.input}
                                value={formData.firmName}
                                onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Admin Email</label>
                            <input
                                type="email"
                                className={styles.input}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Operational Guardrails</h2>
                        <div className={styles.toggleField}>
                            <div className={styles.toggleInfo}>
                                <strong>Autonomous Discovery</strong>
                                <p>Enable agents to scale document search loops independently.</p>
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
                                <strong>Real-time Auditing</strong>
                                <p>Generate specialized risk assessments for every large transaction.</p>
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

                    <div className={styles.footer}>
                        <button className={styles.btnPrimary} onClick={handleSave}>
                            {saved ? "Vault Updated" : "Commit Configuration"}
                        </button>
                    </div>
                </>
            ) : (
                <div className={styles.billingView}>
                    <div className={styles.section}>
                        <h2>Subscription Protocols</h2>
                        <div className={styles.planGrid}>
                            <div className={`${styles.planCard} ${currentPlan === 'Starter' ? styles.selectedPlan : ''}`}>
                                {currentPlan === 'Starter' && <span className={styles.currentPlanBadge}>Active</span>}
                                <div className={styles.planHeader}>
                                    <div className={styles.planName}>Starter (Free)</div>
                                    <div className={styles.planPrice}>$0<span>/mo</span></div>
                                </div>
                                <ul className={styles.featureList}>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.featureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        1 Active Loop
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.featureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        10 Task Requests / mo
                                    </li>
                                </ul>
                                {currentPlan !== 'Starter' && (
                                    <button className={styles.btnPrimary} style={{ width: '100%', marginTop: '16px' }} onClick={() => handlePlanSwitch('Starter')}>
                                        Select Protocol
                                    </button>
                                )}
                            </div>

                            <div className={`${styles.planCard} ${currentPlan === 'Professional' ? styles.selectedPlan : ''}`}>
                                {currentPlan === 'Professional' && <span className={styles.currentPlanBadge}>Active</span>}
                                <div className={styles.planHeader}>
                                    <div className={styles.planName}>Professional</div>
                                    <div className={styles.planPrice}>$49<span>/mo</span></div>
                                </div>
                                <ul className={styles.featureList}>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.featureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        5 Active Loops
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.featureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        500 Task Requests / mo
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.featureIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        Priority Support
                                    </li>
                                </ul>
                                {currentPlan !== 'Professional' && (
                                    <button className={styles.btnPrimary} style={{ width: '100%', marginTop: '16px', background: '#34D186', color: '#0F172A' }} onClick={() => handlePlanSwitch('Professional')}>
                                        Unlock Capacity
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Invoice History</h2>
                        <table className={styles.billTable}>
                            <thead>
                                <tr>
                                    <th>Ref ID</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length > 0 ? invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td>{inv.invoiceNumber}</td>
                                        <td>{new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td style={{ fontWeight: 950, color: '#0F172A' }}>{inv.amount}</td>
                                        <td><span className={`${styles.statusPill} ${styles.statusPaid}`}>{inv.status}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className={styles.downloadBtn} title="Download PDF">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No historical transactions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}


