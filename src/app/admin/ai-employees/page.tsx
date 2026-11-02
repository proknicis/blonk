"use client";

import React, { useState, useEffect } from "react";
import { Users, Server, Layers, Settings, RefreshCw, Key, Shield, PlusCircle, Check, Loader2 } from "lucide-react";

interface AIEmployeeTemplate {
    id: string;
    name: string;
    description: string;
    suggestedName: string;
    defaultPermissions: any;
    brainTemplateId: string;
    brainTemplateName: string;
    brainTemplateVersion: string;
    createdAt: string;
}

interface BrainTemplate {
    id: string;
    name: string;
    version: string;
}

export default function AIEmployeeTemplatesPage() {
    const [templates, setTemplates] = useState<AIEmployeeTemplate[]>([]);
    const [brainTemplates, setBrainTemplates] = useState<BrainTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [suggestedName, setSuggestedName] = useState("");
    const [brainTemplateId, setBrainTemplateId] = useState("");
    const [permissionsString, setPermissionsString] = useState('{"Invoices": true, "Stripe": true}');
    const [isCreating, setIsCreating] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const tRes = await fetch("/api/admin/employee-templates");
            if (tRes.ok) setTemplates(await tRes.json());

            const bRes = await fetch("/api/admin/brain-templates");
            if (bRes.ok) setBrainTemplates(await bRes.json());
        } catch (e) {
            console.error("Failed to load templates:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !brainTemplateId) {
            alert("Role Name and Automation Template are required.");
            return;
        }

        let defaultPermissions = {};
        try {
            defaultPermissions = JSON.parse(permissionsString);
        } catch {
            alert("Permissions must be valid JSON format.");
            return;
        }

        setIsCreating(true);
        try {
            const res = await fetch("/api/admin/employee-templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    suggestedName: suggestedName || name,
                    defaultPermissions,
                    brainTemplateId
                })
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("AI Employee Template created successfully.", "success");
                setName("");
                setDescription("");
                setSuggestedName("");
                setBrainTemplateId("");
                setPermissionsString('{"Invoices": true, "Stripe": true}');
                loadData();
            } else {
                alert("Failed to create template.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 950, color: "var(--foreground)", margin: 0 }}>AI EMPLOYEE TEMPLATES</h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 750 }}>
                        Configure the marketplace specialist templates, default access credentials, and automation linkages.
                    </p>
                </div>
                <button 
                    onClick={loadData} 
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
                    <RefreshCw size={14} /> Sync Catalog
                </button>
            </div>

            {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "250px", gap: "12px" }}>
                    <Loader2 className="spin" size={24} style={{ color: "var(--accent)" }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 800 }}>Reading Specialist Metadata...</span>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
                    
                    {/* Left Column: List templates */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {templates.map((tpl) => {
                            const perms = typeof tpl.defaultPermissions === 'string' ? JSON.parse(tpl.defaultPermissions) : tpl.defaultPermissions || {};
                            return (
                                <div key={tpl.id} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 950, color: "var(--foreground)" }}>{tpl.name}</h4>
                                            <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 800 }}>Suggested Instance Name: {tpl.suggestedName}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", background: "var(--muted)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "100px", fontSize: "0.68rem", fontWeight: 900, color: "var(--foreground)" }}>
                                            <Layers size={12} />
                                            <span>{tpl.brainTemplateName} (v{tpl.brainTemplateVersion})</span>
                                        </div>
                                    </div>

                                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: "1.5", fontWeight: 700 }}>
                                        {tpl.description}
                                    </p>

                                    {/* Permissions Matrix preview */}
                                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "6px" }}>
                                        <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--muted-foreground)", textTransform: "uppercase" }}>DEFAULT ACCESS CREDENTIALS SET</span>
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "2px" }}>
                                            {Object.entries(perms).map(([key, val]) => (
                                                <div key={key} style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: val ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)", color: val ? "#10B981" : "#F59E0B", padding: "3px 8px", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 950 }}>
                                                    <Shield size={10} />
                                                    <span>{key}: {val ? "Grant" : "Deny"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {templates.length === 0 && (
                            <div style={{ padding: "40px", background: "var(--card)", border: "1px dashed var(--border)", borderRadius: "24px", textAlign: "center", color: "var(--muted-foreground)" }}>
                                No AI Employee Templates defined yet.
                            </div>
                        )}
                    </div>

                    {/* Right Column: Creation form */}
                    <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "28px", height: "fit-content" }}>
                        <h4 style={{ margin: "0 0 16px 0", fontSize: "0.9rem", fontWeight: 950, color: "var(--foreground)" }}>ADD NEW EMPLOYEE PERSONA</h4>
                        <form onSubmit={handleCreateTemplate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>ROLE NAME</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sales Assistant" 
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.78rem", background: "var(--muted)", color: "var(--foreground)" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>SUGGESTED INSTANCE NAME</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Sales AI" 
                                    value={suggestedName}
                                    onChange={e => setSuggestedName(e.target.value)}
                                    style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.78rem", background: "var(--muted)", color: "var(--foreground)" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>ROLE DESCRIPTION</label>
                                <textarea 
                                    placeholder="Enter role capabilities..." 
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={{ width: "100%", height: "80px", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", fontSize: "0.78rem", background: "var(--muted)", color: "var(--foreground)", resize: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>ASSIGN BACKEND AUTOMATION TEMPLATE</label>
                                <select 
                                    value={brainTemplateId}
                                    onChange={e => setBrainTemplateId(e.target.value)}
                                    style={{ width: "100%", height: "36px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 10px", fontSize: "0.78rem", fontWeight: 800, background: "var(--muted)", color: "var(--foreground)", outline: "none" }}
                                >
                                    <option value="">Select template...</option>
                                    {brainTemplates.map(bt => (
                                        <option key={bt.id} value={bt.id}>{bt.name} (v{bt.version})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 950, color: "var(--muted-foreground)", marginBottom: "4px" }}>DEFAULT PERMISSIONS MATRIX (JSON)</label>
                                <textarea 
                                    value={permissionsString}
                                    onChange={e => setPermissionsString(e.target.value)}
                                    style={{ width: "100%", height: "70px", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px", fontSize: "0.72rem", fontFamily: "monospace", background: "var(--muted)", color: "var(--foreground)", resize: "none" }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isCreating}
                                style={{ height: "38px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.75rem", fontWeight: 950, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                            >
                                <PlusCircle size={14} /> {isCreating ? "Adding..." : "Add Template"}
                            </button>
                        </form>
                    </div>

                </div>
            )}
        </div>
    );
}
