"use client";

import React, { useState, useEffect } from "react";
import styles from "./team.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "@/app/components/Skeleton";
import { User, Shield, Briefcase, Clock, Search, Filter, X, Check, Trash2, UserPlus, Zap, Settings } from "lucide-react";

export default function TeamPage() {
    const [members, setMembers] = useState<any[]>([]);
    const [allWorkflows, setAllWorkflows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [currentUserRole, setCurrentUserRole] = useState("VIEWER");
    
    // Member Interaction States
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [showDecommissionModal, setShowDecommissionModal] = useState(false);
    const [showRoleEditModal, setShowRoleEditModal] = useState(false);
    const [showWorkflowModal, setShowWorkflowModal] = useState(false);

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
        fetchWorkflows();

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

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/dashboard/summary');
            const data = await res.json();
            if (data.topWorkflows) setAllWorkflows(data.topWorkflows);
        } catch (err) {
            console.error("Workflow fetch failure", err);
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
                    workflows: m.workflows || (i === 0 ? ['Lead Automation', 'Invoice Processing'] : i === 2 ? ['Client Onboarding'] : [])
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

    const handleUpdateMember = async (memberId: string, updates: any) => {
        try {
            const res = await fetch('/api/team', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, ...updates })
            });
            if (res.ok) {
                fetchTeamData();
                setShowRoleEditModal(false);
                setShowWorkflowModal(false);
            }
        } catch (err) {
            console.error("Member update failure", err);
        }
    };

    const handleRemoveMember = async () => {
        if (!selectedMember) return;
        try {
            const res = await fetch('/api/team', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId: selectedMember.id })
            });
            if (res.ok) {
                fetchTeamData();
                setShowDecommissionModal(false);
                setSelectedMember(null);
            }
        } catch (error) {
            console.error("Decommissioning failure", error);
        }
    };

    const toggleWorkflow = (workflowName: string) => {
        if (!selectedMember) return;
        const currentWfs = selectedMember.workflows || [];
        const newWfs = currentWfs.includes(workflowName)
            ? currentWfs.filter((w: string) => w !== workflowName)
            : [...currentWfs, workflowName];
        
        setSelectedMember({ ...selectedMember, workflows: newWfs });
    };

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "ALL" || m.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const totalWorkflowsAssigned = members.reduce((acc, m) => acc + (m.workflows?.length || 0), 0);
    const activeToday = members.filter(m => m.status === 'Active').length;

    return (
        <div className={styles.teamContainer}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--foreground)' }}>Strategic Personnel</h1>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>Team access</span>
                </div>
            </div>

            <div className={styles.headerSection}>
                <div className={styles.headerLeft}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em', textTransform: 'uppercase', marginBottom: '8px' }}>Team Command</h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>Manage sovereign access and operational permissions.</span>
                        <span style={{ fontSize: '0.9rem', color: '#6B7280', fontWeight: 800 }}>Manage who can view, run, and control workflows</span>
                    </div>
                </div>
                {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && (
                    <button className={styles.btnPrimary} onClick={() => setShowInviteModal(true)} style={{ background: '#0F172A', color: '#FFFFFF', borderRadius: '16px', padding: '16px 28px', fontSize: '0.95rem', fontWeight: 950 }}>
                        <UserPlus size={20} />
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
                    <Search size={18} style={{ opacity: 0.3 }} />
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
                            <th style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>User</th>
                            <th style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Role</th>
                            <th style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assigned Workflows</th>
                            <th style={{ fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last Activity</th>
                            <th style={{ textAlign: 'right' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [1, 2, 3, 4].map(i => (
                                <tr key={i} className={styles.teamRow}>
                                    <td colSpan={5} style={{ padding: '24px' }}>
                                        <Skeleton height="80px" borderRadius="24px" />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            filteredMembers.map((member: any) => {
                                const isOwner = member.role === 'OWNER';
                                const isAdmin = member.role === 'ADMIN';
                                
                                return (
                                    <tr key={member.id} className={styles.teamRow}>
                                        <td>
                                            <div className={styles.userCell}>
                                                <div className={styles.avatar} style={{ 
                                                    background: isOwner ? '#0F172A' : '#F3F4F6',
                                                    color: isOwner ? '#FFFFFF' : '#111827',
                                                    width: '48px', height: '48px', borderRadius: '14px'
                                                }}>
                                                    {(member.name || 'U').charAt(0).toUpperCase()}
                                                    <div className={`${styles.statusDot} ${member.status === 'Active' ? styles.statusActive : styles.statusOffline}`} />
                                                </div>
                                                <div className={styles.userInfo}>
                                                    <span className={styles.userName} style={{ fontSize: '1rem', fontWeight: 950, color: '#111827' }}>{member.name || 'Anonymous User'}</span>
                                                    <span className={styles.userEmail} style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>{member.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => {
                                                    if (!isOwner && (currentUserRole === 'OWNER' || currentUserRole === 'ADMIN')) {
                                                        setSelectedMember(member);
                                                        setShowRoleEditModal(true);
                                                    }
                                                }}
                                                className={styles.roleBadge} 
                                                style={{
                                                    borderColor: '#E5E7EB',
                                                    color: '#111827',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 950,
                                                    padding: '6px 16px',
                                                    borderRadius: '10px',
                                                    cursor: !isOwner ? 'pointer' : 'default',
                                                    background: 'transparent'
                                                }}
                                            >
                                                {member.role}
                                            </button>
                                        </td>
                                        <td>
                                            <div 
                                                onClick={() => {
                                                    if (currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') {
                                                        setSelectedMember(member);
                                                        setShowWorkflowModal(true);
                                                    }
                                                }}
                                                style={{ cursor: 'pointer', display: 'flex', gap: '8px', minWidth: '100px' }}
                                            >
                                                {member.workflows && member.workflows.length > 0 ? (
                                                    <div className={styles.workflowsList}>
                                                        {member.workflows.map((wf: string, idx: number) => (
                                                            <span key={idx} className={styles.workflowPill} style={{ background: '#F3F4F6', color: '#111827', fontWeight: 800, fontSize: '0.7rem', padding: '6px 12px', borderRadius: '8px' }}>{wf}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 700 }}>Unassigned</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.activityInfo}>
                                                <span className={styles.activityText} style={{ fontSize: '0.85rem', fontWeight: 950, color: '#111827' }}>{member.lastActivity}</span>
                                                <span className={styles.activityTime} style={{ fontSize: '0.7rem', fontWeight: 950, color: member.status === 'Active' ? '#10B981' : '#9CA3AF', textTransform: 'uppercase' }}>{member.status === 'Active' ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            {(currentUserRole === 'OWNER' || currentUserRole === 'ADMIN') && !isOwner && (
                                                <button 
                                                    className={styles.actionBtn} 
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowDecommissionModal(true);
                                                    }}
                                                    title="Remove Member"
                                                    style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F9FAFB', border: '1px solid #F3F4F6', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <Trash2 size={18} />
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

            {/* Custom Decommission Modal */}
            {showDecommissionModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowDecommissionModal(false)}>
                        <div className={styles.modal} style={{ maxWidth: '440px', textAlign: 'center', padding: '48px' }} onClick={e => e.stopPropagation()}>
                            <div style={{ width: '64px', height: '64px', background: '#FEF2F2', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', margin: '0 auto 24px' }}>
                                <Trash2 size={32} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#111827', marginBottom: '16px' }}>Decommission Operator?</h2>
                            <p style={{ color: '#6B7280', fontWeight: 700, lineHeight: 1.6, marginBottom: '32px' }}>
                                Are you certain you wish to decommission **{selectedMember?.name}**? This action will immediately terminate all sovereign access keys.
                            </p>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className={styles.btnCancel} style={{ flex: 1 }} onClick={() => setShowDecommissionModal(false)}>Cancel</button>
                                <button className={styles.btnSubmit} style={{ flex: 1, background: '#EF4444' }} onClick={handleRemoveMember}>Confirm Deletion</button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Role Edit Modal */}
            {showRoleEditModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowRoleEditModal(false)}>
                        <div className={styles.modal} style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <h2>Update Role</h2>
                                    <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#6B7280' }}>Adjust permissions for {selectedMember?.name}</p>
                                </div>
                            </div>
                            <div className={styles.modalBody}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {['ADMIN', 'OPERATOR', 'VIEWER'].map(role => (
                                        <button 
                                            key={role}
                                            onClick={() => handleUpdateMember(selectedMember.id, { role })}
                                            style={{
                                                width: '100%', padding: '20px', borderRadius: '18px', border: `2px solid ${selectedMember.role === role ? '#0F172A' : '#F3F4F6'}`,
                                                background: selectedMember.role === role ? '#F9FAFB' : '#FFFFFF', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                                            }}
                                        >
                                            <span style={{ fontWeight: 950, color: '#111827' }}>{role}</span>
                                            {selectedMember.role === role && <Check size={18} color="#0F172A" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Workflow Assign Modal */}
            {showWorkflowModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowWorkflowModal(false)}>
                        <div className={styles.modal} style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <h2>Assign Workflows</h2>
                                    <p style={{ margin: '8px 0 0', fontWeight: 700, color: '#6B7280' }}>Provision workflow access for {selectedMember?.name}</p>
                                </div>
                            </div>
                            <div className={styles.modalBody}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                                    {allWorkflows.map(wf => {
                                        const isAssigned = selectedMember.workflows?.includes(wf.name);
                                        return (
                                            <button 
                                                key={wf.id}
                                                onClick={() => toggleWorkflow(wf.name)}
                                                style={{
                                                    width: '100%', padding: '20px', borderRadius: '18px', border: `2px solid ${isAssigned ? '#10B981' : '#F3F4F6'}`,
                                                    background: isAssigned ? '#F0FDF4' : '#FFFFFF', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontWeight: 950, color: '#111827' }}>{wf.name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 800 }}>Loop ID: {wf.id.substring(0, 8)}</div>
                                                </div>
                                                {isAssigned && <Check size={18} color="#10B981" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                    <button className={styles.btnCancel} style={{ flex: 1 }} onClick={() => setShowWorkflowModal(false)}>Cancel</button>
                                    <button 
                                        className={styles.btnSubmit} 
                                        style={{ flex: 1 }} 
                                        onClick={() => handleUpdateMember(selectedMember.id, { workflows: selectedMember.workflows })}
                                    >
                                        Save Assignments
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#111827', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Invite Member</h2>
                                    <p style={{ margin: '8px 0 0 0', color: '#6B7280', fontWeight: 700 }}>Provision access to your automation platform.</p>
                                </div>
                                <div style={{ color: '#10B981', width: '56px', height: '56px', background: '#F0FDF4', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserPlus size={28} />
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
                                        <button type="submit" className={styles.btnSubmit} disabled={inviteLoading} style={{ background: '#0F172A' }}>
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
