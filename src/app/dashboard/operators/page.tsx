"use client";

import React, { useState, useEffect } from "react";
import styles from "./team.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "@/app/components/Skeleton";
import { 
    User, Shield, Briefcase, Clock, Search, Filter, X, Check, 
    Trash2, UserPlus, Zap, Settings, Link2, ShieldCheck, 
    ChevronRight, MoreHorizontal, MessageSquare, Play, Globe,
    Activity, Users, Workflow, Mail, Info, MousePointer2,
    TrendingUp, TrendingDown, ArrowUpRight
} from "lucide-react";
import Link from "next/link";

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

    const [activity, setActivity] = useState<any[]>([]);
    const [noTeam, setNoTeam] = useState(false);
    const [creationLoading, setCreationLoading] = useState(false);
    const [creationFirm, setCreationFirm] = useState("");
    const [creationNode, setCreationNode] = useState("");

    useEffect(() => {
        fetchTeamData();
        fetchCurrentUser();
        fetchWorkflows();
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

    const formatTimeAgo = (dateStr: string) => {
        if (!dateStr) return "Never";
        const date = new Date(dateStr);
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const isOnline = (dateStr: string) => {
        if (!dateStr) return false;
        const date = new Date(dateStr);
        const diff = (new Date().getTime() - date.getTime()) / 1000;
        return diff < 300; 
    };

    const fetchTeamData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/team');
            if (res.status === 400) {
                setNoTeam(true);
                setIsLoading(false);
                return;
            }
            const data = await res.json();
            if (data.members) {
                setNoTeam(false);
                const enriched = data.members.map((m: any) => ({
                    ...m,
                    status: isOnline(m.lastSeen) ? 'Active' : (m.lastSeen ? 'Offline' : 'Invited'),
                    lastActivity: m.lastActivity || 'System idle',
                    lastSeenFormatted: formatTimeAgo(m.lastSeen)
                }));
                enriched.sort((a: any, b: any) => a.role === 'OWNER' ? -1 : b.role === 'OWNER' ? 1 : 0);
                setMembers(enriched);
            }
            if (data.activity) {
                setActivity(data.activity);
            }
        } catch (error) {
            console.error("Team fetch failure", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreationLoading(true);
        try {
            const res = await fetch('/api/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'CREATE_TEAM',
                    firmName: creationFirm,
                    teamName: creationNode
                })
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (err) {
            console.error("Team creation failure", err);
        } finally {
            setCreationLoading(false);
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
    const owner = members.find(m => m.role === 'OWNER');

    if (noTeam) {
        return (
            <div className={styles.onboardingGate}>
                <div className={styles.onboardingCard}>
                    <div className={styles.onboardingIconBox}>
                        <Zap size={44} />
                    </div>
                    <h1 className={styles.onboardingTitle}>Initialize Command Node</h1>
                    <p className={styles.onboardingText}>
                        Establish your Institutional Firm before provisioning personnel access.
                    </p>
                    <form onSubmit={handleCreateTeam} className={styles.onboardingForm}>
                        <div className={styles.onboardingField}>
                            <label>Firm Identity</label>
                            <input type="text" className={styles.onboardingInput} placeholder="e.g. Blackwood Capital Global" required value={creationFirm} onChange={e => setCreationFirm(e.target.value)} />
                        </div>
                        <div className={styles.onboardingField}>
                            <label>Command Node Name</label>
                            <input type="text" className={styles.onboardingInput} placeholder="e.g. Primary Operations Hub" required value={creationNode} onChange={e => setCreationNode(e.target.value)} />
                        </div>
                        <button type="submit" className={styles.onboardingSubmit} disabled={creationLoading}>
                            {creationLoading ? 'Establishing Node...' : 'Initialize Firm & Team'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const pendingInvites = members.filter(m => m.status === 'Invited').length;

    return (
        <div className={styles.teamContainer}>
            {/* HEADER */}
            <div className={styles.headerSection}>
                <div className={styles.headerLeft}>
                    <h1>Operators</h1>
                    <p>Manage personnel, roles, and access control across your autonomous firm.</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={18} /> Invite Operator
                </button>
            </div>

            {/* METRICS */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#ECFDF5', color: '#10B981' }}><Users size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{members.length}</span>
                        <span className={styles.statLabel}>Total Operators</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#EFF6FF', color: '#3B82F6' }}><Activity size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{activeToday}</span>
                        <span className={styles.statLabel}>Active Today</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#FEF3C7', color: '#F59E0B' }}><Workflow size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{totalWorkflowsAssigned}</span>
                        <span className={styles.statLabel}>Assigned Workflows</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#F3E8FF', color: '#8B5CF6' }}><Mail size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{pendingInvites}</span>
                        <span className={styles.statLabel}>Pending Invites</span>
                    </div>
                </div>
            </div>

            {/* OWNER CARD */}
            {owner && (
                <div className={styles.ownerCard}>
                    <div className={styles.ownerLeft}>
                        <div className={styles.ownerAvatar}>
                            <ShieldCheck size={32} color="#10B981" />
                        </div>
                        <div className={styles.ownerInfo}>
                            <div className={styles.ownerNameRow}>
                                <span className={styles.ownerName}>{owner.name}</span>
                                <div className={styles.ownerBadge}>OWNER</div>
                            </div>
                            <span className={styles.ownerEmail}>{owner.email}</span>
                            <div className={styles.ownerMeta}>
                                <span className={styles.ownerMetaItem}><Clock size={14} /> Last active {owner.lastSeenFormatted || 'recently'}</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.accessPanel}>
                        <span className={styles.accessLabel}>Full System Access</span>
                        <div className={styles.accessChips}>
                            <div className={styles.accessChip}><Zap size={14} /> All Workflows</div>
                            <div className={styles.accessChip}><Users size={14} /> Team Management</div>
                            <div className={styles.accessChip}><Settings size={14} /> Security Settings</div>
                            <div className={styles.accessChip}><Globe size={14} /> Marketplace</div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT + SIDEBAR */}
            <div className={styles.mainLayout}>
                <div className={styles.contentArea}>
                    {/* FILTERS */}
                    <div className={styles.filtersBar}>
                        <div className={styles.searchBox}>
                            <Search size={18} color="#94A3B8" />
                            <input type="text" placeholder="Search operators..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className={styles.filterGroup}>
                            <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                                <option value="ALL">All Roles</option>
                                <option value="ADMIN">Admin</option>
                                <option value="EDITOR">Editor</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                            <button className={styles.clearFilters} onClick={() => { setSearch(""); setRoleFilter("ALL"); }}>
                                <X size={16} /> Reset
                            </button>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className={styles.tableContainer}>
                        <table className={styles.teamTable}>
                            <thead>
                                <tr>
                                    <th>Operator</th>
                                    <th>Role</th>
                                    <th>Workflows</th>
                                    <th>Status</th>
                                    <th>Last Active</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.filter(m => m.role !== 'OWNER').map((member, idx) => {
                                    const roleColors: any = {
                                        'ADMIN': '#3B82F6',
                                        'EDITOR': '#8B5CF6',
                                        'VIEWER': '#10B981',
                                        'PAUSED': '#64748B'
                                    };
                                    const color = roleColors[member.role] || '#64748B';
                                    const statusColor = member.status === 'Active' ? '#10B981' : (member.status === 'Invited' ? '#F59E0B' : '#94A3B8');

                                    return (
                                        <tr key={member.id} className={styles.memberRow}>
                                            <td>
                                                <div className={styles.memberCell}>
                                                    <div className={styles.memberAvatar} style={{ background: `${color}15`, color: color }}>
                                                        {member.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                    <div className={styles.memberDetails}>
                                                        <span className={styles.memberName}>{member.name}</span>
                                                        <span className={styles.memberEmail}>{member.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    className={styles.roleButton}
                                                    style={{ background: `${color}15`, color: color }}
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowRoleEditModal(true);
                                                    }}
                                                >
                                                    {member.role}
                                                </button>
                                            </td>
                                            <td>
                                                <div
                                                    className={styles.workflowCount}
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowWorkflowModal(true);
                                                    }}
                                                >
                                                    {member.workflows?.length || 0}
                                                    <ChevronRight size={12} color="#94A3B8" />
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.statusBadge} style={{ color: statusColor, background: `${statusColor}15` }}>
                                                    <div className={styles.statusDot} style={{ background: statusColor }} />
                                                    {member.status}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.lastActive}>{member.lastSeenFormatted}</span>
                                            </td>
                                            <td>
                                                <button
                                                    className={styles.actionBtn}
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowRoleEditModal(true);
                                                    }}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredMembers.filter(m => m.role !== 'OWNER').length === 0 && (
                            <div className={styles.emptyTable}>
                                <Users size={48} color="#94A3B8" />
                                <p>No operators found matching your filters</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className={styles.sidebar}>
                    {/* PERMISSIONS GUIDE */}
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarHeader}>
                            <h3 className={styles.sidebarTitle}>Role Permissions</h3>
                            <span className={styles.sidebarSubtitle}>Access levels by role</span>
                        </div>
                        <div className={styles.permissionList}>
                            {[
                                { role: 'Admin', desc: 'Full team & workflow management', color: '#3B82F6', icon: Shield },
                                { role: 'Editor', desc: 'Create and edit workflows', color: '#8B5CF6', icon: Workflow },
                                { role: 'Viewer', desc: 'View and run workflows only', color: '#10B981', icon: Activity }
                            ].map(p => (
                                <div key={p.role} className={styles.permissionItem}>
                                    <div className={styles.roleIconBox} style={{ background: `${p.color}15`, color: p.color }}>
                                        <p.icon size={16} />
                                    </div>
                                    <div className={styles.permissionInfo}>
                                        <span className={styles.roleTitle}>{p.role}</span>
                                        <span className={styles.roleDesc}>{p.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TEAM ACTIVITY */}
                    <div className={styles.sidebarCard}>
                        <div className={styles.sidebarHeader}>
                            <h3 className={styles.sidebarTitle}>Recent Activity</h3>
                            <span className={styles.sidebarSubtitle}>Latest team actions</span>
                        </div>
                        <div className={styles.activityList}>
                            {activity.length > 0 ? activity.slice(0, 5).map((a, i) => {
                                const eventColors: any = {
                                    'login': '#10B981',
                                    'workflow_start': '#3B82F6',
                                    'role_change': '#8B5CF6',
                                    'admin_change': '#F97316'
                                };
                                const Icon = a.eventType === 'workflow_start' ? Play : (a.eventType === 'login' ? User : Settings);
                                const color = eventColors[a.eventType] || '#64748B';

                                return (
                                    <div key={i} className={styles.activityItem}>
                                        <div className={styles.activityIconBox} style={{ background: `${color}15`, color: color }}>
                                            <Icon size={14} />
                                        </div>
                                        <div className={styles.activityContent}>
                                            <span className={styles.activityAction}>
                                                <span className={styles.activityUser}>{a.userName}</span>
                                                {' '}{a.eventType.replace('_', ' ')}
                                            </span>
                                            <span className={styles.activityTime}>{formatTimeAgo(a.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className={styles.emptyActivity}>
                                    <Info size={32} color="#94A3B8" />
                                    <span>No recent activity</span>
                                </div>
                            )}
                        </div>
                        <Link href="/dashboard/audit" className={styles.sidebarLink}>
                            View all activity <ChevronRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showInviteModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalIconWrapper}>
                                    <UserPlus size={24} color="#10B981" />
                                </div>
                                <div>
                                    <h2 className={styles.modalTitle}>Invite Operator</h2>
                                    <p className={styles.modalSubtitle}>Add a new team member with specific access permissions</p>
                                </div>
                            </div>
                            <form onSubmit={handleInvite}>
                                {inviteError && <div className={styles.errorMessage}>{inviteError}</div>}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Full Name</label>
                                    <input type="text" required className={styles.formInput} placeholder="John Doe" value={inviteName} onChange={e => setInviteName(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Email Address</label>
                                    <input type="email" required className={styles.formInput} placeholder="john@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Temporary Password</label>
                                    <input type="password" required className={styles.formInput} placeholder="••••••••" value={invitePassword} onChange={e => setInvitePassword(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Role</label>
                                    <div className={styles.roleSelector}>
                                        {[
                                            { value: 'ADMIN', label: 'Admin', desc: 'Full management access', color: '#3B82F6' },
                                            { value: 'EDITOR', label: 'Editor', desc: 'Create & edit workflows', color: '#8B5CF6' },
                                            { value: 'VIEWER', label: 'Viewer', desc: 'View & run only', color: '#10B981' }
                                        ].map(r => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                className={styles.roleOption}
                                                style={{ borderColor: inviteRole === r.value ? r.color : '#E2E8F0', background: inviteRole === r.value ? `${r.color}15` : '#FFFFFF' }}
                                                onClick={() => setInviteRole(r.value)}
                                            >
                                                <div className={styles.roleOptionIcon} style={{ color: r.color }}>
                                                    {inviteRole === r.value && <Check size={18} />}
                                                </div>
                                                <div>
                                                    <span className={styles.roleOptionLabel}>{r.label}</span>
                                                    <span className={styles.roleOptionDesc}>{r.desc}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.btnCancel} onClick={() => setShowInviteModal(false)}>Cancel</button>
                                    <button type="submit" className={styles.btnPrimary} disabled={inviteLoading}>{inviteLoading ? 'Inviting...' : 'Send Invite'}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* ROLE EDIT MODAL */}
            {showRoleEditModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowRoleEditModal(false)}>
                        <div className={styles.modal} style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <div className={styles.modalIconWrapper} style={{ background: '#EFF6FF' }}>
                                    <Shield size={24} color="#3B82F6" />
                                </div>
                                <div>
                                    <h2 className={styles.modalTitle}>Update Role</h2>
                                    <p className={styles.modalSubtitle}>Adjust permissions for {selectedMember?.name}</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { value: 'ADMIN', label: 'Admin', desc: 'Full management access', color: '#3B82F6' },
                                    { value: 'EDITOR', label: 'Editor', desc: 'Create & edit workflows', color: '#8B5CF6' },
                                    { value: 'VIEWER', label: 'Viewer', desc: 'View & run only', color: '#10B981' },
                                    { value: 'PAUSED', label: 'Paused', desc: 'No access', color: '#64748B' }
                                ].map(r => (
                                    <button
                                        key={r.value}
                                        onClick={() => handleUpdateMember(selectedMember.id, { role: r.value })}
                                        className={styles.roleOption}
                                        style={{ borderColor: selectedMember.role === r.value ? r.color : '#E2E8F0', background: selectedMember.role === r.value ? `${r.color}15` : '#FFFFFF' }}
                                    >
                                        <div className={styles.roleOptionIcon} style={{ color: r.color }}>
                                            {selectedMember.role === r.value && <Check size={18} />}
                                        </div>
                                        <div>
                                            <span className={styles.roleOptionLabel}>{r.label}</span>
                                            <span className={styles.roleOptionDesc}>{r.desc}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className={styles.modalActions}>
                                <button className={styles.btnCancel} onClick={() => setShowRoleEditModal(false)}>Cancel</button>
                                <button className={styles.btnDanger} onClick={() => setShowDecommissionModal(true)}>Decommission</button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* DECOMMISSION MODAL */}
            {showDecommissionModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowDecommissionModal(false)}>
                        <div className={styles.modal} style={{ maxWidth: '440px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            <div className={styles.dangerIconWrapper}>
                                <Trash2 size={32} color="#EF4444" />
                            </div>
                            <h2 className={styles.modalTitle} style={{ textAlign: 'center' }}>Decommission Operator?</h2>
                            <p className={styles.modalSubtitle} style={{ textAlign: 'center' }}>
                                Are you certain you wish to decommission <strong>{selectedMember?.name}</strong>? This action will immediately terminate all access and cannot be undone.
                            </p>
                            <div className={styles.modalActions}>
                                <button className={styles.btnCancel} onClick={() => setShowDecommissionModal(false)}>Cancel</button>
                                <button className={styles.btnDanger} onClick={handleRemoveMember}>Confirm Decommission</button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
