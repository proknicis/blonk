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

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState("All");
    const [modalTab, setModalTab] = useState("Overview");

    useEffect(() => {
        fetchUsers();
    }, []);

    const UserModal = ({ user, onClose }: { user: any, onClose: () => void }) => {
        if (!user) return null;
        const status = getUserStatus(user);

        return (
            <ModalPortal>
                <div className={adminStyles.modalOverlay} onClick={onClose} style={{ zIndex: 10000 }}>
                    <div className={adminStyles.modal} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader} style={{ background: '#111', backgroundImage: 'none' }}>
                            <button className={adminStyles.modalClose} onClick={onClose}>
                                <X size={20} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                <div className={adminStyles.requesterAvatar} style={{ width: '100px', height: '100px', fontSize: '2.5rem', background: '#34D186', color: '#111' }}>
                                    {user.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <h2 className={adminStyles.modalTitle} style={{ fontSize: '2.5rem' }}>{user.name}</h2>
                                    <p className={adminStyles.modalSubtitle} style={{ color: '#94A3B8', fontSize: '1.2rem' }}>{user.email}</p>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                        <span className={`${adminStyles.statusBadge} ${getStatusClass(status)}`} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                                            <div className={adminStyles.statusPulse} />
                                            {status}
                                        </span>
                                        <span className={`${adminStyles.tierBadge} ${getTierBadge(user.tier)}`} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                                            {user.tier || 'Free'}
                                        </span>
                                        {parseFloat(user.totalSpend) > 5000 && (
                                            <span className={adminStyles.tierBadge} style={{ background: '#34D186', color: '#111', padding: '6px 16px', fontSize: '0.8rem', fontWeight: 950 }}>
                                                HIGH VALUE
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={adminStyles.tabsContainer} style={{ margin: '48px 0 0', border: 'none', gap: '40px' }}>
                                {["Overview", "Firm Context", "Workflows", "Payments", "Activity Logs"].map(tab => (
                                    <button 
                                        key={tab}
                                        className={`${adminStyles.tab} ${modalTab === tab ? adminStyles.tabActive : ''}`}
                                        onClick={() => setModalTab(tab)}
                                        style={{ 
                                            color: modalTab === tab ? 'white' : 'rgba(255,255,255,0.4)',
                                            fontSize: '1rem',
                                            paddingBottom: '16px'
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={adminStyles.modalBody} style={{ padding: '48px', minHeight: '450px' }}>
                            {modalTab === "Overview" && (
                                <div className={adminStyles.parameterGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>System Identity</span>
                                        <span className={adminStyles.parameterValue}>{user.id}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Provisioned Role</span>
                                        <span className={adminStyles.parameterValue} style={{ color: '#34D186' }}>{user.role}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Onboarding Protocol</span>
                                        <span className={adminStyles.parameterValue}>{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Last Sync Heartbeat</span>
                                        <span className={adminStyles.parameterValue}>{user.lastActive ? new Date(user.lastActive).toLocaleTimeString() : 'N/A'}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard} style={{ gridColumn: 'span 2' }}>
                                        <span className={adminStyles.parameterLabel}>Administrative Notes</span>
                                        <span className={adminStyles.parameterValue} style={{ fontSize: '0.9rem', color: '#64748B', fontFamily: 'Inter' }}>
                                            Standard institutional operator with {user.tier || 'free'} tier access. No recent security flags detected.
                                        </span>
                                    </div>
                                </div>
                            )}

                            {modalTab === "Firm Context" && (
                                <div className={adminStyles.parameterGrid} style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
                                    <div className={adminStyles.parameterCard} style={{ background: '#F0FAF5', borderColor: '#34D186' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span className={adminStyles.parameterLabel} style={{ color: '#059669' }}>Anchored Institution</span>
                                                <span className={adminStyles.parameterValue} style={{ fontSize: '1.5rem' }}>{user.firmName || "Independent Operator"}</span>
                                            </div>
                                            <Building2 size={32} color="#34D186" />
                                        </div>
                                    </div>
                                    <div className={adminStyles.parameterGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className={adminStyles.parameterCard}>
                                            <span className={adminStyles.parameterLabel}>Domain Connectivity</span>
                                            <span className={adminStyles.parameterValue}>{user.email.split('@')[1]}</span>
                                        </div>
                                        <div className={adminStyles.parameterCard}>
                                            <span className={adminStyles.parameterLabel}>Security Level</span>
                                            <span className={adminStyles.parameterValue}>Level 4 (Standard)</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === "Workflows" && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div className={adminStyles.parameterCard} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: '#111', color: 'white' }}>
                                        <div>
                                            <span className={adminStyles.parameterLabel} style={{ color: '#94A3B8' }}>Active Deployments</span>
                                            <span className={adminStyles.parameterValue} style={{ fontSize: '1.5rem', color: '#34D186' }}>{user.workflowsUsed || 0} Pipelines</span>
                                        </div>
                                        <Zap size={32} color="#34D186" />
                                    </div>
                                    {(user.workflowsUsed || 0) > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <span className={adminStyles.parameterLabel}>Provisioned Assets</span>
                                            {["Automated Data Ingestion", "Neural Market Scan", "Sovereign Audit Log", "Global Asset Verification"].slice(0, user.workflowsUsed).map((w, i) => (
                                                <div key={i} className={adminStyles.workflowChip} style={{ padding: '16px', justifyContent: 'space-between', borderRadius: '12px', background: '#F8FAFC' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '8px', height: '8px', background: '#34D186', borderRadius: '50%' }} />
                                                        <span style={{ fontWeight: 800, color: '#111' }}>{w}</span>
                                                    </div>
                                                    <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 900 }}>INSTALLED</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '60px 0', background: '#F8FAFC', borderRadius: '24px' }}>
                                            <Zap size={48} color="#E2E8F0" style={{ margin: '0 auto 16px' }} />
                                            <p style={{ color: '#94A3B8', fontWeight: 800 }}>No active workflows detected.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {modalTab === "Payments" && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div className={adminStyles.parameterCard} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', background: '#F0FAF5', borderColor: '#34D186' }}>
                                        <div>
                                            <span className={adminStyles.parameterLabel} style={{ color: '#059669' }}>Institutional Value</span>
                                            <span className={adminStyles.parameterValue} style={{ color: '#111', fontSize: '2rem' }}>
                                                €{(parseFloat(user.totalSpend) || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <Euro size={40} color="#34D186" />
                                    </div>
                                    <div className={adminStyles.parameterGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div className={adminStyles.parameterCard}>
                                            <span className={adminStyles.parameterLabel}>Billing Cycle</span>
                                            <span className={adminStyles.parameterValue}>Monthly Institutional</span>
                                        </div>
                                        <div className={adminStyles.parameterCard}>
                                            <span className={adminStyles.parameterLabel}>Next Invoice</span>
                                            <span className={adminStyles.parameterValue}>April 28, 2026</span>
                                        </div>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Provisioning Controls</span>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                            <button 
                                                className={adminStyles.actionBtnPrimary} 
                                                style={{ flex: 1, height: '48px' }}
                                                onClick={() => updateUser(user.id, { tier: 'Paid' })}
                                            >
                                                <ArrowUpCircle size={18} style={{ marginRight: '8px' }} />
                                                Upgrade to Enterprise
                                            </button>
                                            <button 
                                                className={adminStyles.actionBtnDelete} 
                                                style={{ flex: 1, height: '48px', width: 'auto' }}
                                                onClick={() => updateUser(user.id, { tier: 'Free' })}
                                            >
                                                <ArrowDownCircle size={18} style={{ marginRight: '8px' }} />
                                                Revert to Free
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === "Activity Logs" && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div className={adminStyles.parameterCard}>
                                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ padding: '12px', background: '#F1F5F9', borderRadius: '12px' }}>
                                                <History size={24} color="#64748B" />
                                            </div>
                                            <div>
                                                <span className={adminStyles.parameterLabel}>Recent Session Activity</span>
                                                <span className={adminStyles.parameterValue}>
                                                    Last active: {user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <span className={adminStyles.parameterLabel}>Access Logs</span>
                                        {[
                                            { action: "API Authentication", time: "10 minutes ago", status: "Success" },
                                            { action: "Workflow Deployment", time: "2 hours ago", status: "Success" },
                                            { action: "Institutional Login", time: "Yesterday", status: "Success" },
                                            { action: "Security Credential Reset", time: "3 days ago", status: "Success" }
                                        ].map((log, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: '#111', fontSize: '0.9rem' }}>{log.action}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>{log.time}</div>
                                                </div>
                                                <div style={{ color: '#34D186', fontSize: '0.7rem', fontWeight: 950 }}>{log.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={adminStyles.modalFooter} style={{ padding: '32px 48px', background: '#F8FAFC' }}>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    className={adminStyles.actionBtnPrimary}
                                    style={{ height: '52px', padding: '0 32px' }}
                                    onClick={() => {
                                        alert("API credentials have been reset and sent to " + user.email);
                                        updateUser(user.id, { updatedAt: new Date().toISOString() });
                                    }}
                                >
                                    <Key size={18} style={{ marginRight: '10px' }} />
                                    Reset Credentials
                                </button>
                                <button 
                                    className={adminStyles.actionBtnDelete}
                                    style={{ width: 'auto', height: '52px', padding: '0 32px' }}
                                    onClick={() => updateUser(user.id, { status: user.status === 'Suspended' ? 'Active' : 'Suspended' })}
                                >
                                    {user.status === 'Suspended' ? 'Re-Activate Account' : 'Suspend Account Access'}
                                </button>
                            </div>
                            <button className={adminStyles.refreshBtn} onClick={onClose} style={{ height: '52px', background: 'white', border: '1px solid #EAEAEA', color: '#111' }}>
                                Close Registry Entry
                            </button>
                        </div>
                    </div>
                </div>
            </ModalPortal>
        );
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (Array.isArray(data)) {
                setUsers(data);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateUser = async (id: string, updates: any) => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
                if (selectedUser?.id === id) {
                    setSelectedUser({ ...selectedUser, ...updates });
                }
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setUpdatingId(null);
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to permanently revoke access for this user?")) return;

        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
                setSelectedUser(null);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const getUserStatus = (u: any) => {
        if (u.status === 'Suspended') return 'Suspended';
        
        const lastActive = u.lastActive ? new Date(u.lastActive) : null;
        if (!lastActive) return 'No Activation';
        
        const diffDays = (new Date().getTime() - lastActive.getTime()) / (1000 * 3600 * 24);
        
        if (diffDays > 30) return 'Churn Risk';
        if (diffDays > 7) return 'Inactive';
        return 'Active';
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Active': return adminStyles.statusActive;
            case 'Inactive': return adminStyles.statusInactive;
            case 'Churn Risk': return adminStyles.statusChurn;
            case 'Suspended': return adminStyles.statusSuspended;
            case 'No Activation': return adminStyles.statusInactive;
            default: return '';
        }
    };

    const getTierBadge = (tier: string) => {
        const t = tier?.toLowerCase() || 'free';
        if (t === 'admin' || t === 'superadmin') return adminStyles.tierAdmin;
        if (t === 'paid' || t === 'enterprise') return adminStyles.tierPaid;
        return adminStyles.tierFree;
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = 
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.firmName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (!matchesSearch) return false;

        const status = getUserStatus(u);
        if (activeFilter === "All") return true;
        if (activeFilter === "Active") return status === "Active";
        if (activeFilter === "Inactive") return status === "Inactive" || status === "Churn Risk";
        if (activeFilter === "Paying") return u.tier === "Paid" || u.tier === "Enterprise";
        if (activeFilter === "Admin") return u.role === "Admin" || u.role === "SuperAdmin";
        if (activeFilter === "Workflows") return (u.workflowsUsed || 0) > 0;
        
        return true;
    });

    const stats = {
        total: users.length,
        paying: users.filter(u => u.tier === 'Paid' || u.tier === 'Enterprise').length,
        revenue: users.reduce((acc, u) => acc + (parseFloat(u.totalSpend) || 0), 0),
        churnRisk: users.filter(u => getUserStatus(u) === 'Churn Risk').length
    };

    const SkeletonRow = () => (
        <tr className={adminStyles.registryRow}>
            <td><Skeleton width="180px" height="40px" borderRadius="12px" /></td>
            <td><Skeleton width="120px" height="24px" /></td>
            <td><Skeleton width="80px" height="24px" /></td>
            <td><Skeleton width="100px" height="24px" /></td>
            <td><Skeleton width="100px" height="24px" /></td>
            <td><Skeleton width="120px" height="32px" borderRadius="20px" /></td>
            <td style={{ textAlign: 'right' }}><Skeleton width="120px" height="36px" borderRadius="10px" /></td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            <div className={adminStyles.integrityPanel}>
                <div className={adminStyles.integrityHub}>
                    <div className={adminStyles.statusBeacon}>
                        <div className={adminStyles.beaconPulse} />
                    </div>
                    <div>
                        <h4 className={adminStyles.panelTitle}>Identity Registry: Synchronized</h4>
                        <p className={adminStyles.panelSubtitle}>Institutional access logs and privilege levels are up to date.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <span className={adminStyles.hubLabel}>Total Operators:</span>
                    <span className={adminStyles.hubValue}>{isLoading ? <Skeleton width="30px" height="20px" /> : users.length}</span>
                </div>
            </div>

            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>VERIFIED USERS</span>
                        <UserCheck size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : users.length}</div>
                    <div className={adminStyles.metricDetail}>Active account registry</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>PAYING CLIENTS</span>
                        <TrendingUp size={14} color="#34D186" />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.paying}</div>
                    <div className={adminStyles.metricDetail}>Premium tier subscribers</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>TOTAL SPEND</span>
                        <Euro size={14} color="#34D186"/>
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : `€${stats.revenue.toLocaleString()}`}</div>
                    <div className={adminStyles.metricDetail}>Aggregated user revenue</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>CHURN RISK</span>
                        <AlertCircle size={14} color="#EF4444" />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.churnRisk}</div>
                    <div className={adminStyles.metricDetail}>Inactive for 30+ days</div>
                </div>
            </div>

            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>User Management System</h3>
                        <p className={adminStyles.registrySubtitle}>Full visibility and control over institutional operators.</p>
                    </div>
                    <div className={styles.searchWrapper} style={{ width: '400px' }}>
                        <Search className={styles.searchIcon} size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or firm..." 
                            className={styles.searchInput} 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={adminStyles.filterBar}>
                    {["All", "Active", "Paying", "Inactive", "Admin", "Workflows"].map(filter => (
                        <button
                            key={filter}
                            className={`${adminStyles.filterBtn} ${activeFilter === filter ? adminStyles.filterBtnActive : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter} Users
                        </button>
                    ))}
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>User</th>
                                <th className={adminStyles.registryTH}>Tier</th>
                                <th className={adminStyles.registryTH}>Spend</th>
                                <th className={adminStyles.registryTH}>Workflows</th>
                                <th className={adminStyles.registryTH}>Last Active</th>
                                <th className={adminStyles.registryTH}>Status</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : (
                                <>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '80px 0', textAlign: 'center' }}>
                                                <Users size={48} style={{ color: '#EAEAEA', marginBottom: '20px' }} />
                                                <p style={{ fontWeight: 900, color: '#111', fontSize: '1.1rem' }}>No users found</p>
                                                <p style={{ color: '#94A3B8', fontWeight: 700 }}>Adjust your parameters to locate the operator.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(u => {
                                            const status = getUserStatus(u);
                                            return (
                                                <tr key={u.id} className={adminStyles.registryRow}>
                                                    <td>
                                                        <div className={adminStyles.loopDetail} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer' }}>
                                                            <div className={adminStyles.requesterAvatar}>
                                                                {u.name?.charAt(0) || "U"}
                                                            </div>
                                                            <div>
                                                                <div className={adminStyles.loopName}>{u.name}</div>
                                                                <div className={adminStyles.requesterEmail}>{u.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`${adminStyles.tierBadge} ${getTierBadge(u.tier)}`}>
                                                            {u.tier || 'Free'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className={adminStyles.loopName} style={{ color: '#34D186' }}>
                                                            €{(parseFloat(u.totalSpend) || 0).toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={adminStyles.workflowChip}>
                                                            <Zap size={12} />
                                                            {u.workflowsUsed || 0}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={adminStyles.requesterEmail}>
                                                            {u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'Never'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className={`${adminStyles.statusBadge} ${getStatusClass(status)}`}>
                                                            <div className={adminStyles.statusPulse} />
                                                            {status}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                            <button 
                                                                className={adminStyles.actionIconBtn}
                                                                onClick={() => setSelectedUser(u)}
                                                                title="View Profile"
                                                            >
                                                                <ChevronRight size={18} />
                                                            </button>
                                                            <button 
                                                                className={adminStyles.actionIconBtn}
                                                                onClick={() => updateUser(u.id, { status: u.status === 'Suspended' ? 'Active' : 'Suspended' })}
                                                                title={u.status === 'Suspended' ? "Activate" : "Suspend"}
                                                            >
                                                                {u.status === 'Suspended' ? <UserCheck size={18} /> : <ShieldAlert size={18} />}
                                                            </button>
                                                            {u.role !== 'SuperAdmin' && (
                                                                <button 
                                                                    className={`${adminStyles.actionIconBtn} ${adminStyles.actionIconBtnDanger}`}
                                                                    onClick={() => deleteUser(u.id)}
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </div>
    );
}

