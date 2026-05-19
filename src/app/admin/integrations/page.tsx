"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    ExternalLink, 
    RefreshCcw, 
    Plus, 
    Zap, 
    Shield, 
    CheckCircle, 
    AlertCircle, 
    Cloud, 
    Key, 
    Bot,
    MessageSquare,
    CreditCard
} from "lucide-react";
import adminStyles from "../admin.module.css";

export default function IntegrationsPage() {
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

    const integrations = [
        { 
            name: "n8n Workflow Engine", 
            status: "Connected", 
            type: "Core Automation", 
            icon: <Zap size={24} color="#FF6D5A" />,
            lastSync: "2 mins ago",
            desc: "Primary execution engine for sovereign client workflows."
        },
        { 
            name: "PostgreSQL Database", 
            status: "Connected", 
            type: "Persistence", 
            icon: <Cloud size={24} color="#336791" />,
            lastSync: "Live",
            desc: "Institutional relational data store on VPS cluster."
        },
        { 
            name: "Stripe Connect", 
            status: "Connected", 
            type: "Financial Hub", 
            icon: <CreditCard size={24} color="#635BFF" />,
            lastSync: "14 mins ago",
            desc: "Institutional billing and subscription management."
        },
        { 
            name: "OpenAI API", 
            status: "Connected", 
            type: "Cognitive Engine", 
            icon: <Bot size={24} color="#10A37F" />,
            lastSync: "1 hour ago",
            desc: "LLM services for autonomous agent reasoning."
        }
    ];

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: '#0F172A', color: 'white', border: 'none' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <ExternalLink size={28} color="#10B981" />
                    </div>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>System Integrations</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', margin: '6px 0 0', fontWeight: 700 }}>Manage institutional connections and third-party API gateways</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.primaryBtn} style={{ width: 'auto', padding: '0 24px', height: '48px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Plus size={18} /> Provision Gateway
                    </button>
                </div>
            </div>

            {/* INTEGRATIONS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
                {integrations.map((int, i) => (
                    <div key={i} className={adminStyles.registryCard} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                <div style={{ width: '56px', height: '56px', background: '#F8FAFC', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #E2E8F0' }}>
                                    {int.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 950, margin: 0 }}>{int.name}</h4>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{int.type}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#E8FDF0', color: '#10B981', borderRadius: '100px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 950 }}>{int.status}</span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600, lineHeight: '1.6', margin: 0 }}>{int.desc}</p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #F1F5F9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <RefreshCcw size={14} color="#94A3B8" />
                                <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 750 }}>Sync: {int.lastSync}</span>
                            </div>
                            <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: '0.8rem', fontWeight: 950, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                Configure <Key size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* API LOGS PREVIEW */}
            <div className={adminStyles.registryCard} style={{ padding: '40px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 950, margin: '0 0 24px' }}>Institutional Gateway Logs</h3>
                <div style={{ height: "180px", background: "#0F172A", borderRadius: "20px", padding: "24px", fontFamily: "monospace", fontSize: "0.75rem", overflow: "hidden", color: "#94A3B8", lineHeight: 1.8 }}>
                    <div>[20:04:12] <span style={{ color: "#10B981" }}>SUCCESS</span>: Stripe.Webhook.Signature verified.</div>
                    <div>[20:03:45] <span style={{ color: "#10B981" }}>SUCCESS</span>: n8n.Trigger received for node blonk-sync-01.</div>
                    <div>[19:58:22] <span style={{ color: "#3B82F6" }}>INFO</span>: OpenAI.Usage calibration completed.</div>
                    <div>[19:45:10] <span style={{ color: "#10B981" }}>SUCCESS</span>: PostgreSQL.Handshake nominal.</div>
                    <div style={{ opacity: 0.5 }}>[19:30:00] System.Handshake starting institutional sync...</div>
                </div>
            </div>

        </div>
    );
}
