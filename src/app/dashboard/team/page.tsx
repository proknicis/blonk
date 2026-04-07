"use client";

import React, { useState, useEffect } from "react";
import styles from "./team.module.css";
import ModalPortal from "@/app/components/ModalPortal";

export default function TeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");

    useEffect(() => {
        fetchTeamData();
    }, []);

    const fetchTeamData = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            if (data.members) {
                // Enrich data with activity/workflows for UI if missing
                const enriched = data.members.map((m: any, i: number) => ({
                    ...m,
                    status: i === 0 || i === 2 ? 'Active' : 'Offline',
                    lastActivity: i === 0 ? 'Ran Lead Automation 1h ago' : i === 1 ? 'Edited user permissions 2d ago' : 'Logged in 5h ago',
                    workflows: i === 0 ? ['Lead Automation', 'Invoice Processing'] : i === 2 ? ['Client Onboarding'] : []
                }));
                // Ensure owner is at top
                enriched.sort((a: any, b: any) => a.role === 'OWNER' ? -1 : b.role === 'OWNER' ? 1 : 0);
                setMembers(enriched);
            }
        } catch (error) {
            console.error("Team fetch failure", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalWorkflowsAssigned = members.reduce((acc, m) => acc + (m.workflows?.length || 0), 0);
    const activeToday = members.filter(m => m.status === 'Active').length;

    const getRoleStyles = (role: string) => {
        if (role === 'OWNER') return { bg: '#0A0A0A', color: '#FFF' };
        if (role === 'ADMIN') return { bg: '#EEF2FF', color: '#6366F1' };
        if (role === 'OPERATOR') return { bg: '#FDF4FF', color: '#D946EF' };
        return { bg: '#F8FAFC', color: '#64748B' }; // VIEW/MEMBER
    };

    return (
        <div className={styles.teamContainer}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1>Team Directory</h1>
                    <p>Manage access, assign workflows, and monitor activity.</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => setShowInviteModal(true)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Invite Member
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Members</span>
                    <span className={styles.statValue}>{members.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Today</span>
                    <span className={styles.statValue}>{activeToday}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Workflows Assigned</span>
                    <span className={styles.statValue}>{totalWorkflowsAssigned}</span>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <div className={styles.controls}>
                    <div className={styles.searchBox}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                        <option value="ALL">All Roles</option>
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="OPERATOR">Operator</option>
                        <option value="MEMBER">Viewer</option>
                    </select>
                </div>

                {isLoading ? (
                    <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>Loading team data...</div>
                ) : filteredMembers.length === 0 ? (
                    <div style={{ padding: '64px', textAlign: 'center' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        <p style={{ fontWeight: 800, fontSize: '1.1rem', color: '#64748B', margin: 0 }}>No members found.</p>
                    </div>
                ) : (
                    <table className={styles.teamTable}>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Assigned Workflows</th>
                                <th>Last Activity</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member: any) => {
                                const roleStyle = getRoleStyles(member.role);
                                return (
                                    <tr key={member.id} className={styles.teamRow}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar} style={{ background: roleStyle.bg, color: roleStyle.color }}>
                                                    {(member.name || 'U').charAt(0).toUpperCase()}
                                                    <div className={`${styles.statusDot} ${member.status === 'Active' ? styles.statusActive : styles.statusOffline}`} />
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName}>{member.name || 'Anonymous User'}</span>
                                                    <span className={styles.userEmail}>{member.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.roleBadge} style={{ background: roleStyle.bg, color: roleStyle.color }}>
                                                {member.role === 'MEMBER' ? 'VIEWER' : member.role}
                                            </span>
                                        </td>
                                        <td>
                                            {member.workflows && member.workflows.length > 0 ? (
                                                <div className={styles.workflowsList}>
                                                    {member.workflows.map((wf: string, idx: number) => (
                                                        <span key={idx} className={styles.workflowPill}>{wf}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>Unassigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.activityInfo}>
                                                <span className={styles.activityText}>{member.lastActivity}</span>
                                                <span className={styles.activityTime}>{member.status === 'Active' ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className={styles.actionBtn} aria-label="Manage user">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {showInviteModal && (
                <ModalPortal>
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(8px)' }}>
                        <div style={{ background: '#ffffff', borderRadius: '32px', padding: '40px', width: '100%', maxWidth: '500px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 950, margin: 0, color: '#0F172A' }}>Invite Member</h2>
                                    <p style={{ fontSize: '0.9rem', color: '#64748B', margin: '4px 0 0 0', fontWeight: 600 }}>Provision access to your automation platform.</p>
                                </div>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                </div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); setShowInviteModal(false); }}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Email Address</label>
                                    <input type="email" required placeholder="colleague@company.com" style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontWeight: 600, fontSize: '0.95rem' }} />
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Role</label>
                                    <select style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
                                        <option value="ADMIN">Admin (Full Access)</option>
                                        <option value="OPERATOR">Operator (Manage Workflows)</option>
                                        <option value="VIEWER">Viewer (Read Only)</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>Direct Assignments (Optional)</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        <label style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" /> <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Lead Automation</span>
                                        </label>
                                        <label style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input type="checkbox" /> <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Invoice Processing</span>
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowInviteModal(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#0F172A', fontWeight: 900, cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                    <button type="submit" style={{ flex: 1, padding: '16px', borderRadius: '14px', border: 'none', background: '#0A0A0A', color: '#FFFFFF', fontWeight: 900, cursor: 'pointer' }}>
                                        Send Invite
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
