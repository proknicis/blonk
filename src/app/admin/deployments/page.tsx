"use client";

import React, { useState, useEffect } from "react";
import { Server, Activity, CheckCircle, AlertTriangle, RefreshCw, Layers, Compass, Loader2 } from "lucide-react";
import adminStyles from "../admin.module.css";

interface WorkspaceDeployment {
    customerBrainId: string;
    installedVersion: string;
    installedAt: string;
    installationStatus: string;
    automationName: string;
    latestVersion: string;
    category: string;
    teamName: string;
    companyName: string;
    deploymentStatus: string;
    n8nServer: string;
    executionMode: string;
    lastUpdated: string;
}

export default function WorkspaceDeploymentsPage() {
    const [deployments, setDeployments] = useState<WorkspaceDeployment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDeployments = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/deployments");
            if (res.ok) {
                setDeployments(await res.json());
            }
        } catch (e) {
            console.error("Failed to load deployments:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeployments();
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>ACTIVE WORKSPACE DEPLOYMENTS</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 750 }}>
                        Monitor installed automations, container versions, hosting nodes, and system health status.
                    </p>
                </div>
                <button 
                    onClick={fetchDeployments} 
                    style={{ 
                        height: "36px", 
                        padding: "0 12px", 
                        background: "var(--muted)", 
                        border: "1px solid var(--border)", 
                        borderRadius: "8px", 
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        color: "var(--foreground)",
                        gap: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 900
                    }}
                >
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
                    <Loader2 className="spin" size={24} style={{ color: "var(--accent)" }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--muted-foreground)" }}>Querying Active Nodes...</span>
                </div>
            ) : (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ background: "var(--muted)", borderBottom: "1px solid var(--border)" }}>
                                <th style={{ padding: "16px 24px", fontSize: "0.7rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>AI Employee / Automation</th>
                                <th style={{ padding: "16px 24px", fontSize: "0.7rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Workspace Customer</th>
                                <th style={{ padding: "16px 24px", fontSize: "0.7rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Running Version</th>
                                <th style={{ padding: "16px 24px", fontSize: "0.7rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Hosting Region / Node</th>
                                <th style={{ padding: "16px 24px", fontSize: "0.7rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Health status</th>
                                <th style={{ padding: "16px 24px", fontSize: "0.7rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", textAlign: "right" }}>Last Sync</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deployments.map((dep, idx) => {
                                const isUpdateAvailable = dep.installedVersion !== dep.latestVersion;
                                const isHealthy = (dep.deploymentStatus || 'Active') === 'Active';
                                
                                return (
                                    <tr key={idx} style={{ borderBottom: idx === deployments.length - 1 ? "none" : "1px solid var(--border)", fontSize: "0.82rem", fontWeight: 800 }}>
                                        {/* Name */}
                                        <td style={{ padding: "20px 24px" }}>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)" }} />
                                                <div>
                                                    <span style={{ color: "var(--foreground)", fontWeight: 900 }}>{dep.automationName}</span>
                                                    <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "2px" }}>
                                                        Category: {dep.category || "General"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        
                                        {/* Company */}
                                        <td style={{ padding: "20px 24px", color: "var(--foreground)" }}>
                                            {dep.companyName || dep.teamName}
                                        </td>
                                        
                                        {/* Version info */}
                                        <td style={{ padding: "20px 24px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ fontFamily: "monospace", fontWeight: 900 }}>v{dep.installedVersion}</span>
                                                {isUpdateAvailable && (
                                                    <span style={{ 
                                                        fontSize: "0.62rem", 
                                                        fontWeight: 950, 
                                                        background: "rgba(245, 158, 11, 0.12)", 
                                                        color: "#D97706", 
                                                        padding: "2px 8px", 
                                                        borderRadius: "100px" 
                                                    }}>
                                                        Update to v{dep.latestVersion}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* Server info */}
                                        <td style={{ padding: "20px 24px" }}>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                                <span style={{ color: "var(--foreground)" }}>{dep.n8nServer || "n8n-main-node-1"}</span>
                                                <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                                    Region: EU-West
                                                </span>
                                            </div>
                                        </td>
                                        
                                        {/* Health */}
                                        <td style={{ padding: "20px 24px" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: isHealthy ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)", color: isHealthy ? "#10B981" : "#EF4444", padding: "4px 10px", borderRadius: "100px", fontSize: "0.65rem", fontWeight: 950, textTransform: "uppercase" }}>
                                                {isHealthy ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                                <span>{isHealthy ? "Healthy" : "Degraded"}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Last Sync */}
                                        <td style={{ padding: "20px 24px", textAlign: "right", color: "var(--muted-foreground)" }}>
                                            {dep.lastUpdated ? new Date(dep.lastUpdated).toLocaleTimeString() : "Just now"}
                                        </td>
                                    </tr>
                                );
                            })}
                            {deployments.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)" }}>
                                        No active workspace automations deployed yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}
