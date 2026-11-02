"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { 
    Server, Activity, ShieldAlert, CheckCircle, AlertTriangle, 
    ArrowLeft, RefreshCw, Layers, Cpu, Database, Play, ChevronRight, Save
} from "lucide-react";
import adminStyles from "../../admin.module.css";

export default function ServerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const serverId = params.id as string;

    const [server, setServer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProbing, setIsProbing] = useState(false);
    const [linkedWorkspaces, setLinkedWorkspaces] = useState<any[]>([]);

    // Edit states
    const [editMaxWorkflows, setEditMaxWorkflows] = useState(100);
    const [editTier, setEditTier] = useState("Standard");
    const [isSaving, setIsSaving] = useState(false);

    const fetchServerDetails = async (probe: boolean = false) => {
        if (probe) {
            setIsProbing(true);
        } else {
            setIsLoading(true);
        }
        try {
            const nodesRes = await fetch(probe ? "/api/admin/nodes?probe=true" : "/api/admin/nodes");
            if (nodesRes.ok) {
                const nodes = await nodesRes.json();
                const match = nodes.find((n: any) => n.id === serverId);
                setServer(match || null);
                if (match) {
                    setEditMaxWorkflows(match.max_workflows || 100);
                    setEditTier(match.tier || "Standard");
                }
            }

            // Fetch workspaces to match linked ones
            const workspacesRes = await fetch("/api/admin/users");
            if (workspacesRes.ok) {
                const data = await workspacesRes.json();
                const filtered = data.filter((w: any) => w.role !== "SuperAdmin" && w.assignedServerId === serverId);
                setLinkedWorkspaces(filtered);
            }
        } catch (e) {
            console.error("Failed to load server details:", e);
        } finally {
            setIsLoading(false);
            setIsProbing(false);
        }
    };

    useEffect(() => {
        if (serverId) {
            fetchServerDetails();
        }
    }, [serverId, server?.teamId]);

    const handleSaveMaxWorkflows = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!server) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/nodes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: server.id,
                    max_workflows: editMaxWorkflows,
                    tier: editTier
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Server hardware configurations updated.", "success");
                fetchServerDetails();
            }
        } catch (err) {
            console.error("Save capacity error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestartCheck = async () => {
        if (!confirm("Are you sure you want to restart n8n connectivity check?")) return;
        fetchServerDetails(true);
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ height: '30px', width: '200px', background: 'var(--muted)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ height: '300px', background: 'var(--muted)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
            </div>
        );
    }

    if (!server) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--muted-foreground)", gap: "12px" }}>
                <AlertTriangle size={36} />
                <span style={{ fontSize: "1rem", fontWeight: 800 }}>Server record not found.</span>
                <Link href="/admin/servers" style={{ fontSize: "0.85rem", color: "var(--accent)", textDecoration: "none", fontWeight: 900 }}>
                    Return to Servers Directory
                </Link>
            </div>
        );
    }

    const isOnline = server.status === 'Active';

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link 
                    href="/admin/servers" 
                    style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", fontWeight: 950, color: "var(--accent)" }}
                >
                    <ArrowLeft size={16} /> Back to Servers
                </Link>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 950, color: "var(--muted-foreground)" }}>STATUS:</span>
                    <span style={{ 
                        fontSize: "0.7rem", 
                        fontWeight: 950, 
                        padding: "4px 12px", 
                        borderRadius: "100px", 
                        background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
                        color: isOnline ? '#10B981' : '#EF4444',
                        textTransform: "uppercase" 
                    }}>
                        {isOnline ? "online" : "offline"}
                    </span>
                </div>
            </div>

            {/* TWO COLUMN GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "32px", alignItems: "start" }}>
                
                {/* LEFT COLUMN: SYSTEM TELEMETRY */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    
                    {/* SECTION 1: SERVER SUMMARY */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Server size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>SERVER HARDWARE SUMMARY</h3>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", fontSize: "0.8rem", fontWeight: 800 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Server ID Label</span>
                                    <span style={{ color: "var(--foreground)" }}>{server.name || "Default VPS"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Host URL endpoint</span>
                                    <span style={{ color: "var(--foreground)", wordBreak: "break-all" }}>{server.url}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>IP Address</span>
                                    <span style={{ color: "var(--foreground)" }}>{server.ipAddress || "manual endpoint"}</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Hosting Provider</span>
                                    <span style={{ color: "var(--foreground)", textTransform: "uppercase" }}>{server.provider || "manual"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Region Location</span>
                                    <span style={{ color: "var(--foreground)" }}>{server.region || "Default Region"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "6px" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Uptime duration</span>
                                    <span style={{ color: "var(--foreground)" }}>{server.uptime || "—"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: "var(--muted-foreground)" }}>Server Tier</span>
                                    <span style={{ color: "var(--foreground)", fontWeight: 900 }}>{server.tier || "Standard"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: n8n INSTANCE HEALTH */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Activity size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>n8n EXECUTION ENGINE HEALTH</h3>
                        </div>

                        {isOnline ? (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                                <div style={{ padding: "16px", background: "var(--muted)", borderRadius: "14px", border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>CPU LOAD</div>
                                    <div style={{ fontSize: "1.4rem", fontWeight: 950, color: server.cpu >= 80 ? "#EF4444" : "var(--foreground)", marginTop: "6px" }}>{server.cpu || 0}%</div>
                                    <div style={{ height: "4px", background: "var(--card)", borderRadius: "10px", overflow: "hidden", marginTop: "8px" }}>
                                        <div style={{ width: `${server.cpu || 0}%`, height: "100%", background: server.cpu >= 80 ? "#EF4444" : "var(--accent)" }} />
                                    </div>
                                </div>
                                <div style={{ padding: "16px", background: "var(--muted)", borderRadius: "14px", border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>RAM CONSUMPTION</div>
                                    <div style={{ fontSize: "1.4rem", fontWeight: 950, color: server.ram >= 80 ? "#EF4444" : "var(--foreground)", marginTop: "6px" }}>{server.ram || 0}%</div>
                                    <div style={{ height: "4px", background: "var(--card)", borderRadius: "10px", overflow: "hidden", marginTop: "8px" }}>
                                        <div style={{ width: `${server.ram || 0}%`, height: "100%", background: server.ram >= 80 ? "#EF4444" : "var(--accent)" }} />
                                    </div>
                                </div>
                                <div style={{ padding: "16px", background: "var(--muted)", borderRadius: "14px", border: "1px solid var(--border)" }}>
                                    <div style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>DISK CAPACITY</div>
                                    <div style={{ fontSize: "1.4rem", fontWeight: 950, color: "var(--foreground)", marginTop: "6px" }}>{server.disk || 0}%</div>
                                    <div style={{ height: "4px", background: "var(--card)", borderRadius: "10px", overflow: "hidden", marginTop: "8px" }}>
                                        <div style={{ width: `${server.disk || 0}%`, height: "100%", background: "var(--accent)" }} />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "12px", padding: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                                <ShieldAlert size={20} style={{ color: "#EF4444" }} />
                                <span style={{ fontSize: "0.85rem", fontWeight: 950, color: "#EF4444" }}>n8n API is unreachable. System health monitoring suspended.</span>
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: DEPLOYED WORKSPACES */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Layers size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>DEPLOYED CUSTOMER WORKSPACES</h3>
                        </div>

                        {linkedWorkspaces.length === 0 ? (
                            <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontStyle: "italic" }}>No tenant workspaces provisioned on this node cluster.</span>
                        ) : (
                            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: "6px 12px", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", textAlign: "left" }}>Company</th>
                                        <th style={{ padding: "6px 12px", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", textAlign: "left" }}>AI Employee</th>
                                        <th style={{ padding: "6px 12px", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase", textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linkedWorkspaces.map((ws, idx) => (
                                        <tr key={idx} style={{ background: "var(--muted)" }}>
                                            <td style={{ padding: "12px", borderTopLeftRadius: "8px", borderBottomLeftRadius: "8px", fontSize: "0.8rem", fontWeight: 900 }}>{ws.firmName || "Sovereign tenant"}</td>
                                            <td style={{ padding: "12px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{ws.aiEmployee || "Unassigned"}</td>
                                            <td style={{ padding: "12px", borderTopRightRadius: "8px", borderBottomRightRadius: "8px", textAlign: "right" }}>
                                                <button 
                                                    onClick={() => router.push(`/admin/workspaces/${ws.id}`)}
                                                    style={{ width: "24px", height: "24px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "4px", cursor: "pointer" }}
                                                >
                                                    <ChevronRight size={10} style={{ margin: "auto" }} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                </div>

                {/* RIGHT COLUMN: ACTIONS OVERRIDES */}
                <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                    
                    {/* CAPACITY SETTINGS */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Cpu size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>CLUSTER CAPACITIES</h3>
                        </div>

                        <form onSubmit={handleSaveMaxWorkflows} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "6px" }}>MAX WORKFLOWS CAPACITY LIMIT</label>
                                <input 
                                    type="number" 
                                    value={editMaxWorkflows}
                                    onChange={e => setEditMaxWorkflows(parseInt(e.target.value))}
                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)", fontWeight: 800 }}
                                />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "6px" }}>SERVER HARDWARE TIER</label>
                                <select 
                                    value={editTier}
                                    onChange={e => setEditTier(e.target.value)}
                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)", fontWeight: 800, outline: "none" }}
                                >
                                    <option value="Standard">Standard Tier (Up to 5 Employees)</option>
                                    <option value="Pro">Pro Tier (Up to 15 Employees)</option>
                                </select>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isSaving}
                                style={{ width: "100%", height: "38px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                            >
                                <Save size={12} /> {isSaving ? "Saving..." : "Commit Limits"}
                            </button>
                        </form>
                    </div>

                    {/* INFRA ACTIONS */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                            <Database size={18} style={{ color: "var(--accent)" }} />
                            <h3 style={{ fontSize: "1.05rem", fontWeight: 950, margin: 0 }}>NODE COMMAND PANEL</h3>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <button 
                                onClick={handleRestartCheck}
                                disabled={isProbing}
                                style={{ width: "100%", height: "40px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "10px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, color: "var(--foreground)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                            >
                                <RefreshCw size={12} className={isProbing ? adminStyles.spinning : ""} />
                                <span>Re-probe Engine Status</span>
                            </button>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
