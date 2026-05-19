"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Settings, 
    RefreshCcw, 
    Save, 
    Globe, 
    Server, 
    Shield, 
    Mail, 
    Zap, 
    AlertTriangle,
    Bell,
    CreditCard,
    Layout
} from "lucide-react";
import adminStyles from "../admin.module.css";

export default function SystemSettingsPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);
    const [activeTab, setActiveTab] = useState("general");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/session");
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.user);
                    const role = (data.user.role || "").toUpperCase();
                    if (role !== "SUPERADMIN" && role !== "SUPER ADMIN" && role !== "ROOT") {
                        router.replace("/admin");
                    }
                } else {
                    router.replace("/admin/login");
                }
            } finally {
                setIsCheckingRole(false);
            }
        })();
    }, [router]);

    if (isCheckingRole || (currentUser && currentUser.role !== "SuperAdmin")) {
        return (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RefreshCcw size={24} className={adminStyles.spinning} color="var(--accent)" />
            </div>
        );
    }

    const tabs = [
        { id: "general", label: "General", icon: <Globe size={18} /> },
        { id: "server", label: "Infrastructure", icon: <Server size={18} /> },
        { id: "billing", label: "Institutional Billing", icon: <CreditCard size={18} /> },
        { id: "notifications", label: "System Alerts", icon: <Bell size={18} /> }
    ];

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: '#0F172A', color: 'white', border: 'none' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Settings size={28} color="#10B981" />
                    </div>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>System Settings</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', margin: '6px 0 0', fontWeight: 700 }}>Global configuration for the BLONK Sovereign environment</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.primaryBtn} style={{ width: 'auto', padding: '0 24px', height: '48px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Save size={18} /> Commit Changes
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "40px" }}>
                {/* SETTINGS TABS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "16px 20px",
                                borderRadius: "14px",
                                border: "none",
                                background: activeTab === tab.id ? "#0F172A" : "transparent",
                                color: activeTab === tab.id ? "white" : "#64748B",
                                fontSize: "0.9rem",
                                fontWeight: 900,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* SETTINGS CONTENT */}
                <div className={adminStyles.registryCard} style={{ padding: '48px' }}>
                    {activeTab === "general" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 950, margin: "0 0 24px" }}>Institutional Branding</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 950, color: "#94A3B8", marginBottom: "8px", textTransform: "uppercase" }}>Platform Name</label>
                                        <input style={{ width: "100%", height: "48px", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "0 16px", fontSize: "0.9rem", fontWeight: 700, outline: "none" }} defaultValue="BLONK.SOVEREIGN" />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 950, color: "#94A3B8", marginBottom: "8px", textTransform: "uppercase" }}>Support Email</label>
                                        <input style={{ width: "100%", height: "48px", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "0 16px", fontSize: "0.9rem", fontWeight: 700, outline: "none" }} defaultValue="institutional-support@manadavana.lv" />
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: "32px", background: "#F8FAFC", borderRadius: "24px", border: "1px solid #E2E8F0" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: "1rem", fontWeight: 950, color: "#0F172A" }}>Global Maintenance Mode</div>
                                        <p style={{ fontSize: "0.85rem", color: "#64748B", margin: "4px 0 0", fontWeight: 600 }}>Lock down all client nodes and workspace access.</p>
                                    </div>
                                    <div style={{ width: "48px", height: "26px", background: "#CBD5E1", borderRadius: "100px", position: "relative", cursor: "pointer" }}>
                                        <div style={{ width: "20px", height: "20px", background: "white", borderRadius: "50%", position: "absolute", left: "3px", top: "3px" }} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 950, margin: "0 0 24px" }}>Communication Hub</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)", borderRadius: "14px" }}>
                                    <Mail size={18} color="#10B981" />
                                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#065F46" }}>Institutional SMTP is nominal.</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "server" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 950, margin: 0 }}>Cluster Infrastructure</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ padding: "24px", background: "#0F172A", borderRadius: "20px", color: "white" }}>
                                    <div style={{ fontSize: "0.65rem", fontWeight: 950, opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.1em" }}>Primary API Gateway</div>
                                    <div style={{ fontSize: "1.1rem", fontWeight: 900, marginTop: "8px" }}>https://api.manadavana.lv/v1</div>
                                </div>
                                <div style={{ padding: "24px", border: "1px solid #E2E8F0", borderRadius: "20px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 950 }}>Node Auto-Scaling</span>
                                        <span style={{ fontSize: "0.7rem", fontWeight: 950, padding: "4px 10px", background: "#E8FDF0", color: "#10B981", borderRadius: "100px" }}>ACTIVE</span>
                                    </div>
                                    <div style={{ height: "6px", background: "#F1F5F9", borderRadius: "10px", overflow: "hidden" }}>
                                        <div style={{ width: "65%", height: "100%", background: "#10B981" }} />
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", fontSize: "0.7rem", color: "#64748B", fontWeight: 700 }}>
                                        <span>Current: 12 Nodes</span>
                                        <span>Limit: 20 Nodes</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab !== "general" && activeTab !== "server" && (
                        <div style={{ padding: "80px 0", textAlign: "center" }}>
                            <div style={{ width: "64px", height: "64px", background: "#F8FAFC", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                                <Zap size={24} color="#CBD5E1" />
                            </div>
                            <h4 style={{ fontSize: "1.1rem", fontWeight: 950, margin: 0 }}>Submodule calibrating...</h4>
                            <p style={{ fontSize: "0.85rem", color: "#64748B", marginTop: "8px", fontWeight: 700 }}>This settings module is being synced with the VPS database.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
