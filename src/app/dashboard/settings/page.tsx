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
                setInviteEmail("");
                setInvitePassword("");
                setInviteName("");
                fetchTeamData();
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
                    className={`${styles.tab} ${activeTab === 'team' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('team')}
                >
                    Personnel Roster
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

            {activeTab === 'team' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    <div className={styles.section}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2>Operator Provisioning</h2>
                                <p className={styles.planDescription}>Deploy new co-pilots with specialized administrative credentials.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'var(--accent-muted)', borderRadius: '14px', border: '1px solid var(--accent)' }}>
                                <Users size={16} color="var(--accent)" />
                                <span style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{members.length} Active</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                            <div className={styles.field}><label>Presence Name</label><input type="text" className={styles.input} value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Jane Smith" /></div>
                            <div className={styles.field}><label>Identity Token (Email)</label><input type="email" className={styles.input} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="jane@blonk.ai" /></div>
                            <div className={styles.field}><label>Initial Password</label><input type="text" className={styles.input} value={invitePassword} onChange={e => setInvitePassword(e.target.value)} placeholder="Min. 8 characters" /></div>
                            <div className={styles.field}><label>System Permission</label><select className={styles.input} value={inviteRole} onChange={e => setInviteRole(e.target.value)}><option value="MEMBER">Member — Standard Loop Access</option><option value="ADMIN">Admin — Full Subsystem Control</option></select></div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className={styles.btnPrimary} onClick={handleInvite} disabled={inviting || !inviteEmail || !invitePassword || !inviteName}>
                                {inviting ? "Provisioning..." : "+ Deploy New Operator"}
                            </button>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2>Active Personnel Roster</h2>
                        <table className={styles.billTable}>
                            <thead>
                                <tr>
                                    <th>Identity</th>
                                    <th>Token</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Direct Control</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member: any) => (
                                    <tr key={member.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ 
                                                    width: '38px', 
                                                    height: '38px', 
                                                    borderRadius: '10px', 
                                                    background: member.role === 'OWNER' ? 'var(--primary)' : 'var(--accent-muted)', 
                                                    color: member.role === 'OWNER' ? 'var(--primary-foreground)' : 'var(--accent)', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    fontWeight: 950, 
                                                    fontSize: '0.9rem' 
                                                }}>
                                                    {(member.name || 'O').charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 950, color: 'var(--foreground)' }}>{member.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ color: 'var(--muted-foreground)' }}>{member.email}</td>
                                        <td>
                                            <span className={styles.statusPaid}>{member.role}</span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {member.role !== 'OWNER' && (
                                                <button onClick={() => handleRemoveMember(member.id, member.name)} style={{ background: 'none', border: 'none', color: 'var(--destructive)', fontWeight: 950, fontSize: '0.8rem', cursor: 'pointer' }}>Eject Member</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
