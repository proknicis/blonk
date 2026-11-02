"use client";

import React, { useState, useEffect } from "react";
import { 
    Plus, Trash2, Sparkles, CheckCircle2, 
    ArrowRight, Loader2, Globe, Layers, Eye, RefreshCw, X,
    FileCode, Link, AlertCircle, Bookmark, ClipboardList
} from "lucide-react";
import adminStyles from "../admin.module.css";

interface AutomationWorkflow {
    id?: string;
    workflowId: string;
    workflowName: string;
    type: string; // 'Main' | 'Subagent' | 'Trigger' | 'Approval' | 'Reflection'
}

interface AutomationTemplate {
    id?: string;
    name: string;
    description: string;
    version: string;
    category: string;
    mainWorkflowId: string;
    published: boolean;
    workflows?: AutomationWorkflow[];
}

export default function AutomationLibraryPage() {
    const [templates, setTemplates] = useState<AutomationTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Panel/Modal states
    const [showCreatePanel, setShowCreatePanel] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form fields
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [version, setVersion] = useState("1.0.0");
    const [category, setCategory] = useState("Finance");
    const [mainWorkflowId, setMainWorkflowId] = useState("");
    const [published, setPublished] = useState(true);
    
    // Bundled workflows state
    const [bundledWfs, setBundledWfs] = useState<AutomationWorkflow[]>([
        { workflowId: "", workflowName: "", type: "Subagent" }
    ]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/brain-templates");
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleAddWfInput = () => {
        setBundledWfs([...bundledWfs, { workflowId: "", workflowName: "", type: "Subagent" }]);
    };

    const handleRemoveWfInput = (idx: number) => {
        setBundledWfs(bundledWfs.filter((_, i) => i !== idx));
    };

    const handleWfInputChange = (idx: number, field: keyof AutomationWorkflow, value: string) => {
        const updated = bundledWfs.map((item, i) => {
            if (i === idx) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setBundledWfs(updated);
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !version) {
            alert("Name and version are required.");
            return;
        }

        setIsSaving(true);
        try {
            // Filter empty workflows
            const filteredWfs = bundledWfs.filter(w => w.workflowId && w.workflowName);

            const res = await fetch("/api/admin/brain-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    version,
                    category,
                    mainWorkflowId,
                    published,
                    workflows: filteredWfs
                })
            });

            if (res.ok) {
                setName("");
                setDescription("");
                setVersion("1.0.0");
                setCategory("Finance");
                setMainWorkflowId("");
                setPublished(true);
                setBundledWfs([{ workflowId: "", workflowName: "", type: "Subagent" }]);
                setShowCreatePanel(false);
                fetchTemplates();
            } else {
                alert("Failed to save automation template.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteTemplate = async (id: string) => {
        if (!confirm("Are you sure you want to delete this Automation Template? All client configurations mapping to it will remain but won't sync updates.")) return;
        try {
            const res = await fetch("/api/admin/brain-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "DELETE", id })
            });
            if (res.ok) {
                fetchTemplates();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* Header section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>AUTOMATION TEMPLATES LIBRARY</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 750 }}>
                        Manage standard automation logic, blueprint configurations, and execution loops for hired AI Employees.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreatePanel(true)}
                    style={{ 
                        height: "36px", 
                        padding: "0 16px", 
                        background: "var(--foreground)", 
                        color: "var(--background)", 
                        border: "none", 
                        borderRadius: "8px", 
                        fontSize: "0.78rem", 
                        fontWeight: 950, 
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "6px" 
                    }}
                >
                    <Plus size={14} /> Create Automation
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "300px", gap: "12px" }}>
                    <Loader2 className="spin" size={24} style={{ color: "var(--accent)" }} />
                    <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--muted-foreground)" }}>Loading Automation Templates...</span>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    {templates.map(tpl => (
                        <div key={tpl.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" }}>
                            
                            {/* Card Top Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: "0.95rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>
                                            {tpl.name}
                                        </h4>
                                        <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                                            Category: <strong>{tpl.category}</strong> · Version: {tpl.version}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span style={{ 
                                        fontSize: "0.62rem", 
                                        fontWeight: 950, 
                                        padding: "2px 8px", 
                                        borderRadius: "100px", 
                                        background: tpl.published ? "rgba(16, 185, 129, 0.1)" : "rgba(156, 163, 175, 0.1)", 
                                        color: tpl.published ? "#10B981" : "var(--muted-foreground)",
                                        textTransform: "uppercase"
                                    }}>
                                        {tpl.published ? "Published" : "Draft"}
                                    </span>
                                    <button 
                                        onClick={() => tpl.id && handleDeleteTemplate(tpl.id)}
                                        style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", display: "flex", alignItems: "center" }}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Description */}
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700, lineHeight: 1.45 }}>
                                {tpl.description || "No description provided."}
                            </p>

                            {/* Main Workflow Info */}
                            {tpl.mainWorkflowId && (
                                <div style={{ padding: "10px 14px", background: "var(--muted)", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "0.75rem", fontWeight: 800, color: "var(--foreground)", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Globe size={14} style={{ color: "var(--accent)" }} />
                                    <span>Main n8n Trigger ID: <strong>{tpl.mainWorkflowId}</strong></span>
                                </div>
                            )}

                            {/* Bundled Workflows List */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Bundled Execution Loops ({tpl.workflows?.length || 0})</span>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {tpl.workflows?.map((w, idx) => (
                                        <div key={idx} style={{ padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--foreground)" }}>{w.workflowName}</span>
                                            <span style={{ 
                                                fontSize: "0.65rem", 
                                                fontWeight: 900, 
                                                padding: "2px 6px", 
                                                background: w.type === 'Main' ? 'rgba(59, 130, 246, 0.1)' : 'var(--muted)', 
                                                color: w.type === 'Main' ? '#3B82F6' : 'var(--muted-foreground)',
                                                borderRadius: "4px"
                                            }}>
                                                {w.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dependency Blueprint Checklist */}
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Dependency Blueprint Checklist</span>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.72rem", color: "var(--foreground)", fontWeight: 750 }}>
                                    {tpl.category === "Finance" ? (
                                        <>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Brain: Invoices, Contracts</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Apps: Google Drive, Gmail, Stripe</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Creds: Google OAuth, Stripe API Key</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Model: GPT-4o, Embedding-3</span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Brain: Helpdesk SOPs, FAQs</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Apps: Hubspot CRM, Slack, Gmail</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Creds: CRM OAuth, Slack Webhook</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>✓</span>
                                                <span>Model: Claude-3.5, Embedding-3</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>
            )}

            {/* Slide-out panel / Overlay for Creation */}
            {showCreatePanel && (
                <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0, background: "rgba(0, 0, 0, 0.2)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ width: "540px", background: "var(--card)", borderLeft: "1px solid var(--border)", padding: "40px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
                        
                        {/* Panel Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                            <div>
                                <h3 style={{ fontSize: "1.05rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>CREATE AUTOMATION TEMPLATE</h3>
                                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 700 }}>Package versioned workflows.</span>
                            </div>
                            <button onClick={() => setShowCreatePanel(false)} style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Panel Form */}
                        <form onSubmit={handleCreateTemplate} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Automation Name</span>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="e.g. Invoice Processing"
                                        style={{ height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                    />
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Version</span>
                                    <input 
                                        type="text" 
                                        value={version}
                                        onChange={e => setVersion(e.target.value)}
                                        placeholder="e.g. 2.4"
                                        style={{ height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Category</span>
                                    <select 
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        style={{ height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.75rem", fontWeight: 800, background: "var(--muted)", color: "var(--foreground)" }}
                                    >
                                        <option value="Finance">Finance</option>
                                        <option value="Support">Support</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="HR">HR</option>
                                        <option value="General">General</option>
                                    </select>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Main n8n Workflow ID</span>
                                    <input 
                                        type="text" 
                                        value={mainWorkflowId}
                                        onChange={e => setMainWorkflowId(e.target.value)}
                                        placeholder="e.g. finance-main-wf"
                                        style={{ height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)" }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Description</span>
                                <textarea 
                                    rows={3}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Explain the automation this template configures..."
                                    style={{ padding: "10px 12px", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)", resize: "none" }}
                                />
                            </div>

                            {/* Dynamically bundled workflows */}
                            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Bundled Workflows</span>
                                    <button 
                                        type="button" 
                                        onClick={handleAddWfInput}
                                        style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.72rem", fontWeight: 950, cursor: "pointer" }}
                                    >
                                        + Add Workflow
                                    </button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {bundledWfs.map((wf, idx) => (
                                        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr auto", gap: "8px", alignItems: "center" }}>
                                            <input 
                                                type="text" 
                                                value={wf.workflowId}
                                                onChange={e => handleWfInputChange(idx, "workflowId", e.target.value)}
                                                placeholder="n8n ID"
                                                style={{ height: "34px", border: "1px solid var(--border)", borderRadius: "6px", padding: "0 8px", fontSize: "0.75rem", background: "var(--muted)", color: "var(--foreground)" }}
                                            />
                                            <input 
                                                type="text" 
                                                value={wf.workflowName}
                                                onChange={e => handleWfInputChange(idx, "workflowName", e.target.value)}
                                                placeholder="Name (e.g. OCR Reader)"
                                                style={{ height: "34px", border: "1px solid var(--border)", borderRadius: "6px", padding: "0 8px", fontSize: "0.75rem", background: "var(--muted)", color: "var(--foreground)" }}
                                            />
                                            <select 
                                                value={wf.type}
                                                onChange={e => handleWfInputChange(idx, "type", e.target.value)}
                                                style={{ height: "34px", border: "1px solid var(--border)", borderRadius: "6px", padding: "0 4px", fontSize: "0.72rem", fontWeight: 800, background: "var(--muted)", color: "var(--foreground)" }}
                                            >
                                                <option value="Main">Main</option>
                                                <option value="Subagent">Subagent</option>
                                                <option value="Trigger">Trigger</option>
                                                <option value="Approval">Approval</option>
                                                <option value="Reflection">Reflection</option>
                                            </select>
                                            <button 
                                                type="button" 
                                                onClick={() => handleRemoveWfInput(idx)}
                                                style={{ background: "none", border: "none", color: "var(--muted-foreground)", cursor: "pointer", display: "flex", alignItems: "center" }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isSaving}
                                style={{ height: "38px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 950, cursor: "pointer", marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                                {isSaving ? <Loader2 className="spin" size={14} /> : "Publish Automation Template"}
                            </button>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
