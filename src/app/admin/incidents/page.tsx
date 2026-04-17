import { db } from "@/lib/db";
import { ShieldAlert, Terminal, MessageSquare, ExternalLink, Filter, Search, PhoneForwarded, BellRing, Clock } from "lucide-react";
import adminStyles from "../admin.module.css";
import React from 'react';

interface Incident {
    id: string;
    firm: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    timestamp: string;
    status: 'Active' | 'Investigating' | 'Resolved';
}

export default async function IncidentCommandPage() {
    // FETCH REAL INCIDENTS (ERRORS)
    const errorLogs = await db.query(`
        SELECT 
            wl.id, 
            u."firmName", 
            wl."workflowName", 
            COALESCE(wl.result->>'error', w."errorMessage", 'Unknown Operational Fault') as "errorMessage", 
            wl."createdAt",
            wl.status
        FROM "WorkflowLog" wl
        LEFT JOIN "Workflow" w ON wl."workflowId" = w.id
        LEFT JOIN "User" u ON w."userId" = u.id
        WHERE wl.status = 'error'
        ORDER BY wl."createdAt" DESC
        LIMIT 10
    `) as any[];

    const incidents = errorLogs.map(log => {
        // Humanize timestamp
        const created = new Date(log.createdAt);
        const diffMs = new Date().getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const timeStr = diffMins < 1 ? 'Just now' : diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;

        return {
            id: log.id.substring(0, 8),
            firm: log.firmName || 'System Archive',
            description: log.errorMessage || `Unknown failure in ${log.workflowName}`,
            severity: 'High' as 'High' | 'Medium' | 'Low', // Errors are generally high severity
            timestamp: timeStr,
            status: 'Active' as 'Active' | 'Investigating' | 'Resolved'
        };
    });

    const getSeverityStyle = (severity: string) => {
        if (severity === 'High') return { background: 'rgba(255, 82, 82, 0.1)', color: '#FF5252' };
        if (severity === 'Medium') return { background: 'rgba(255, 167, 38, 0.1)', color: '#FFA726' };
        return { background: 'rgba(39, 174, 96, 0.1)', color: '#27AE60' };
    };

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* INTEGRITY PANEL */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--background)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShieldAlert size={24} color="var(--foreground)" className={adminStyles.pulse} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '16px', height: '16px', background: incidents.length > 0 ? '#EF4444' : '#10B981', borderRadius: '50%', border: '3px solid var(--foreground)' }} />
                    </div>
                    <div>
                        <h2 style={{ color: 'var(--background)', fontSize: '1.4rem', fontWeight: 950, margin: 0 }}>Incident Command</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', margin: '4px 0 0' }}>Authoritative Operational Ledger: {incidents.length} active exceptions detected.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <div style={{ padding: '0 32px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 950, opacity: 0.5 }}>System State</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 950, color: incidents.length > 0 ? '#EF4444' : '#10B981' }}>{incidents.length > 0 ? 'COMPROMISED' : 'NOMINAL'}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "32px" }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* INCIDENT FEED */}
                    <div className={adminStyles.registryCard}>
                        <div className={adminStyles.registryHeader} style={{ marginBottom: '32px' }}>
                            <div>
                                <h3 className={adminStyles.registryTitle}>Global Incident Feed</h3>
                                <p className={adminStyles.registrySubtitle}>Real-time institutional exceptions.</p>
                            </div>
                            <div className={adminStyles.searchContainer} style={{ maxWidth: '300px' }}>
                                <Search size={16} className={adminStyles.searchIcon} />
                                <input type="text" placeholder="Filter incidents..." className={adminStyles.searchField} />
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {incidents.map((inc) => (
                                <div key={inc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px", borderRadius: "24px", background: "var(--muted)", border: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                                        <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                            <ShieldAlert size={24} style={{ color: getSeverityStyle(inc.severity).color }} />
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 950 }}>{inc.firm}</span>
                                                <span style={{ fontSize: "0.6rem", fontWeight: 950, padding: "2px 8px", borderRadius: "6px", ...getSeverityStyle(inc.severity), textTransform: 'uppercase', letterSpacing: '0.05em' }}>{inc.severity}</span>
                                            </div>
                                            <div style={{ fontSize: "0.95rem", color: "var(--foreground)", fontWeight: 800, maxWidth: '480px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.01em' }}>{inc.description}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "6px" }}>
                                                <code style={{ background: 'var(--border)', padding: '2px 8px', borderRadius: '4px', fontStyle: 'normal' }}>LOG_{inc.id}</code> 
                                                <Clock size={12} />
                                                <span>{inc.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <button className={adminStyles.actionIconBtn} title="Establish Bridge"><Terminal size={18} /></button>
                                        <button className={adminStyles.actionIconBtn} title="Dispatch Alert"><BellRing size={18} /></button>
                                        <button className={adminStyles.actionIconBtn} title="External Logs"><ExternalLink size={18} /></button>
                                    </div>
                                </div>
                            ))}
                            {incidents.length === 0 && (
                                <div className={adminStyles.emptyState}>
                                    <div className={adminStyles.emptyIcon}><ShieldAlert size={64} style={{ color: '#10B981', opacity: 1 }} /></div>
                                    <p style={{ fontWeight: 950, color: 'var(--foreground)', fontSize: '1.25rem' }}>Operational Zenith Artifact</p>
                                    <p style={{ color: 'var(--muted-foreground)', fontWeight: 700, marginTop: '8px' }}>Zero active exceptions detected across the institutional fleet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TACTICAL CONTROLS */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                        <div className={adminStyles.registryCard} style={{ padding: '32px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <Terminal size={24} color="#10B981" />
                            </div>
                            <h4 style={{ fontWeight: 950, fontSize: '1.1rem', marginBottom: "8px" }}>Remote n8n Debugger</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "24px", lineHeight: 1.5, fontWeight: 700 }}>Establish a secure, temporary tunnel into client workflow environments.</p>
                            <button className={adminStyles.primaryBtn} style={{ width: "100%" }}>Authorize Debug</button>
                        </div>
                        <div className={adminStyles.registryCard} style={{ padding: '32px' }}>
                            <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                <MessageSquare size={24} color="var(--foreground)" />
                            </div>
                            <h4 style={{ fontWeight: 950, fontSize: '1.1rem', marginBottom: "8px" }}>Institutional Bridge</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "24px", lineHeight: 1.5, fontWeight: 700 }}>Initiate direct tactical communication with firm-level responders.</p>
                            <button className={adminStyles.primaryBtn} style={{ width: "100%", background: 'var(--muted)', color: 'var(--foreground)' }}>Open Bridge</button>
                        </div>
                    </div>
                </div>

                {/* SIDEBAR OPS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div className={adminStyles.registryCard} style={{ padding: "32px" }}>
                        <h4 style={{ fontSize: "0.7rem", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted-foreground)", marginBottom: "24px" }}>Alert Protocol</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {[
                                { label: 'Tactical Push', active: true },
                                { label: 'Discord Bridge', active: true },
                                { label: 'Global Ops SMS', active: false }
                            ].map((opt, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "0.85rem", fontWeight: 950 }}>{opt.label}</span>
                                    <div style={{ width: "40px", height: "20px", background: opt.active ? '#10B981' : 'var(--border)', borderRadius: "10px", position: "relative", cursor: 'pointer' }}>
                                        <div style={{ width: "16px", height: "16px", background: "white", borderRadius: "50%", position: "absolute", [opt.active ? 'right' : 'left']: "2px", top: "2px", transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={adminStyles.primaryBtn} style={{ width: "100%", marginTop: "32px", height: "52px", fontSize: "0.85rem", background: 'var(--muted)', color: 'var(--foreground)' }}>
                            <PhoneForwarded size={16} style={{ marginRight: "12px" }} /> Establish On-Call
                        </button>
                    </div>

                    <div className={adminStyles.registryCard} style={{ padding: "32px", background: "var(--foreground)", color: "var(--background)", border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <div className={adminStyles.statusIndicatorHealthy} style={{ background: '#10B981', boxShadow: '0 0 15px #10B981' }}>
                                <div className={adminStyles.beaconPulse} />
                            </div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 950, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)' }}>LIVE TELEMETRY</span>
                        </div>
                        <h4 style={{ fontWeight: 950, marginBottom: "8px", fontSize: '1.1rem' }}>Sovereign Heartbeat</h4>
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "24px", fontWeight: 700, lineHeight: 1.5 }}>Listening for institutional cluster broadcasts...</p>
                        <div style={{ height: "120px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "16px", fontFamily: "var(--font-mono, monospace)", fontSize: "0.6rem", overflow: "hidden", border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.8 }}>
                            <div style={{ color: "rgba(255,255,255,0.3)" }}>[0.00ms] Sovereignty protocol active</div>
                            <div style={{ color: "#EF4444" }}>[+14ms] ERROR: ECONN_DROPPED @ alpha-node</div>
                            <div style={{ color: "rgba(255,255,255,0.3)" }}>[+202ms] Re-establishing handshake...</div>
                            <div style={{ color: "#10B981" }}>[+450ms] Connection established via backup</div>
                            <div style={{ color: "rgba(255,255,255,0.2)" }}>[+892ms] Heartbeat nominal</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

