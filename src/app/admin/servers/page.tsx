"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Server, Activity, ShieldAlert, CheckCircle, AlertTriangle, 
    Search, Filter, RefreshCw, ChevronRight, Play, Database, Info, Trash2, Plus
} from "lucide-react";
import adminStyles from "../admin.module.css";

export default function ServersPage() {
    const router = useRouter();
    const [servers, setServers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProbing, setIsProbing] = useState(false);

    // Add server modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [addName, setAddName] = useState("");
    const [addIpAddress, setAddIpAddress] = useState("");
    const [addUrl, setAddUrl] = useState("");
    const [addApiKey, setAddApiKey] = useState("");
    const [addProvider, setAddProvider] = useState("manual");
    const [addRegion, setAddRegion] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [addError, setAddError] = useState("");

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setAddName("");
        setAddIpAddress("");
        setAddUrl("");
        setAddApiKey("");
        setAddProvider("manual");
        setAddRegion("");
        setAddError("");
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddError("");
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/nodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: addName,
                    url: addUrl,
                    api_key: addApiKey,
                    max_workflows: 100,
                    provider: addProvider,
                    region: addRegion,
                    ipAddress: addIpAddress
                })
            });
            const data = await res.json();
            if (res.ok) {
                closeAddModal();
                fetchServers();
            } else {
                setAddError(data.error || "Failed to register server node.");
            }
        } catch (err: any) {
            setAddError("Network error: Could not contact administrative registry.");
        } finally {
            setIsSaving(false);
        }
    };

    // Filters states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [providerFilter, setProviderFilter] = useState("All");
    const [healthFilter, setHealthFilter] = useState("All"); // All, Healthy (CPU/RAM < 80%), Overloaded (CPU/RAM >= 80%)

    const fetchServers = async (probe: boolean = false) => {
        if (probe) {
            setIsProbing(true);
        } else {
            setIsLoading(true);
        }
        try {
            const url = probe ? "/api/admin/nodes?probe=true" : "/api/admin/nodes";
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setServers(data);
            }
        } catch (e) {
            console.error("Failed to load servers infrastructure:", e);
        } finally {
            setIsLoading(false);
            setIsProbing(false);
        }
    };

    useEffect(() => {
        fetchServers();
    }, []);

    // Filter calculations
    const filteredServers = servers.filter(s => {
        const matchesSearch = 
            (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.ipAddress || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.url || "").toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;

        const serverStatus = s.status === 'Active' ? 'online' : 'offline';
        if (statusFilter !== "All" && serverStatus !== statusFilter.toLowerCase()) return false;

        if (providerFilter !== "All" && (s.provider || "manual").toLowerCase() !== providerFilter.toLowerCase()) return false;

        const isOverloaded = (s.cpu || 0) >= 80 || (s.ram || 0) >= 80;
        if (healthFilter === "Healthy" && isOverloaded) return false;
        if (healthFilter === "Overloaded" && !isOverloaded) return false;

        return true;
    });

    const providersList = Array.from(new Set(servers.map(s => s.provider || "manual")));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* SEARCH AND FILTERS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", background: "var(--card)", padding: "18px 24px", borderRadius: "18px", border: "1px solid var(--border)" }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                    <input 
                        type="text" 
                        placeholder="Search by server name or IP..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid var(--border)', paddingLeft: '40px', fontSize: '0.8rem', fontWeight: 750, outline: 'none', background: 'var(--muted)', color: 'var(--foreground)' }}
                    />
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <select 
                        value={statusFilter} 
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline / Degraded</option>
                    </select>

                    <select 
                        value={providerFilter} 
                        onChange={e => setProviderFilter(e.target.value)}
                        style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                    >
                        <option value="All">All Providers</option>
                        {providersList.map((p, idx) => (
                            <option key={idx} value={p}>{p.toUpperCase()}</option>
                        ))}
                    </select>

                    <select 
                        value={healthFilter} 
                        onChange={e => setHealthFilter(e.target.value)}
                        style={{ height: '38px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                    >
                        <option value="All">All Resource Health</option>
                        <option value="Healthy">Healthy (CPU &lt; 80%)</option>
                        <option value="Overloaded">Overloaded</option>
                    </select>

                    <button 
                        onClick={() => fetchServers(true)}
                        disabled={isProbing}
                        style={{ height: "38px", padding: "0 14px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, display: "flex", alignItems: "center", gap: "6px", color: "var(--foreground)" }}
                    >
                        <RefreshCw size={12} className={isProbing ? adminStyles.spinning : ""} />
                        <span>{isProbing ? "Probing Node APIs..." : "Check System Health"}</span>
                    </button>

                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        style={{ height: "38px", padding: "0 14px", background: "#34D186", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, display: "flex", alignItems: "center", gap: "6px", color: "#FFFFFF" }}
                    >
                        <Plus size={12} />
                        <span>Add Server</span>
                    </button>
                </div>
            </div>

            {/* INFRASTRUCTURE TABLE DIRECTORY */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                <div style={{ overflowX: "auto" }}>
                    <div style={{ marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>ACTIVE HOSTING SERVERS</h3>
                        <p style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 750 }}>VPS and bare-metal cluster instances hosting active customer workloads</p>
                    </div>

                    {isLoading ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[1, 2].map(i => (
                                <div key={i} style={{ height: "48px", background: "var(--muted)", borderRadius: "10px", animation: "pulse 1.5s infinite" }} />
                            ))}
                        </div>
                    ) : filteredServers.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", border: "1px dashed var(--border)", borderRadius: "16px", color: "var(--muted-foreground)" }}>
                            <Server size={28} style={{ opacity: 0.5, marginBottom: "8px" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>No servers found matching current filters.</span>
                        </div>
                    ) : (
                        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Server Details</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Provider / Region</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Workspaces Assigned</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Status</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>n8n Health</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Usage Stats</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Heartbeat</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredServers.map((s) => {
                                    const isOnline = s.status === 'Active';
                                    const hasHighUsage = (s.cpu || 0) >= 80 || (s.ram || 0) >= 80;
                                    
                                    return (
                                        <tr 
                                            key={s.id} 
                                            onClick={() => router.push(`/admin/servers/${s.id}`)}
                                            style={{ background: "var(--muted)", cursor: "pointer", transition: "opacity 0.2s" }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.95'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            {/* Server details */}
                                            <td style={{ padding: "16px", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px" }}>
                                                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "var(--foreground)" }}>{s.name}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "2px" }}>IP: {s.ipAddress || "Manual URL"}</div>
                                            </td>
 
                                            {/* Provider / Region */}
                                            <td style={{ padding: "16px", fontSize: "0.8rem", fontWeight: 800 }}>
                                                <div style={{ textTransform: "uppercase" }}>{s.provider || "manual"}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "2px" }}>{s.region || "Default Region"}</div>
                                            </td>

                                            {/* Workspaces Assigned */}
                                            <td style={{ padding: "16px", fontSize: "0.8rem", fontWeight: 800 }}>
                                                <span style={{ padding: "4px 10px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "6px" }}>
                                                    {s.assigned_workspaces_count || 0}
                                                </span>
                                            </td>

                                            {/* Online status */}
                                            <td style={{ padding: "16px" }}>
                                                <span style={{ 
                                                    fontSize: "0.65rem", 
                                                    fontWeight: 950, 
                                                    padding: "4px 10px", 
                                                    borderRadius: "100px",
                                                    background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: isOnline ? '#10B981' : '#EF4444',
                                                    textTransform: "uppercase"
                                                }}>
                                                    {isOnline ? "online" : "offline"}
                                                </span>
                                            </td>

                                            {/* n8n Status */}
                                            <td style={{ padding: "16px", fontSize: "0.8rem", fontWeight: 800 }}>
                                                {isOnline ? (
                                                    <span style={{ color: "#10B981" }}>Nominal Syncing</span>
                                                ) : (
                                                    <span style={{ color: "#EF4444" }}>Unreachable API</span>
                                                )}
                                            </td>

                                            {/* Usage stats (CPU/RAM/Disk) */}
                                            <td style={{ padding: "16px" }}>
                                                {isOnline ? (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.75rem", fontWeight: 750 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", color: s.cpu >= 80 ? "#EF4444" : "var(--foreground)" }}>
                                                            <span>CPU</span>
                                                            <span>{s.cpu || 0}%</span>
                                                        </div>
                                                        <div style={{ display: "flex", justifyContent: "space-between", color: s.ram >= 80 ? "#EF4444" : "var(--foreground)" }}>
                                                            <span>RAM</span>
                                                            <span>{s.ram || 0}%</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: "var(--muted-foreground)", fontSize: "0.75rem" }}>—</span>
                                                )}
                                            </td>

                                            {/* Heartbeat */}
                                            <td style={{ padding: "16px", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                                {isOnline ? "Just now" : "Failed probe"}
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: "16px", borderTopRightRadius: "12px", borderBottomRightRadius: "12px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => router.push(`/admin/servers/${s.id}`)}
                                                    style={{ width: "28px", height: "28px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "6px", cursor: "pointer", color: "var(--foreground)" }}
                                                >
                                                    <ChevronRight size={12} style={{ margin: "auto" }} />
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ADD SERVER MODAL DIALOG */}
            {isAddModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
                    background: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)",
                    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
                }}>
                    <div style={{
                        background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px",
                        width: "500px", maxWidth: "90%", padding: "32px", display: "flex", flexDirection: "column",
                        gap: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.12)", animation: "fadeIn 0.2s ease-out"
                    }}>
                        <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>Register Infrastructure Server</h3>
                            <p style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 700 }}>Add a new n8n executor node to the platform provisioning fleet.</p>
                        </div>

                        {addError && (
                            <div style={{
                                background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)",
                                borderRadius: "8px", padding: "10px 14px", color: "#EF4444", fontSize: "0.75rem", fontWeight: 700
                            }}>
                                {addError}
                            </div>
                        )}

                        <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Server Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Node 5 Munich"
                                        value={addName}
                                        onChange={e => setAddName(e.target.value)}
                                        required
                                        style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.75rem", padding: "0 10px", outline: "none" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>IP Address</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 192.168.1.100"
                                        value={addIpAddress}
                                        onChange={e => setAddIpAddress(e.target.value)}
                                        required
                                        style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.75rem", padding: "0 10px", outline: "none" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>n8n Endpoint URL</label>
                                <input 
                                    type="url" 
                                    placeholder="e.g. https://node5.blonk.io"
                                    value={addUrl}
                                    onChange={e => setAddUrl(e.target.value)}
                                    required
                                    style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.75rem", padding: "0 10px", outline: "none" }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>n8n API Key Credentials</label>
                                <input 
                                    type="password" 
                                    placeholder="n8n_api_..."
                                    value={addApiKey}
                                    onChange={e => setAddApiKey(e.target.value)}
                                    required
                                    style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.75rem", padding: "0 10px", outline: "none" }}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Hosting Provider</label>
                                    <select 
                                        value={addProvider}
                                        onChange={e => setAddProvider(e.target.value)}
                                        style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.75rem", padding: "0 10px", outline: "none", fontWeight: 700 }}
                                    >
                                        <option value="contabo">CONTABO</option>
                                        <option value="manual">MANUAL / BARE-METAL</option>
                                        <option value="aws">AWS</option>
                                        <option value="digitalocean">DIGITALOCEAN</option>
                                    </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <label style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Region / Zone</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. EU-Central"
                                        value={addRegion}
                                        onChange={e => setAddRegion(e.target.value)}
                                        required
                                        style={{ height: "36px", border: "1px solid var(--border)", borderRadius: "6px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.75rem", padding: "0 10px", outline: "none" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
                                <button 
                                    type="button" 
                                    onClick={closeAddModal}
                                    style={{ height: "38px", padding: "0 16px", border: "1px solid var(--border)", background: "transparent", color: "var(--foreground)", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 800 }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    style={{ height: "38px", padding: "0 18px", background: "#34D186", color: "#FFFFFF", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    {isSaving ? <RefreshCw size={12} className={adminStyles.spinning} /> : null}
                                    <span>{isSaving ? "Registering..." : "Register Server"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
