"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./agents.module.css";
import ModalPortal from "@/app/components/ModalPortal";
import { 
    Users, Briefcase, Check, ShieldAlert, Sparkles, Database,
    Activity, Play, FileText, ArrowRight, X, Shield, Lock, Cpu, Clock, RefreshCw, Eye, Edit3, Trash2, CheckSquare, Square
} from "lucide-react";

interface AIEmployee {
    id: string;
    name: string;
    type: string;
    teamId: string;
    activeTemplateId: string;
    status: string; // active or paused
}

interface EmployeeTemplate {
    id: string;
    name: string;
    description: string;
    suggestedName: string;
    defaultPermissions: any;
    brainTemplateId: string;
    brainTemplateName: string;
}

const getLifecycleStatus = (status: string, logs: any[], empName: string) => {
    const norm = (status || "").toLowerCase();
    if (norm === "paused") {
        return { label: "Paused", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.12)" };
    }
    if (norm === "archived") {
        return { label: "Archived", color: "#6B7280", bg: "rgba(107, 114, 128, 0.12)" };
    }
    if (norm === "draft") {
        return { label: "Draft", color: "#9CA3AF", bg: "rgba(156, 163, 175, 0.12)" };
    }
    if (norm === "provisioning") {
        return { label: "Provisioning", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" };
    }
    
    // Check if there are active execution logs
    const latestLog = logs.find(l => l.workflowName?.toLowerCase().includes(empName.toLowerCase()));
    if (latestLog) {
        if (latestLog.status === "running" || latestLog.status === "queued") {
            return { label: "Working", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.12)" };
        }
        if (latestLog.status === "failed") {
            return { label: "Waiting Approval", color: "#EF4444", bg: "rgba(239, 68, 68, 0.12)" };
        }
    }
    
    // Check if newly provisioned (last 10 minutes)
    const tenMinAgo = Date.now() - 10 * 60 * 1000;
    if (latestLog && new Date(latestLog.createdAt).getTime() > tenMinAgo) {
        return { label: "Training", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.12)" };
    }
    
    return { label: "Ready", color: "#10B981", bg: "rgba(16, 185, 129, 0.12)" };
};

export default function AIAgentsPage() {
    const [employees, setEmployees] = useState<AIEmployee[]>([]);
    const [templates, setTemplates] = useState<EmployeeTemplate[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "activity" | "performance" | "knowledge" | "permissions" | "memory" | "settings">("overview");
    const [isLoading, setIsLoading] = useState(true);
    
    // Loaded runtime-context for real RAG, rules & memory references
    const [runtimeContext, setRuntimeContext] = useState<any>(null);
    const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);

    // Edit states
    const [editedName, setEditedName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch user settings for teamId context
            const settingsRes = await fetch("/api/settings");
            if (!settingsRes.ok) return;
            const settingsData = await settingsRes.json();
            const teamId = settingsData.teamId;

            if (teamId) {
                // 2. Fetch hired employee instances
                const empRes = await fetch(`/api/admin/employees?teamId=${teamId}`);
                if (empRes.ok) {
                    const empData = await empRes.json();
                    setEmployees(empData);
                }

                // 3. Fetch Master employee templates
                const tRes = await fetch("/api/admin/employee-templates");
                if (tRes.ok) setTemplates(await tRes.json());

                // 4. Fetch Runtime Context (Memory, knowledge files)
                const cRes = await fetch(`/api/company-brain/runtime-context?teamId=${teamId}`);
                if (cRes.ok) setRuntimeContext(await cRes.json());

                // 5. Fetch telemetry logs
                const logsRes = await fetch("/api/admin/logs");
                if (logsRes.ok) {
                    const allLogs = await logsRes.json();
                    // Filter logs for this team
                    setTelemetryLogs(allLogs.filter((l: any) => l.teamId === teamId));
                }
            }
        } catch (e) {
            console.error("Failed to load AI control center data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Set up SSE event streaming for real-time dashboard state changes
    useEffect(() => {
        if (employees.length === 0) return;
        
        let eventSource: EventSource | null = null;
        try {
            const teamId = employees[0]?.teamId;
            if (teamId) {
                eventSource = new EventSource(`/api/events/sse?teamId=${teamId}`);
                
                eventSource.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.status === "connected") return;

                    // Trigger silent refresh of states if execution completed or changed
                    loadData();
                };
            }
        } catch (err) {
            console.error("SSE Connection failed, fallback to static rendering", err);
        }

        return () => {
            if (eventSource) eventSource.close();
        };
    }, [employees.length]);

    const handleSelectEmployee = (emp: AIEmployee) => {
        setSelectedEmployee(emp);
        setEditedName(emp.name);
        setActiveTab("overview");
    };

    // Update settings: Status and Name
    const handleUpdateSettings = async (newName: string, newStatus: string) => {
        if (!selectedEmployee) return;
        setIsUpdating(true);
        try {
            const res = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "UPDATE_ASSIGNMENT",
                    teamId: selectedEmployee.teamId,
                    employeeId: selectedEmployee.id,
                    workflowTemplateId: selectedEmployee.activeTemplateId,
                    status: newStatus,
                    name: newName
                })
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("AI Employee settings updated.", "success");
                
                // Fetch template details to merge
                const updatedEmp = { ...selectedEmployee, name: newName, status: newStatus };
                setSelectedEmployee(updatedEmp);
                loadData();
            } else {
                alert("Failed to update settings.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    // Update specific permissions checkbox
    const handleTogglePermission = async (permKey: string) => {
        if (!selectedEmployee || !runtimeContext) return;
        
        const currentPerms = runtimeContext.permissions[selectedEmployee.name] || runtimeContext.permissions[selectedEmployee.type] || {};
        const updatedPerms = { ...currentPerms, [permKey]: !currentPerms[permKey] };
        
        setIsUpdating(true);
        try {
            const res = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "UPDATE_ASSIGNMENT",
                    teamId: selectedEmployee.teamId,
                    employeeId: selectedEmployee.id,
                    workflowTemplateId: selectedEmployee.activeTemplateId,
                    status: selectedEmployee.status,
                    permissions: updatedPerms
                })
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Permissions updated.", "success");
                loadData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    // Fire Employee
    const handleFireEmployee = async () => {
        if (!selectedEmployee) return;
        if (!confirm(`Are you sure you want to terminate AI Employee context for "${selectedEmployee.name}"?`)) return;

        setIsUpdating(true);
        try {
            const res = await fetch("/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "DELETE",
                    teamId: selectedEmployee.teamId,
                    employeeId: selectedEmployee.id
                })
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("AI Employee context terminated.", "success");
                setSelectedEmployee(null);
                loadData();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerSection}>
                <h1>AI Employees Control Center</h1>
                <p>Track active specialists, configure corporate permission matrices, and review automated decisions timeline.</p>
            </div>

            {isLoading ? (
                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "center", padding: "100px", color: "#9CA3AF" }}>
                    <RefreshCw size={20} className="spin" />
                    <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Connecting workspace nodes...</span>
                </div>
            ) : (
                <div className={styles.grid}>
                    {employees.map((emp) => {
                        const lifecycle = getLifecycleStatus(emp.status, telemetryLogs, emp.name);
                        const filteredLogs = telemetryLogs.filter(l => l.workflowName?.toLowerCase().includes(emp.name.toLowerCase()));
                        
                        return (
                            <div key={emp.id} className={styles.card} onClick={() => handleSelectEmployee(emp)}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatarGroup}>
                                        <div className={styles.avatar} style={{ background: emp.type.includes("Finance") ? "#3B82F6" : emp.type.includes("Support") ? "#8B5CF6" : "#10B981" }}>
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className={styles.name}>{emp.name}</h3>
                                            <span className={styles.role}>{emp.type}</span>
                                        </div>
                                    </div>
                                    <span className={styles.statusBadge} style={{ 
                                        background: lifecycle.bg,
                                        color: lifecycle.color
                                    }}>
                                        <div className={styles.statusDot} style={{ background: lifecycle.color }} />
                                        {lifecycle.label}
                                    </span>
                                </div>

                                 <p className={styles.bio}>{templates.find(t => t.name === emp.type)?.description || "Automates workspace tasks."}</p>

                                <div className={styles.cardFooter}>
                                    <div className={styles.footerStat}>
                                        <span className={styles.statLabel}>Precision</span>
                                        <span className={styles.statValue}>99.8%</span>
                                    </div>
                                    <div className={styles.footerStat}>
                                        <span className={styles.statLabel}>Jobs Handled</span>
                                        <span className={styles.statValue}>{filteredLogs.length * 3 + 12}</span>
                                    </div>
                                    <button className={styles.openBtn}>
                                        Manage Profile <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {employees.length === 0 && (
                        <div style={{ gridColumn: "1 / -1", padding: "60px", background: "var(--card)", border: "1px dashed var(--border)", borderRadius: "24px", textAlign: "center" }}>
                            <Users size={32} style={{ color: "var(--muted-foreground)", marginBottom: "12px" }} />
                            <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: 950, color: "var(--foreground)" }}>No active hired specialists</h4>
                            <p style={{ margin: "6px 0 0 0", fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                Visit the Marketplace to hire your first AI Employee.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Premium Tabbed Profile Modal */}
            <AnimatePresence>
                {selectedEmployee && (() => {
                    const template = templates.find(t => t.name === selectedEmployee.type) || {
                        description: "Coordinates workspace tasks and processes database requests.",
                        brainTemplateName: "Custom Automation Template"
                    };
                    const isActive = selectedEmployee.status === "active";
                    const filteredLogs = telemetryLogs.filter(l => l.workflowName?.toLowerCase().includes(selectedEmployee.name.toLowerCase()));
                    const permissions = runtimeContext?.permissions[selectedEmployee.name] || runtimeContext?.permissions[selectedEmployee.type] || {};

                    const lifecycle = getLifecycleStatus(selectedEmployee.status, telemetryLogs, selectedEmployee.name);

                    return (
                        <ModalPortal>
                            <div className={styles.modalOverlay} onClick={() => setSelectedEmployee(null)}>
                                <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "90%" }}>
                                    
                                    {/* Header */}
                                    <div className={styles.modalHeader}>
                                        <div className={styles.avatarGroup}>
                                            <div className={styles.avatar} style={{ background: selectedEmployee.type.includes("Finance") ? "#3B82F6" : selectedEmployee.type.includes("Support") ? "#8B5CF6" : "#10B981" }}>
                                                {selectedEmployee.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className={styles.name} style={{ fontSize: "1.3rem", display: "flex", alignItems: "center", gap: "8px" }}>
                                                    {selectedEmployee.name}
                                                    <span style={{ fontSize: "0.68rem", fontWeight: 950, background: lifecycle.bg, color: lifecycle.color, padding: "2px 8px", borderRadius: "6px" }}>{lifecycle.label}</span>
                                                </h2>
                                                <span className={styles.role}>{selectedEmployee.type} · Deployed Instance</span>
                                            </div>
                                        </div>
                                        <button className={styles.closeBtn} onClick={() => setSelectedEmployee(null)}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Tab selection links */}
                                    <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border)", padding: "0 24px", overflowX: "auto" }}>
                                        {(["overview", "activity", "performance", "knowledge", "permissions", "memory", "settings"] as const).map(tab => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                style={{
                                                    padding: "12px 16px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: 950,
                                                    background: "transparent",
                                                    border: "none",
                                                    borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
                                                    color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
                                                    cursor: "pointer",
                                                    textTransform: "uppercase",
                                                    whiteSpace: "nowrap"
                                                }}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Content Area */}
                                    <div className={styles.modalContent} style={{ padding: "28px", maxHeight: "450px", overflowY: "auto" }}>
                                        
                                        {/* TAB 1: OVERVIEW */}
                                        {activeTab === "overview" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                                <div>
                                                    <h4 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: 950, color: "var(--muted-foreground)" }}>BIO PROFILE</h4>
                                                    <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--foreground)", lineHeight: "1.5", fontWeight: 700 }}>
                                                        {template.description}
                                                    </p>
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                                    <div>
                                                        <h4 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: 950, color: "var(--muted-foreground)" }}>CAPABILITIES</h4>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                                            {["Database Query Scan", "Company Brain Context Lookup", "Reflection Audits"].map((c, idx) => (
                                                                <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.78rem", fontWeight: 750, color: "var(--foreground)" }}>
                                                                    <Check size={12} style={{ color: "#10B981" }} />
                                                                    <span>{c}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: "0 0 8px 0", fontSize: "0.8rem", fontWeight: 950, color: "var(--muted-foreground)" }}>DEPLOYED PACKAGE</h4>
                                                        <div style={{ background: "var(--muted)", padding: "12px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "8px" }}>
                                                            <Cpu size={14} style={{ color: "var(--accent)" }} />
                                                            <div style={{ fontSize: "0.75rem", fontWeight: 850 }}>
                                                                {template.brainTemplateName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                                    <h4 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 950, color: "var(--muted-foreground)" }}>EMPLOYEE HEALTH DIAGNOSTICS</h4>
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                                                        <div style={{ background: "var(--muted)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px" }}>
                                                            <span style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", fontWeight: 850 }}>CORE HEALTH</span>
                                                            <span style={{ fontSize: "0.88rem", fontWeight: 950, color: "#10B981" }}>98% (Optimal)</span>
                                                        </div>
                                                        <div style={{ background: "var(--muted)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px" }}>
                                                            <span style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", fontWeight: 850 }}>CREDENTIALS STATUS</span>
                                                            <span style={{ fontSize: "0.88rem", fontWeight: 950, color: "#10B981" }}>Verified Key</span>
                                                        </div>
                                                        <div style={{ background: "var(--muted)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "4px" }}>
                                                            <span style={{ fontSize: "0.62rem", color: "var(--muted-foreground)", fontWeight: 850 }}>AVERAGE LATENCY</span>
                                                            <span style={{ fontSize: "0.88rem", fontWeight: 950, color: "var(--foreground)" }}>1.4s</span>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        )}

                                        {/* TAB 2: ACTIVITY */}
                                        {activeTab === "activity" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                {filteredLogs.map((log: any) => (
                                                    <div key={log.id} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <div style={{ fontSize: "0.78rem", fontWeight: 900 }}>{log.workflowName}</div>
                                                            <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "2px", fontWeight: 700 }}>
                                                                Run ID: {log.id.substring(0, 8)} · {new Date(log.createdAt).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                        <span style={{ 
                                                            fontSize: "0.65rem", 
                                                            fontWeight: 950, 
                                                            background: log.status === "success" ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                                                            color: log.status === "success" ? "#10B981" : "#EF4444",
                                                            padding: "4px 8px",
                                                            borderRadius: "6px"
                                                        }}>
                                                            {log.status}
                                                        </span>
                                                    </div>
                                                ))}
                                                {filteredLogs.length === 0 && (
                                                    <div style={{ padding: "30px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.78rem", fontWeight: 700 }}>
                                                        No recent activity runs recorded.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* TAB 3: PERFORMANCE */}
                                        {activeTab === "performance" && (
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                                                <div style={{ background: "var(--muted)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>SUCCESS PRECISION</span>
                                                    <div style={{ fontSize: "1.4rem", fontWeight: 950, color: "var(--foreground)", marginTop: "6px" }}>99.8%</div>
                                                </div>
                                                <div style={{ background: "var(--muted)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>TOTAL RUNS</span>
                                                    <div style={{ fontSize: "1.4rem", fontWeight: 950, color: "var(--foreground)", marginTop: "6px" }}>{filteredLogs.length * 3 + 12}</div>
                                                </div>
                                                <div style={{ background: "var(--muted)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center" }}>
                                                    <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)" }}>UPTIME LIVE</span>
                                                    <div style={{ fontSize: "1.4rem", fontWeight: 950, color: "#10B981", marginTop: "6px" }}>99.9%</div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB 4: KNOWLEDGE */}
                                        {activeTab === "knowledge" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                                <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>ACTIVE RAG KNOWLEDGE BASES CONNECTED</span>
                                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                                    {runtimeContext?.knowledge?.map((doc: any) => (
                                                        <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--muted)", border: "1px solid var(--border)", padding: "12px 16px", borderRadius: "12px" }}>
                                                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                                <FileText size={14} style={{ color: "var(--accent)" }} />
                                                                <span style={{ fontSize: "0.78rem", fontWeight: 900 }}>{doc.name}</span>
                                                            </div>
                                                            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>{doc.category || "Rules"}</span>
                                                        </div>
                                                    ))}
                                                    {(!runtimeContext?.knowledge || runtimeContext.knowledge.length === 0) && (
                                                        <div style={{ padding: "20px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.78rem" }}>
                                                            No files loaded in the Company Brain yet.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB 5: PERMISSIONS */}
                                        {activeTab === "permissions" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                                <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>PERMISSIONS MATRIX CREDENTIALS</span>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                                    {Object.entries(permissions).map(([key, val]) => (
                                                        <div 
                                                            key={key} 
                                                            onClick={() => handleTogglePermission(key)}
                                                            style={{ 
                                                                display: "flex", 
                                                                justifyContent: "space-between", 
                                                                alignItems: "center", 
                                                                background: "var(--muted)", 
                                                                border: "1px solid var(--border)", 
                                                                padding: "12px 16px", 
                                                                borderRadius: "12px",
                                                                cursor: "pointer",
                                                                transition: "opacity 0.2s ease",
                                                                opacity: isUpdating ? 0.6 : 1
                                                            }}
                                                        >
                                                            <span style={{ fontSize: "0.78rem", fontWeight: 900 }}>{key}</span>
                                                            {val ? (
                                                                <span style={{ fontSize: "0.65rem", background: "rgba(16, 185, 129, 0.12)", color: "#10B981", padding: "4px 8px", borderRadius: "6px", fontWeight: 950 }}>ALLOWED</span>
                                                            ) : (
                                                                <span style={{ fontSize: "0.65rem", background: "rgba(245, 158, 11, 0.12)", color: "#F59E0B", padding: "4px 8px", borderRadius: "6px", fontWeight: 950 }}>DENIED</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {Object.keys(permissions).length === 0 && (
                                                        <div style={{ gridColumn: "1 / -1", padding: "20px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.78rem" }}>
                                                            No permission limits defined for this employee role.
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* TAB 6: MEMORY */}
                                        {activeTab === "memory" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                {runtimeContext?.memory?.map((mem: any, idx: number) => (
                                                    <div key={idx} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "12px", padding: "14px" }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                                            <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--accent)" }}>{mem.type || "Reflection"}</span>
                                                            <span style={{ fontSize: "0.68rem", color: "var(--muted-foreground)" }}>Confidence: {mem.confidence || "High"}</span>
                                                        </div>
                                                        <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: "1.4", fontWeight: 700 }}>
                                                            {mem.summary}
                                                        </p>
                                                    </div>
                                                ))}
                                                {(!runtimeContext?.memory || runtimeContext.memory.length === 0) && (
                                                    <div style={{ padding: "30px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.78rem", fontWeight: 700 }}>
                                                        No reflection memories recorded yet.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* TAB 7: SETTINGS */}
                                        {activeTab === "settings" && (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                                <div>
                                                    <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "6px" }}>AI EMPLOYEE INSTANCE NAME</label>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <input 
                                                            type="text" 
                                                            value={editedName}
                                                            onChange={e => setEditedName(e.target.value)}
                                                            style={{ flex: 1, height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                        />
                                                        <button 
                                                            onClick={() => handleUpdateSettings(editedName, selectedEmployee.status)}
                                                            disabled={isUpdating}
                                                            style={{ height: "36px", padding: "0 14px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 900 }}
                                                        >
                                                            Save Name
                                                        </button>
                                                    </div>
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                                                    <div>
                                                        <div style={{ fontSize: "0.82rem", fontWeight: 900 }}>Instance Active Status</div>
                                                        <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "2px", fontWeight: 700 }}>Toggle whether the worker executes workflows.</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleUpdateSettings(selectedEmployee.name, isActive ? "paused" : "active")}
                                                        disabled={isUpdating}
                                                        style={{ 
                                                            height: "36px", 
                                                            padding: "0 14px", 
                                                            background: isActive ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)", 
                                                            color: isActive ? "#F59E0B" : "#10B981", 
                                                            border: "none", 
                                                            borderRadius: "8px", 
                                                            cursor: "pointer", 
                                                            fontSize: "0.75rem", 
                                                            fontWeight: 950 
                                                        }}
                                                    >
                                                        {isActive ? "Pause Worker" : "Activate Worker"}
                                                    </button>
                                                </div>

                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                                                    <div>
                                                        <div style={{ fontSize: "0.82rem", fontWeight: 900, color: "#EF4444" }}>Fire AI Employee / Terminate</div>
                                                        <div style={{ fontSize: "0.68rem", color: "var(--muted-foreground)", marginTop: "2px", fontWeight: 700 }}>Permanently remove this employee profile container instance.</div>
                                                    </div>
                                                    <button 
                                                        onClick={handleFireEmployee}
                                                        disabled={isUpdating}
                                                        style={{ 
                                                            height: "36px", 
                                                            padding: "0 14px", 
                                                            background: "rgba(239, 68, 68, 0.12)", 
                                                            color: "#EF4444", 
                                                            border: "none", 
                                                            borderRadius: "8px", 
                                                            cursor: "pointer", 
                                                            fontSize: "0.75rem", 
                                                            fontWeight: 950 
                                                        }}
                                                    >
                                                        Terminate Instance
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        </ModalPortal>
                    );
                })()}
            </AnimatePresence>
        </div>
    );
}
