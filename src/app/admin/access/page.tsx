"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Shield, 
    Lock, 
    Check, 
    X, 
    RefreshCcw, 
    UserCheck, 
    ShieldAlert, 
    Eye, 
    Settings,
    Key,
    Database,
    Users
} from "lucide-react";
import adminStyles from "../admin.module.css";

export default function AccessRolesPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

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

    const roles = [
        { 
            name: "SuperAdmin", 
            description: "Full institutional control. Root access to all modules, financial data, and security policies.",
            permissions: ["Read/Write All", "Financial Reports", "User Management", "System Config", "Audit Logs"],
            color: "#0F172A"
        },
        { 
            name: "Admin", 
            description: "High-level administrative access. Can manage users and fleet, but restricted from root system settings.",
            permissions: ["Read/Write Users", "Fleet Control", "Support Tickets", "Registry Access"],
            color: "#3B82F6"
        },
        { 
            name: "Operator", 
            description: "Operational staff. Manages day-to-day workflow execution and client support.",
            permissions: ["Workflow Control", "Support Bridge", "Registry View"],
            color: "#10B981"
        },
        { 
            name: "Viewer", 
            description: "Read-only access. Auditing and observation only.",
            permissions: ["Read-only Modules"],
            color: "#64748B"
        }
    ];

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: '#0F172A', color: 'white', border: 'none' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <Shield size={28} color="#10B981" />
                    </div>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>Access & Roles</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', margin: '6px 0 0', fontWeight: 700 }}>Institutional privilege and governance management</p>
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "32px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    
                    {/* ROLE CARDS */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                        {roles.map((role, i) => (
                            <div key={i} className={adminStyles.registryCard} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: role.color }} />
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 950, margin: 0 }}>{role.name}</h4>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: 950, padding: '4px 10px', background: '#F1F5F9', color: '#64748B', borderRadius: '100px', textTransform: 'uppercase' }}>Active Policy</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, lineHeight: '1.6', margin: 0 }}>{role.description}</p>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {role.permissions.map((p, idx) => (
                                        <span key={idx} style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 12px', background: 'rgba(59, 130, 246, 0.05)', color: '#3B82F6', borderRadius: '8px' }}>
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* SYSTEM POLICIES */}
                    <div className={adminStyles.registryCard} style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: 0 }}>Security Protocol Policies</h3>
                            <button className={adminStyles.primaryBtn} style={{ width: 'auto', padding: '0 20px', height: '40px', fontSize: '0.8rem' }}>Update Protocols</button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: "Enforce MFA for Admin Accounts", active: true, desc: "Require cryptographic verification for all privileged access." },
                                { label: "Session Expiry Timeout (12h)", active: true, desc: "Automatically revoke administrative tokens after 12 hours of inactivity." },
                                { label: "IP Whitelisting", active: false, desc: "Restrict access to predefined institutional network ranges." },
                                { label: "Action Auditing", active: true, desc: "Log every state-mutating request to the immutable event ledger." }
                            ].map((policy, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>{policy.label}</div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{policy.desc}</div>
                                    </div>
                                    <div style={{ width: "44px", height: "24px", background: policy.active ? '#10B981' : '#CBD5E1', borderRadius: "100px", position: "relative", cursor: 'pointer' }}>
                                        <div style={{ width: "18px", height: "18px", background: "white", borderRadius: "50%", position: "absolute", [policy.active ? 'right' : 'left']: "3px", top: "3px", transition: '0.2s' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    <div className={adminStyles.registryCard} style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <Key size={20} color="#64748B" />
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Governance Keys</h4>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600, lineHeight: '1.5' }}>Administrative access is controlled by the Root platform owner. Only the Platform Owner can promote or demote other Admin staff.</p>
                        <div style={{ marginTop: '24px', padding: '16px', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '12px', display: 'flex', gap: '12px' }}>
                            <ShieldAlert size={18} color="#F97316" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9A3412' }}>Policy changes require re-authentication.</span>
                        </div>
                    </div>

                    <div className={adminStyles.registryCard} style={{ padding: '32px', background: '#0F172A', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <Database size={20} color="#10B981" />
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Active Sessions</h4>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 950 }}>14</div>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, margin: '8px 0 0' }}>Connected Admin Nodes</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
