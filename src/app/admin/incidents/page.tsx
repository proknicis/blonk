"use client";

import React, { useState, useEffect } from 'react';
import adminStyles from "../admin.module.css";
import { ShieldAlert, Terminal, MessageSquare, ExternalLink, Filter, Search, PhoneForwarded, BellRing } from "lucide-react";

interface Incident {
    id: string;
    firm: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    timestamp: string;
    status: 'Active' | 'Investigating' | 'Resolved';
}

export default function IncidentCommandPage() {
    const [incidents, setIncidents] = useState<Incident[]>([
        { id: 'inc-01', firm: 'Legal Firm Alpha', description: 'n8n Workflow Timeout: Client Onboarding', severity: 'High', timestamp: '5m ago', status: 'Active' },
        { id: 'inc-02', firm: 'Institutional Hub HQ', description: 'API Rate Limit Exceeded: Stripe Sync', severity: 'Medium', timestamp: '12m ago', status: 'Investigating' },
        { id: 'inc-03', firm: 'Legacy Firm Partner', description: 'Database Connection Latency (>500ms)', severity: 'Low', timestamp: '45m ago', status: 'Resolved' },
    ]);

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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 950, marginBottom: "4px" }}>Global Incident Feed</h3>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>Real-time anonymized error logs across the fleet</p>
                            </div>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <div style={{ position: "relative" }}>
                                    <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                                    <input 
                                        type="text" 
                                        placeholder="Search logs..." 
                                        style={{ height: "40px", paddingLeft: "36px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--muted)", fontSize: "0.85rem", fontWeight: 700 }}
                                    />
                                </div>
                                <button className={adminStyles.refreshBtn}>
                                    <Filter size={18} /> Filter
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {incidents.map((inc) => (
                                <div key={inc.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", borderRadius: "20px", background: "var(--muted)", border: "1px solid var(--border)" }}>
                                    <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                                        <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                                            <ShieldAlert size={20} style={{ color: getSeverityStyle(inc.severity).color }} />
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "0.85rem", fontWeight: 950 }}>{inc.firm}</span>
                                                <span style={{ fontSize: "0.7rem", fontWeight: 800, padding: "2px 8px", borderRadius: "6px", ...getSeverityStyle(inc.severity) }}>{inc.severity} SEVERITY</span>
                                            </div>
                                            <div style={{ fontSize: "0.9rem", color: "var(--foreground)", fontWeight: 700 }}>{inc.description}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 600, marginTop: "4px" }}>Log ID: {inc.id} • {inc.timestamp}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button className={adminStyles.btnDark} style={{ padding: "8px 16px", fontSize: "0.75rem", borderRadius: "12px" }}>
                                            <Terminal size={14} style={{ marginRight: "8px" }} /> Diagnostics
                                        </button>
                                        <button className={adminStyles.btnLight} style={{ padding: "8px 16px", fontSize: "0.75rem", borderRadius: "12px" }}>
                                            <MessageSquare size={14} style={{ marginRight: "8px" }} /> Contact
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bridge Access Section */}
                    <div className={adminStyles.card}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 950, marginBottom: "24px" }}>Sovereign Access Bridge</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                            <div style={{ padding: "24px", borderRadius: "24px", background: "linear-gradient(135deg, rgba(82, 102, 255, 0.05) 0%, rgba(82, 102, 255, 0) 100%)", border: "1px solid rgba(82, 102, 255, 0.2)" }}>
                                <Terminal size={32} style={{ color: "var(--accent)", marginBottom: "16px" }} />
                                <h4 style={{ fontWeight: 950, marginBottom: "8px" }}>Remote n8n Debugger</h4>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "20px" }}>Establish a secure, temporary tunnel into client workflow environments for troubleshooting.</p>
                                <button className={adminStyles.btnDark} style={{ width: "100%", height: "48px" }}>Request Debug Session</button>
                            </div>
                            <div style={{ padding: "24px", borderRadius: "24px", background: "var(--muted)", border: "1px solid var(--border)" }}>
                                <ShieldAlert size={32} style={{ color: "var(--foreground)", marginBottom: "16px" }} />
                                <h4 style={{ fontWeight: 950, marginBottom: "8px" }}>Governance Overlap</h4>
                                <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", marginBottom: "20px" }}>Review active administrator sessions and diagnostic permissions granted by firm owners.</p>
                                <button className={adminStyles.btnLight} style={{ width: "100%", height: "48px" }}>Review Permissions</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div className={adminStyles.card} style={{ padding: "24px" }}>
                        <h4 style={{ fontSize: "0.85rem", fontWeight: 950, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)", marginBottom: "20px" }}>Alert Configuration</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>Mobile Push (Critical)</span>
                                <div style={{ width: "36px", height: "18px", background: "var(--accent)", borderRadius: "9px", position: "relative" }}>
                                    <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", right: "2px", top: "2px" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>Discord Webhook</span>
                                <div style={{ width: "36px", height: "18px", background: "var(--accent)", borderRadius: "9px", position: "relative" }}>
                                    <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", right: "2px", top: "2px" }} />
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "0.85rem", fontWeight: 800 }}>Email Digest</span>
                                <div style={{ width: "36px", height: "18px", background: "var(--border)", borderRadius: "9px", position: "relative" }}>
                                    <div style={{ width: "14px", height: "14px", background: "white", borderRadius: "50%", position: "absolute", left: "2px", top: "2px" }} />
                                </div>
                            </div>
                        </div>
                        <button className={adminStyles.btnLight} style={{ width: "100%", marginTop: "24px", height: "44px", fontSize: "0.85rem" }}>
                            <PhoneForwarded size={16} style={{ marginRight: "8px" }} /> Configure On-Call
                        </button>
                    </div>

                    <div className={adminStyles.card} style={{ padding: "24px", background: "var(--foreground)", color: "var(--background)" }}>
                        <BellRing size={24} style={{ marginBottom: "16px" }} />
                        <h4 style={{ fontWeight: 950, marginBottom: "8px" }}>Live Error Stream</h4>
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", marginBottom: "16px" }}>Listening for node broadcast events on ALPHA cluster...</p>
                        <div style={{ height: "120px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "12px", fontFamily: "monospace", fontSize: "0.65rem", overflow: "hidden" }}>
                            <div style={{ color: "rgba(255,255,255,0.4)" }}>[12:44:02] Listener attached</div>
                            <div style={{ color: "#FF5252" }}>[12:44:11] ERROR: ECONNREFUSED 10.0.4.12</div>
                            <div style={{ color: "rgba(255,255,255,0.4)" }}>[12:44:15] Retrying in 5000ms...</div>
                            <div style={{ color: "#FFA726" }}>[12:44:20] WARN: RAM high (92%) on node-delta-12</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
