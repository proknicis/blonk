"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import adminStyles from "../../admin.module.css";
import { 
    Users, Shield, Trash2, Search, Activity, UserCheck, ShieldAlert, 
    Building2, Clock, Zap, ChevronRight, X, CreditCard, Key, 
    ArrowDownCircle, Fingerprint, ShieldCheck, Calendar, ArrowLeft
} from "lucide-react";

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;
    
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [modalTab, setModalTab] = useState("Overview");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/admin/users');
                const data = await res.json();
                const foundUser = data.find((u: any) => u.id === userId);
                setUser(foundUser);
            } catch (error) {
                console.error("Failed to fetch user", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    if (isLoading) {
        return <div style={{ padding: '64px', textAlign: 'center', color: '#6B7280', fontWeight: 950 }}>LOADING...</div>;
    }

    if (!user) {
        return <div style={{ padding: '64px', textAlign: 'center', color: '#6B7280', fontWeight: 950 }}>USER NOT FOUND</div>;
    }

    // Example mock properties for logic based on real user data
    // In a real system, you'd fetch from Stripe/Billing APIs. 
    // Here we deduce from user's current data to show 'no subscription' properly.
    const hasActiveSubscription = user.tier && user.tier !== "Trial" && user.tier !== "Starter";
    const planName = user.tier || "Starter";
    const paymentMethod = hasActiveSubscription ? "Visa ending in 4242" : "None";
    const totalPaid = hasActiveSubscription ? "€149.00" : "€0.00";
    const nextInvoice = hasActiveSubscription ? "05/06/2026" : "N/A";
    const monthlyPrice = hasActiveSubscription ? "€49.00 / month" : "Free";
    const invoices = hasActiveSubscription ? [{ id: 'INV-2026-04', date: '05/05/2026', amount: '€49.00', status: 'PAID' }] : [];
    
    // Workflows Logic
    const workflowsUsed = user.workflowsUsed || 0;
    const assignedWorkflows = workflowsUsed > 0 ? [{ name: 'Invoice processing', role: 'Admin', status: 'ACTIVE', lastRun: '12m ago (100% success)' }] : [];

    // Audit logs - we'd normally fetch this from an API
    const auditLogs = [
        { time: new Date().toLocaleString(), action: "Viewed Profile", target: "Admin Dashboard" }
    ];

    const getUserStatus = (u: any) => {
        if (u.status === 'Suspended' || u.status === 'Blocked') return 'Suspended';
        if (!u.lastActive) return 'Inactive';
        const diffDays = (new Date().getTime() - new Date(u.lastActive).getTime()) / (1000 * 3600 * 24);
        return diffDays > 7 ? 'Inactive' : 'Active';
    };

    return (
        <div style={{ animation: "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Header Area */}
            <div style={{ padding: '0 0 32px 0' }}>
                <button 
                    onClick={() => router.push('/admin/users')}
                    style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.85rem', fontWeight: 950, display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', marginBottom: '24px' }}
                >
                    <ArrowLeft size={16} /> BACK TO DIRECTORY
                </button>
            </div>

            <div style={{ flex: 1, background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                
                {/* User Header Profile */}
                <div style={{ background: '#0F172A', color: '#FFFFFF', padding: '56px 64px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                            <div style={{ width: '100px', height: '100px', background: '#10B981', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 950, color: '#0F172A' }}>
                                {user.name?.charAt(0)}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0, letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                                        {user.name}
                                    </h2>
                                    <div style={{ padding: '4px 12px', background: '#10B981', color: '#0F172A', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>
                                        Plan: {planName}
                                    </div>
                                </div>
                                <p style={{ fontSize: '1.1rem', opacity: 0.6, margin: 0 }}>{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '48px', marginTop: '56px' }}>
                        {["Overview", "Workflows", "Billing", "Audit Logs"].map(t => (
                            <button 
                                key={t}
                                onClick={() => setModalTab(t)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: modalTab === t ? '#10B981' : 'rgba(255,255,255,0.4)',
                                    fontSize: '0.9rem',
                                    fontWeight: 950,
                                    padding: '0 0 16px 0',
                                    borderBottom: modalTab === t ? '2px solid #10B981' : '2px solid transparent',
                                    cursor: 'pointer'
                                }}
                            >
                                {t.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, padding: '64px', overflowY: 'auto' }}>
                    {modalTab === "Overview" && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            {[
                                { label: "USER ID", value: user.id, icon: <Fingerprint size={16} /> },
                                { label: "LAST ACTIVE", value: user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never', icon: <Clock size={16} /> },
                                { label: "WORKSPACE", value: user.firmName || "Independent", icon: <Building2 size={16} /> },
                                { label: "ROLE", value: user.role || "Operator", icon: <ShieldCheck size={16} /> },
                                { label: "JOINED DATE", value: new Date(user.createdAt).toLocaleDateString(), icon: <Calendar size={16} /> }
                            ].map((item, i) => (
                                <div key={i} style={{ background: '#FAFAFA', padding: '32px', borderRadius: '24px', border: 'none' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#6B7280', marginBottom: '16px' }}>
                                        {item.icon}
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                                    </div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#111827' }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {modalTab === "Workflows" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                                <button className={adminStyles.primaryBtn} style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', height: '40px', padding: '0 20px', borderRadius: '12px' }}>Add Workflow Access</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                {[
                                    { label: "ASSIGNED WORKFLOWS", value: workflowsUsed.toString(), icon: <Activity size={16} /> },
                                    { label: "ACTIVE WORKFLOWS", value: assignedWorkflows.length.toString(), icon: <Zap size={16} /> },
                                    { label: "LAST WORKFLOW ACTION", value: assignedWorkflows.length > 0 ? "12m ago" : "Never", icon: <Clock size={16} /> },
                                    { label: "ASSIGNED N8N INSTANCE", value: workflowsUsed > 0 ? "n8n Instance A" : "None", icon: <Building2 size={16} /> }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: i === 0 ? '#F0FDF4' : '#FAFAFA', padding: '24px', borderRadius: '24px', border: i === 0 ? '1px solid #BBF7D0' : 'none' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: i === 0 ? '#166534' : '#6B7280', marginBottom: '16px' }}>
                                            {item.icon}
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                                        </div>
                                        <div style={{ fontSize: i === 3 ? '1.1rem' : '1.5rem', fontWeight: 950, color: i === 0 ? '#166534' : '#0F172A' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '24px', textTransform: 'uppercase' }}>ASSIGNED WORKFLOWS</h3>
                                {assignedWorkflows.length > 0 ? (
                                    <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
                                        <table className={adminStyles.registryTable} style={{ margin: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>WORKFLOW</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>PERMISSION</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>STATUS</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>LAST RUN</th>
                                                    <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {assignedWorkflows.map((flow, i) => (
                                                    <tr key={i} className={adminStyles.registryRow} style={{ height: '72px' }}>
                                                        <td style={{ fontWeight: 950, color: '#0F172A' }}>{flow.name}</td>
                                                        <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>{flow.role}</td>
                                                        <td><span style={{ padding: '6px 12px', background: '#F0FDF4', color: '#16A34A', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>{flow.status}</span></td>
                                                        <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>{flow.lastRun}</td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #F3F4F6', background: '#FAFAFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer' }}>
                                                                <Search size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ background: '#FAFAFA', padding: '48px', borderRadius: '24px', textAlign: 'center', color: '#6B7280' }}>
                                        <Activity size={32} style={{ marginBottom: '16px', opacity: 0.3 }} />
                                        <div style={{ fontWeight: 950 }}>No Workflows Assigned</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {modalTab === "Billing" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                                <button className={adminStyles.primaryBtn} style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', height: '40px', padding: '0 20px', borderRadius: '12px' }}>Open Billing Portal</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                {[
                                    { label: "CURRENT PLAN", value: planName, icon: <Building2 size={16} /> },
                                    { label: "BILLING STATUS", value: hasActiveSubscription ? 'Active' : 'Inactive', icon: <Activity size={16} /> },
                                    { label: "NEXT INVOICE", value: nextInvoice, icon: <Calendar size={16} /> },
                                    { label: "TOTAL PAID", value: totalPaid, icon: <CreditCard size={16} /> }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#FAFAFA', padding: '24px', borderRadius: '24px', border: 'none' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#6B7280', marginBottom: '16px' }}>
                                            {item.icon}
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 950, color: item.value === 'Active' ? '#16A34A' : '#0F172A' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                <div style={{ background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: 'none' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', marginBottom: '8px' }}>Payment Method</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>{paymentMethod}</div>
                                </div>
                                <div style={{ background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: 'none' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', marginBottom: '8px' }}>Billing Email</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>{user.email}</div>
                                </div>
                                <div style={{ background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: 'none' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', marginBottom: '8px' }}>Monthly Price</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>{monthlyPrice}</div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '24px', textTransform: 'uppercase' }}>INVOICES</h3>
                                {invoices.length > 0 ? (
                                    <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
                                        <table className={adminStyles.registryTable} style={{ margin: 0 }}>
                                            <thead>
                                                <tr>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>INVOICE</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>DATE</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>AMOUNT</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>STATUS</th>
                                                    <th className={adminStyles.registryTH} style={{ textAlign: 'right', fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>DOWNLOAD</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoices.map((inv, i) => (
                                                    <tr key={i} className={adminStyles.registryRow} style={{ height: '72px' }}>
                                                        <td style={{ fontWeight: 950, color: '#0F172A' }}>{inv.id}</td>
                                                        <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>{inv.date}</td>
                                                        <td style={{ fontWeight: 950, color: '#0F172A' }}>{inv.amount}</td>
                                                        <td><span style={{ padding: '6px 12px', background: '#F0FDF4', color: '#16A34A', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>{inv.status}</span></td>
                                                        <td style={{ textAlign: 'right' }}>
                                                            <button style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #F3F4F6', background: '#FAFAFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer' }}>
                                                                <ArrowDownCircle size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div style={{ background: '#FAFAFA', padding: '48px', borderRadius: '24px', textAlign: 'center', color: '#6B7280' }}>
                                        <CreditCard size={32} style={{ marginBottom: '16px', opacity: 0.3 }} />
                                        <div style={{ fontWeight: 950 }}>No Invoices Yet</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {modalTab === "Audit Logs" && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.5s ease-out' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                {[
                                    { label: "TOTAL USER EVENTS", value: auditLogs.length.toString(), icon: <Activity size={16} /> },
                                    { label: "LAST LOGIN", value: user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Today', icon: <Key size={16} /> },
                                    { label: "LAST WORKFLOW ACTION", value: workflowsUsed > 0 ? "12m ago" : "Never", icon: <Zap size={16} /> },
                                    { label: "FAILED LOGIN ATTEMPTS", value: "0", icon: <ShieldAlert size={16} color="#EF4444" /> }
                                ].map((item, i) => (
                                    <div key={i} style={{ background: '#FAFAFA', padding: '24px', borderRadius: '24px', border: 'none' }}>
                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#6B7280', marginBottom: '16px' }}>
                                            {item.icon}
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</span>
                                        </div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A' }}>{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px', letterSpacing: '0.05em' }}>EVENT FILTERS</h4>
                                    {[
                                        "Login events", "Logout events", "Role changes", "Workspace changes",
                                        "Workflow starts", "Workflow pauses", "Workflow setup approvals",
                                        "Credential connections", "Support tickets created",
                                        "Admin changes made to this user", "Failed login attempts"
                                    ].map(filterLabel => (
                                        <label key={filterLabel} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                            <div style={{ width: '16px', height: '16px', background: '#0F172A', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M8.5 2.5L3.5 7.5L1.5 5.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>{filterLabel}</span>
                                        </label>
                                    ))}
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 950, margin: 0, textTransform: 'uppercase' }}>ACTION LOG</h3>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ background: '#FAFAFA', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '8px 16px', fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}>All Events</button>
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: '#FFFFFF', borderRadius: '24px', border: '1px solid #F3F4F6', overflow: 'hidden' }}>
                                        <table className={adminStyles.registryTable} style={{ margin: 0, width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>TIME</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>ACTION</th>
                                                    <th className={adminStyles.registryTH} style={{ fontSize: '0.75rem', fontWeight: 950, letterSpacing: '0.05em' }}>TARGET</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {auditLogs.map((log, i) => (
                                                    <tr key={i} className={adminStyles.registryRow} style={{ height: '72px' }}>
                                                        <td style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 800 }}>{log.time}</td>
                                                        <td style={{ fontWeight: 950, color: '#0F172A', fontSize: '0.95rem' }}>{log.action}</td>
                                                        <td style={{ fontSize: '0.85rem', color: '#0F172A' }}>{log.target}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ padding: '32px 64px', background: '#FFFFFF', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <button className={adminStyles.primaryBtn} style={{ background: '#0F172A', color: '#FFFFFF', height: '48px', padding: '0 24px', borderRadius: '12px', border: 'none' }}>
                            <UserCheck size={18} style={{ marginRight: '8px' }} /> Update Profile
                        </button>
                        <button 
                            style={{ background: 'none', border: 'none', color: '#6B7280', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            {getUserStatus(user) === 'Suspended' ? 'Reactivate User' : 'Deactivate User'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
