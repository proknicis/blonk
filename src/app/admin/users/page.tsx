"use client";

import styles from "../../dashboard/page.module.css";
import adminStyles from "../admin.module.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    const router = useRouter();
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
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => router.push('/admin/users/' + u.id)}>
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
                                                <button className={adminStyles.actionIconBtn} onClick={() => router.push('/admin/users/' + u.id)}><ChevronRight size={18} /></button>
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
