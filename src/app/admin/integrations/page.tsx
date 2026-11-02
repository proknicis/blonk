"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    ExternalLink, RefreshCcw, CheckCircle, AlertCircle, 
    Cloud, Key, Bot, MessageSquare, CreditCard, ChevronRight,
    Users, ShieldAlert, Sparkles, Filter, X, Database
} from "lucide-react";
import adminStyles from "../admin.module.css";

const BLUEPRINT_REQUIRED_TOOLS: Record<string, string[]> = {
    'invoice-parsing-billing': ['Gmail', 'OpenAI', 'Google Sheets'],
    'outbound-enrichment': ['Slack', 'OpenAI', 'Apollo.io'],
    'customer-intake-sync': ['Hubspot', 'Slack', 'Gmail'],
    'expense-compliance-audit': ['Gmail', 'OpenAI', 'Stripe'],
    'talent-screening-pipeline': ['Slack', 'OpenAI', 'Google Sheets'],
    'automated-contract-review': ['Stripe', 'Gmail', 'Slack'],
    'support-ticket-routing': ['Gmail', 'Slack', 'OpenAI'],
    'document-knowledge-search': ['Google Drive', 'Slack', 'Notion'],
    'devops-alert-triaging': ['Gmail', 'Slack', 'Jira'],
    'lead-nurturing-agent': ['Slack', 'OpenAI', 'Gmail'],
    'client-onboarding-tracker': ['Gmail', 'Slack', 'Google Sheets'],
    'subscription-churn-alert': ['Stripe', 'OpenAI', 'Slack'],
    'legal-contract-generator': ['Gmail', 'OpenAI', 'Slack'],
    'translation-localization': ['OpenAI', 'Google Sheets', 'Slack'],
    'social-media-scheduler': ['Gmail', 'Slack', 'OpenAI'],
    'it-asset-tracker': ['Gmail', 'OpenAI', 'Slack'],
    'compliance-reporting': ['OpenAI', 'Slack', 'Gmail'],
    'employee-performance-tracker': ['Gmail', 'OpenAI', 'Google Sheets'],
    'content-marketing-generator': ['Gmail', 'OpenAI', 'Slack'],
    'billing-collections-reminder': ['Slack', 'Stripe', 'Gmail'],
    'product-release-notifier': ['Slack', 'OpenAI', 'Gmail']
};

interface IntegrationStat {
    provider: string;
    label: string;
    icon: React.ReactNode;
    connectedCount: number;
    missingCount: number;
    expiredCount: number;
}

export default function IntegrationsPage() {
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Drill down selected provider state
    const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

    const fetchWorkspaces = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            if (res.ok) {
                const data = await res.json();
                const filtered = data.filter((w: any) => w.role !== "SuperAdmin");
                setWorkspaces(filtered);
            }
        } catch (e) {
            console.error("Failed to load integrations data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    // Integration providers configuration
    const PROVIDERS = [
        { key: "gmail", label: "Gmail Link", icon: <MessageSquare size={20} color="#EA4335" /> },
        { key: "slack", label: "Slack Sync", icon: <MessageSquare size={20} color="#4A154B" /> },
        { key: "google sheets", label: "Google Sheets", icon: <Cloud size={20} color="#0F9D58" /> },
        { key: "stripe", label: "Stripe Connect", icon: <CreditCard size={20} color="#635BFF" /> },
        { key: "openai", label: "OpenAI API", icon: <Bot size={20} color="#10A37F" /> },
        { key: "google drive", label: "Google Drive", icon: <Cloud size={20} color="#4285F4" /> },
        { key: "notion", label: "Notion Integration", icon: <Database size={20} color="#000000" /> }
    ];

    // Compute metrics
    const stats: IntegrationStat[] = PROVIDERS.map(p => {
        let connectedCount = 0;
        let missingCount = 0;
        let expiredCount = 0;

        workspaces.forEach(ws => {
            const blueprintKey = ws.selectedWorkflowId || "";
            const reqTools = BLUEPRINT_REQUIRED_TOOLS[blueprintKey] || [];
            const isRequired = reqTools.map(t => t.toLowerCase()).includes(p.key.toLowerCase());

            const credentials = ws.connectedCredentials || [];
            const cred = credentials.find((c: any) => c.provider.toLowerCase() === p.key.toLowerCase());

            if (cred) {
                if (cred.status === 'expired' || cred.status === 'failed') {
                    expiredCount++;
                } else {
                    connectedCount++;
                }
            } else if (isRequired) {
                missingCount++;
            }
        });

        return {
            provider: p.key,
            label: p.label,
            icon: p.icon,
            connectedCount,
            missingCount,
            expiredCount
        };
    });

    // Affected workspaces for selected provider
    const getAffectedWorkspaces = () => {
        if (!selectedProvider) return [];
        return workspaces.filter(ws => {
            const blueprintKey = ws.selectedWorkflowId || "";
            const reqTools = BLUEPRINT_REQUIRED_TOOLS[blueprintKey] || [];
            const isRequired = reqTools.map(t => t.toLowerCase()).includes(selectedProvider.toLowerCase());

            const credentials = ws.connectedCredentials || [];
            const cred = credentials.find((c: any) => c.provider.toLowerCase() === selectedProvider.toLowerCase());

            // We show it in drilldown if it requires this integration, whether active, missing, or failed
            return isRequired || !!cred;
        });
    };

    const affectedWorkspaces = getAffectedWorkspaces();

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* PLATFORM METRICS SUMMARY */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Active connected Integrations</span>
                    <div style={{ fontSize: "1.75rem", fontWeight: 950, color: "#10B981", marginTop: "6px" }}>
                        {stats.reduce((sum, s) => sum + s.connectedCount, 0)}
                    </div>
                </div>
                <div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Critical Missing links</span>
                    <div style={{ fontSize: "1.75rem", fontWeight: 950, color: "#EF4444", marginTop: "6px" }}>
                        {stats.reduce((sum, s) => sum + s.missingCount, 0)}
                    </div>
                </div>
                <div>
                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Expired auth errors</span>
                    <div style={{ fontSize: "1.75rem", fontWeight: 950, color: "#F59E0B", marginTop: "6px" }}>
                        {stats.reduce((sum, s) => sum + s.expiredCount, 0)}
                    </div>
                </div>
            </div>

            {/* TWO COLUMN CONTENT */}
            <div style={{ display: "grid", gridTemplateColumns: selectedProvider ? "1.6fr 1.4fr" : "1fr", gap: "32px", transition: "all 0.3s", alignItems: "start" }}>
                
                {/* INTEGRATIONS PROVIDER INDEX */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>PLATFORM INTEGRATION SYNC</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 750 }}>Sync status tracking of credentials across client workspaces</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} style={{ height: "100px", background: "var(--muted)", borderRadius: "14px", animation: "pulse 1.5s infinite" }} />
                            ))
                        ) : (
                            stats.map((s, idx) => {
                                const isSelected = selectedProvider === s.provider;
                                return (
                                    <div 
                                        key={idx}
                                        onClick={() => setSelectedProvider(isSelected ? null : s.provider)}
                                        style={{ 
                                            padding: "24px", 
                                            background: isSelected ? "var(--muted)" : "var(--card)", 
                                            border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, 
                                            borderRadius: "16px",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: "14px",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--accent)'; }}
                                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                                    >
                                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                            <div style={{ width: "38px", height: "38px", background: "var(--muted)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                                                {s.icon}
                                            </div>
                                            <div>
                                                <h4 style={{ fontSize: "0.9rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>{s.label}</h4>
                                                <span style={{ fontSize: "0.65rem", fontWeight: 900, color: "var(--muted-foreground)", textTransform: "uppercase" }}>{s.provider}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", fontSize: "0.8rem", fontWeight: 800 }}>
                                            <div>
                                                <div style={{ color: "#10B981" }}>{s.connectedCount}</div>
                                                <span style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", fontWeight: 700 }}>ACTIVE</span>
                                            </div>
                                            <div>
                                                <div style={{ color: "#EF4444" }}>{s.missingCount}</div>
                                                <span style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", fontWeight: 700 }}>MISSING</span>
                                            </div>
                                            <div>
                                                <div style={{ color: "#F59E0B" }}>{s.expiredCount}</div>
                                                <span style={{ fontSize: "0.6rem", color: "var(--muted-foreground)", fontWeight: 700 }}>EXPIRED</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* IMPACTED WORKSPACES DRILL-DOWN */}
                {selectedProvider && (
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.2s ease-out" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
                            <div>
                                <h3 style={{ fontSize: "1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>IMPACTED WORKSPACES</h3>
                                <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700 }}>Provider: {selectedProvider.toUpperCase()}</span>
                            </div>
                            <button onClick={() => setSelectedProvider(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}>
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
                            {affectedWorkspaces.length === 0 ? (
                                <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>No workspaces configured with this integration.</span>
                            ) : (
                                affectedWorkspaces.map((ws) => {
                                    const credentials = ws.connectedCredentials || [];
                                    const cred = credentials.find((c: any) => c.provider.toLowerCase() === selectedProvider.toLowerCase());
                                    
                                    let statusText = "Missing Connection";
                                    let statusColor = "#EF4444";
                                    let statusBg = "rgba(239, 68, 68, 0.1)";

                                    if (cred) {
                                        if (cred.status === 'expired' || cred.status === 'failed') {
                                            statusText = "Expired / Failed";
                                            statusColor = "#F59E0B";
                                            statusBg = "rgba(245, 158, 11, 0.1)";
                                        } else {
                                            statusText = "Connected Nominal";
                                            statusColor = "#10B981";
                                            statusBg = "rgba(16, 185, 129, 0.1)";
                                        }
                                    }

                                    return (
                                        <div 
                                            key={ws.id} 
                                            onClick={() => router.push(`/admin/workspaces/${ws.id}`)}
                                            style={{ 
                                                display: "flex", 
                                                justifyContent: "space-between", 
                                                alignItems: "center", 
                                                padding: "12px 16px", 
                                                background: "var(--muted)", 
                                                borderRadius: "10px", 
                                                cursor: "pointer",
                                                border: "1px solid var(--border)",
                                                transition: "border-color 0.2s"
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div>
                                                <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "var(--foreground)" }}>{ws.firmName || "Sovereign Workspace"}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "2px" }}>Operator: {ws.name}</div>
                                            </div>
                                            
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                <span style={{ 
                                                    fontSize: "0.6rem", 
                                                    fontWeight: 950, 
                                                    padding: "3px 8px", 
                                                    borderRadius: "4px",
                                                    background: statusBg,
                                                    color: statusColor,
                                                    textTransform: "uppercase"
                                                }}>{statusText}</span>
                                                <ChevronRight size={14} style={{ color: "var(--muted-foreground)" }} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}
