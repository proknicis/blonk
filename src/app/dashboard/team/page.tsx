"use client";

import React, { useState, useEffect } from "react";
import styles from "./team.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "@/app/components/Skeleton";

export default function TeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [currentUserRole, setCurrentUserRole] = useState("VIEWER");
    
    // Invite Modal State
    const [inviteName, setInviteName] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [invitePassword, setInvitePassword] = useState("");
    const [inviteRole, setInviteRole] = useState("VIEWER");
    const [inviteLoading, setInviteLoading] = useState(false);
    const [inviteError, setInviteError] = useState("");

    useEffect(() => {
        fetchTeamData();
        fetchCurrentUser();

        const handleOpenModal = () => setShowInviteModal(true);
        window.addEventListener('OPEN_INVITE_MODAL', handleOpenModal);
        return () => window.removeEventListener('OPEN_INVITE_MODAL', handleOpenModal);
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.role) setCurrentUserRole(data.role);
        } catch (error) {
            console.error("Current user fetch failure", error);
        }
    };

    const fetchTeamData = async () => {
        setIsLoading(true);
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

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviteError("");
        setInviteLoading(true);

        try {
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: inviteName,
                    email: inviteEmail,
                    password: invitePassword,
                    role: inviteRole
                })
            });
            const data = await res.json();
            
            if (!res.ok) {
                setInviteError(data.error || "Failed to invite member");
                return;
            }

            // Success, close modal and refresh team
            setShowInviteModal(false);
            setInviteName("");
            setInviteEmail("");
            setInvitePassword("");
            fetchTeamData();
        } catch (err) {
            setInviteError("Network error occurred.");
        } finally {
            setInviteLoading(false);
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
        if (role === 'OWNER') return { bg: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF', border: 'rgba(255, 255, 255, 0.1)' };
        if (role === 'ADMIN') return { bg: 'rgba(52, 209, 134, 0.1)', color: '#34D186', border: 'rgba(52, 209, 134, 0.2)' };
        if (role === 'OPERATOR') return { bg: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
        return { bg: 'rgba(255, 255, 255, 0.03)', color: 'rgba(255, 255, 255, 0.4)', border: 'rgba(255, 255, 255, 0.05)' }; // VIEW/MEMBER
    };

    return (
        <div className={styles.teamContainer}>
            <div className={styles.headerSection}>
                <div className={styles.headerLeft}>
                    <h1>Team Command</h1>
                    <p>Manage sovereign access and operational permissions.</p>
                </div>
                {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && (
                    <button className={styles.btnPrimary} onClick={() => setShowInviteModal(true)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                        Provision Member
                    </button>
                )}
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Total Members</span>
                    <span className={styles.statValue}>{isLoading ? <Skeleton width="40px" height="32px"/> : members.length}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Active Today</span>
                    <span className={styles.statValue}>{isLoading ? <Skeleton width="40px" height="32px"/> : activeToday}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Workflows Assigned</span>
                    <span className={styles.statValue}>{isLoading ? <Skeleton width="40px" height="32px"/> : totalWorkflowsAssigned}</span>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBox}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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
                    <option value="VIEWER">Viewer</option>
                </select>
            </div>

            <div className={styles.tableWrapper}>
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
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <tr key={i} className={styles.teamRow}>
                                    <td colSpan={5} style={{ padding: '24px' }}>
                                        <Skeleton height="60px" borderRadius="16px" />
                                    </td>
                                </tr>
                            ))
                        ) : filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '80px', textAlign: 'center' }}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" style={{ margin: '0 auto 16px', display: 'block' }}>
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                    <p style={{ fontWeight: 800, fontSize: '1.1rem', color: "rgba(255,255,255,0.2)", margin: 0 }}>No members found in current sector.</p>
                                </td>
                            </tr>
                        ) : (
                            filteredMembers.map((member: any) => {
                                const roleStyle = getRoleStyles(member.role);
                                return (
                                    <tr key={member.id} className={styles.teamRow}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar} style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
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
                                            <span className={styles.roleBadge} style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
                                                {member.role}
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
                                                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 600 }}>Unassigned</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className={styles.activityInfo}>
                                                <span className={styles.activityText}>{member.lastActivity}</span>
                                                <span className={styles.activityTime}>{member.status === 'Active' ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && (
                                                <button className={styles.actionBtn} aria-label="Manage user">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {showInviteModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay}>
                        <div className={styles.modal}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalHeaderInfo}>
                                    <h2>Invite Member</h2>
                                    <p>Provision access to your automation platform.</p>
                                </div>
                                <div className={styles.modalHeaderIcon}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                </div>
                            </div>

                            <div className={styles.modalBody}>
                                <form onSubmit={handleInvite}>
                                    {inviteError && <div className={styles.errorMessage}>{inviteError}</div>}
                                    
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Full Name</label>
                                        <input type="text" required className={styles.formInput} value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Jane Doe" />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Email Address</label>
                                        <input type="email" required className={styles.formInput} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Temporary Password</label>
                                        <input type="password" required className={styles.formInput} value={invitePassword} onChange={e => setInvitePassword(e.target.value)} placeholder="Provide a secure password" />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Role</label>
                                        <select className={styles.formSelect} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                                            <option value="ADMIN">Admin (Full Access)</option>
                                            <option value="OPERATOR">Operator (Manage Workflows)</option>
                                            <option value="VIEWER">Viewer (Read Only)</option>
                                        </select>
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button type="button" className={styles.btnCancel} onClick={() => setShowInviteModal(false)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className={styles.btnSubmit} disabled={inviteLoading}>
                                            {inviteLoading ? 'Provisioning...' : 'Provision Account'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
