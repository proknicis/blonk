"use client";

import React, { useState } from "react";
import { 
    Users, Activity, Shield, UserPlus, Search, 
    MoreHorizontal, Filter, ShieldAlert, Key, Zap, Edit, Trash2
} from "lucide-react";
import { updateOperatorRole, decommissionOperator } from "./actions";
import styles from "./operators.module.css";

interface Operator {
    id: string;
    name: string;
    email: string;
    role: string;
    accessLevel: string;
    assignedNodes: number;
    status: string;
    lastAction: string;
}

export default function OperatorsClient({ initialOperators }: { initialOperators: Operator[] }) {
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState<string | null>(null);

    const handleUpdateRole = async (userId: string, newRole: string) => {
        setMenuOpen(null);
        try {
            await updateOperatorRole(userId, newRole);
        } catch(e) { console.error(e); }
    };

    const handleDecommission = async (userId: string) => {
        setMenuOpen(null);
        if (!confirm("Are you sure you want to decommission this operator?")) return;
        try {
            await decommissionOperator(userId);
        } catch(e) { console.error(e); }
    };

    const filteredOperators = initialOperators.filter(op => 
        op.name.toLowerCase().includes(search.toLowerCase()) || 
        op.email.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = initialOperators.filter(o => o.status === 'Active').length;
    const suspendedCount = initialOperators.filter(o => o.status === 'Suspended').length;
    const pendingCount = initialOperators.filter(o => o.status === 'Pending').length;

    return (
        <div className={styles.container}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Operator Directory</h1>
                    <p className={styles.subtitle}>
                        Manage personnel, role assignments, and sovereign access protocols.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.btnProvision}>
                        <UserPlus size={16} /> Provision Operator
                    </button>
                </div>
            </div>

            {/* STATS STRIP */}
            <div className={styles.statsStrip}>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Total Operators</span>
                        <span className={styles.statValue}>{initialOperators.length}</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                        <Activity size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Active Duty</span>
                        <span className={styles.statValue}>{activeCount}</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                        <ShieldAlert size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Suspended</span>
                        <span className={styles.statValue}>{suspendedCount}</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <div className={styles.statIcon} style={{ color: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                        <Zap size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Pending</span>
                        <span className={styles.statValue}>{pendingCount}</span>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className={styles.mainContent}>
                <div className={styles.controlsBar}>
                    <div className={styles.searchBox}>
                        <Search size={16} />
                        <input 
                            type="text" 
                            placeholder="Search operators by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className={styles.btnFilter}><Filter size={16} /> Filters</button>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Operator Identity</th>
                                <th>Assigned Rank</th>
                                <th>Access Level</th>
                                <th>Nodes</th>
                                <th>Status</th>
                                <th>Last Action</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOperators.map(op => {
                                let statusClass = styles.statusActive;
                                if (op.status === 'Suspended') statusClass = styles.statusSuspended;
                                if (op.status === 'Pending') statusClass = styles.statusPending;

                                let rankColor = '#64748B';
                                if (op.role === 'OWNER' || op.role === 'Owner') rankColor = '#10B981';
                                if (op.role === 'ADMIN' || op.role === 'Admin') rankColor = '#3B82F6';
                                if (op.role === 'EDITOR' || op.role === 'Editor') rankColor = '#8B5CF6';

                                return (
                                    <tr key={op.id} className={styles.tableRow}>
                                        <td>
                                            <div className={styles.operatorIdentity}>
                                                <div className={styles.avatar} style={{ backgroundColor: `${rankColor}15`, color: rankColor }}>
                                                    {op.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={styles.operatorInfo}>
                                                    <span className={styles.opName}>{op.name}</span>
                                                    <span className={styles.opEmail}>{op.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.rankBadge} style={{ backgroundColor: `${rankColor}15`, color: rankColor, border: `1px solid ${rankColor}30` }}>
                                                {op.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.accessLevel}>
                                                <Key size={14} /> {op.accessLevel}
                                            </div>
                                        </td>
                                        <td className={styles.tdNodes}>{op.assignedNodes}</td>
                                        <td>
                                            <span className={`${styles.statusPill} ${statusClass}`}>
                                                {op.status}
                                            </span>
                                        </td>
                                        <td className={styles.tdLastAction}>{op.lastAction}</td>
                                        <td className={styles.tdActions} style={{ position: 'relative' }}>
                                            <button 
                                                className={styles.btnMore} 
                                                onClick={() => setMenuOpen(menuOpen === op.id ? null : op.id)}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                            
                                            {menuOpen === op.id && (
                                                <div style={{
                                                    position: 'absolute', right: 0, top: '100%', zIndex: 10,
                                                    background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: 8, minWidth: 160,
                                                    display: 'flex', flexDirection: 'column', gap: 4
                                                }}>
                                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', padding: '4px 8px', textTransform: 'uppercase' }}>Update Role</div>
                                                    <button onClick={() => handleUpdateRole(op.id, 'ADMIN')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: '6px 8px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer', borderRadius: 4, textAlign: 'left' }}><Shield size={14} color="#3B82F6"/> Admin</button>
                                                    <button onClick={() => handleUpdateRole(op.id, 'EDITOR')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: '6px 8px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer', borderRadius: 4, textAlign: 'left' }}><Activity size={14} color="#8B5CF6"/> Editor</button>
                                                    <button onClick={() => handleUpdateRole(op.id, 'VIEWER')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: '6px 8px', fontSize: '0.8rem', fontWeight: 600, color: '#0F172A', cursor: 'pointer', borderRadius: 4, textAlign: 'left' }}><Key size={14} color="#64748B"/> Viewer</button>
                                                    
                                                    <div style={{ height: 1, background: '#F1F5F9', margin: '4px 0' }} />
                                                    
                                                    <button onClick={() => handleDecommission(op.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: 'none', padding: '6px 8px', fontSize: '0.8rem', fontWeight: 700, color: '#EF4444', cursor: 'pointer', borderRadius: 4, textAlign: 'left' }}>
                                                        <Trash2 size={14} /> Decommission
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredOperators.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontWeight: 600 }}>
                                        No operators found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
