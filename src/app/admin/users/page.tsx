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
        <tr className={adminStyles.registryRow}>
            <td>
                <div className={adminStyles.loopDetail}>
                    <Skeleton width="40px" height="40px" borderRadius="12px" />
                    <div>
                        <Skeleton width="140px" height="18px" style={{ marginBottom: '6px' }} />
                        <Skeleton width="100px" height="12px" />
                    </div>
                </div>
            </td>
            <td><Skeleton width="200px" height="20px" /></td>
            <td><Skeleton width="150px" height="20px" /></td>
            <td><Skeleton width="140px" height="36px" borderRadius="10px" /></td>
            <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Skeleton width="40px" height="40px" borderRadius="10px" />
                    <Skeleton width="40px" height="40px" borderRadius="10px" />
                </div>
            </td>
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
                        <span className={adminStyles.metricTag}>FIRM ENTITIES</span>
                        <Building2 size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : new Set(users.map(u => u.firmName)).size}</div>
                    <div className={adminStyles.metricDetail}>Unique institutional clients</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>PRIVILEGE ACCESS</span>
                        <Shield size={14} color="#34D186"/>
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : users.filter(u => u.role === 'Admin' || u.role === 'SuperAdmin' || u.role === 'OWNER').length}</div>
                    <div className={adminStyles.metricDetail}>Administrative accounts</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>REGISTRY HEALTH</span>
                        <Activity size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>Optimal</div>
                    <div className={adminStyles.metricDetail}>Liveness data active</div>
                </div>
            </div>

            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Identity Registry</h3>
                        <p className={adminStyles.registrySubtitle}>Manage operator privileges and institutional firm anchoring.</p>
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

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>Operator Instance</th>
                                <th className={adminStyles.registryTH}>Email Connectivity</th>
                                <th className={adminStyles.registryTH}>Firm Anchoring</th>
                                <th className={adminStyles.registryTH}>Privilege Level</th>
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
                                            <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                                                <Users size={48} style={{ color: '#EAEAEA', marginBottom: '20px' }} />
                                                <p style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '1.1rem' }}>No identities found</p>
                                                <p style={{ color: '#94A3B8', fontWeight: 700 }}>Adjust your parameters to locate the operator.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map(u => (
                                            <tr key={u.id} className={adminStyles.registryRow}>
                                                <td>
                                                    <div className={adminStyles.loopDetail}>
                                                        <div className={adminStyles.requesterAvatar}>
                                                            {u.name?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <div className={adminStyles.loopName}>{u.name}</div>
                                                            <code className={adminStyles.identityHash} style={{ marginTop: '2px', display: 'block' }}>
                                                                {u.id.substring(0, 12)}
                                                            </code>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={adminStyles.requesterInfo}>
                                                        <Mail size={14} color="#94A3B8" />
                                                        <span className={adminStyles.requesterEmail}>{u.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={adminStyles.requesterInfo}>
                                                        <Building2 size={16} color="#94A3B8" />
                                                        <span className={adminStyles.loopName} style={{ fontSize: '0.9rem' }}>{u.firmName || "N/A"}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ position: 'relative', width: '160px' }}>
                                                        <select
                                                            value={u.role}
                                                            disabled={u.role === 'SuperAdmin' || updatingId === u.id}
                                                            onChange={(e) => updateRole(u.id, e.target.value)}
                                                            className={adminStyles.actionBtnPrimary}
                                                            style={{ 
                                                                width: '100%', 
                                                                appearance: 'none', 
                                                                cursor: (u.role === 'SuperAdmin' || updatingId === u.id) ? 'not-allowed' : 'pointer',
                                                                textAlign: 'center',
                                                                background: u.role === 'OWNER' || u.role === 'Admin' ? '#F0FAF5' : '#FFFFFF',
                                                                borderColor: u.role === 'OWNER' || u.role === 'Admin' ? '#34D186' : '#E2E8F0',
                                                                color: u.role === 'OWNER' || u.role === 'Admin' ? '#34D186' : '#0F172A',
                                                                height: '38px',
                                                                lineHeight: '38px',
                                                                padding: '0 16px',
                                                                border: '1.5px solid'
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
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        {u.role !== 'SuperAdmin' && (
                                                            <button 
                                                                className={adminStyles.actionBtnDelete}
                                                                onClick={() => deleteUser(u.id)}
                                                                title="Revoke Access"
                                                            >
                                                                <ShieldAlert size={18} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            className={adminStyles.actionBtnPrimary}
                                                            style={{ width: '38px', padding: 0 }}
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
    );
}

