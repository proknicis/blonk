"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Users, Plus, Search, Trash2, Edit3, Shield, Mail, Lock, Check, X, 
    ArrowUp, Download, Eye, ExternalLink, RefreshCcw, Send, AlertTriangle,
    Activity, EyeOff, Euro, Clock, Zap, History, Key, ArrowUpCircle, 
    ArrowDownCircle, ShieldAlert, Building2, ChevronRight, TrendingUp, AlertCircle
} from "lucide-react";
import adminStyles from "../admin.module.css";
import styles from "../../dashboard/page.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "../../components/Skeleton";

interface DbUser {
    id: string;
    name: string;
    email: string;
    firmName: string | null;
    role: string;
    tier: string | null;
    totalSpend: string | null;
    lastActive: string | null;
    status: string;
    workflowsUsed: any;
    createdAt: string;
}

export default function UserDirectoryPage() {
    const router = useRouter();
    const [users, setUsers] = useState<DbUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedUser, setSelectedUser] = useState<DbUser | null>(null);
    const [userActivity, setUserActivity] = useState<any[]>([]);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [editingUser, setEditingUser] = useState<DbUser | null>(null);
    const [editForm, setEditForm] = useState({ role: "", tier: "", status: "", totalSpend: "" });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            }
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    const updateUser = async (id: string, updates: any) => {
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, ...updates })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
                if (selectedUser?.id === id) setSelectedUser({ ...selectedUser, ...updates });
                setEditingUser(null);
                (window as any).showToast("Identity policy updated.", "success");
            }
        } catch (err) { console.error(err); }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to revoke credentials for ${name}?`)) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
                setSelectedUser(null);
                (window as any).showToast("User access revoked.", "success");
            }
        } catch (err) { console.error(err); }
    };

    const getUserStatus = (u: DbUser) => {
        if (u.status === 'SUSPENDED' || u.status === 'Suspended') return 'Suspended';
        const lastActive = new Date(u.lastActive || u.createdAt);
        const diffDays = (new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 30) return 'Churned';
        if (diffDays > 7) return 'Inactive';
        return 'Active';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return '#34D186';
            case 'Inactive': return '#F59E0B';
            case 'Churned': return '#EF4444';
            case 'Suspended': return '#64748B';
            default: return '#E2E8F0';
        }
    };

    const stats = {
        total: users.length,
        paying: users.filter(u => u.tier !== 'Free' && u.tier !== null).length,
        revenue: users.reduce((acc, u) => acc + (parseFloat(u.totalSpend || "0")), 0),
        churnRisk: users.filter(u => getUserStatus(u) === 'Churned').length
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeFilter === "All") return matchesSearch;
        if (activeFilter === "Active") return matchesSearch && getUserStatus(u) === "Active";
        if (activeFilter === "Inactive") return matchesSearch && (getUserStatus(u) === "Inactive" || getUserStatus(u) === "Churned");
        if (activeFilter === "Paying") return matchesSearch && (u.tier !== "Free" && u.tier !== null);
        return matchesSearch;
    });

    const SkeletonRow = () => (
        <tr className={adminStyles.registryRow}>
            <td colSpan={5}><Skeleton width="100%" height="60px" borderRadius="16px" /></td>
        </tr>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}><span className={adminStyles.metricTag}>TOTAL USERS</span><Users size={14} /></div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.total}</div>
                    <div className={adminStyles.metricDetail}>Provisioned operator identities</div>
                </div>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}><span className={adminStyles.metricTag}>PAYING CLIENTS</span><TrendingUp size={14} color="#34D186" /></div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.paying}</div>
                    <div className={adminStyles.metricDetail}>Premium tier subscribers</div>
                </div>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}><span className={adminStyles.metricTag}>TOTAL SPEND</span><Euro size={14} color="#34D186"/></div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : `€${stats.revenue.toLocaleString()}`}</div>
                    <div className={adminStyles.metricDetail}>Aggregated user revenue</div>
                </div>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}><span className={adminStyles.metricTag}>CHURN RISK</span><AlertCircle size={14} color="#EF4444" /></div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.churnRisk}</div>
                    <div className={adminStyles.metricDetail}>Inactive for 30+ days</div>
                </div>
            </div>

            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>User Management System</h3>
                        <p className={adminStyles.registrySubtitle}>Identity control, monetization visibility, and institutional anchoring.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', background: '#F8F9FA', padding: '4px', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
                            {["All", "Active", "Paying", "Inactive"].map(f => (
                                <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 800, border: 'none', background: activeFilter === f ? '#FFFFFF' : 'transparent', color: activeFilter === f ? '#0A0A0A' : '#64748B', boxShadow: activeFilter === f ? '0 2px 8px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer' }}>{f}</button>
                            ))}
                        </div>
                        <div className={styles.searchWrapper} style={{ width: '300px', margin: 0 }}>
                            <Search className={styles.searchIcon} size={18} />
                            <input type="text" placeholder="Search system records..." className={styles.searchInput} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ height: '44px' }} />
                        </div>
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>Operator Identity</th>
                                <th className={adminStyles.registryTH}>Tier & Spend</th>
                                <th className={adminStyles.registryTH}>Workflows</th>
                                <th className={adminStyles.registryTH}>Status & Activity</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? <><SkeletonRow /><SkeletonRow /><SkeletonRow /></> : filteredUsers.map(u => (
                                <tr key={u.id} className={adminStyles.registryRow} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div className={adminStyles.loopDetail}>
                                            <div className={adminStyles.requesterAvatar}>{u.name?.charAt(0)}</div>
                                            <div><div className={adminStyles.loopName}>{u.name}</div><div className={adminStyles.requesterEmail}>{u.email}</div></div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 950, padding: '2px 8px', borderRadius: '6px', background: u.tier === 'Enterprise' ? '#0A0A0A' : '#F8F9FA', color: u.tier === 'Enterprise' ? '#FFFFFF' : '#64748B', width: 'fit-content' }}>{u.tier?.toUpperCase() || 'FREE'}</span>
                                            <div style={{ fontWeight: 950, color: '#0A0A0A' }}>€{parseFloat(u.totalSpend || "0").toLocaleString()}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {Array.isArray(u.workflowsUsed) && u.workflowsUsed.length > 0 ? u.workflowsUsed.slice(0,3).map((w:any, i:number) => <div key={i} style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F8F9FA', border: '1px solid #EEE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>{w.icon || '⚡'}</div>) : <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>No activations</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div className={adminStyles.statusBadge} style={{ background: `${getStatusColor(getUserStatus(u))}15`, color: getStatusColor(getUserStatus(u)) }}>
                                                <div className={adminStyles.statusPulse} style={{ background: getStatusColor(getUserStatus(u)) }} />
                                                <span>{getUserStatus(u)}</span>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>{new Date(u.lastActive || u.createdAt).toLocaleDateString()}</div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button className={adminStyles.iconBtn} onClick={() => setSelectedUser(u)}><ChevronRight size={18} /></button>
                                            <button className={adminStyles.actionBtnDelete} onClick={() => deleteUser(u.id, u.name)}><ShieldAlert size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setSelectedUser(null)}>
                        <div className={adminStyles.modal} style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                            <div className={adminStyles.modalHeader}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '60px', height: '60px', background: '#FFF', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 950, color: '#0A0A0A' }}>{selectedUser.name.charAt(0)}</div>
                                        <div>
                                            <h3 className={adminStyles.modalTitle}>{selectedUser.name}</h3>
                                            <p className={adminStyles.modalSubtitle}>{selectedUser.email} • {selectedUser.tier || 'Free'}</p>
                                        </div>
                                    </div>
                                    <button className={adminStyles.modalClose} onClick={() => setSelectedUser(null)}><X size={20} /></button>
                                </div>
                            </div>
                            <div className={adminStyles.modalBody} style={{ background: '#F8F9FA', padding: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ background: '#FFF', padding: '24px', borderRadius: '24px', border: '1px solid #EEE' }}>
                                            <h4 style={{ fontSize: '0.75rem', fontWeight: 950, marginBottom: '16px' }}>QUICK ACTIONS</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <button className={adminStyles.actionBtnPrimary} style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => updateUser(selectedUser.id, { tier: selectedUser.tier === 'Paid' ? 'Free' : 'Paid' })}>{selectedUser.tier === 'Paid' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />} {selectedUser.tier === 'Paid' ? 'Downgrade' : 'Upgrade Plan'}</button>
                                                <button className={adminStyles.actionBtnDelete} style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => updateUser(selectedUser.id, { status: selectedUser.status === 'Suspended' ? 'Active' : 'Suspended' })}><ShieldAlert size={16} /> {selectedUser.status === 'Suspended' ? 'Reactivate' : 'Suspend'}</button>
                                            </div>
                                        </div>
                                        <div style={{ background: '#0A0A0A', padding: '24px', borderRadius: '24px', color: '#FFF' }}>
                                            <div style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 950 }}>LIFETIME VALUE</div>
                                            <div style={{ fontSize: '2rem', fontWeight: 950 }}>€{parseFloat(selectedUser.totalSpend || "0").toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div style={{ background: '#FFF', padding: '24px', borderRadius: '24px', border: '1px solid #EEE' }}>
                                        <h4 style={{ fontSize: '0.75rem', fontWeight: 950, marginBottom: '16px' }}>ACTIVE WORKFLOWS</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {Array.isArray(selectedUser.workflowsUsed) && selectedUser.workflowsUsed.length > 0 ? selectedUser.workflowsUsed.map((w:any, i:number) => (
                                                <div key={i} style={{ padding: '12px', background: '#F8F9FA', borderRadius: '12px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>{w.icon} {w.name}</span>
                                                    <span style={{ color: '#34D186', fontWeight: 950, fontSize: '0.7rem' }}>ACTIVE</span>
                                                </div>
                                            )) : <p style={{ color: '#94A3B8', textAlign: 'center', padding: '20px' }}>No workflows found.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
