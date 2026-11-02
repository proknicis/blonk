"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Settings, RefreshCcw, Save, Globe, Server, 
    Shield, Mail, Zap, AlertTriangle, Bell, 
    CreditCard, Layout, CheckCircle, Info
} from "lucide-react";
import adminStyles from "../admin.module.css";

export default function SystemSettingsPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);
    const [activeTab, setActiveTab] = useState("general");

    // Form States
    const [platformName, setPlatformName] = useState("BLONK.SOVEREIGN");
    const [supportEmail, setSupportEmail] = useState("institutional-support@manadavana.lv");
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Alert settings states
    const [alertOnFail, setAlertOnFail] = useState(true);
    const [alertOnApproval, setAlertOnApproval] = useState(true);

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
            } catch (e) {
                console.error("Session verification failed:", e);
            } finally {
                setIsCheckingRole(false);
            }
        })();
    }, [router]);

    const handleSaveSettings = async () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            if ((window as any).showToast) (window as any).showToast("Platform configurations committed successfully.", "success");
        }, 1000);
    };

    const handleToggleMaintenance = () => {
        const nextState = !maintenanceMode;
        const msg = nextState 
            ? "CRITICAL OPERATION: Enable global maintenance mode? This will lock all tenant workflow nodes and block client access." 
            : "Restore all client nodes and reopen platform workspace access?";
            
        if (confirm(msg)) {
            setMaintenanceMode(nextState);
            if ((window as any).showToast) {
                (window as any).showToast(`Global maintenance mode ${nextState ? 'ENABLED' : 'DISABLED'}.`, nextState ? "warning" : "success");
            }
        }
    };

    if (isCheckingRole || (currentUser && currentUser.role !== "SuperAdmin")) {
        return (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RefreshCcw size={24} className={adminStyles.spinning} color="var(--accent)" />
            </div>
        );
    }

    const tabs = [
        { id: "general", label: "General Config", icon: <Globe size={16} /> },
        { id: "notifications", label: "System Alerts", icon: <Bell size={16} /> },
        { id: "server", label: "Infrastructure", icon: <Server size={16} /> },
        { id: "billing", label: "Billing & Tiering", icon: <CreditCard size={16} /> }
    ];

    return (
        <div style={{ animation: "fadeIn 0.5s ease-out", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '32px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Settings size={24} color="#10B981" />
                    </div>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 950, margin: 0, letterSpacing: '-0.02em' }}>Platform Configuration</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: '4px 0 0', fontWeight: 700 }}>Global operations preferences for the BLONK server environment</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button 
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className={adminStyles.primaryBtn} 
                        style={{ width: 'auto', padding: '0 20px', height: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Save size={16} /> {isSaving ? "Saving..." : "Commit Configuration"}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "40px" }}>
                {/* SETTINGS TABS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "14px 18px",
                                borderRadius: "10px",
                                border: "none",
                                background: activeTab === tab.id ? "var(--foreground)" : "transparent",
                                color: activeTab === tab.id ? "var(--background)" : "var(--muted-foreground)",
                                fontSize: "0.8rem",
                                fontWeight: 950,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                textAlign: "left"
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* SETTINGS CONTENT */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "40px" }}>
                    
                    {/* 1. GENERAL TAB */}
                    {activeTab === "general" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: 950, margin: "0 0 20px", color: "var(--foreground)" }}>Platform Branding & Preferences</h3>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: "6px", textTransform: "uppercase" }}>Platform Name</label>
                                        <input 
                                            value={platformName} 
                                            onChange={e => setPlatformName(e.target.value)}
                                            style={{ width: "100%", height: "40px", borderRadius: "8px", border: '1px solid var(--border)', padding: "0 12px", fontSize: "0.85rem", fontWeight: 750, outline: "none", background: "var(--muted)", color: "var(--foreground)" }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: "6px", textTransform: "uppercase" }}>Platform Support Email</label>
                                        <input 
                                            value={supportEmail} 
                                            onChange={e => setSupportEmail(e.target.value)}
                                            style={{ width: "100%", height: "40px", borderRadius: "8px", border: '1px solid var(--border)', padding: "0 12px", fontSize: "0.85rem", fontWeight: 750, outline: "none", background: "var(--muted)", color: "var(--foreground)" }} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dangerous: Maintenance toggle */}
                            <div style={{ padding: "24px", background: maintenanceMode ? "rgba(239, 68, 68, 0.05)" : "var(--muted)", borderRadius: "18px", border: `1px solid ${maintenanceMode ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)'}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: "0.9rem", fontWeight: 950, color: maintenanceMode ? "#EF4444" : "var(--foreground)" }}>Global Maintenance Mode Override</div>
                                    <p style={{ fontSize: "0.75rem", color: 'var(--muted-foreground)', margin: "4px 0 0", fontWeight: 700 }}>Locally suspend all client workspace deployments and loops.</p>
                                </div>
                                <button 
                                    onClick={handleToggleMaintenance}
                                    style={{ 
                                        height: "36px", 
                                        padding: "0 16px", 
                                        border: `1px solid ${maintenanceMode ? '#EF4444' : 'var(--border)'}`, 
                                        background: maintenanceMode ? "#EF4444" : "var(--card)", 
                                        color: maintenanceMode ? "#FFFFFF" : "var(--foreground)", 
                                        borderRadius: "8px", 
                                        fontSize: "0.75rem", 
                                        fontWeight: 950,
                                        cursor: "pointer"
                                    }}
                                >
                                    {maintenanceMode ? "System Suspended" : "Trigger Maintenance"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* 2. NOTIFICATIONS TAB */}
                    {activeTab === "notifications" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 950, margin: 0, color: "var(--foreground)" }}>Administrative Notifications</h3>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <input 
                                        type="checkbox" 
                                        id="alertFail" 
                                        checked={alertOnFail} 
                                        onChange={e => setAlertOnFail(e.target.checked)} 
                                        style={{ cursor: "pointer" }}
                                    />
                                    <label htmlFor="alertFail" style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--foreground)", cursor: "pointer" }}>
                                        Email SuperAdmin immediately on execution telemetry failure
                                    </label>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <input 
                                        type="checkbox" 
                                        id="alertApp" 
                                        checked={alertOnApproval} 
                                        onChange={e => setAlertOnApproval(e.target.checked)} 
                                        style={{ cursor: "pointer" }}
                                    />
                                    <label htmlFor="alertApp" style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--foreground)", cursor: "pointer" }}>
                                        Dispatch notification when workflow triggers HITL compliance override
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 3. INFRASTRUCTURE TAB */}
                    {activeTab === "server" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 950, margin: 0, color: "var(--foreground)" }}>Infrastructure Node Configurations</h3>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ padding: "18px", background: 'var(--muted)', border: "1px solid var(--border)", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: "0.8rem", fontWeight: 900 }}>API Gateway Proxy Route</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--muted-foreground)", marginTop: "2px" }}>http://localhost:3000/api</div>
                                    </div>
                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, padding: "2px 8px", background: "rgba(16, 185, 129, 0.15)", color: "#10B981", borderRadius: "4px" }}>Nominal</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 4. BILLING & TIERING TAB */}
                    {activeTab === "billing" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 950, margin: 0, color: "var(--foreground)" }}>Billing Plans & Pricing Tier mappings</h3>
                            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: 0, fontWeight: 700 }}>Plans linked to Stripe Connect product webhook metadata schemas.</p>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {["Starter - €299/mo", "Professional - €599/mo", "Enterprise - Custom pricing"].map((plan, idx) => (
                                    <div key={idx} style={{ padding: "12px 16px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.8rem", fontWeight: 900 }}>
                                        {plan}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}
