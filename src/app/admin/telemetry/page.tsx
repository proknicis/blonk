"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Activity, Play, Pause, RefreshCw, Terminal, AlertCircle, 
    CheckCircle, Clock, Database, Eye, ChevronRight, Filter, AlertTriangle, Search
} from "lucide-react";
import adminStyles from "../admin.module.css";

export default function TelemetryPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAutoRefresh, setIsAutoRefresh] = useState(true);
    const [selectedLog, setSelectedLog] = useState<any>(null);

    // Filters states
    const [statusFilter, setStatusFilter] = useState("All"); // All, Success, Error
    const [workspaceFilter, setWorkspaceFilter] = useState("All");
    const [employeeFilter, setEmployeeFilter] = useState("All");
    const [sourceFilter, setSourceFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const logsRes = await fetch("/api/admin/logs");
            if (logsRes.ok) {
                const data = await logsRes.json();
                setLogs(data);
            }

            const usersRes = await fetch("/api/admin/users");
            if (usersRes.ok) {
                const data = await usersRes.json();
                const filtered = data.filter((w: any) => w.role !== "SuperAdmin");
                setWorkspaces(filtered);
            }
        } catch (e) {
            console.error("Failed to load telemetry logs data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const filterParam = params.get("filter");
            if (filterParam && filterParam.toLowerCase() === 'error') {
                setStatusFilter("Error");
            }
        }
    }, []);

    useEffect(() => {
        if (!isAutoRefresh) return;
        const timer = setInterval(() => {
            fetchData();
        }, 10000);
        return () => clearInterval(timer);
    }, [isAutoRefresh]);

    const handleSelectLog = (log: any) => {
        setSelectedLog(log);
    };

    const handleCloseOverlay = () => {
        setSelectedLog(null);
    };

    // Filter logs
    const filteredLogs = logs.filter(log => {
        const isSuccess = log.status?.toLowerCase() === 'success' || log.status?.toLowerCase() === 'active';
        const isError = log.status?.toLowerCase() === 'error' || log.status?.toLowerCase() === 'failed';
        
        // 1. Status filter
        if (statusFilter === "Success" && !isSuccess) return false;
        if (statusFilter === "Error" && !isError) return false;

        // 2. Parse result metadata
        const result = typeof log.result === 'string' ? JSON.parse(log.result) : log.result || {};
        const employeeName = result.aiEmployee || "Unassigned";
        const triggerSource = result.dataSource || "n8n";

        // 3. Workspace filter
        if (workspaceFilter !== "All" && log.teamId !== workspaceFilter) return false;

        // 4. AI Employee filter
        if (employeeFilter !== "All" && employeeName.toLowerCase() !== employeeFilter.toLowerCase()) return false;

        // 5. Source System filter
        if (sourceFilter !== "All" && triggerSource.toLowerCase() !== sourceFilter.toLowerCase()) return false;

        // 6. Text query search
        const matchesQuery = 
            (log.workflowName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            triggerSource.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesQuery;
    });

    // Lists for dropdown filters
    const aiEmployees = Array.from(new Set(logs.map(log => {
        const res = typeof log.result === 'string' ? JSON.parse(log.result) : log.result || {};
        return res.aiEmployee || "Unassigned";
    })));

    const sourceSystems = Array.from(new Set(logs.map(log => {
        const res = typeof log.result === 'string' ? JSON.parse(log.result) : log.result || {};
        return res.dataSource || "n8n";
    })));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* CONTROLS & FILTERING BAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", background: "var(--card)", padding: "24px", borderRadius: "24px", border: "1px solid var(--border)" }}>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <Terminal size={18} style={{ color: "var(--accent)" }} />
                        <span style={{ fontSize: "0.85rem", fontWeight: 950, color: "var(--foreground)" }}>SYSTEM EXECUTION MONITOR</span>
                    </div>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <button 
                            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
                            style={{ height: "36px", padding: "0 14px", border: "1px solid var(--border)", background: isAutoRefresh ? "rgba(16, 185, 129, 0.1)" : "var(--card)", color: isAutoRefresh ? "#10B981" : "var(--foreground)", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "6px" }}
                        >
                            {isAutoRefresh ? <Pause size={12} /> : <Play size={12} />}
                            <span>{isAutoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}</span>
                        </button>
                        <button 
                            onClick={fetchData}
                            style={{ height: "36px", width: "36px", border: "1px solid var(--border)", background: "var(--card)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--foreground)" }}
                        >
                            <RefreshCw size={14} className={isLoading ? adminStyles.spinning : ""} />
                        </button>
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    {/* Search query */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                        <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input 
                            type="text" 
                            placeholder="Search workflow or task name..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', height: '36px', borderRadius: '8px', border: '1px solid var(--border)', paddingLeft: '36px', fontSize: '0.8rem', fontWeight: 800, background: 'var(--muted)', color: 'var(--foreground)', outline: 'none' }}
                        />
                    </div>

                    {/* Status filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Execution Status</span>
                        <select 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Success">Success / Active</option>
                            <option value="Error">Error / Failure</option>
                        </select>
                    </div>

                    {/* Workspace filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Workspace Client</span>
                        <select 
                            value={workspaceFilter} 
                            onChange={e => setWorkspaceFilter(e.target.value)}
                            style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none", maxWidth: "200px" }}
                        >
                            <option value="All">All Workspaces</option>
                            {workspaces.map((ws) => (
                                <option key={ws.id} value={ws.teamId}>{ws.firmName || ws.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* AI Employee filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>AI Employee</span>
                        <select 
                            value={employeeFilter} 
                            onChange={e => setEmployeeFilter(e.target.value)}
                            style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Employees</option>
                            {aiEmployees.map((emp, idx) => (
                                <option key={idx} value={emp}>{emp}</option>
                            ))}
                        </select>
                    </div>

                    {/* Source System filter */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ fontSize: "0.6rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Source System</span>
                        <select 
                            value={sourceFilter} 
                            onChange={e => setSourceFilter(e.target.value)}
                            style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Sources</option>
                            {sourceSystems.map((src, idx) => (
                                <option key={idx} value={src}>{src}</option>
                            ))}
                        </select>
                    </div>

                </div>

            </div>

            {/* LIVE CONSOLE MONITOR */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "grid", gridTemplateColumns: "1.75fr 1.25fr", gap: "32px" }}>
                
                {/* LOG TIMELINE LIST */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 950, margin: 0, color: "var(--foreground)" }}>LOGGING TIMELINE</h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "560px", overflowY: "auto", paddingRight: "4px" }}>
                        {isLoading && logs.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ height: "54px", background: "var(--muted)", borderRadius: "10px", animation: "pulse 1.5s infinite" }} />
                                <div style={{ height: "54px", background: "var(--muted)", borderRadius: "10px", animation: "pulse 1.5s infinite" }} />
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "240px", border: "1px dashed var(--border)", borderRadius: "16px", color: "var(--muted-foreground)", gap: "8px" }}>
                                <Activity size={24} style={{ opacity: 0.5 }} />
                                <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>No telemetry logs recorded matching criteria.</span>
                            </div>
                        ) : (
                            filteredLogs.map((log) => {
                                const isSuccess = log.status?.toLowerCase() === 'success' || log.status?.toLowerCase() === 'active';
                                const result = typeof log.result === 'string' ? JSON.parse(log.result) : log.result || {};
                                
                                return (
                                    <div 
                                        key={log.id} 
                                        onClick={() => handleSelectLog(log)}
                                        style={{ 
                                            display: "flex", 
                                            justifyContent: "space-between", 
                                            alignItems: "center", 
                                            padding: "14px 18px", 
                                            background: isSuccess ? "var(--muted)" : "rgba(239, 68, 68, 0.03)", 
                                            border: `1px solid ${isSuccess ? 'var(--border)' : 'rgba(239, 68, 68, 0.15)'}`, 
                                            borderLeft: `4px solid ${isSuccess ? '#10B981' : '#EF4444'}`,
                                            borderRadius: "14px", 
                                            cursor: "pointer",
                                            transition: "all 0.2s" 
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = isSuccess ? 'var(--accent)' : '#EF4444'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = isSuccess ? 'var(--border)' : 'rgba(239, 68, 68, 0.15)'}
                                    >
                                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                            {isSuccess ? (
                                                <CheckCircle size={16} style={{ color: "#10B981" }} />
                                            ) : (
                                                <AlertCircle size={16} style={{ color: "#EF4444" }} />
                                            )}
                                            <div>
                                                <div style={{ fontSize: "0.8rem", fontWeight: 900, color: "var(--foreground)" }}>{log.workflowName || "Autonomous Loop"}</div>
                                                <div style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700, marginTop: "2px" }}>
                                                    Employee: {result.aiEmployee || "Unassigned"} | System: {result.dataSource || "n8n"}
                                                </div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                            {new Date(log.executedAt || log.createdAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* DETAILED INSPECTION PANELS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 950, margin: 0, color: "var(--foreground)" }}>DETAILED INSPECTOR</h3>
                    
                    {selectedLog ? (
                        <div style={{ 
                            background: "var(--muted)", 
                            border: "1px solid var(--border)", 
                            borderRadius: "18px", 
                            padding: "24px", 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "18px", 
                            animation: "fadeIn 0.2s ease-out" 
                        }}>
                            <div>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Workflow / Task Name</span>
                                <div style={{ fontSize: "0.9rem", fontWeight: 950, color: "var(--foreground)", marginTop: "4px" }}>{selectedLog.workflowName}</div>
                            </div>

                            <div>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Execution Log ID</span>
                                <div style={{ fontFamily: "monospace", fontSize: "0.75rem", background: "var(--card)", padding: "4px 8px", borderRadius: "6px", color: "var(--muted-foreground)", marginTop: "4px", width: "fit-content" }}>{selectedLog.id}</div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "0.8rem", fontWeight: 800 }}>
                                <div>
                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Trigger System</span>
                                    <div style={{ color: "var(--foreground)", marginTop: "4px" }}>
                                        {(() => {
                                            const res = typeof selectedLog.result === 'string' ? JSON.parse(selectedLog.result) : selectedLog.result || {};
                                            return res.dataSource || "n8n Gateway";
                                        })()}
                                    </div>
                                </div>
                                <div>
                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>AI employee</span>
                                    <div style={{ color: "var(--foreground)", marginTop: "4px" }}>
                                        {(() => {
                                            const res = typeof selectedLog.result === 'string' ? JSON.parse(selectedLog.result) : selectedLog.result || {};
                                            return res.aiEmployee || "Unassigned";
                                        })()}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Output Summary</span>
                                <div style={{ 
                                    background: "#0F172A", 
                                    color: "#38BDF8",
                                    fontFamily: "monospace",
                                    border: "1px solid var(--border)", 
                                    borderRadius: "10px", 
                                    padding: "12px", 
                                    fontSize: "0.8rem", 
                                    lineHeight: "1.5",
                                    maxHeight: "120px",
                                    overflowY: "auto",
                                    marginTop: "6px"
                                }}>
                                    {(() => {
                                        const res = typeof selectedLog.result === 'string' ? JSON.parse(selectedLog.result) : selectedLog.result || {};
                                        return res.outputGenerated || "Workflow completed successfully. Active execution dispatched writeback.";
                                    })()}
                                </div>
                            </div>

                            <div>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>error summary</span>
                                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: selectedLog.status?.toLowerCase() === 'error' || selectedLog.status?.toLowerCase() === 'failed' ? "#EF4444" : "var(--muted-foreground)", marginTop: "4px" }}>
                                    {(() => {
                                        const res = typeof selectedLog.result === 'string' ? JSON.parse(selectedLog.result) : selectedLog.result || {};
                                        return res.errorHistory || "None. Policy checks resolved cleanly.";
                                    })()}
                                </div>
                            </div>

                            {/* Shortcut to Workspace Detail */}
                            {selectedLog.teamId && (
                                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", marginTop: "4px" }}>
                                    <button 
                                        onClick={() => {
                                            const match = workspaces.find(w => w.teamId === selectedLog.teamId);
                                            if (match) {
                                                router.push(`/admin/workspaces/${match.id}`);
                                            } else {
                                                alert("Workspace matches team index but details page is unavailable.");
                                            }
                                        }}
                                        style={{ width: "100%", height: "38px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                    >
                                        Drill-down into Related Workspace <ChevronRight size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "240px", border: "1px dashed var(--border)", borderRadius: "18px", color: "var(--muted-foreground)" }}>
                            <Eye size={20} style={{ opacity: 0.5, marginBottom: "8px" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>Select a log entry to inspect detail.</span>
                        </div>
                    )}
                </div>

            </div>

        </div>
    );
}
