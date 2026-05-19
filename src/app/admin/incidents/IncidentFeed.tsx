"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, MessageSquare, ExternalLink, Search, BellRing, Clock, RefreshCw, Server, Zap, CheckCircle2, ChevronDown } from "lucide-react";
import adminStyles from "../admin.module.css";

interface Incident {
    id: string;
    firm: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    timestamp: string;
    status: 'Active' | 'Investigating' | 'Resolved';
    debugUrl?: string;
    workflowName: string;
    serverName: string;
}

export default function IncidentFeed({ initialIncidents }: { initialIncidents: Incident[] }) {
    const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
    const [search, setSearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

    const toggleResolve = async (id: string) => {
        const isCurrentlyResolved = resolvedIds.has(id);
        
        try {
            const res = await fetch('/api/admin/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, action: 'RESOLVE' })
            });

            if (res.ok) {
                setResolvedIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) newSet.delete(id);
                    else newSet.add(id);
                    return newSet;
                });
                (window as any).showToast(`Incident ${isCurrentlyResolved ? 'reopened' : 'resolved'} successfully.`, "success");
            }
        } catch (err) {
            console.error("Failed to update incident:", err);
            (window as any).showToast("Failed to update incident status.", "error");
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch('/api/admin/incidents');
            if (res.ok) {
                const data = await res.json();
                setIncidents(data);
            }
        } catch (err) {
            console.error("Failed to refresh incidents:", err);
        } finally {
            setIsRefreshing(false);
        }
    };

    const enrichedIncidents = incidents.map(inc => ({
        ...inc,
        status: resolvedIds.has(inc.id) ? 'Resolved' as const : 'Active' as const,
    }));

    const filteredIncidents = enrichedIncidents.filter(inc => 
        inc.firm.toLowerCase().includes(search.toLowerCase()) || 
        inc.description.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
        // Active first, resolved last
        if (a.status === 'Resolved' && b.status !== 'Resolved') return 1;
        if (a.status !== 'Resolved' && b.status === 'Resolved') return -1;
        return 0;
    });

    const displayedIncidents = showAll ? filteredIncidents : filteredIncidents.slice(0, 6);

    const getSeverityStyle = (severity: string, status: string) => {
        if (status === 'Resolved') return { background: 'rgba(100, 116, 139, 0.1)', color: '#64748B' };
        if (severity === 'High') return { background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' };
        if (severity === 'Medium') return { background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' };
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' };
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div className={adminStyles.registryCard}>
                    <div className={adminStyles.registryHeader} style={{ marginBottom: '32px' }}>
                        <div>
                            <h3 className={adminStyles.registryTitle}>Incident Feed</h3>
                            <p className={adminStyles.registrySubtitle}>Real-time workflow and server issues</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div className={adminStyles.searchContainer} style={{ maxWidth: '300px' }}>
                                <Search size={16} className={adminStyles.searchIcon} />
                                <input 
                                    type="text" 
                                    placeholder="Filter incidents..." 
                                    className={adminStyles.searchField} 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={refreshData} 
                                className={adminStyles.refreshBtn}
                                style={{ borderRadius: '16px' }}
                            >
                                <RefreshCw size={18} className={isRefreshing ? adminStyles.spinning : ''} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {displayedIncidents.map((inc) => (
                            <div key={inc.id} style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between", 
                                padding: "24px", 
                                borderRadius: "24px", 
                                background: inc.status === 'Resolved' ? "rgba(248, 250, 252, 0.5)" : "var(--background)", 
                                border: "1px solid var(--border)",
                                opacity: inc.status === 'Resolved' ? 0.7 : 1,
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                                    <div style={{ 
                                        width: "52px", 
                                        height: "52px", 
                                        borderRadius: "16px", 
                                        background: inc.status === 'Resolved' ? "transparent" : "var(--card)", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        border: inc.status === 'Resolved' ? "1px dashed var(--border)" : "1px solid var(--border)"
                                    }}>
                                        {inc.status === 'Resolved' ? (
                                            <CheckCircle2 size={24} color="#64748B" />
                                        ) : (
                                            <ShieldAlert size={24} style={{ color: getSeverityStyle(inc.severity, inc.status).color }} />
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 950, textDecoration: inc.status === 'Resolved' ? 'line-through' : 'none', color: inc.status === 'Resolved' ? '#94A3B8' : 'inherit' }}>{inc.firm}</span>
                                            <span style={{ 
                                                fontSize: "0.6rem", 
                                                fontWeight: 950, 
                                                padding: "3px 8px", 
                                                borderRadius: "100px", 
                                                ...getSeverityStyle(inc.severity, inc.status), 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.05em' 
                                            }}>{inc.status === 'Resolved' ? 'RESOLVED' : `${inc.severity} SEVERITY`}</span>
                                        </div>
                                        <div style={{ fontSize: "0.95rem", color: inc.status === 'Resolved' ? "#94A3B8" : "var(--foreground)", fontWeight: 800, maxWidth: '500px', letterSpacing: '-0.01em', marginBottom: "10px" }}>{inc.description}</div>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 750, flexWrap: 'wrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: inc.status === 'Resolved' ? 'transparent' : 'var(--muted)', padding: '2px 8px', borderRadius: '6px', border: inc.status === 'Resolved' ? '1px solid var(--border)' : 'none' }}>
                                                <Zap size={12} color={inc.status === 'Resolved' ? '#94A3B8' : '#10B981'} />
                                                <span>{inc.workflowName}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: inc.status === 'Resolved' ? 'transparent' : 'var(--muted)', padding: '2px 8px', borderRadius: '6px', border: inc.status === 'Resolved' ? '1px solid var(--border)' : 'none' }}>
                                                <Server size={12} color={inc.status === 'Resolved' ? '#94A3B8' : '#3B82F6'} />
                                                <span>{inc.serverName}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: inc.status === 'Resolved' ? 'transparent' : 'var(--muted)', padding: '2px 8px', borderRadius: '6px', border: inc.status === 'Resolved' ? '1px solid var(--border)' : 'none' }}>
                                                <Clock size={12} />
                                                <span>{inc.timestamp}</span>
                                            </div>
                                            <code style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem' }}>{inc.id.substring(0, 8)}</code> 
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "12px", alignItems: 'center' }}>
                                    <button 
                                        onClick={() => toggleResolve(inc.id)}
                                        className={adminStyles.primaryBtn} 
                                        style={{ 
                                            padding: '8px 16px', 
                                            fontSize: '0.8rem', 
                                            background: inc.status === 'Resolved' ? 'var(--card)' : '#10B981', 
                                            color: inc.status === 'Resolved' ? 'var(--foreground)' : 'white',
                                            border: inc.status === 'Resolved' ? '1px solid var(--border)' : 'none'
                                        }}
                                    >
                                        {inc.status === 'Resolved' ? 'Reopen' : 'Mark Fixed'}
                                    </button>
                                    {inc.debugUrl && inc.status !== 'Resolved' && (
                                        <a href={inc.debugUrl} target="_blank" rel="noopener noreferrer" className={adminStyles.actionIconBtn} title="Launch Debugger">
                                            <Terminal size={18} />
                                        </a>
                                    )}
                                    {inc.status !== 'Resolved' && (
                                        <>
                                            <button className={adminStyles.actionIconBtn} title="Dispatch Alert"><BellRing size={18} /></button>
                                            <button className={adminStyles.actionIconBtn} title="External Logs"><ExternalLink size={18} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                        
                        {!showAll && filteredIncidents.length > 6 && (
                            <button 
                                onClick={() => setShowAll(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '16px', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)',
                                    color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 950, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--muted)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card)'}
                            >
                                View {filteredIncidents.length - 6} older incidents <ChevronDown size={16} />
                            </button>
                        )}

                        {showAll && filteredIncidents.length > 6 && (
                            <button 
                                onClick={() => setShowAll(false)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    padding: '16px', borderRadius: '20px', background: 'transparent', border: 'none',
                                    color: 'var(--muted-foreground)', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                Show less
                            </button>
                        )}
                        
                        {filteredIncidents.length === 0 && (
                            <div className={adminStyles.emptyState} style={{ padding: '80px 0' }}>
                                <div className={adminStyles.emptyIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', marginBottom: '24px' }}>
                                    <ShieldAlert size={48} />
                                </div>
                                <h4 style={{ fontWeight: 950, fontSize: '1.5rem', marginBottom: '8px' }}>No Active Incidents</h4>
                                <p style={{ color: 'var(--muted-foreground)', fontWeight: 700 }}>No active incidents detected across workflows or servers</p>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                    <div className={adminStyles.registryCard} style={{ padding: '40px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Terminal size={24} color="var(--foreground)" />
                        </div>
                        <h4 style={{ fontWeight: 950, fontSize: '1.2rem', marginBottom: "8px" }}>Server Debug</h4>
                        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "32px", lineHeight: 1.6, fontWeight: 700 }}>Open a secure admin session for debugging</p>
                        <button className={adminStyles.primaryBtn} onClick={() => window.location.href='/admin/fleet'} style={{ width: '100%' }}>Start Debug Session</button>
                    </div>
                    <div className={adminStyles.registryCard} style={{ padding: '40px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <MessageSquare size={24} color="var(--foreground)" />
                        </div>
                        <h4 style={{ fontWeight: 950, fontSize: '1.2rem', marginBottom: "8px" }}>Support Bridge</h4>
                        <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", marginBottom: "32px", lineHeight: 1.6, fontWeight: 700 }}>Open direct support communication with the affected client or admin</p>
                        <button className={adminStyles.primaryBtn} style={{ width: '100%', background: 'var(--muted)', color: 'var(--foreground)' }}>Open Support Bridge</button>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                <div className={adminStyles.registryCard} style={{ padding: "32px" }}>
                    <h4 style={{ fontSize: "0.75rem", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted-foreground)", marginBottom: "24px" }}>Alert Channels</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {[
                            { label: 'Push Notifications', active: true },
                            { label: 'Discord Alerts', active: true },
                            { label: 'SMS Alerts', active: false }
                        ].map((opt, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.9rem", fontWeight: 950 }}>{opt.label}</span>
                                <div style={{ width: "44px", height: "24px", background: opt.active ? '#10B981' : 'var(--border)', borderRadius: "100px", position: "relative", cursor: 'pointer' }}>
                                    <div style={{ width: "20px", height: "20px", background: "white", borderRadius: "50%", position: "absolute", [opt.active ? 'right' : 'left']: "2px", top: "2px", transition: '0.2s' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={adminStyles.registryCard} style={{ padding: "32px", background: "#09090B", color: "white", border: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                        <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.1em', opacity: 0.6 }}>LIVE STATUS</span>
                    </div>
                    <h4 style={{ fontWeight: 950, marginBottom: "8px", fontSize: '1.1rem' }}>System Heartbeat</h4>
                    <p style={{ fontSize: "0.85rem", opacity: 0.4, marginBottom: "24px", fontWeight: 700 }}>Monitoring server and workflow status</p>
                    <div style={{ height: "140px", background: "rgba(255,255,255,0.03)", borderRadius: "20px", padding: "20px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", overflow: "hidden", border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.8 }}>
                        <div style={{ color: "#71717A" }}>[0.00ms] Sovereignty protocol active</div>
                        <div style={{ color: "#EF4444" }}>[+14ms] ERROR: ECONN_DROPPED @ alpha-node</div>
                        <div style={{ color: "#71717A" }}>[+202ms] Re-establishing handshake...</div>
                        <div style={{ color: "#10B981" }}>[+450ms] Connection established</div>
                        <div style={{ color: "#71717A" }}>[+892ms] Heartbeat nominal</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
