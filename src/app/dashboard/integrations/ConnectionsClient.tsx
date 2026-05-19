"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle, LayoutGrid, Search, ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Info, MoreHorizontal } from "lucide-react";

interface Connection {
    id: string;
    app: string;
    category: string;
    status: string;
    statusKey: string;
    workflows: string[];
    lastChecked: string;
    health: string;
    action: string;
    color: string;
}

interface AttentionItem {
    id: string;
    app: string;
    issue: string;
    time: string;
    color: string;
}

export default function ConnectionsClient({ initialConnections, needsAttention }: { initialConnections: Connection[], needsAttention: AttentionItem[] }) {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState("");

    const filteredConnections = useMemo(() => {
        const term = search.trim().toLowerCase();
        return initialConnections.filter(conn => {
            const matchesFilter = filter === 'All' || (filter === 'Connected' ? conn.statusKey === 'connected' : conn.statusKey !== 'connected');
            const matchesSearch = !term || [conn.app, conn.category, conn.status, conn.health, ...conn.workflows].some(value => value.toLowerCase().includes(term));
            return matchesFilter && matchesSearch;
        });
    }, [filter, initialConnections, search]);

    const connectedCount = initialConnections.filter(conn => conn.statusKey === 'connected').length;
    const notConnectedCount = initialConnections.filter(conn => conn.statusKey === 'not_connected').length;
    const issueCount = initialConnections.length - connectedCount - notConnectedCount;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 60 }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: "1.7rem", fontWeight: 950, letterSpacing: "-0.04em", margin: "0 0 6px 0", color: "#0F172A", textTransform: 'uppercase' }}>Connections</h1>
                <p style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 600, margin: 0 }}>
                    Manage connected apps, credentials, and integration health.
                </p>
            </div>

            {/* Health Summary Strip */}
            <div style={{ display: 'flex', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, overflow: 'hidden' }}>
                <HealthItem icon={<CheckCircle2 size={24} color="#10B981" />} iconBg="#ECFDF5" count={connectedCount} label="Connected" />
                <HealthItem icon={<AlertTriangle size={24} color="#F59E0B" />} iconBg="#FFFBEB" count={0} label="Needs Reconnect" />
                <HealthItem icon={<XCircle size={24} color="#EF4444" />} iconBg="#FEF2F2" count={issueCount} label="Issues" />
                <HealthItem icon={<MinusCircle size={24} color="#64748B" />} iconBg="#F1F5F9" count={notConnectedCount} label="Not Connected" borderRight />
                <HealthItem icon={<LayoutGrid size={24} color="#3B82F6" />} iconBg="#EFF6FF" count={initialConnections.length} label="Total Apps" noBorder />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2.8fr 1fr', gap: 24, alignItems: 'start' }}>
                
                {/* Left Column - Main Table */}
                <div>
                    {/* Filters & Search */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 100, border: '1px solid #E2E8F0' }}>
                                <FilterPill active={filter === 'All'} onClick={() => setFilter('All')} label="All" icon={<CheckCircle2 size={12}/>} />
                                <FilterPill active={filter === 'Connected'} onClick={() => setFilter('Connected')} label="Connected" color="#10B981" />
                                <FilterPill active={filter === 'Issues'} onClick={() => setFilter('Issues')} label="Issues" color="#EF4444" />
                            </div>
                            <Dropdown label="By Workflow" />
                            <Dropdown label="Categories" />
                        </div>
                        
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 100, padding: '8px 16px', width: 240 }}>
                                <Search size={14} color="#94A3B8" />
                                <input placeholder="Search connections..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: '100%' }} />
                            </div>
                            <span onClick={() => { setSearch(""); setFilter("All"); }} style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', cursor: 'pointer' }}>Clear filters</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>ALL CONNECTIONS<br/>APP</th>
                                    <th style={thStyle}><br/>STATUS</th>
                                    <th style={thStyle}><br/>USED IN WORKFLOWS</th>
                                    <th style={thStyle}><br/>LAST CHECKED</th>
                                    <th style={{...thStyle, textAlign: 'right'}}><br/>ACTION</th>
                                    <th style={{...thStyle, width: 40}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredConnections.map((conn, i) => (
                                    <tr key={conn.id} style={{ borderBottom: i < filteredConnections.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 36, height: 36, borderRadius: 10, background: conn.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.2rem' }}>
                                                    {conn.app[0]}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A' }}>{conn.app}</div>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{conn.category}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: getStatusColor(conn.statusKey) }}>{conn.status}</div>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{conn.health === 'Healthy' ? 'Healthy' : conn.health === 'Not connected' ? 'Not set up' : conn.health === 'Reconnect needed' ? 'Re-auth required' : 'Token expired'}</div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                {conn.workflows.map((w, j) => (
                                                    <div key={j} style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, display: 'flex', gap: 6, alignItems: 'center' }}>
                                                        {w.startsWith('+') ? <span style={{ background: '#F1F5F9', padding: '2px 6px', borderRadius: 100, fontSize: '0.65rem', fontWeight: 800, color: '#64748B' }}>{w}</span> : w}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>{conn.lastChecked}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: getStatusColor(conn.statusKey), display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {conn.health} {conn.statusKey !== 'connected' && conn.statusKey !== 'not_connected' && <div style={{width: 6, height: 6, borderRadius: '50%', background: getStatusColor(conn.statusKey)}}/>}
                                                {conn.statusKey === 'connected' && <div style={{width: 6, height: 6, borderRadius: '50%', background: '#10B981'}}/>}
                                            </div>
                                        </td>
                                        <td style={{...tdStyle, textAlign: 'right'}}>
                                            <button onClick={() => window.location.href = conn.statusKey === 'connected' ? '/dashboard/access' : '/dashboard/registry'} style={{ background: 'transparent', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}>
                                                {conn.action}
                                            </button>
                                        </td>
                                        <td style={{...tdStyle, textAlign: 'right', paddingRight: 24}}>
                                            <MoreHorizontal size={16} color="#94A3B8" style={{ cursor: 'pointer' }} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>Showing {filteredConnections.length} of {initialConnections.length} connections</span>
                    </div>
                </div>

                {/* Right Column - Needs Attention Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    
                    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0', padding: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <AlertTriangle size={14} /> NEEDS ATTENTION
                            </div>
                            <div style={{ background: '#FEF2F2', color: '#EF4444', fontWeight: 900, fontSize: '0.75rem', width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {needsAttention.length}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {needsAttention.map((item, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 20, borderBottom: i < needsAttention.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1rem' }}>
                                                {item.app[0]}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A' }}>{item.app}</div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B' }}>{item.issue}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>{item.time}</span>
                                    </div>
                                    <button onClick={() => window.location.href = '/dashboard/access'} style={{ width: '100%', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}>
                                        Configure
                                    </button>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                View all issues <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>

                    <div style={{ background: '#ECFDF5', borderRadius: 16, border: '1px solid #A7F3D0', padding: 20 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                            <ShieldCheck size={20} color="#10B981" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Secure & Private</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#065F46', margin: '0 0 16px 0', lineHeight: 1.5, fontWeight: 500 }}>
                            Your credentials are encrypted and stored securely. We never share access without your permission.
                        </p>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            Learn more about security <ArrowRight size={12} />
                        </span>
                    </div>

                    <div style={{ background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', padding: 20 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                            <Info size={20} color="#3B82F6" />
                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permission Notes</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 16px 0', lineHeight: 1.5, fontWeight: 500 }}>
                            Some apps may require additional scopes to enable advanced features in your workflows.
                        </p>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                            View permission guide <ArrowRight size={12} />
                        </span>
                    </div>

                </div>

            </div>
        </div>
    );
}

function HealthItem({ icon, iconBg, count, label, borderRight, noBorder }: any) {
    return (
        <div style={{ flex: 1, padding: 24, display: 'flex', alignItems: 'center', gap: 16, borderRight: borderRight ? '1px solid #E2E8F0' : (noBorder ? 'none' : 'none') }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A' }}>{count}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>{label}</div>
            </div>
        </div>
    )
}

function FilterPill({ active, onClick, label, icon, color }: any) {
    return (
        <button 
            onClick={onClick}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, border: 'none', background: active ? (color ? `${color}15` : '#F1F5F9') : 'transparent', color: active ? (color || '#0F172A') : '#64748B', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
        >
            {icon ? icon : <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />}
            {label}
        </button>
    )
}

function Dropdown({ label }: any) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 100, fontSize: '0.8rem', fontWeight: 800, color: '#0F172A', cursor: 'pointer' }}>
            {label} <ChevronRight size={14} style={{ transform: 'rotate(90deg)' }} />
        </div>
    )
}

function getStatusColor(statusKey: string) {
    if (statusKey === 'connected') return '#10B981';
    if (statusKey === 'expired') return '#EF4444';
    if (statusKey === 'needs_reconnect') return '#F59E0B';
    return '#64748B';
}

const thStyle = { padding: '16px 24px', fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' as const, letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', textAlign: 'left' as const };
const tdStyle = { padding: '20px 24px' };
