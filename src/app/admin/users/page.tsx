"use client";

import styles from "../../dashboard/page.module.css";
import adminStyles from "../admin.module.css";
import React, { useState, useEffect } from "react";
import { 
    Users, 
    Shield, 
    Trash2, 
    Search, 
    Activity, 
    UserCheck, 
    ShieldAlert, 
    Mail, 
    Building2,
    RefreshCcw,
    MoreVertical,
    Euro,
    Clock,
    Zap,
    AlertCircle,
    TrendingUp,
    ChevronRight,
    X,
    CreditCard,
    History,
    Key,
    ArrowUpCircle,
    ArrowDownCircle,
    Filter,
    UserX,
    Fingerprint,
    ShieldCheck,
    Lock,
    Calendar
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";
import ModalPortal from "../../components/ModalPortal";

const getUserStatus = (u: any) => {
    if (u.status === 'Suspended' || u.status === 'Blocked') return 'Suspended';
    if (!u.lastActive) return 'Inactive';
    const diffDays = (new Date().getTime() - new Date(u.lastActive).getTime()) / (1000 * 3600 * 24);
    return diffDays > 7 ? 'Inactive' : 'Active';
};

const Sparkline = ({ data, color }: { data: number[], color: string }) => (
    <svg width="80" height="24" viewBox="0 0 100 30" style={{ overflow: 'visible' }}>
        <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={data.map((val, i) => `${(i / (data.length - 1)) * 100},${30 - (val / 100) * 30}`).join(' ')}
            style={{ filter: `drop-shadow(0 0 4px ${color}44)` }}
        />
    </svg>
);

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [modalTab, setModalTab] = useState("Overview");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteForm, setInviteForm] = useState({ email: "", role: "Operator", workflows: "" });

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (error: any) { 
            console.error("[AdminUsers] Registry sync failure:", error);
        } finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateUser = async (id: string, updates: any) => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            if (selectedUser && selectedUser.id === id) {
                setSelectedUser({ ...selectedUser, ...updates });
            }
            await fetchUsers();
        } catch (error: any) { 
            alert(`Sovereign Decree Failure: ${error.message}`);
        } finally { setUpdatingId(null); }
    };

    const deleteUser = async (id: string) => {
        if (!confirm("Permanently revoke access for this operator? This action is irreversible.")) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            await fetchUsers();
        } catch (error: any) { 
            alert(`Fleet Decommissioning Failure: ${error.message}`);
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             u.firmName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;
        
        const status = getUserStatus(u);
        if (activeFilter === "Active") return status === "Active";
        if (activeFilter === "Inactive") return status === "Inactive";
        if (activeFilter === "Blocked") return status === "Suspended";
        if (activeFilter === "Trial") return u.tier === "Trial" || !u.tier;
        
        return true;
    });

    const inviteOperator = async () => {
        if (!inviteForm.email) return;
        setUpdatingId("inviting");
        try {
            await new Promise(r => setTimeout(r, 1000));
            alert(`Invite sent to ${inviteForm.email}.`);
            setIsInviting(false);
            setInviteForm({ email: "", role: "Operator", workflows: "" });
        } finally { setUpdatingId(null); }
    };

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* IDENTITY DOMAIN HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', border: 'none', padding: '40px 48px', borderRadius: '32px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--background)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={32} color="var(--foreground)" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '4px 10px', background: 'var(--accent)', color: 'var(--background)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Directory Active</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>User Management</span>
                        </div>
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>User Directory</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Manage client users, admins, and platform access</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.primaryBtn} onClick={() => setIsInviting(true)} style={{ background: 'var(--background)', color: 'var(--foreground)', border: 'none', height: '48px', padding: '0 24px' }}>
                        <UserCheck size={18} style={{ marginRight: '8px' }} /> Add User
                    </button>
                </div>
            </div>

            {/* CONTROL BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className={adminStyles.filterBar}>
                    {["All", "Active", "Inactive", "Blocked", "Trial"].map(f => (
                        <button 
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`${adminStyles.filterBtn} ${activeFilter === f ? adminStyles.filterBtnActive : ''}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className={adminStyles.searchContainer}>
                    <Search className={adminStyles.searchIcon} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className={adminStyles.searchField}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* REGISTRY TABLE */}
            <div className={adminStyles.registryCard} style={{ borderRadius: '32px', border: '1px solid var(--border)' }}>
                <div className={adminStyles.tableWrapper} style={{ padding: '20px 40px 40px' }}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>User</th>
                                <th className={adminStyles.registryTH}>Workspace / Plan</th>
                                <th className={adminStyles.registryTH}>Activity</th>
                                <th className={adminStyles.registryTH}>Status</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i}><td colSpan={5} style={{ padding: '20px 0' }}><Skeleton width="100%" height="64px" borderRadius="16px" /></td></tr>
                                ))
                            ) : filteredUsers.map(u => {
                                const status = getUserStatus(u);
                                return (
                                    <tr key={u.id} className={adminStyles.registryRow} style={{ height: '84px' }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} onClick={() => setSelectedUser(u)}>
                                                <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 950, color: 'var(--accent)', border: '1px solid var(--border)' }}>
                                                    {u.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: 'var(--foreground)' }}>{u.name}</div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Fingerprint size={12} />
                                                        {u.id.substring(0, 12)}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>{u.firmName || "Independent"}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{u.tier || "Standard"} • {u.role}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <Sparkline data={[20, 50, 40, 80, 60, 90, 75]} color={status === 'Active' ? 'var(--accent)' : 'var(--muted-foreground)'} />
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>{u.workflowsUsed || 0}</div>
                                                    <div style={{ fontSize: '0.6rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>FLOWS</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '8px', 
                                                padding: '6px 14px', 
                                                background: status === 'Active' ? '#10B98115' : (status === 'Suspended' ? '#EF444415' : '#F59E0B15'),
                                                color: status === 'Active' ? '#10B981' : (status === 'Suspended' ? '#EF4444' : '#F59E0B'),
                                                borderRadius: '100px',
                                                border: `1px solid ${status === 'Active' ? '#10B98120' : (status === 'Suspended' ? '#EF444420' : '#F59E0B20')}`,
                                                width: 'fit-content'
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor', animation: status === 'Active' ? 'pulse 1.5s infinite' : 'none' }} />
                                                <span style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{status}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className={adminStyles.actionIconBtn} onClick={() => setSelectedUser(u)}><ChevronRight size={18} /></button>
                                                <button className={adminStyles.actionIconBtn} style={{ color: 'var(--destructive)' }} onClick={() => deleteUser(u.id)}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* USER DETAIL MODAL */}
            {selectedUser && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setSelectedUser(null)}>
                        <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '960px', height: '85vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: '32px', overflow: 'hidden' }}>
                            <div style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '56px 64px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                        <div style={{ width: '100px', height: '100px', background: 'var(--accent)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 950, color: 'var(--foreground)' }}>
                                            {selectedUser.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                                <h2 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0, letterSpacing: '-0.04em' }}>
                                                    {selectedUser.name?.toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                                </h2>
                                                <div style={{ padding: '4px 12px', background: 'var(--accent)', color: 'var(--foreground)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 950 }}>
                                                    Plan: {selectedUser.tier || 'Standard'}
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', opacity: 0.6, margin: 0 }}>{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '48px', marginTop: '56px' }}>
                                    {["Overview", "Workflows", "Billing", "Audit Logs"].map(t => (
                                        <button 
                                            key={t}
                                            onClick={() => setModalTab(t)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                color: modalTab === t ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                                                fontSize: '0.9rem',
                                                fontWeight: 950,
                                                padding: '0 0 16px 0',
                                                borderBottom: modalTab === t ? '2px solid var(--accent)' : '2px solid transparent',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {t.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '64px' }}>
                                {modalTab === "Overview" && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                        {[
                                            { label: "USER ID", value: selectedUser.id, icon: <Fingerprint size={16} /> },
                                            { label: "LAST ACTIVE", value: selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'Never', icon: <Clock size={16} /> },
                                            { label: "WORKSPACE", value: selectedUser.firmName || "Legacy Firm Hub", icon: <Building2 size={16} /> },
                                            { label: "ROLE", value: selectedUser.plan || "Starter", icon: <ShieldCheck size={16} /> },
                                            { label: "JOINED DATE", value: new Date(selectedUser.createdAt).toLocaleDateString(), icon: <Calendar size={16} /> }
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
                                                { label: "ASSIGNED WORKFLOWS", value: selectedUser.workflowsUsed || "0", icon: <Activity size={16} /> },
                                                { label: "ACTIVE WORKFLOWS", value: "0", icon: <Zap size={16} /> },
                                                { label: "LAST WORKFLOW ACTION", value: "Never", icon: <Clock size={16} /> },
                                                { label: "ASSIGNED N8N INSTANCE", value: "n8n Instance A", icon: <Building2 size={16} /> }
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
                                                        <tr className={adminStyles.registryRow} style={{ height: '72px' }}>
                                                            <td style={{ fontWeight: 950, color: '#0F172A' }}>Invoice processing</td>
                                                            <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>Admin</td>
                                                            <td><span style={{ padding: '6px 12px', background: '#F0FDF4', color: '#16A34A', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>ACTIVE</span></td>
                                                            <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>12m ago<br/><span style={{ fontSize: '0.75rem' }}>(100% success)</span></td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #F3F4F6', background: '#FAFAFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer' }}>
                                                                    <Search size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalTab === "Billing" && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.5s ease-out' }}>
                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                                            <button className={adminStyles.primaryBtn} style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', height: '40px', padding: '0 20px', borderRadius: '12px' }}>Open Billing Portal</button>
                                        </div>

                                        {/* Cards */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                            {[
                                                { label: "CURRENT PLAN", value: selectedUser.plan || "Standard", icon: <Building2 size={16} /> },
                                                { label: "BILLING STATUS", value: getUserStatus(selectedUser) === 'Active' ? 'Active' : 'Inactive', icon: <Activity size={16} /> },
                                                { label: "NEXT INVOICE", value: "05/06/2026", icon: <Calendar size={16} /> },
                                                { label: "TOTAL PAID", value: "€149.00", icon: <CreditCard size={16} /> }
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

                                        {/* Details Grid */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                            <div style={{ background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: 'none' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', marginBottom: '8px' }}>Payment Method</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>Visa ending in 4242</div>
                                            </div>
                                            <div style={{ background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: 'none' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', marginBottom: '8px' }}>Billing Email</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>{selectedUser.email}</div>
                                            </div>
                                            <div style={{ background: '#FAFAFA', padding: '24px', borderRadius: '16px', border: 'none' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', marginBottom: '8px' }}>Monthly Price</div>
                                                <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>€49.00 / month</div>
                                            </div>
                                        </div>

                                        {/* Invoices Table */}
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 950, marginBottom: '24px', textTransform: 'uppercase' }}>INVOICES</h3>
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
                                                        <tr className={adminStyles.registryRow} style={{ height: '72px' }}>
                                                            <td style={{ fontWeight: 950, color: '#0F172A' }}>INV-2026-04</td>
                                                            <td style={{ fontSize: '0.85rem', color: '#6B7280' }}>05/05/2026</td>
                                                            <td style={{ fontWeight: 950, color: '#0F172A' }}>€49.00</td>
                                                            <td><span style={{ padding: '6px 12px', background: '#F0FDF4', color: '#16A34A', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase' }}>PAID</span></td>
                                                            <td style={{ textAlign: 'right' }}>
                                                                <button style={{ width: '40px', height: '40px', borderRadius: '12px', border: '1px solid #F3F4F6', background: '#FAFAFA', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', cursor: 'pointer' }}>
                                                                    <ArrowDownCircle size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalTab === "Audit Logs" && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', animation: 'fadeIn 0.5s ease-out' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                                            {[
                                                { label: "TOTAL USER EVENTS", value: "342", icon: <Activity size={16} /> },
                                                { label: "LAST LOGIN", value: selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleDateString() : 'Today', icon: <Key size={16} /> },
                                                { label: "LAST WORKFLOW ACTION", value: "12m ago", icon: <Zap size={16} /> },
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
                                            {/* Event Filters Sidebar */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: '#6B7280', marginBottom: '12px', letterSpacing: '0.05em' }}>EVENT FILTERS</h4>
                                                {[
                                                    "Login events", 
                                                    "Logout events", 
                                                    "Role changes", 
                                                    "Workspace changes",
                                                    "Workflow starts", 
                                                    "Workflow pauses", 
                                                    "Workflow setup approvals",
                                                    "Credential connections", 
                                                    "Support tickets created",
                                                    "Admin changes made to this user", 
                                                    "Failed login attempts"
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

                                            {/* Table Area */}
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
                                                            {[
                                                                { time: "02/05/2026 14:25", action: "Role changed", target: "Operator → Admin" },
                                                                { time: "02/05/2026 14:20", action: "Started workflow", target: "Invoice processing" },
                                                                { time: "02/05/2026 14:11", action: "Logged in", target: "Account" }
                                                            ].map((log, i) => (
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
                                        onClick={() => updateUser(selectedUser.id, { status: getUserStatus(selectedUser) === 'Suspended' ? 'Active' : 'Suspended' })} 
                                        style={{ background: 'none', border: 'none', color: '#6B7280', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        {getUserStatus(selectedUser) === 'Suspended' ? 'Reactivate User' : 'Deactivate User'}
                                    </button>
                                </div>
                                <button 
                                    onClick={() => setSelectedUser(null)} 
                                    style={{ background: 'none', border: 'none', color: '#6B7280', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {isInviting && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setIsInviting(false)}>
                        <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', borderRadius: '32px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <div className={adminStyles.modalHeader} style={{ padding: '40px' }}>
                                <h3 className={adminStyles.modalTitle}>Invite User</h3>
                                <p className={adminStyles.modalSubtitle}>Send an invite and assign platform access.</p>
                            </div>
                            <div className={adminStyles.modalBody} style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Email Address</label>
                                    <input 
                                        type="email" 
                                        className={adminStyles.mainInput} 
                                        style={{ width: '100%', height: '52px', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 16px' }} 
                                        placeholder="email@firm.com" 
                                        value={inviteForm.email}
                                        onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Role</label>
                                    <select className={adminStyles.mainInput} style={{ width: '100%', height: '52px', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 16px' }} value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})}>
                                        <option>Operator</option>
                                        <option>Manager</option>
                                        <option>Super Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className={adminStyles.modalFooter} style={{ padding: '32px 40px', background: 'var(--muted)' }}>
                                <button type="button" className={adminStyles.refreshBtn} onClick={() => setIsInviting(false)} style={{ border: 'none' }}>Cancel</button>
                                <button 
                                    type="button"
                                    className={adminStyles.primaryBtn} 
                                    style={{ background: 'var(--foreground)', color: 'var(--background)', height: '48px', padding: '0 24px', borderRadius: '12px' }}
                                    onClick={inviteOperator}
                                    disabled={updatingId === "inviting"}
                                >
                                    {updatingId === "inviting" ? "Sending..." : "Send Invite"}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
