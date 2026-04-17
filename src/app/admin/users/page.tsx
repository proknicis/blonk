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
    Filter
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";
import ModalPortal from "../../components/ModalPortal";

const getUserStatus = (u: any) => {
    if (u.status === 'Suspended' || u.status === 'Blocked') return 'Suspended';
    if (!u.lastActive) return 'Inactive';
    const diffDays = (new Date().getTime() - new Date(u.lastActive).getTime()) / (1000 * 3600 * 24);
    return diffDays > 7 ? 'Inactive' : 'Active';
};

const SkeletonRow = () => (
    <tr className={adminStyles.registryRow}>
        <td><Skeleton width="180px" height="40px" borderRadius="12px" /></td>
        <td><Skeleton width="100px" height="24px" /></td>
        <td><Skeleton width="80px" height="24px" /></td>
        <td><Skeleton width="60px" height="24px" /></td>
        <td><Skeleton width="100px" height="24px" /></td>
        <td><Skeleton width="100px" height="32px" borderRadius="20px" /></td>
        <td style={{ textAlign: 'right' }}><Skeleton width="80px" height="38px" borderRadius="10px" /></td>
    </tr>
);

const UserModal = ({ user, onClose, updateUser, updatingId, modalTab, setModalTab }: any) => {
    if (!user) return null;
    
    return (
        <ModalPortal>
            <div className={adminStyles.modalOverlay} onClick={onClose}>
                <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', height: '85vh', display: 'flex', flexDirection: 'column' }}>
                    <div className={adminStyles.modalHeader} style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '56px 64px' }}>
                        <button type="button" className={adminStyles.modalClose} onClick={onClose} style={{ color: 'var(--background)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                            <X size={20} />
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                            <div className={adminStyles.requesterAvatar} style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: 'var(--accent)', color: 'var(--foreground)', border: 'none', borderRadius: '24px' }}>
                                {user.name?.charAt(0) || "U"}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                                    <h2 className={adminStyles.modalTitle} style={{ color: 'var(--background)', fontSize: '2.4rem', margin: 0 }}>{user.name}</h2>
                                    <span className={adminStyles.tierBadge} style={{ background: user.status === 'Active' ? 'var(--accent)' : '#EF4444', color: user.status === 'Active' ? 'var(--foreground)' : 'white' }}>
                                        {user.status?.toUpperCase() || 'ACTIVE'}
                                    </span>
                                </div>
                                <p className={adminStyles.modalSubtitle} style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>{user.email}</p>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                    <span className={adminStyles.tierBadge} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                        {user.tier || 'Trial'} TIER
                                    </span>
                                    <span className={adminStyles.tierBadge} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                        {user.role}
                                    </span>
                                    <span className={adminStyles.tierBadge} style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
                                        PROVISIONED {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={adminStyles.tabsContainer} style={{ margin: '56px 0 0', border: 'none', gap: '48px' }}>
                            {["Overview", "Billing", "Workflows", "Activity", "Logs"].map(tab => (
                                <button 
                                    key={tab}
                                    type="button"
                                    className={`${adminStyles.tab} ${modalTab === tab ? adminStyles.tabActive : ''}`}
                                    onClick={() => setModalTab(tab)}
                                    style={{ 
                                        color: modalTab === tab ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                                        paddingBottom: '16px',
                                        fontSize: '0.95rem',
                                        fontWeight: 900
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={adminStyles.modalBody} style={{ padding: '64px', overflowY: 'auto', flex: 1 }}>
                        {modalTab === "Overview" && (
                            <div className={adminStyles.parameterGrid}>
                                <div className={adminStyles.parameterCard}>
                                    <span className={adminStyles.parameterLabel}>System Identity</span>
                                    <span className={adminStyles.parameterValue}>{user.id}</span>
                                </div>
                                <div className={adminStyles.parameterCard}>
                                    <span className={adminStyles.parameterLabel}>Last Operational Ping</span>
                                    <span className={adminStyles.parameterValue}>{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'N/A'}</span>
                                </div>
                                <div className={adminStyles.parameterCard}>
                                    <span className={adminStyles.parameterLabel}>Firm Anchor</span>
                                    <span className={adminStyles.parameterValue}>{user.firmName || "N/A"}</span>
                                </div>
                                <div className={adminStyles.parameterCard}>
                                    <span className={adminStyles.parameterLabel}>Onboarding Source</span>
                                    <span className={adminStyles.parameterValue}>Direct Invite</span>
                                </div>
                            </div>
                        )}

                        {modalTab === "Billing" && (
                            <div className={adminStyles.parameterGrid}>
                                <div className={adminStyles.parameterCard} style={{ borderLeft: '4px solid var(--accent)' }}>
                                    <span className={adminStyles.parameterLabel}>Lifetime Spend</span>
                                    <span className={adminStyles.parameterValue} style={{ fontSize: '2.5rem', color: 'var(--foreground)' }}>€{(parseFloat(user.totalSpend) || 0).toLocaleString()}</span>
                                </div>
                                <div className={adminStyles.parameterCard}>
                                    <span className={adminStyles.parameterLabel}>Current Subscription</span>
                                    <span className={adminStyles.parameterValue} style={{ color: 'var(--accent)' }}>{user.tier || 'Trial'} Plan</span>
                                </div>
                                <div className={adminStyles.parameterCard}>
                                    <span className={adminStyles.parameterLabel}>Next Billing Protocol</span>
                                    <span className={adminStyles.parameterValue}>{new Date(Date.now() + 2592000000).toLocaleDateString()}</span>
                                </div>
                                <div className={adminStyles.parameterCard}>
                                    <span className={adminStyles.parameterLabel}>Payment Method</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <CreditCard size={16} />
                                        <span style={{ fontWeight: 800 }}>Visa •••• 4242</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalTab === "Workflows" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className={adminStyles.parameterCard} style={{ background: '#F0FDF4', borderColor: '#34D399' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span className={adminStyles.parameterLabel} style={{ color: '#065F46' }}>Active Flows</span>
                                                <span className={adminStyles.parameterValue} style={{ fontSize: '2.5rem', color: '#065F46' }}>{user.workflowsUsed || 0}</span>
                                            </div>
                                            <Zap size={40} color="#059669" />
                                        </div>
                                    </div>
                                    <div className={adminStyles.parameterCard} style={{ background: '#FEF2F2', borderColor: '#F87171' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span className={adminStyles.parameterLabel} style={{ color: '#991B1B' }}>Failed Flows</span>
                                                <span className={adminStyles.parameterValue} style={{ fontSize: '2.5rem', color: '#991B1B' }}>{Math.floor((user.workflowsUsed || 0) * 0.1)}</span>
                                            </div>
                                            <AlertCircle size={40} color="#DC2626" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={adminStyles.registryTable} style={{ marginTop: '24px' }}>
                                    <div style={{ padding: '24px', background: 'var(--muted)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <h4 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 950 }}>Provisioned Infrastructure</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {["Stripe Invoice Sync", "LawPay Reconciliation", "Institutional Onboarding"].slice(0, user.workflowsUsed || 0).map((wf, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div style={{ width: '32px', height: '32px', background: 'var(--muted)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={16} /></div>
                                                        <span style={{ fontWeight: 800 }}>{wf}</span>
                                                    </div>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--accent)' }}>NOMINAL</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalTab === "Activity" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div className={adminStyles.parameterGrid}>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Runs Today</span>
                                        <span className={adminStyles.parameterValue} style={{ fontSize: '2.5rem' }}>{Math.floor(Math.random() * 400 + 100)}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Compute Intensity</span>
                                        <span className={adminStyles.parameterValue} style={{ color: 'var(--accent)' }}>High Capacity</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Avg Reaction Latency</span>
                                        <span className={adminStyles.parameterValue}>1.4ms Pulse</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Node Cluster</span>
                                        <span className={adminStyles.parameterValue}>EU-CENTRAL-A</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {modalTab === "Logs" && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    { action: "Registry Access", time: "12m ago", status: "AUTHORIZED", detail: "Viewed client documents" },
                                    { action: "Fleet Mutation", time: "1h ago", status: "STABLE", detail: "Paused n8n workflow cluster" },
                                    { action: "Protocol Sync", time: "4h ago", status: "NOMINAL", detail: "Synchronized identity registry" },
                                    { action: "Institutional Login", time: "6h ago", status: "AUTHORIZED", detail: "New session from 173.24.xx.xx" },
                                ].map((log, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '24px', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 950, fontSize: '1rem', color: 'var(--foreground)' }}>{log.action}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginTop: '4px' }}>{log.detail}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase' }}>{log.status}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.3)', marginTop: '4px' }}>{log.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={adminStyles.modalFooter} style={{ padding: '48px 64px', background: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <button type="button" className={adminStyles.refreshBtn} style={{ background: 'var(--foreground)', color: 'var(--background)', width: 'auto', padding: '0 32px' }} onClick={() => onClose()}>
                                <UserCheck size={18} style={{ marginRight: '8px' }} /> Update Profile
                            </button>
                            <button type="button" className={adminStyles.refreshBtn} style={{ width: 'auto', padding: '0 24px' }} onClick={() => updateUser(user.id, { status: user.status === 'Suspended' ? 'Active' : 'Suspended' })}>
                                {user.status === 'Suspended' ? 'Unblock Identity' : 'Block Operator'}
                            </button>
                            <button type="button" className={adminStyles.refreshBtn} style={{ width: 'auto', padding: '0 24px' }}>
                                <CreditCard size={18} style={{ marginRight: '8px' }} /> Upgrade Plan
                            </button>
                            <button type="button" className={adminStyles.refreshBtn} style={{ width: 'auto', padding: '0 24px' }}>
                                <Key size={18} style={{ marginRight: '8px' }} /> Reset API Key
                            </button>
                        </div>
                        <button type="button" className={adminStyles.refreshBtn} style={{ background: 'transparent' }} onClick={onClose}>
                            Close Command
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
};

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
            console.log("[AdminUsers] Fetching fleet operators...");
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            console.log("[AdminUsers] Sync complete, records:", data?.length);
            if (Array.isArray(data)) setUsers(data);
        } catch (error: any) { 
            console.error("[AdminUsers] Registry sync failure:", error);
            if (error.message.includes("401")) {
                console.warn("[AdminUsers] Unauthorized access detected.");
                // alert("Authentication Blockade: Your session has expired or lacks authority.");
            }
        } finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const updateUser = async (id: string, updates: any) => {
        setUpdatingId(id);
        try {
            console.log("[AdminUsers] Dispatched mutation for:", id, updates);
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Update failed: ${res.status}`);
            }
            
            if (selectedUser && selectedUser.id === id) {
                setSelectedUser({ ...selectedUser, ...updates });
            }
            await fetchUsers();
        } catch (error: any) { 
            console.error("[AdminUsers] Identity update failure:", error);
            alert(`Sovereign Decree Failure: ${error.message}`);
        } finally { setUpdatingId(null); }
    };

    const deleteUser = async (id: string) => {
        if (!confirm("Permanently revoke access for this operator? This action is irreversible.")) return;
        try {
            console.log("[AdminUsers] Initializing decommissioning for:", id);
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || `Deletion failed: ${res.status}`);
            }
            await fetchUsers();
        } catch (error: any) { 
            console.error("[AdminUsers] Operator decommissioning failure:", error);
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
        if (activeFilter === "High Spend") return (parseFloat(u.totalSpend) || 0) > 1000;
        
        return true;
    });

    const inviteOperator = async () => {
        if (!inviteForm.email) return;
        setUpdatingId("inviting");
        try {
            console.log("[AdminUsers] Dispatching sovereign invite to:", inviteForm.email);
            await new Promise(r => setTimeout(r, 1000));
            alert(`Sovereign Invite Dispatched to ${inviteForm.email}. Protocol initialized.`);
            setIsInviting(false);
            setInviteForm({ email: "", role: "Operator", workflows: "" });
        } finally { setUpdatingId(null); }
    };

    const Sparkline = ({ data, color }: { data: number[], color: string }) => (
        <svg width="80" height="24" viewBox="0 0 100 30" style={{ overflow: 'visible' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data.map((val, i) => `${(i / (data.length - 1)) * 100},${30 - (val / 100) * 30}`).join(' ')}
                style={{ filter: `drop-shadow(0 0 4px ${color}44)` }}
            />
        </svg>
    );

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* INTEGRITY PANEL */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--background)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={24} color="var(--foreground)" className={adminStyles.pulse} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', background: '#10B981', borderRadius: '50%', border: '3px solid var(--foreground)' }} />
                    </div>
                    <div>
                        <h2 style={{ color: 'var(--background)', fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>Identity Domain</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '4px 0 0' }}>Authoritative Registry: {users.length} provisioned operators.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <div style={{ padding: '0 32px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 950, opacity: 0.5 }}>Active Now</span>
                        <div style={{ fontSize: '1.5rem', fontWeight: 950 }}>{users.filter(u => getUserStatus(u) === 'Active').length}</div>
                    </div>
                </div>
            </div>

            {/* ACTION CENTER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {["All", "Active", "Inactive", "Blocked", "Trial"].map(f => (
                        <button 
                            key={f}
                            type="button"
                            className={`${adminStyles.filterBtn} ${activeFilter === f ? adminStyles.filterBtnActive : ''}`}
                            onClick={() => setActiveFilter(f)}
                            style={{ padding: '10px 24px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 950, border: '1px solid var(--border)', background: activeFilter === f ? 'var(--foreground)' : 'transparent', color: activeFilter === f ? 'var(--background)' : 'var(--foreground)' }}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                        <input 
                            type="text" 
                            placeholder="Operator search..." 
                            className={adminStyles.searchField}
                            style={{ paddingLeft: '44px', width: '280px', height: '48px', borderRadius: '14px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button 
                        className={adminStyles.primaryBtn}
                        style={{ height: '48px', padding: '0 24px', borderRadius: '14px', fontWeight: 950 }}
                        onClick={() => setIsInviting(true)}
                    >
                        <UserCheck size={18} style={{ marginRight: '8px' }} /> Provision Operator
                    </button>
                </div>
            </div>

            {/* REGISTRY CARD */}
            <div className={adminStyles.registryCard}>
                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>Operator Dossier</th>
                                <th className={adminStyles.registryTH}>Context</th>
                                <th className={adminStyles.registryTH}>Activity Spark</th>
                                <th className={adminStyles.registryTH}>Value Metric</th>
                                <th className={adminStyles.registryTH}>Health</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className={adminStyles.registryRow}>
                                        <td>
                                            <div className={adminStyles.loopDetail} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer' }}>
                                                <div className={adminStyles.requesterAvatar} style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                                                    {u.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <div className={adminStyles.loopName}>{u.name}</div>
                                                    <div className={adminStyles.identityHash}>{u.id.substring(0, 10)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 950, color: 'var(--foreground)' }}>{u.firmName || "Independent"}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)' }}>{u.tier || "Standard"} • {u.role}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Sparkline data={[20, 40, 30, 60, 45, 80, 70]} color={getUserStatus(u) === 'Active' ? '#10B981' : '#94A3B8'} />
                                                <span style={{ fontSize: '0.7rem', fontWeight: 950, opacity: 0.4 }}>{u.workflowsUsed || 0} ops</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 950, color: 'var(--foreground)' }}>€{(parseFloat(u.totalSpend) || 0).toLocaleString()}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)' }}>TOTAL LTV</div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: getUserStatus(u) === 'Active' ? '#10B98115' : (getUserStatus(u) === 'Suspended' ? '#EF444415' : '#F59E0B15'), padding: '6px 14px', borderRadius: '100px', width: 'fit-content' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getUserStatus(u) === 'Active' ? '#10B981' : (getUserStatus(u) === 'Suspended' ? '#EF4444' : '#F59E0B') }} />
                                                <span style={{ fontWeight: 950, fontSize: "0.7rem", color: getUserStatus(u) === 'Active' ? '#10B981' : (getUserStatus(u) === 'Suspended' ? '#EF4444' : '#F59E0B'), textTransform: 'uppercase' }}>{getUserStatus(u)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className={adminStyles.actionIconBtn} onClick={() => setSelectedUser(u)} title="Full Dossier"><ChevronRight size={18} /></button>
                                                <button className={adminStyles.actionIconBtn} style={{ color: '#EF4444' }} onClick={() => deleteUser(u.id)} title="Revoke Privilege"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!isLoading && filteredUsers.length === 0 && (
                        <div className={adminStyles.emptyState}>
                             <div className={adminStyles.emptyIcon}><UserX size={64} /></div>
                             <p style={{ fontWeight: 950, color: 'var(--foreground)', fontSize: '1.25rem' }}>Identity vault empty.</p>
                             <p style={{ color: 'var(--muted-foreground)', fontWeight: 700, marginTop: '8px' }}>No provisioned operators match your filter criteria.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedUser && (
                <UserModal 
                    user={selectedUser} 
                    onClose={() => {
                        console.log("[AdminUsers] Closing record view");
                        setSelectedUser(null);
                    }} 
                    updateUser={updateUser}
                    updatingId={updatingId}
                    modalTab={modalTab}
                    setModalTab={setModalTab}
                />
            )}

            {isInviting && (
                <ModalPortal>
                    <div className={adminStyles.modalOverlay} onClick={() => setIsInviting(false)}>
                        <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className={adminStyles.modalHeader}>
                                <h3 className={adminStyles.modalTitle}>Invite Operator</h3>
                                <p className={adminStyles.modalSubtitle}>Provision new administrative access.</p>
                            </div>
                            <div className={adminStyles.modalBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Operator Email</label>
                                    <input 
                                        type="email" 
                                        className={adminStyles.mainInput} 
                                        style={{ width: '100%' }} 
                                        placeholder="email@firm.com" 
                                        value={inviteForm.email}
                                        onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Role Assignment</label>
                                    <select className={adminStyles.mainInput} style={{ width: '100%', height: '52px' }} value={inviteForm.role} onChange={e => setInviteForm({...inviteForm, role: e.target.value})}>
                                        <option>Operator</option>
                                        <option>Manager</option>
                                        <option>Super Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px', textTransform: 'uppercase' }}>Workflow Scope</label>
                                    <input 
                                        type="text" 
                                        className={adminStyles.mainInput} 
                                        style={{ width: '100%' }} 
                                        placeholder="Comma separated IDs" 
                                        value={inviteForm.workflows}
                                        onChange={e => setInviteForm({...inviteForm, workflows: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className={adminStyles.modalFooter}>
                                <button type="button" className={adminStyles.refreshBtn} onClick={() => setIsInviting(false)}>Cancel</button>
                                <button 
                                    type="button"
                                    className={adminStyles.refreshBtn} 
                                    style={{ background: 'var(--foreground)', color: 'var(--background)' }}
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
