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
            alert(`Sovereign Invite Dispatched to ${inviteForm.email}. Protocol initialized.`);
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
                            <div style={{ padding: '4px 10px', background: 'var(--accent)', color: 'var(--background)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>REGISTRY ACTIVE</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>IDENTITY DOMAIN</span>
                        </div>
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Sovereign User Registry</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Authoritative audit of {users.length} provisioned institutional operators.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.primaryBtn} onClick={() => setIsInviting(true)} style={{ background: 'var(--background)', color: 'var(--foreground)', border: 'none', height: '48px', padding: '0 24px' }}>
                        <UserCheck size={18} style={{ marginRight: '8px' }} /> Provision Operator
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
                        placeholder="Search identity vault..." 
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
                                <th className={adminStyles.registryTH}>OPERATOR IDENTITY</th>
                                <th className={adminStyles.registryTH}>INSTITUTIONAL CONTEXT</th>
                                <th className={adminStyles.registryTH}>ACTIVITY PULSE</th>
                                <th className={adminStyles.registryTH}>SLA HEALTH</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>COMMANDS</th>
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
                                                <h2 style={{ fontSize: '2.5rem', fontWeight: 950, margin: 0, letterSpacing: '-0.04em' }}>{selectedUser.name}</h2>
                                                <div style={{ padding: '4px 12px', background: 'var(--accent)', color: 'var(--foreground)', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 950 }}>{selectedUser.tier || 'STANDARD'}</div>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', opacity: 0.6, margin: 0 }}>{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <X size={20} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '48px', marginTop: '56px' }}>
                                    {["Overview", "Infrastructure", "Billing", "Audit"].map(t => (
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
                                            { label: "System Identity", value: selectedUser.id, icon: <Fingerprint size={18} /> },
                                            { label: "Last Active", value: selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'Never', icon: <Clock size={18} /> },
                                            { label: "Institution", value: selectedUser.firmName || "Independent", icon: <Building2 size={18} /> },
                                            { label: "Role Assignment", value: selectedUser.role, icon: <ShieldCheck size={18} /> },
                                            { label: "Onboarding Date", value: new Date(selectedUser.createdAt).toLocaleDateString(), icon: <Calendar size={18} /> }
                                        ].map((item, i) => (
                                            <div key={i} style={{ background: 'var(--muted)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: 'var(--muted-foreground)', marginBottom: '16px' }}>
                                                    {item.icon}
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 950 }}>{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {modalTab === "Infrastructure" && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div style={{ background: '#F0FDF4', padding: '40px', borderRadius: '32px', border: '1px solid #BBF7D0' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 950, color: '#166534', textTransform: 'uppercase', marginBottom: '16px' }}>Deployed Protocols</div>
                                                <div style={{ fontSize: '3rem', fontWeight: 950, color: '#166534' }}>{selectedUser.workflowsUsed || 0}</div>
                                            </div>
                                            <div style={{ background: 'var(--muted)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '16px' }}>Compute Allocation</div>
                                                <div style={{ fontSize: '2rem', fontWeight: 950 }}>Institutional Cluster A</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '48px 64px', background: 'var(--muted)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button className={adminStyles.primaryBtn} style={{ background: 'var(--foreground)', color: 'var(--background)', height: '48px', padding: '0 24px' }}>
                                        <UserCheck size={18} style={{ marginRight: '8px' }} /> Update Profile
                                    </button>
                                    <button className={adminStyles.refreshBtn} onClick={() => updateUser(selectedUser.id, { status: getUserStatus(selectedUser) === 'Suspended' ? 'Active' : 'Suspended' })} style={{ height: '48px', padding: '0 24px' }}>
                                        {getUserStatus(selectedUser) === 'Suspended' ? 'Reactivate Identity' : 'Deactivate Operator'}
                                    </button>
                                </div>
                                <button className={adminStyles.refreshBtn} onClick={() => setSelectedUser(null)} style={{ border: 'none' }}>Close Dossier</button>
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
                                <h3 className={adminStyles.modalTitle}>Invite Operator</h3>
                                <p className={adminStyles.modalSubtitle}>Provision new administrative access.</p>
                            </div>
                            <div className={adminStyles.modalBody} style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Operator Email</label>
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
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Role Assignment</label>
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
                                    style={{ background: 'var(--foreground)', color: 'var(--background)', height: '48px', padding: '0 24px' }}
                                    onClick={inviteOperator}
                                    disabled={updatingId === "inviting"}
                                >
                                    {updatingId === "inviting" ? "Dispatching..." : "Send Sovereign Invite"}
                                </button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
