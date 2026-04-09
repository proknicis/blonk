"use client";

import styles from "../../dashboard/page.module.css";
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
    MoreVertical
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

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

    const updateRole = async (id: string, newRole: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role: newRole })
            });
            if (res.ok) {
                setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
                alert(`User role updated to ${newRole}`);
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
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firmName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SkeletonRow = () => (
        <tr>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Skeleton width="40px" height="40px" borderRadius="50%" />
                    <div>
                        <Skeleton width="120px" height="18px" style={{ marginBottom: '8px' }} />
                        <Skeleton width="80px" height="12px" />
                    </div>
                </div>
            </td>
            <td><Skeleton width="180px" height="18px" /></td>
            <td><Skeleton width="140px" height="18px" /></td>
            <td><Skeleton width="120px" height="32px" borderRadius="12px" /></td>
            <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Skeleton width="36px" height="36px" borderRadius="10px" />
                    <Skeleton width="36px" height="36px" borderRadius="10px" />
                </div>
            </td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            {/* STATUS BANNER */}
            <div className={styles.integrityBanner}>
                <div className={styles.integrityInfo}>
                    <div className={styles.statusIndicatorHealthy}>
                        <div className={styles.pulseEffect} />
                    </div>
                    <div>
                        <h4 className={styles.integrityTitle}>User Directory: Synchronized</h4>
                        <p className={styles.integritySubtitle}>Institutional access logs and privilege levels are up to date.</p>
                    </div>
                </div>
                <div className={styles.integrityMetrics}>
                    <span className={styles.metricLabel}>Total Operators:</span>
                    <span className={styles.metricValue}>{isLoading ? <Skeleton width="30px" height="20px" /> : users.length}</span>
                </div>
            </div>

            {/* QUICK METRICS */}
            <div className={styles.metricsMatrix}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Verified Users</span>
                        <UserCheck size={14} className={styles.accentIcon} />
                    </div>
                    <div className={styles.value}>{isLoading ? <Skeleton width="40px" height="32px" /> : users.length}</div>
                    <div className={styles.trend}>Active account registry</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Firm Entities</span>
                        <Building2 size={14} />
                    </div>
                    <div className={styles.value}>{isLoading ? <Skeleton width="40px" height="32px" /> : new Set(users.map(u => u.firmName)).size}</div>
                    <div className={styles.trend}>Unique institutional clients</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Privilege Access</span>
                        <Shield size={14} color="#34D186"/>
                    </div>
                    <div className={styles.value}>{isLoading ? <Skeleton width="40px" height="32px" /> : users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin' || u.role === 'OWNER').length}</div>
                    <div className={styles.trend}>Administrative accounts</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Registry Health</span>
                        <Activity size={14} />
                    </div>
                    <div className={styles.value}>Optimal</div>
                    <div className={styles.trend}>Liveness data active</div>
                </div>
            </div>

            {/* USER REGISTRY */}
            <div className={styles.commandGrid} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.activeWorkflows} style={{ padding: '32px' }}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h3 className={styles.cardTitle}>Identity Registry</h3>
                            <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>Manage operator privileges and institutional firm anchoring.</p>
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

                    <div style={{ overflowX: 'auto', marginTop: '24px' }}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Operator Instance</th>
                                    <th>Email Connectivity</th>
                                    <th>Firm Anchoring</th>
                                    <th>Privilege Level</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
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
                                                <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                                                    <Users size={48} style={{ color: '#EAEAEA', marginBottom: '20px' }} />
                                                    <p style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '1.1rem' }}>No identities found</p>
                                                    <p style={{ color: '#94A3B8', fontWeight: 700 }}>Adjust your parameters to locate the operator.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map(u => (
                                                <tr key={u.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                            <div className={styles.avatar} style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                                                                {u.name?.charAt(0) || "U"}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 950, color: '#0A0A0A', fontSize: '1rem' }}>{u.name}</div>
                                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>ID: {u.id.substring(0, 8)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontWeight: 700, fontSize: '0.9rem' }}>
                                                            <Mail size={14} />
                                                            {u.email}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A0A0A', fontWeight: 850, fontSize: '0.9rem' }}>
                                                            <Building2 size={16} color="#94A3B8" />
                                                            {u.firmName || "N/A"}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ position: 'relative', width: '140px' }}>
                                                            <select
                                                                value={u.role}
                                                                disabled={u.role === 'SuperAdmin' || updatingId === u.id}
                                                                onChange={(e) => updateRole(u.id, e.target.value)}
                                                                className={styles.btnOutline}
                                                                style={{ 
                                                                    width: '100%', 
                                                                    padding: '6px 12px', 
                                                                    appearance: 'none', 
                                                                    cursor: (u.role === 'SuperAdmin' || updatingId === u.id) ? 'not-allowed' : 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    fontWeight: 900,
                                                                    textAlign: 'center',
                                                                    background: u.role === 'OWNER' || u.role === 'Admin' ? '#F0FAF5' : '#FFFFFF',
                                                                    borderColor: u.role === 'OWNER' || u.role === 'Admin' ? '#34D186' : '#EAEAEA',
                                                                    color: u.role === 'OWNER' || u.role === 'Admin' ? '#34D186' : '#0A0A0A'
                                                                }}
                                                            >
                                                                <option value="User">Standard User</option>
                                                                <option value="Admin">System Admin</option>
                                                                <option value="OWNER">Firm Owner</option>
                                                                <option value="SuperAdmin" disabled>Super Admin</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                            {u.role !== 'SuperAdmin' && (
                                                                <button 
                                                                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'none', border: '1px solid #FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    onClick={() => deleteUser(u.id)}
                                                                    title="Revoke Access"
                                                                >
                                                                    <ShieldAlert size={18} />
                                                                </button>
                                                            )}
                                                            <button 
                                                                className={styles.btnOutline}
                                                                style={{ width: '40px', height: '40px', borderRadius: '12px', padding: 0 }}
                                                                onClick={fetchUsers}
                                                            >
                                                                <RefreshCcw size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

