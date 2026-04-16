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
            wl."errorMessage", 
            wl."createdAt",
            wl.status
        FROM "WorkflowLog" wl
        LEFT JOIN "User" u ON wl."teamId" = u."teamId"
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
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px" }}>
                <div>
                    {/* Incident List */}
                    <div className={adminStyles.card} style={{ marginBottom: "32px" }}>
                        <div className={adminStyles.registryHeader} style={{ marginBottom: '32px' }}>
                            <div>
                                <h3 className={adminStyles.registryTitle}>Global Incident Feed</h3>
                                <p className={adminStyles.registrySubtitle}>Real-time exception tracking across the institutional fleet.</p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div className={adminStyles.searchWrapper}>
                                    <Search size={16} className={adminStyles.searchIcon} />
                                    <input type="text" placeholder="Search operational logs..." className={adminStyles.searchInput} style={{ width: '240px' }} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {incidents.map((inc) => (
                                <div key={inc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderRadius: "20px", background: "var(--muted)", border: "1px solid var(--border)", transition: 'transform 0.2s ease' }}>
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                            <ShieldAlert size={20} style={{ color: getSeverityStyle(inc.severity).color }} />
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 950 }}>{inc.firm}</span>
                                                <span style={{ fontSize: "0.65rem", fontWeight: 950, padding: "2px 8px", borderRadius: "6px", ...getSeverityStyle(inc.severity), textTransform: 'uppercase', letterSpacing: '0.05em' }}>{inc.severity} SEVERITY</span>
                                            </div>
                                            <div style={{ fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 800, maxWidth: '450px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{inc.description}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "4px" }}>
                                                <code style={{ background: 'var(--border)', padding: '1px 6px', borderRadius: '4px' }}>LOG_{inc.id}</code> 
                                                <Clock size={12} style={{ marginLeft: '4px' }} />
                                                <span>{inc.timestamp}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button className={adminStyles.btnDark} style={{ padding: "10px 16px", fontSize: "0.75rem", borderRadius: "12px", display: 'flex', alignItems: 'center' }}>
                                            <Terminal size={14} style={{ marginRight: "8px" }} /> Bridge
                                        </button>
                                        <button className={adminStyles.btnLight} style={{ padding: "10px 16px", fontSize: "0.75rem", borderRadius: "12px", border: '1px solid var(--border)' }}>
                                            <MessageSquare size={14} style={{ marginRight: "8px" }} /> Alert
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {incidents.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '100px', border: '2px dashed var(--border)', borderRadius: '24px' }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--accent)', marginBottom: '8px' }}>Zero Active Incidents</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>The institutional fleet is operating at peak stability.</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bridge Access Section */}
                    <div className={adminStyles.card}>
                        <h3 className={adminStyles.registryTitle} style={{ marginBottom: "24px" }}>Sovereign Access Bridge</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div style={{ padding: "28px", borderRadius: "28px", background: "linear-gradient(135deg, rgba(52, 209, 134, 0.05) 0%, rgba(52, 209, 134, 0) 100%)", border: "1px solid rgba(52, 209, 134, 0.2)" }}>
                                <Terminal size={32} style={{ color: "var(--accent)", marginBottom: "16px" }} />
                                <h4 style={{ fontWeight: 950, marginBottom: "8px" }}>Remote n8n Debugger</h4>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "20px", lineHeight: 1.5 }}>Establish a secure, temporary tunnel into client workflow environments for low-latency troubleshooting.</p>
                                <button className={adminStyles.btnDark} style={{ width: "100%", height: "52px", borderRadius: '14px' }}>Authorize Debug Session</button>
                            </div>
                            <div style={{ padding: "28px", borderRadius: "28px", background: "var(--muted)", border: "1px solid var(--border)" }}>
                                <ShieldAlert size={32} style={{ color: "var(--foreground)", marginBottom: "16px" }} />
                                <h4 style={{ fontWeight: 950, marginBottom: "8px" }}>Governance Overlap</h4>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "20px", lineHeight: 1.5 }}>Review active administrator sessions and diagnostic permissions granted by firm owners via the Consent Registry.</p>
                                <button className={adminStyles.btnLight} style={{ width: "100%", height: "52px", borderRadius: '14px', border: '1px solid var(--border)' }}>Review Permissions</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className={adminStyles.card} style={{ padding: "24px" }}>
                        <h4 style={{ fontSize: "0.75rem", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--muted-foreground)", marginBottom: "24px" }}>Alert Protocol</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>Tactical Push</span>
                                <div style={{ width: "36px", height: "18px", background: "var(--accent)", borderRadius: "9px", position: "relative" }}>
                                    <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", right: "2px", top: "2px" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>Discord Bridge</span>
                                <div style={{ width: "36px", height: "18px", background: "var(--accent)", borderRadius: "9px", position: "relative" }}>
                                    <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", right: "2px", top: "2px" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>Global Ops SMS</span>
                                <div style={{ width: "36px", height: "18px", background: "var(--border)", borderRadius: "9px", position: "relative" }}>
                                    <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", left: "2px", top: "2px" }} />
                                </div>
                            </div>
                        </div>
                        <button className={adminStyles.btnLight} style={{ width: "100%", marginTop: "32px", height: "48px", fontSize: "0.85rem", borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <PhoneForwarded size={16} style={{ marginRight: "8px" }} /> Establish On-Call
                        </button>
                    </div>

                    <div className={adminStyles.card} style={{ padding: "24px", background: "var(--foreground)", color: "var(--background)", borderRadius: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 950, letterSpacing: '0.1em', opacity: 0.6 }}>STREAMING LIVE</span>
                        </div>
                        <h4 style={{ fontWeight: 950, marginBottom: "8px", color: 'white' }}>Institutional Telemetry</h4>
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "16px", fontWeight: 700 }}>Listening for node broadcast events on institutional clusters...</p>
                        <div style={{ height: "140px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", padding: "16px", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", overflow: "hidden", border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ color: "rgba(255,255,255,0.3)" }}>[0.00ms] Sovereignty protocol active</div>
                            <div style={{ color: "#FF5252" }}>[+14ms] ERROR: ECONN_DROPPED @ alpha-node</div>
                            <div style={{ color: "rgba(255,255,255,0.3)" }}>[+202ms] Re-establishing handshake...</div>
                            <div style={{ color: "#34D186" }}>[+450ms] Connection established via backup</div>
                            <div style={{ color: "rgba(255,255,255,0.2)" }}>[+892ms] Heartbeat nominal</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

