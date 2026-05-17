"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Plus, 
    Search, 
    Zap, 
    Trash2, 
    Edit3, 
    Activity, 
    ShieldCheck,
    RefreshCcw,
    Layers,
    ArrowUpRight,
    Eye,
    ShoppingCart,
    BarChart3,
    X,
    Clock,
    Database,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Server,
    Cpu,
    Play,
    Pause,
    RotateCcw,
    Terminal,
    Filter,
    Settings,
    MoreHorizontal,
    Network,
    Lock,
    Globe,
    AlertCircle,
    Users,
    Mail,
    Shield,
    Check,
    UserCheck,
    UserX,
    LockKeyhole,
    Key,
    Download
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";
import adminStyles from "../admin.module.css";

// Premium Mock Data matching Screenshot 4
const MOCK_USERS_METRICS = {
    totalUsers: 24,
    activeUsers: 18,
    activeGrowth: "+12%",
    admins: 6,
    invited: 2,
    logins30d: 162,
    loginsGrowth: "+8%",
    usersWithAccess: "21/24"
};

const MOCK_USERS_DIRECTORY = [
    { id: "u-1", name: "Valters V.", email: "valters@blonk.io", role: "Super Admin", workspace: "Independent", plan: "ROOT", lastActivity: "Just now", status: "ACTIVE", mfa: true },
    { id: "u-2", name: "Kristaps B.", email: "kristaps@blonk.io", role: "Admin", workspace: "Independent", plan: "ROOT", lastActivity: "12m ago", status: "ACTIVE", mfa: true },
    { id: "u-3", name: "Alex Newman", email: "alex@novaanalytics.io", role: "Operator", workspace: "Nova Analytics", plan: "PRO - GROWTH", lastActivity: "1h ago", status: "ACTIVE", mfa: true },
    { id: "u-4", name: "Sarah Connor", email: "sarah@acme-corp.io", role: "Operator", workspace: "Acme Corp", plan: "STANDARD - STARTER", lastActivity: "3h ago", status: "ACTIVE", mfa: true },
    { id: "u-5", name: "John Doe", email: "john@lexflow.com", role: "Viewer", workspace: "LexFlow LLC", plan: "TRIAL - GROWTH", lastActivity: "1d ago", status: "INACTIVE", mfa: false },
    { id: "u-6", name: "Emily Watson", email: "emily@healthplus.org", role: "Pending / Invited", workspace: "HealthPlus", plan: "STANDARD - STARTER", lastActivity: "Not joined yet", status: "INVITED", mfa: false }
];

export default function UserDirectoryPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteData, setInviteData] = useState({ name: "", email: "", role: "Operator" });
    const [isLoading, setIsLoading] = useState(false);

    const handleInvite = async () => {
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1200));
        setIsLoading(false);
        setIsInviting(false);
        alert(`Invitation dispatched to ${inviteData.email}`);
        setInviteData({ name: "", email: "", role: "Operator" });
    };

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* SUB-HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A' }}>Users</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '64px', height: '1px', background: '#E2E8F0', marginRight: '4px' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Node Cluster: Global_Alpha</span>
                    </div>
                </div>
            </div>

            {/* DEEP SLATE BANNER */}
            <div style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '40px 48px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={32} color="#10B981" />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#10B981', borderRadius: '50%', border: '3px solid #0F172A' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ padding: '3px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>GOVERNANCE PROTOCOL</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>USER DIRECTORY</span>
                        </div>
                        <h2 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>User Directory</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 700, margin: '6px 0 0' }}>Manage client users, admins, and platform access across the firm.</p>
                    </div>
                </div>
                <div>
                    <button 
                        onClick={() => setIsInviting(true)}
                        style={{ background: '#10B981', color: '#0F172A', height: '56px', padding: '0 28px', borderRadius: '16px', border: 'none', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                        <Plus size={18} /> Add User
                    </button>
                </div>
            </div>

            {/* SIX METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px' }}>
                {[
                    { label: 'TOTAL USERS', value: MOCK_USERS_METRICS.totalUsers, detail: 'Registered profiles' },
                    { label: 'ACTIVE USERS', value: MOCK_USERS_METRICS.activeUsers, detail: 'Active last 7 days', growth: MOCK_USERS_METRICS.activeGrowth },
                    { label: 'ADMINS', value: MOCK_USERS_METRICS.admins, detail: 'Privileged operators' },
                    { label: 'INVITED', value: MOCK_USERS_METRICS.invited, detail: 'Pending verification' },
                    { label: 'LAST 30D LOGINS', value: MOCK_USERS_METRICS.logins30d, detail: 'Platform interactions', growth: MOCK_USERS_METRICS.loginsGrowth },
                    { label: 'USERS WITH ACCESS', value: MOCK_USERS_METRICS.usersWithAccess, detail: 'Active subscriptions' }
                ].map((m, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#64748B', letterSpacing: '0.05em' }}>{m.label}</span>
                            <div style={{ fontSize: '1.85rem', fontWeight: 950, color: '#0F172A', marginTop: '8px', letterSpacing: '-0.02em' }}>{m.value}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>{m.detail}</span>
                            {m.growth && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <ArrowUp size={12} /> {m.growth}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* MIDDLE ROW: DIRECTORY & QUICK ACTIONS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
                
                {/* USER DIRECTORY TABLE */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>USER DIRECTORY</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>Registry database of sovereign users</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={roleFilter} 
                                    onChange={e => setRoleFilter(e.target.value)}
                                    style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 800, background: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="All">All Roles</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Operator">Operator</option>
                                    <option value="Viewer">Viewer</option>
                                </select>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={statusFilter} 
                                    onChange={e => setStatusFilter(e.target.value)}
                                    style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 800, background: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="INVITED">Invited</option>
                                </select>
                            </div>
                            <div style={{ position: 'relative', width: '220px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Filter users..." 
                                    style={{ width: '100%', height: '36px', borderRadius: '12px', border: '1px solid #E2E8F0', paddingLeft: '36px', fontSize: '0.8rem', fontWeight: 750, outline: 'none' }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>User</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Role</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Workspace / Plan</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Last Activity</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Status</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>MFA</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_USERS_DIRECTORY.filter(u => {
                                    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
                                    const matchesRole = roleFilter === "All" || u.role.includes(roleFilter);
                                    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
                                    return matchesSearch && matchesRole && matchesStatus;
                                }).map(user => (
                                    <tr key={user.id} style={{ background: '#F8FAFC', borderRadius: '16px' }}>
                                        <td style={{ padding: '16px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <div style={{ width: '40px', height: '40px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Shield size={14} color="#94A3B8" />
                                                <span>{user.role}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>{user.workspace}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 950, textTransform: 'uppercase' }}>{user.plan}</div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                            {user.lastActivity}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '6px', 
                                                padding: '4px 10px', 
                                                background: user.status === 'ACTIVE' ? '#E8FDF0' : (user.status === 'INACTIVE' ? '#FFFBEB' : '#EFF6FF'), 
                                                color: user.status === 'ACTIVE' ? '#10B981' : (user.status === 'INACTIVE' ? '#F59E0B' : '#3B82F6'), 
                                                borderRadius: '100px', 
                                                width: 'fit-content' 
                                            }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase' }}>{user.status}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            {user.mfa ? (
                                                <div style={{ width: '20px', height: '20px', background: '#E8FDF0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            ) : (
                                                <div style={{ width: '20px', height: '20px', background: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                                                    <X size={12} strokeWidth={3} />
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button 
                                                    onClick={() => alert("Email composer opened.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                    title="Message User"
                                                >
                                                    <Mail size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Security credentials logs opened.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                                                    title="Security Audit"
                                                >
                                                    <Lock size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Edit operator config.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3B82F6' }}
                                                    title="Edit User"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => alert("Revoke user credentials.")}
                                                    style={{ width: '36px', height: '36px', border: '1px solid #FEE2E2', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#EF4444' }}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT SYSTEM SIDEBARS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* USER ACTIONS */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>USER ACTIONS</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { label: 'Add New User', desc: 'Manually add new credentials', icon: <Plus size={16} />, action: () => setIsInviting(true) },
                                { label: 'Bulk Invite Users', desc: 'Bulk invite from domain', icon: <Mail size={16} />, action: () => alert("Bulk invite launched.") },
                                { label: 'Import Users (CSV)', desc: 'Import directory database', icon: <Download size={16} />, action: () => alert("Directory import initiated.") },
                                { label: 'Manage Roles', desc: 'Configure global privileges', icon: <Shield size={16} />, action: () => alert("Global roles console opened.") },
                                { label: 'Access Requests', desc: 'Pending verification logs', icon: <Key size={16} />, badge: 3, action: () => alert("Access logs opened.") }
                            ].map((item, i) => (
                                <button 
                                    key={i} 
                                    onClick={item.action}
                                    style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: '16px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
                                >
                                    <div style={{ width: '36px', height: '36px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0, position: 'relative' }}>
                                        {item.icon}
                                        {item.badge && (
                                            <div style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#EF4444', color: '#FFFFFF', width: '16px', height: '16px', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {item.badge}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>{item.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginTop: '2px' }}>{item.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ROLE OVERVIEW */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>ROLE OVERVIEW</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                            {[
                                { role: "Super Admin", count: 2 },
                                { role: "Admin", count: 4 },
                                { role: "Operator", count: 11 },
                                { role: "Viewer", count: 5 },
                                { role: "Pending / Invited", count: 2 }
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                    <span>{item.role}</span>
                                    <span style={{ fontWeight: 950, color: '#0F172A' }}>{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECURITY OVERVIEW */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>SECURITY OVERVIEW</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                <span>MFA Enabled</span>
                                <span style={{ fontWeight: 950, color: '#10B981' }}>78%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                                <span>Users with active sessions</span>
                                <span style={{ fontWeight: 950, color: '#0F172A' }}>18</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Blocked Users</span>
                                <span style={{ fontWeight: 950, color: '#EF4444' }}>1</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* INVITE USER MODAL */}
            {isInviting && (
                <div className={adminStyles.modalOverlay} onClick={() => setIsInviting(false)} style={{ backdropFilter: 'blur(16px)', background: 'rgba(250, 250, 250, 0.4)' }}>
                    <div className={adminStyles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', border: '1px solid #E2E8F0', boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.12)', borderRadius: '32px', overflow: 'hidden' }}>
                        <div className={adminStyles.modalHeader} style={{ background: '#0F172A', color: '#FFFFFF', padding: '40px 48px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>INVITE USER</div>
                                    <h3 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em', color: '#FFFFFF' }}>Invite New Operator</h3>
                                    <p style={{ opacity: 0.5, margin: '10px 0 0', fontWeight: 700, fontSize: '0.9rem' }}>Send directory invite link and assign operational role.</p>
                                </div>
                                <button onClick={() => setIsInviting(false)} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: 'white', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex' }}><X size={20} /></button>
                            </div>
                        </div>
                        <div className={adminStyles.modalBody} style={{ padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: '24px', background: '#FFFFFF' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Full Name</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        placeholder="e.g. John Doe" 
                                        value={inviteData.name} 
                                        onChange={e => setInviteData({...inviteData, name: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email Address</label>
                                    <input 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none' }} 
                                        placeholder="operator@firm.com" 
                                        type="email" 
                                        value={inviteData.email} 
                                        onChange={e => setInviteData({...inviteData, email: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 950, color: '#64748B', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Workspace Role</label>
                                    <select 
                                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 16px', fontSize: '0.85rem', fontWeight: 750, outline: 'none', background: '#FFFFFF' }}
                                        value={inviteData.role}
                                        onChange={e => setInviteData({...inviteData, role: e.target.value})}
                                    >
                                        <option value="Operator">Operator</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Viewer">Viewer</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className={adminStyles.modalFooter} style={{ padding: '28px 48px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsInviting(false)} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '0 20px', height: '44px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 900, color: '#475569' }}>Cancel</button>
                            <button onClick={handleInvite} disabled={isLoading || !inviteData.name || !inviteData.email} style={{ height: '44px', borderRadius: '12px', padding: '0 28px', background: '#0F172A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 950 }}>
                                {isLoading ? 'Sending invite...' : 'Invite user'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
