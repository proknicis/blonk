"use client";

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Terminal, MessageSquare, ExternalLink, Search, BellRing, Clock, RefreshCw } from "lucide-react";
import adminStyles from "../admin.module.css";

interface Incident {
    id: string;
    firm: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    timestamp: string;
    status: 'Active' | 'Investigating' | 'Resolved';
    debugUrl?: string;
}

export default function IncidentFeed({ initialIncidents }: { initialIncidents: Incident[] }) {
    const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
    const [search, setSearch] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);

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

    const filteredIncidents = incidents.filter(inc => 
        inc.firm.toLowerCase().includes(search.toLowerCase()) || 
        inc.description.toLowerCase().includes(search.toLowerCase())
    );

    const getSeverityStyle = (severity: string) => {
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
                        {filteredIncidents.map((inc) => (
                            <div key={inc.id} style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between", 
                                padding: "24px", 
                                borderRadius: "24px", 
                                background: "var(--background)", 
                                border: "1px solid var(--border)",
                                transition: 'all 0.3s ease'
                            }}>
                                <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                                    <div style={{ 
                                        width: "52px", 
                                        height: "52px", 
                                        borderRadius: "16px", 
                                        background: "var(--card)", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center", 
                                        border: "1px solid var(--border)"
                                    }}>
                                        <ShieldAlert size={24} style={{ color: getSeverityStyle(inc.severity).color }} />
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 950 }}>{inc.firm}</span>
                                            <span style={{ 
                                                fontSize: "0.6rem", 
                                                fontWeight: 950, 
                                                padding: "4px 10px", 
                                                borderRadius: "100px", 
                                                ...getSeverityStyle(inc.severity), 
                                                textTransform: 'uppercase', 
                                                letterSpacing: '0.05em' 
                                            }}>{inc.severity}</span>
                                        </div>
                                        <div style={{ fontSize: "0.95rem", color: "var(--foreground)", fontWeight: 800, maxWidth: '480px', letterSpacing: '-0.01em' }}>{inc.description}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "8px" }}>
                                            <code style={{ background: 'var(--muted)', padding: '2px 8px', borderRadius: '4px' }}>LOG_{inc.id}</code> 
                                            <Clock size={12} />
                                            <span>{inc.timestamp}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    {inc.debugUrl && (
                                        <a href={inc.debugUrl} target="_blank" rel="noopener noreferrer" className={adminStyles.actionIconBtn} title="Launch Debugger">
                                            <Terminal size={18} />
                                        </a>
                                    )}
                                    <button className={adminStyles.actionIconBtn} title="Dispatch Alert"><BellRing size={18} /></button>
                                    <button className={adminStyles.actionIconBtn} title="External Logs"><ExternalLink size={18} /></button>
                                </div>
                            </div>
                        ))}
                        
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
