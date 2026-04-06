"use client";

import styles from "./settings.module.css";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
    
    // Team State
    const [members, setMembers] = useState<any[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("MEMBER");
    const [inviting, setInviting] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const success = searchParams.get("success");
        const sessionId = searchParams.get("sessionId");

        if (success === 'true' && sessionId) {
            handleVerification(sessionId);
        } else {
            fetchInitialData();
            fetchTeamData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const fetchTeamData = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            if (data.members) setMembers(data.members);
        } catch (error) {
            console.error("Team fetch failure", error);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail) return;
        try {
            setInviting(true);
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole })
            });
            const data = await res.json();
            if (data.success) {
                alert("Invitation signal successfully dispatched.");
                setInviteEmail("");
            } else {
                alert(data.error || "Invitation pulse failure");
            }
        } catch (error) {
            console.error("Invite failure", error);
        } finally {
            setInviting(false);
        }
    };

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
            console.error("Stripe verification failure", error);
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
            
            // Institutional plan triggers the sovereign checkout handshake
            if (plan === 'Institutional') {
                // We use a modular POST to initiate the sovereign payment session
                const res = await fetch("/api/stripe/checkout", { 
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ plan: 'Institutional' })
                });
                
                const data = await res.json().catch(() => null);
                
                if (!res.ok || !data?.url) {
                    throw new Error(data?.error || "Institutional Handshake Failed");
                }
                
                // Redirecting to Stripe Sovereign Terminal
                window.location.href = data.url;
                return;
            }

            // For infrastructure or other tiers, reset loading
            setCurrentPlan(plan);
            setIsLoading(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error("Plan switch failed", error);
            setIsLoading(false);
            alert("Payment initialization failed. Please verify configuration.");
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
                    className={`${styles.tab} ${activeTab === 'team' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('team')}
                >
                    Team Management
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === 'billing' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('billing')}
                >
                    Billing & Plans
                </button>
            </div>

            {activeTab === 'general' && (
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
            )}

            {activeTab === 'team' && (
                <div className={styles.teamView}>
                    <div className={styles.section}>
                        <h2>Team Management</h2>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                            <input
                                type="email"
                                className={styles.input}
                                placeholder="name@firm.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                style={{ maxWidth: '300px' }}
                            />
                            <select 
                                className={styles.input} 
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                style={{ maxWidth: '150px' }}
                            >
                                <option value="ADMIN">Admin</option>
                                <option value="MEMBER">Member</option>
                            </select>
                            <button 
                                className={styles.btnPrimary} 
                                onClick={handleInvite}
                                disabled={inviting}
                            >
                                {inviting ? "Pulse..." : "Invite Member"}
                            </button>
                        </div>

                        <table className={styles.billTable}>
                            <thead>
                                <tr>
                                    <th>Operator Name</th>
                                    <th>Identity Email</th>
                                    <th>Direct Role</th>
                                    <th style={{ textAlign: 'right' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => (
                                    <tr key={member.id}>
                                        <td style={{ fontWeight: 950, color: '#0A0A0A' }}>{member.name || 'Anonymous Operator'}</td>
                                        <td>{member.email}</td>
                                        <td><span className={styles.planLabel} style={{ fontSize: '0.65rem' }}>{member.role}</span></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <span className={`${styles.statusPill} ${styles.statusActive}`}>Live Connection</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className={styles.billingView}>
                    <div className={styles.section}>
                        <h2>Fleet Subscription</h2>
                        <div className={styles.planGrid}>
                            {/* INSTITUTIONAL PLAN */}
                            <div className={styles.institutionCard}>
                                <div className={styles.planLabels}>
                                    <span className={styles.planLabel}>Institutional</span>
                                </div>
                                <div className={styles.planPricing}>
                                    <span className={styles.planAmount}>$833</span>
                                    <span className={styles.planPeriod}>/mo</span>
                                </div>
                                <p className={styles.planDescription}>
                                    Deploy a full autonomous workforce module across your critical departmental layers.
                                </p>
                                <ul className={styles.featureList}>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Core Governance Engine
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Public Sovereign Cloud
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        SOC-2 Ready Audit
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        5 Seat Integrated Vault
                                    </li>
                                </ul>
                                <button 
                                    className={styles.btnInstitutional}
                                    onClick={() => handlePlanSwitch('Institutional')}
                                    disabled={currentPlan === 'Institutional'}
                                >
                                    {currentPlan === 'Institutional' ? "Current Directive" : "Select Institutional."}
                                </button>
                            </div>

                            {/* INFRASTRUCTURE (ENTERPRISE) PLAN */}
                            <div className={styles.infrastructureCard}>
                                <span className={styles.enterpriseBadge}>Enterprise</span>
                                <div className={styles.planLabels}>
                                    <span className={styles.planLabel}>Infrastructure</span>
                                </div>
                                <div className={styles.planPricing}>
                                    <span className={styles.planAmount}>Inquire</span>
                                </div>
                                <p className={styles.planDescription}>
                                    The absolute operating layer for Fortune 500 legal and accounting firms.
                                </p>
                                <ul className={styles.featureList}>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Private Sovereign Backbone
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Unlimited Capacity scaling
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Strategic Compliance Sync
                                    </li>
                                    <li className={styles.featureItem}>
                                        <svg className={styles.planIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                        Dedicated Key Manager
                                    </li>
                                </ul>
                                <button className={styles.btnInfrastructure} onClick={() => window.open('mailto:architecture@blonk.ai')}>
                                    Contact Architecture.
                                </button>
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
                                    <th style={{ textAlign: 'right' }}>Action</th>
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

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className={styles.container}><p>Initializing sovereign control panel...</p></div>}>
            <SettingsContent />
        </Suspense>
    );
}
