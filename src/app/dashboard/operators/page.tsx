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
                    <h1>Team Command</h1>
                    <p>Manage people, roles, and access. Control who can view, run, and edit workflows.</p>
                </div>
                <button className={styles.btnHeader} onClick={() => setShowInviteModal(true)}>
                    <UserPlus size={18} /> Provision Member
                </button>
            </div>

            {/* METRICS */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#F0FAF5', color: '#34D186' }}><Users size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{members.length}</span>
                        <span className={styles.statLabel}>Total Members</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#F0F9FF', color: '#0EA5E9' }}><Activity size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{activeToday}</span>
                        <span className={styles.statLabel}>Active Today</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#FFF7ED', color: '#F97316' }}><Workflow size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{totalWorkflowsAssigned}</span>
                        <span className={styles.statLabel}>Workflows Assigned</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIconBox} style={{ background: '#F5F3FF', color: '#8B5CF6' }}><Shield size={24} /></div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{pendingInvites}</span>
                        <span className={styles.statLabel}>Pending Invites</span>
                    </div>
                </div>
            </div>

            {/* OWNER CARD */}
            {owner && (
                <div className={styles.ownerCard}>
                    <div className={styles.ownerInfo}>
                        <div className={styles.ownerAvatar}>{owner.name?.charAt(0)}</div>
                        <div className={styles.ownerDetails}>
                            <span className={styles.ownerName}>{owner.name}</span>
                            <span className={styles.ownerEmail}>{owner.email}</span>
                        </div>
                        <div className={styles.ownerBadge}>OWNER</div>
                    </div>
                    <div className={styles.accessPanel}>
                        <span className={styles.accessLabel}>Full Access To</span>
                        <div className={styles.accessChips}>
                            <div className={styles.accessChip}>All Workflows</div>
                            <div className={styles.accessChip}>Team & Billing</div>
                            <div className={styles.accessChip}>Security & Settings</div>
                            <div className={styles.accessChip}>Marketplace</div>
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
                            <input type="text" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className={styles.filterSelect} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                            <option value="ALL">All Roles</option>
                            <option value="OWNER">Owner</option>
                            <option value="ADMIN">Admin</option>
                            <option value="EDITOR">Editor</option>
                            <option value="VIEWER">Viewer</option>
                        </select>
                        <select className={styles.filterSelect}><option>All Status</option></select>
                        <select className={styles.filterSelect}><option>All Access</option></select>
                        <button className={styles.clearFilters} onClick={() => { setSearch(""); setRoleFilter("ALL"); }}>
                            <X size={16} /> Clear filters
                        </button>
                    </div>

                    {/* TABLE */}
                    <div className={styles.tableContainer}>
                        <table className={styles.teamTable}>
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    <th>Role</th>
                                    <th>Assigned Workflows</th>
                                    <th>Access Level</th>
                                    <th>Last Active</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.filter(m => m.role !== 'OWNER').map((member, idx) => {
                                    const colors = ['#3B82F6', '#8B5CF6', '#F97316', '#10B981'];
                                    const roleColors: any = {
                                        'ADMIN': '#3B82F6',
                                        'EDITOR': '#8B5CF6',
                                        'VIEWER': '#10B981',
                                        'PAUSED': '#64748B'
                                    };
                                    const color = roleColors[member.role] || colors[idx % 4];

                                    return (
                                        <tr key={member.id} className={styles.memberRow}>
                                            <td>
                                                <div className={styles.memberCell}>
                                                    <div className={styles.memberAvatar} style={{ background: `${color}15`, color: color }}>
                                                        {member.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <span className={styles.memberName}>{member.name}</span>
                                                        <span className={styles.memberEmail}>{member.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div 
                                                    className={styles.rolePill} 
                                                    style={{ background: `${color}15`, color: color, cursor: 'pointer' }}
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowRoleEditModal(true);
                                                    }}
                                                >
                                                    {member.role}
                                                </div>
                                            </td>
                                            <td style={{ cursor: 'pointer' }} onClick={() => {
                                                setSelectedMember(member);
                                                setShowWorkflowModal(true);
                                            }}>
                                                <div className={styles.assignedCountWrapper}>
                                                    <span className={styles.assignedCount}>{member.workflows?.length || 0}</span>
                                                    <ChevronRight size={12} color="#94A3B8" />
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.accessIcons}>
                                                    <span title="Can run workflows"><Play size={14} /></span>
                                                    <span title="Can link systems"><Link2 size={14} /></span>
                                                    <span title="Can edit settings"><Settings size={14} /></span>
                                                    <div style={{ color: member.role === 'PAUSED' ? '#EF4444' : '#E2E8F0' }}>
                                                        {member.role === 'PAUSED' ? <span title="Account Paused"><Trash2 size={14} /></span> : <span title="Security Verified"><Shield size={14} /></span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={styles.lastActiveText}>{member.lastSeenFormatted}</span></td>
                                            <td>
                                                <div className={styles.statusPill} style={{ color: member.status === 'Active' ? '#10B981' : (member.status === 'Invited' ? '#F97316' : '#94A3B8') }}>
                                                    <div className={styles.statusDot} style={{ background: member.status === 'Active' ? '#10B981' : (member.status === 'Invited' ? '#F97316' : '#94A3B8') }} />
                                                    {member.status}
                                                </div>
                                            </td>
                                            <td>
                                                <button className={styles.actionBtn} onClick={() => {
                                                    setSelectedMember(member);
                                                    setShowRoleEditModal(true);
                                                }}>
                                                    {member.status === 'Invited' ? <Trash2 size={16} color="#EF4444" /> : <MoreHorizontal size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className={styles.sidebar}>
                    {/* PERMISSIONS GUIDE */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>Role Permissions Guide</h3>
                        <span className={styles.sidebarSubtitle}>What each role can do</span>
                        <div className={styles.permissionList}>
                            {[
                                { role: 'Owner', desc: 'Full access to everything', color: '#10B981' },
                                { role: 'Admin', desc: 'Manage team, workflows and settings', color: '#3B82F6' },
                                { role: 'Editor', desc: 'Create and edit workflows', color: '#8B5CF6' },
                                { role: 'Viewer', desc: 'View and run workflows', color: '#64748B' },
                                { role: 'Paused', desc: 'No access while paused', color: '#64748B' }
                            ].map(p => (
                                <div key={p.role} className={styles.permissionItem}>
                                    <div className={styles.roleIconBox} style={{ background: `${p.color}15`, color: p.color }}>
                                        {p.role === 'Owner' ? <Shield size={14} /> : (p.role === 'Paused' ? <Clock size={14} /> : <User size={14} />)}
                                    </div>
                                    <div>
                                        <span className={styles.roleTitle}>{p.role}</span>
                                        <span className={styles.roleDesc}>{p.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.sidebarFooter}>
                            <Link href="#" className={styles.footerLink}>Manage roles</Link>
                            <ChevronRight size={14} color="#0F172A" />
                        </div>
                    </div>

                    {/* TEAM ACTIVITY */}
                    <div className={styles.sidebarCard}>
                        <h3 className={styles.sidebarTitle}>Team Activity</h3>
                        <span className={styles.sidebarSubtitle}>Recent team actions</span>
                        <div className={styles.activityList}>
                            {activity.length > 0 ? activity.map((a, i) => {
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
                                                {a.eventType.replace('_', ' ')}
                                            </span>
                                            {a.metadata?.target && <span className={styles.activityTarget}>{a.metadata.target}</span>}
                                            <span className={styles.activityTime}>{formatTimeAgo(a.createdAt)}</span>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8', fontSize: '0.85rem', fontWeight: 700 }}>
                                    No recent activity
                                </div>
                            )}
                        </div>
                        <div className={styles.sidebarFooter}>
                            <Link href="/dashboard/audit" className={styles.footerLink}>View all activity</Link>
                            <ChevronRight size={14} color="#0F172A" />
                        </div>
                    </div>
                </div>
            </div>

            {/* MODALS */}
            {showInviteModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>
                            <h2 className={styles.modalTitle}>Provision Member</h2>
                            <form onSubmit={handleInvite}>
                                {inviteError && <div className={styles.errorMessage}>{inviteError}</div>}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Full Name</label>
                                    <input type="text" required className={styles.formInput} value={inviteName} onChange={e => setInviteName(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Email Address</label>
                                    <input type="email" required className={styles.formInput} value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Temporary Password</label>
                                    <input type="password" required className={styles.formInput} value={invitePassword} onChange={e => setInvitePassword(e.target.value)} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Role</label>
                                    <select className={styles.formSelect} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                                        <option value="ADMIN">Admin</option>
                                        <option value="EDITOR">Editor</option>
                                        <option value="VIEWER">Viewer</option>
                                    </select>
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" className={styles.btnCancel} onClick={() => setShowInviteModal(false)}>Cancel</button>
                                    <button type="submit" className={styles.btnSubmit} disabled={inviteLoading}>{inviteLoading ? 'Provisioning...' : 'Provision Account'}</button>
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
                        <div className={styles.modal} style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
                             <h2 className={styles.modalTitle} style={{ marginBottom: '8px' }}>Update Role</h2>
                             <p style={{ color: '#64748B', fontWeight: 700, marginBottom: '24px' }}>Adjust permissions for {selectedMember?.name}</p>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {['ADMIN', 'EDITOR', 'VIEWER', 'PAUSED'].map(role => (
                                    <button 
                                        key={role}
                                        onClick={() => handleUpdateMember(selectedMember.id, { role })}
                                        style={{
                                            width: '100%', padding: '20px', borderRadius: '18px', 
                                            border: `2px solid ${selectedMember.role === role ? '#0F172A' : '#F1F5F9'}`,
                                            background: selectedMember.role === role ? '#F8FAFC' : '#FFFFFF', 
                                            textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ fontWeight: 950, color: '#0F172A' }}>{role}</span>
                                        {selectedMember.role === role && <Check size={18} color="#0F172A" />}
                                    </button>
                                ))}
                             </div>
                             <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                                <button className={styles.btnCancel} style={{ flex: 1 }} onClick={() => setShowRoleEditModal(false)}>Cancel</button>
                                <button className={styles.btnSubmit} style={{ flex: 1, background: '#EF4444' }} onClick={() => setShowDecommissionModal(true)}>Decommission</button>
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
                             <div style={{ width: '64px', height: '64px', background: '#FEF2F2', color: '#EF4444', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <Trash2 size={32} />
                             </div>
                             <h2 className={styles.modalTitle} style={{ textAlign: 'center' }}>Decommission Member?</h2>
                             <p style={{ color: '#64748B', fontWeight: 700, lineHeight: 1.6, marginBottom: '32px' }}>
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
        </div>
    );
}
