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
                <div className={adminStyles.modalOverlay} onClick={onClose}>
                    <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
                        <div className={adminStyles.modalHeader} style={{ background: 'var(--foreground)', color: 'var(--background)' }}>
                            <button className={adminStyles.modalClose} onClick={onClose} style={{ color: 'var(--background)', borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                                <X size={20} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
                                <div className={adminStyles.requesterAvatar} style={{ width: '80px', height: '80px', fontSize: '2rem', background: 'var(--accent)', color: 'var(--foreground)', border: 'none' }}>
                                    {user.name?.charAt(0) || "U"}
                                </div>
                                <div>
                                    <h2 className={adminStyles.modalTitle} style={{ color: 'var(--background)', fontSize: '2rem' }}>{user.name}</h2>
                                    <p className={adminStyles.modalSubtitle} style={{ color: 'rgba(255,255,255,0.6)' }}>{user.email}</p>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                        <span className={adminStyles.tierBadge} style={{ background: 'var(--accent)', color: 'var(--foreground)' }}>
                                            {user.tier || 'Free'} TIER
                                        </span>
                                        <span className={adminStyles.tierBadge} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={adminStyles.tabsContainer} style={{ margin: '40px 0 0', border: 'none', gap: '32px' }}>
                                {["Overview", "Firm Context", "Workflows", "Activity"].map(tab => (
                                    <button 
                                        key={tab}
                                        className={`${adminStyles.tab} ${modalTab === tab ? adminStyles.tabActive : ''}`}
                                        onClick={() => setModalTab(tab)}
                                        style={{ 
                                            color: modalTab === tab ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
                                            paddingBottom: '12px'
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={adminStyles.modalBody}>
                            {modalTab === "Overview" && (
                                <div className={adminStyles.parameterGrid}>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>System Identity</span>
                                        <span className={adminStyles.parameterValue}>{user.id}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Provisioned Role</span>
                                        <span className={adminStyles.parameterValue} style={{ color: 'var(--accent)' }}>{user.role}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Onboarding Protocol</span>
                                        <span className={adminStyles.parameterValue}>{new Date(user.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={adminStyles.parameterCard}>
                                        <span className={adminStyles.parameterLabel}>Last Sync</span>
                                        <span className={adminStyles.parameterValue}>{user.lastActive ? new Date(user.lastActive).toLocaleTimeString() : 'N/A'}</span>
                                    </div>
                                </div>
                            )}

                            {modalTab === "Firm Context" && (
                                <div className={adminStyles.parameterGrid} style={{ gridTemplateColumns: '1fr' }}>
                                    <div className={adminStyles.parameterCard} style={{ borderColor: 'var(--accent)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span className={adminStyles.parameterLabel}>Anchored Institution</span>
                                                <span className={adminStyles.parameterValue} style={{ fontSize: '1.5rem' }}>{user.firmName || "Independent Operator"}</span>
                                            </div>
                                            <Building2 size={32} color="var(--accent)" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === "Workflows" && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div className={adminStyles.parameterCard} style={{ background: 'var(--foreground)', color: 'var(--background)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span className={adminStyles.parameterLabel} style={{ color: 'rgba(255,255,255,0.4)' }}>Active Deployments</span>
                                                <span className={adminStyles.parameterValue} style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>{user.workflowsUsed || 0} Pipelines</span>
                                            </div>
                                            <Zap size={32} color="var(--accent)" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modalTab === "Activity" && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {[
                                        { action: "API Authentication", time: "10m ago", status: "Success" },
                                        { action: "Workflow Deployment", time: "2h ago", status: "Success" },
                                        { action: "Institutional Login", time: "Yesterday", status: "Success" },
                                    ].map((log, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--muted)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div>
                                                <div style={{ fontWeight: 800, color: 'var(--foreground)' }}>{log.action}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{log.time}</div>
                                            </div>
                                            <div style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 950 }}>{log.status}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={adminStyles.modalFooter}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                    className={adminStyles.actionIconBtn} 
                                    style={{ width: 'auto', padding: '0 20px' }}
                                    onClick={() => updateUser(user.id, { status: 'Active' })}
                                    disabled={updatingId === user.id}
                                >
                                    <Key size={16} style={{ marginRight: '8px' }} /> Restore
                                </button>
                                <button 
                                    className={adminStyles.actionIconBtn} 
                                    style={{ width: 'auto', padding: '0 20px', color: 'var(--destructive)' }}
                                    onClick={() => updateUser(user.id, { status: 'Suspended' })}
                                    disabled={updatingId === user.id}
                                >
                                    <ShieldAlert size={16} style={{ marginRight: '8px' }} /> Suspend
                                </button>
                            </div>
                            <button className={adminStyles.refreshBtn} onClick={onClose}>
                                Close Registry
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
            if (Array.isArray(data)) setUsers(data);
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
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
                const updatedUser = await res.json();
                if (selectedUser && selectedUser.id === id) {
                    setSelectedUser({ ...selectedUser, ...updates });
                }
                fetchUsers();
            }
        } catch (error) { console.error(error); } finally { setUpdatingId(null); }
    };

    const deleteUser = async (id: string) => {
        if (!confirm("Permanently revoke access?")) return;
        try {
            await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            fetchUsers();
        } catch (error) { console.error(error); }
    };

    const getUserStatus = (u: any) => {
        if (u.status === 'Suspended') return 'Suspended';
        if (!u.lastActive) return 'Inactive';
        const diffDays = (new Date().getTime() - new Date(u.lastActive).getTime()) / (1000 * 3600 * 24);
        return diffDays > 7 ? 'Inactive' : 'Active';
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firmName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <span className={adminStyles.hubValue}>{isLoading ? <Skeleton width="30px" height="24px" /> : users.length}</span>
                </div>
            </div>

            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>User Management</h3>
                        <p className={adminStyles.registrySubtitle}>Granular control over fleet operators.</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input 
                            type="text" 
                            placeholder="Search operators..." 
                            className={adminStyles.mainInput} 
                            style={{ padding: '12px 16px 12px 48px', width: '320px', borderRadius: '16px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>User</th>
                                <th className={adminStyles.registryTH}>Tier</th>
                                <th className={adminStyles.registryTH}>Spend</th>
                                <th className={adminStyles.registryTH}>Flows</th>
                                <th className={adminStyles.registryTH}>Activity</th>
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
                                </>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className={adminStyles.registryRow}>
                                        <td>
                                            <div className={adminStyles.loopDetail} onClick={() => setSelectedUser(u)} style={{ cursor: 'pointer' }}>
                                                <div className={adminStyles.requesterAvatar}>
                                                    {u.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <div className={adminStyles.loopName}>{u.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={adminStyles.tierBadge} style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                                                {u.tier || 'Free'}
                                            </span>
                                        </td>
                                        <td><div style={{ fontWeight: 800, color: 'var(--accent)' }}>€{(parseFloat(u.totalSpend) || 0).toLocaleString()}</div></td>
                                        <td><div style={{ fontWeight: 800 }}>{u.workflowsUsed || 0}</div></td>
                                        <td><div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{u.lastActive ? new Date(u.lastActive).toLocaleDateString() : 'Never'}</div></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getUserStatus(u) === 'Active' ? 'var(--accent)' : 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getUserStatus(u) === 'Active' ? 'var(--accent)' : 'var(--muted-foreground)' }} />
                                                {getUserStatus(u)}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className={adminStyles.actionIconBtn} onClick={() => setSelectedUser(u)}><ChevronRight size={18} /></button>
                                                <button className={adminStyles.actionIconBtn} style={{ color: 'var(--destructive)' }} onClick={() => deleteUser(u.id)}><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedUser && <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </div>
    );
}
