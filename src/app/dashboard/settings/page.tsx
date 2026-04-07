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
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [invitePassword, setInvitePassword] = useState("");
    const [inviteRole, setInviteRole] = useState("MEMBER");
    const [inviting, setInviting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        if (!inviteEmail || !invitePassword) return;
        try {
            setInviting(true);
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: inviteEmail, 
                    password: invitePassword, 
                    name: inviteName,
                    role: inviteRole 
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Sovereign Co-Pilot account successfully provisioned.");
                setInviteEmail("");
                setInvitePassword("");
                setInviteName("");
                fetchTeamData(); // Refresh member pulse
            } else {
                alert(data.error || "Personnel provisioning failure");
            }
        } catch (error) {
            console.error("Provisioning failure", error);
        } finally {
            setInviting(false);
        }
    };

    const handleRemoveMember = async (memberId: string, memberName: string) => {
        if (!confirm(`Remove ${memberName || 'this operator'} from your team? This cannot be undone.`)) return;
        try {
            const res = await fetch('/api/team', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId })
            });
            const data = await res.json();
            if (data.success) {
                setMembers(members.filter((m: any) => m.id !== memberId));
            } else {
                alert(data.error || 'Failed to remove operator.');
            }
        } catch (error) {
            console.error('Member removal failure', error);
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
                    {/* PROVISION NEW MEMBER */}
                    <div className={styles.section}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>Add Team Member</h2>
                                <p style={{ color: '#64748B', fontWeight: 700, fontSize: '0.95rem', marginTop: '6px' }}>
                                    Create login credentials for your co-pilots. They can sign in immediately.
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F0FAF5', padding: '8px 16px', borderRadius: '12px' }}>
                                <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%' }} />
                                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#34D186', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    {members.length} Active
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                            <div className={styles.field} style={{ margin: 0 }}>
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Jane Smith"
                                    value={inviteName}
                                    onChange={(e) => setInviteName(e.target.value)}
                                />
                            </div>
                            <div className={styles.field} style={{ margin: 0 }}>
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.input}
                                    placeholder="jane@yourfirm.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                            <div className={styles.field} style={{ margin: 0 }}>
                                <label>Login Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={styles.input}
                                        placeholder="Min. 8 characters"
                                        value={invitePassword}
                                        onChange={(e) => setInvitePassword(e.target.value)}
                                        style={{ paddingRight: '52px' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, lineHeight: 1
                                        }}
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className={styles.field} style={{ margin: 0 }}>
                                <label>Role</label>
                                <select
                                    className={styles.input}
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="MEMBER">Member — Standard access</option>
                                    <option value="ADMIN">Admin — Elevated access</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className={styles.btnPrimary}
                                onClick={handleInvite}
                                disabled={inviting || !inviteEmail || !invitePassword || !inviteName}
                            >
                                {inviting ? (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".2"/><path d="M21 12a9 9 0 0 0-9-9"/></svg>
                                        Provisioning...
                                    </span>
                                ) : '+ Provision Account'}
                            </button>
                        </div>
                    </div>

                    {/* ACTIVE ROSTER */}
                    <div className={styles.section}>
                        <h2>Active Roster</h2>
                        {members.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '48px', color: '#94A3B8', background: '#F8FAFC', borderRadius: '20px', border: '1px solid #E2E8F0' }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                <p style={{ fontWeight: 800, fontSize: '1rem' }}>No team members yet.</p>
                                <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Provision an account above to get started.</p>
                            </div>
                        ) : (
                            <table className={styles.billTable}>
                                <thead>
                                    <tr>
                                        <th>Operator</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member: any) => (
                                        <tr key={member.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                                                        background: member.role === 'OWNER' ? '#0A0A0A' : member.role === 'ADMIN' ? '#EEF2FF' : '#F0FAF5',
                                                        color: member.role === 'OWNER' ? '#FFFFFF' : member.role === 'ADMIN' ? '#6366F1' : '#34D186',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontWeight: 950, fontSize: '0.9rem'
                                                    }}>
                                                        {(member.name || 'O').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 950, color: '#0A0A0A' }}>{member.name || 'Anonymous Operator'}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748B' }}>{member.email}</td>
                                            <td>
                                                <span style={{
                                                    padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950,
                                                    textTransform: 'uppercase', letterSpacing: '0.08em',
                                                    background: member.role === 'OWNER' ? '#0A0A0A' : member.role === 'ADMIN' ? '#EEF2FF' : '#F0FAF5',
                                                    color: member.role === 'OWNER' ? '#FFFFFF' : member.role === 'ADMIN' ? '#6366F1' : '#34D186',
                                                }}>
                                                    {member.role}
                                                </span>
                                            </td>
                                            <td style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
                                                {member.createdAt ? new Date(member.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                {member.role !== 'OWNER' ? (
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id, member.name)}
                                                        style={{
                                                            background: '#FFF1F2', border: '1px solid #FFE4E6', color: '#F43F5E',
                                                            padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 950,
                                                            cursor: 'pointer', transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={e => { (e.target as HTMLElement).style.background = '#F43F5E'; (e.target as HTMLElement).style.color = '#FFFFFF'; }}
                                                        onMouseLeave={e => { (e.target as HTMLElement).style.background = '#FFF1F2'; (e.target as HTMLElement).style.color = '#F43F5E'; }}
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <span style={{ color: '#CBD5E1', fontSize: '0.8rem', fontWeight: 800 }}>Team Owner</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
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
