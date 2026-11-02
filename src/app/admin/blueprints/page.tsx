"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
    Plus, Search, Zap, Trash2, Edit3, Activity, 
    RefreshCw, Layers, Eye, BookOpen, Clock, Database, 
    CheckCircle, AlertCircle, Filter, Settings, X, Save, HardDrive,
    Star, Check, ChevronLeft, ChevronRight, Play, AlertTriangle, Shield,
    Cpu, Brain, FileText, BarChart2, StarHalf, Info, Network, UserCheck, Terminal
} from "lucide-react";
import adminStyles from "../admin.module.css";

interface RealWorkflow {
    id: string;
    name: string;
    status: string;
    totalRuns: number;
    successRate: number;
}

export default function BlueprintsPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");

    // Drawer / Workspace states
    const [selectedBlueprint, setSelectedBlueprint] = useState<any>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<string>("overview");

    // Wizard modal step states
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    
    // Unified product creation state (8-Step Wizard data schema)
    const [wizardData, setWizardData] = useState({
        // Step 1: General
        name: "",
        slug: "",
        shortDesc: "",
        longDesc: "",
        category: "Finance",
        icon: "Zap",
        banner: "",
        screenshots: "",
        video: "",
        tags: "AI, Finance, Matching",
        difficulty: "Medium",
        setupTime: "2 hours",
        // Step 2: Pricing
        monthlyPrice: 49,
        setupFee: 0,
        trialDays: 14,
        currency: "USD",
        discount: 0,
        popularBadge: false,
        featuredBadge: false,
        // Step 3: Workflow
        n8nWorkflowId: "",
        workflowJson: "",
        workflowVersion: "1.0.0",
        webhookRequired: true,
        minBlonkVersion: "1.0.0",
        // Step 4: Integrations
        integrations: ["Gmail", "Stripe", "OpenAI"] as string[],
        // Step 5: AI Employees
        aiEmployees: ["Invoice Reader", "Payment Chaser"] as string[],
        // Step 6: Brain Permissions
        brainPermissions: ["Invoices", "CRM", "Email"] as string[],
        // Step 7: Deployment
        dockerImage: "blonk-runner:latest",
        cpu: "1.0",
        ram: "2GB",
        disk: "10GB",
        timeout: 300,
        region: "us-east-1",
        requiresGpu: false,
        // Step 8: Marketplace
        marketTitle: "",
        marketSubtitle: "",
        seoDesc: "",
        features: "Automatic supplier matching\nReal-time Slack notifications\nDiscrepancy alerts",
        faq: "How secure is it? Extremely secure, self-hosted.\nDoes it support custom CRMs? Yes.",
        releaseNotes: "v1.0.0 - Initial deployment configuration."
    });

    const fetchBlueprints = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/templates");
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (e) {
            console.error("Failed to fetch blueprints:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlueprints();
    }, []);

    const handleSelectBlueprint = (bp: any) => {
        setSelectedBlueprint(bp);
        setActiveDetailTab("overview");
        
        // Feed backend fields back into the wizard form state for editing
        const pInfo = bp.productInfo || {};
        const reqs = bp.requirements || [];
        const reqNames = Array.isArray(reqs) ? reqs.map((r: any) => r.name || r.service) : [];

        setWizardData({
            name: bp.name || "",
            slug: pInfo.slug || bp.id || "",
            shortDesc: bp.description || "",
            longDesc: pInfo.longDesc || bp.description || "",
            category: bp.sector || "Finance",
            icon: bp.icon || "Zap",
            banner: pInfo.banner || "",
            screenshots: pInfo.screenshots || "",
            video: pInfo.video || "",
            tags: pInfo.tags || "AI, Automation",
            difficulty: bp.complexity || "Medium",
            setupTime: bp.savings || "2 hours",
            monthlyPrice: pInfo.monthlyPrice || bp.price || 49,
            setupFee: pInfo.setupFee || 0,
            trialDays: pInfo.trialDays || 14,
            currency: pInfo.currency || "USD",
            discount: pInfo.discount || 0,
            popularBadge: !!pInfo.popularBadge,
            featuredBadge: !!bp.featured,
            n8nWorkflowId: bp.n8n_master_workflow_id || "",
            workflowJson: bp.template_source || "",
            workflowVersion: pInfo.workflowVersion || "1.0.0",
            webhookRequired: pInfo.webhookRequired !== false,
            minBlonkVersion: pInfo.minBlonkVersion || "1.0.0",
            integrations: reqNames.length > 0 ? reqNames : ["Gmail", "Slack"],
            aiEmployees: pInfo.aiEmployees || ["Supervisor", "Worker"],
            brainPermissions: pInfo.brainPermissions || ["CRM", "Email"],
            dockerImage: pInfo.dockerImage || "blonk-runner:latest",
            cpu: pInfo.cpu || "1.0",
            ram: pInfo.ram || "2GB",
            disk: pInfo.disk || "10GB",
            timeout: pInfo.timeout || 300,
            region: pInfo.region || "us-east-1",
            requiresGpu: !!pInfo.requiresGpu,
            marketTitle: pInfo.marketTitle || bp.name || "",
            marketSubtitle: pInfo.marketSubtitle || "",
            seoDesc: pInfo.seoDesc || "",
            features: pInfo.features || "",
            faq: pInfo.faq || "",
            releaseNotes: pInfo.releaseNotes || "v1.0.0 - Stable release"
        });
    };

    const handleOpenCreateWizard = () => {
        setWizardStep(1);
        setWizardData({
            name: "New AI Automation",
            slug: "new-ai-automation",
            shortDesc: "Short description of what this automation accomplishes.",
            longDesc: "Deep description detailing workflow loops and AI subagents logic.",
            category: "Finance",
            icon: "Zap",
            banner: "",
            screenshots: "",
            video: "",
            tags: "AI, Finance, Operations",
            difficulty: "Medium",
            setupTime: "1 hour",
            monthlyPrice: 49,
            setupFee: 0,
            trialDays: 14,
            currency: "USD",
            discount: 0,
            popularBadge: false,
            featuredBadge: false,
            n8nWorkflowId: "",
            workflowJson: "",
            workflowVersion: "1.0.0",
            webhookRequired: true,
            minBlonkVersion: "1.0.0",
            integrations: ["Gmail", "Slack"],
            aiEmployees: ["Supervisor", "Worker"],
            brainPermissions: ["CRM", "Email"],
            dockerImage: "blonk-runner:latest",
            cpu: "1.0",
            ram: "2GB",
            disk: "10GB",
            timeout: 300,
            region: "us-east-1",
            requiresGpu: false,
            marketTitle: "New AI Automation Product",
            marketSubtitle: "Instantly link tools and delegate workloads to active agents.",
            seoDesc: "AI automated product pipelines.",
            features: "Automated indexing\nSlack triggers",
            faq: "Is n8n required? Yes, fully syncs.",
            releaseNotes: "v1.0.0 - Initial config template."
        });
        setIsWizardOpen(true);
    };

    const handleSaveTemplate = async (customData?: any) => {
        setIsSaving(true);
        const activeData = customData || wizardData;
        try {
            const requirements = activeData.integrations.map((name: string) => ({
                name,
                service: name.toLowerCase(),
                label: name,
                type: "oauth2"
            }));

            const productInfo = {
                ...activeData,
                complexity: activeData.difficulty,
                monetization: activeData.monthlyPrice > 0 ? "Subscription" : "Free",
                setupPrice: Number(activeData.setupFee),
                monthlyPrice: Number(activeData.monthlyPrice),
                popularBadge: activeData.popularBadge,
                featuredBadge: activeData.featuredBadge
            };

            const payload = {
                id: selectedBlueprint?.id || null, // If null, API insertion generates UUID
                name: activeData.name,
                sector: activeData.category,
                description: activeData.shortDesc,
                savings: activeData.setupTime,
                complexity: activeData.difficulty,
                icon: activeData.icon,
                color: activeData.featuredBadge ? "#10B981" : "#3B82F6",
                featured: !!activeData.featuredBadge,
                requirements,
                setupGuide: [{ title: "Prerequisites Setup", description: `Ensure credentials are added for: ${activeData.integrations.join(", ")}` }],
                productInfo,
                status: selectedBlueprint?.status || "Draft",
                price: Number(activeData.monthlyPrice),
                category: activeData.category.toLowerCase(),
                template_source: activeData.workflowJson,
                n8n_master_workflow_id: activeData.n8nWorkflowId
            };

            const res = await fetch("/api/admin/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Automation product saved successfully.", "success");
                setIsWizardOpen(false);
                setSelectedBlueprint(null);
                fetchBlueprints();
            } else {
                alert("Failed to save automation product config.");
            }
        } catch (err) {
            console.error("Save automation error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDecommission = async (id: string) => {
        if (!confirm("Are you sure you want to decommission this automation product? This is irreversible.")) return;
        try {
            const res = await fetch(`/api/admin/templates?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast("Automation decommissioned.", "success");
                setSelectedBlueprint(null);
                fetchBlueprints();
            }
        } catch (e) {
            console.error("Decommission error:", e);
        }
    };

    const handleToggleStatus = async (bp: any) => {
        const nextStatus = bp.status === "Published" ? "Draft" : "Published";
        try {
            const res = await fetch("/api/admin/templates", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...bp,
                    status: nextStatus
                })
            });
            if (res.ok) {
                if ((window as any).showToast) (window as any).showToast(`Status changed to ${nextStatus}.`, "success");
                fetchBlueprints();
                setSelectedBlueprint((prev: any) => prev && prev.id === bp.id ? { ...prev, status: nextStatus } : prev);
            }
        } catch (e) {
            console.error("Toggle status error:", e);
        }
    };

    // Filter items
    const filteredTemplates = templates.filter(bp => {
        const matchesSearch = bp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             (bp.description || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || (bp.sector && bp.sector.toLowerCase() === categoryFilter.toLowerCase());
        const matchesStatus = statusFilter === "All" || (bp.status && bp.status.toLowerCase() === statusFilter.toLowerCase());
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const isEditingSettings = activeDetailTab === "settings";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.5s ease" }}>
            
            {/* SEARCH & CONTROLS HEADER */}
            {!selectedBlueprint && !isWizardOpen && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", background: "var(--card)", padding: "18px 24px", borderRadius: "18px", border: "1px solid var(--border)" }}>
                    <div style={{ position: 'relative', width: '320px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input 
                            type="text" 
                            placeholder="Search automation templates..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{ width: '100%', height: '38px', borderRadius: '10px', border: '1px solid var(--border)', paddingLeft: '40px', fontSize: '0.82rem', fontWeight: 700, outline: 'none', background: 'var(--muted)', color: 'var(--foreground)' }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <Filter size={14} style={{ color: "var(--muted-foreground)" }} />
                            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>Category:</span>
                        </div>
                        
                        <select 
                            value={categoryFilter} 
                            onChange={e => setCategoryFilter(e.target.value)}
                            style={{ height: '38px', padding: '0 10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Categories</option>
                            <option value="Operations">Operations</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Finance">Finance</option>
                            <option value="Accounting">Accounting</option>
                            <option value="IT">IT</option>
                            <option value="Law">Law</option>
                        </select>

                        <select 
                            value={statusFilter} 
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ height: '38px', padding: '0 10px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, outline: "none" }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                            <option value="Deprecated">Deprecated</option>
                        </select>

                        <button 
                            onClick={handleOpenCreateWizard}
                            style={{ height: "38px", padding: "0 16px", background: "#34D186", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px", color: "#FFFFFF", boxShadow: "0 4px 12px rgba(52, 209, 134, 0.2)" }}
                        >
                            <Plus size={14} />
                            <span>Create Automation</span>
                        </button>
                    </div>
                </div>
            )}

            {/* CATALOG VIEW: PREMIUM CARDS LIST */}
            {!selectedBlueprint && !isWizardOpen && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                    <div style={{ marginBottom: "24px" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--foreground)", margin: 0 }}>AUTOMATION PRODUCT LIBRARY</h3>
                        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", margin: "4px 0 0", fontWeight: 600 }}>Create and configure end-user automated software products</p>
                    </div>

                    {isLoading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                            {[1, 2, 3].map(i => (
                                <div key={i} style={{ height: "240px", background: "var(--muted)", borderRadius: "20px", animation: "pulse 1.5s infinite" }} />
                            ))}
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "240px", border: "1px dashed var(--border)", borderRadius: "20px", color: "var(--muted-foreground)" }}>
                            <BookOpen size={32} style={{ opacity: 0.5, marginBottom: "12px" }} />
                            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>No automation products matching requirements.</span>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
                            {filteredTemplates.map(bp => {
                                const reqs = bp.requirements || [];
                                const count = Array.isArray(reqs) ? reqs.length : 0;
                                const isPub = bp.status === "Published";
                                const isDep = bp.status === "Deprecated";
                                const statusColor = isPub ? "#10B981" : (isDep ? "#EF4444" : "#6B7280");
                                
                                return (
                                    <div 
                                        key={bp.id} 
                                        onClick={() => handleSelectBlueprint(bp)}
                                        style={{ 
                                            background: "var(--muted)", 
                                            borderRadius: "20px", 
                                            border: "1px solid var(--border)", 
                                            padding: "24px",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease-in-out",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "space-between",
                                            height: "260px"
                                        }}
                                        className={adminStyles.productCard}
                                    >
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Cpu size={16} color="#3B82F6" />
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>{bp.name}</h4>
                                                        <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontWeight: 700 }}>{bp.sector || "Operations"}</span>
                                                    </div>
                                                </div>
                                                <span style={{ fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", padding: "4px 8px", borderRadius: "100px", background: `${statusColor}1A`, color: statusColor }}>
                                                    {bp.status || "Draft"}
                                                </span>
                                            </div>

                                            <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.4, margin: "0 0 16px 0", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {bp.description || "No description configured."}
                                            </p>
                                        </div>

                                        <div>
                                            {/* Rating and price indicators */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                                <div style={{ display: "flex", color: "#F59E0B" }}>
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="#F59E0B" stroke="none" />)}
                                                </div>
                                                <span style={{ fontSize: "0.9rem", fontWeight: 900, color: "var(--foreground)" }}>
                                                    ${bp.price || 0}/mo
                                                </span>
                                            </div>

                                            {/* Specs strip */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "12px", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>
                                                <span>{count} Required Apps</span>
                                                <div style={{ display: "flex", gap: "6px" }}>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleSelectBlueprint(bp); }}
                                                        style={{ background: "none", border: "none", color: "var(--accent)", fontWeight: 800, cursor: "pointer" }}
                                                    >
                                                        Edit Product
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* DETAIL WORKSPACE SCREEN */}
            {selectedBlueprint && !isWizardOpen && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
                    
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <button 
                                onClick={() => setSelectedBlueprint(null)}
                                style={{ background: "none", border: "1px solid var(--border)", width: "36px", height: "36px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--foreground)" }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <h2 style={{ fontSize: "1.3rem", fontWeight: 900, margin: 0 }}>{selectedBlueprint.name}</h2>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 900, textTransform: "uppercase", padding: "4px 10px", borderRadius: "100px", background: "rgba(52, 209, 134, 0.1)", color: "#34D186" }}>
                                        {selectedBlueprint.status || "Draft"}
                                    </span>
                                </div>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                                    ID: {selectedBlueprint.id} · Active Version: {wizardData.workflowVersion}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button 
                                onClick={() => handleToggleStatus(selectedBlueprint)}
                                className={adminStyles.btn}
                                style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)", padding: "0 16px", height: "38px", borderRadius: "10px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800 }}
                            >
                                {selectedBlueprint.status === 'Published' ? 'Deactivate Product' : 'Publish Product'}
                            </button>
                            <button 
                                onClick={() => handleDecommission(selectedBlueprint.id)}
                                className={adminStyles.btn}
                                style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#EF4444", padding: "0 16px", height: "38px", borderRadius: "10px", cursor: "pointer", fontSize: "0.78rem", fontWeight: 800 }}
                            >
                                Decommission
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div style={{ display: "flex", gap: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "2px" }}>
                        {[
                            { id: "overview", label: "Overview", icon: Info },
                            { id: "versions", label: "Versions", icon: RefreshCw },
                            { id: "analytics", label: "Analytics", icon: BarChart2 },
                            { id: "customers", label: "Customers", icon: Layers },
                            { id: "reviews", label: "Reviews", icon: Star },
                            { id: "deployments", label: "Deployments", icon: HardDrive },
                            { id: "logs", label: "Logs", icon: Terminal },
                            { id: "employees", label: "AI Employees", icon: Cpu },
                            { id: "brain", label: "Company Brain", icon: Brain },
                            { id: "settings", label: "Settings", icon: Settings }
                        ].map((t) => {
                            const Icon = t.icon;
                            const isActive = activeDetailTab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveDetailTab(t.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        padding: "10px 4px",
                                        background: "transparent",
                                        border: "none",
                                        borderBottom: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                                        color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                                        fontSize: "0.8rem",
                                        fontWeight: 800,
                                        cursor: "pointer",
                                        outline: "none"
                                    }}
                                >
                                    <Icon size={14} />
                                    <span>{t.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* TAB CONTENTS */}
                    <div style={{ minHeight: "400px" }}>
                        
                        {/* 1. Overview Tab */}
                        {activeDetailTab === "overview" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "32px", animation: "fadeIn 0.3s" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ background: "var(--muted)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 800 }}>General Description</h4>
                                        <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0 }}>
                                            {wizardData.longDesc || selectedBlueprint.description}
                                        </p>
                                    </div>

                                    <div style={{ background: "var(--muted)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 800 }}>Product Core Features</h4>
                                        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.85rem", color: "var(--muted-foreground)", display: "flex", flexDirection: "column", gap: "8px" }}>
                                            {wizardData.features.split("\n").filter(Boolean).map((f, i) => (
                                                <li key={i}>{f}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    <div style={{ background: "var(--muted)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 800 }}>Monetization Specs</h4>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.82rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--muted-foreground)" }}>Monthly Subscription:</span>
                                                <span style={{ fontWeight: 800 }}>${wizardData.monthlyPrice}/mo</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--muted-foreground)" }}>Onboarding Setup Fee:</span>
                                                <span style={{ fontWeight: 800 }}>${wizardData.setupFee}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "var(--muted-foreground)" }}>Free Trial Period:</span>
                                                <span style={{ fontWeight: 800 }}>{wizardData.trialDays} days</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ background: "var(--muted)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                                        <h4 style={{ margin: "0 0 12px 0", fontSize: "0.95rem", fontWeight: 800 }}>Required Connections</h4>
                                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                            {wizardData.integrations.map((app, i) => (
                                                <span key={i} style={{ fontSize: "0.72rem", background: "var(--card)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "6px", fontWeight: 800 }}>
                                                    {app}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. Versions Tab */}
                        {activeDetailTab === "versions" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>Product Releases Timeline</h4>
                                        <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Deploy, audit, and rollback semantic packages</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if ((window as any).showToast) (window as any).showToast("Publish version requested. Syncing n8n blueprint models...", "info");
                                        }}
                                        style={{ height: "36px", padding: "0 14px", background: "var(--accent)", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}
                                    >
                                        Publish New Version
                                    </button>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {[
                                        { ver: "2.4.1", date: "Today", desc: "Patched Stripe webhook payload headers indexing.", active: true },
                                        { ver: "2.4.0", date: "2 days ago", desc: "Added Invoice Reader subagent reasoning prompt.", active: false },
                                        { ver: "2.3.9", date: "1 week ago", desc: "Updated Google Drive RAG file indexing.", active: false }
                                    ].map((v, idx) => (
                                        <div key={idx} style={{ background: "var(--muted)", border: "1px solid var(--border)", padding: "16px 20px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                    <span style={{ fontSize: "0.85rem", fontWeight: 900 }}>v{v.ver}</span>
                                                    {v.active && <span style={{ fontSize: "0.6rem", background: "rgba(52, 209, 134, 0.15)", color: "#34D186", fontWeight: 900, padding: "2px 6px", borderRadius: "4px" }}>ACTIVE</span>}
                                                </div>
                                                <p style={{ margin: "4px 0 0 0", fontSize: "0.78rem", color: "var(--muted-foreground)" }}>{v.desc}</p>
                                            </div>
                                            <div style={{ display: "flex", gap: "10px" }}>
                                                <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{v.date}</span>
                                                {!v.active && (
                                                    <button 
                                                        onClick={() => {
                                                            if ((window as any).showToast) (window as any).showToast(`Product rolled back to version ${v.ver} successfully!`, "success");
                                                        }}
                                                        style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800, cursor: "pointer", color: "var(--foreground)" }}
                                                    >
                                                        Rollback
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Analytics Tab */}
                        {activeDetailTab === "analytics" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                                    {[
                                        { label: "Active Customers", val: "142", icon: Layers, trend: "+12% this month" },
                                        { label: "Monthly Revenue", val: "$6,958", icon: Star, trend: "+8.2% this month" },
                                        { label: "Success Rate", val: "99.2%", icon: Shield, trend: "Optimal uptime" },
                                        { label: "Average Time Saved", val: "126 hours", icon: Clock, trend: "Per workspace" }
                                    ].map((c, i) => {
                                        const Icon = c.icon;
                                        return (
                                            <div key={i} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--muted-foreground)" }}>{c.label}</span>
                                                    <Icon size={16} color="var(--accent)" />
                                                </div>
                                                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--foreground)" }}>{c.val}</div>
                                                <div style={{ fontSize: "0.68rem", color: "#10B981", fontWeight: 800, marginTop: "4px" }}>{c.trend}</div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
                                    <h4 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: 800 }}>Usage Conversion Funnel</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        {[
                                            { label: "Marketplace Views", count: "1,420", pct: 100 },
                                            { label: "Product Installs", count: "240", pct: 16.9 },
                                            { label: "Active Workspaces", count: "142", pct: 9.8 }
                                        ].map((item, idx) => (
                                            <div key={idx}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: "4px" }}>
                                                    <span style={{ fontWeight: 800 }}>{item.label}</span>
                                                    <span style={{ color: "var(--muted-foreground)" }}>{item.count} ({item.pct}%)</span>
                                                </div>
                                                <div style={{ width: "100%", height: "8px", background: "var(--card)", borderRadius: "100px", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", background: "var(--accent)", width: `${item.pct}%`, borderRadius: "100px" }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Customers Tab */}
                        {activeDetailTab === "customers" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s" }}>
                                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>Active Installations</h4>
                                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Workspace</th>
                                            <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Billing Plan</th>
                                            <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Installed Version</th>
                                            <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Install Date</th>
                                            <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Health Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { workspace: "Nikolass's Workspace", plan: "Pro Plan", ver: "2.4.1", date: "2026-07-04", health: "Optimal" },
                                            { workspace: "Alpha Group", plan: "Enterprise Plan", ver: "2.4.1", date: "2026-06-28", health: "Optimal" },
                                            { workspace: "Sia Blonk Operations", plan: "Pro Plan", ver: "2.4.0", date: "2026-06-15", health: "Warning" }
                                        ].map((cust, i) => (
                                            <tr key={i} style={{ background: "var(--muted)" }}>
                                                <td style={{ padding: "16px", borderTopLeftRadius: "12px", borderBottomLeftRadius: "12px", fontSize: "0.82rem", fontWeight: 800 }}>{cust.workspace}</td>
                                                <td style={{ padding: "16px", fontSize: "0.82rem" }}>{cust.plan}</td>
                                                <td style={{ padding: "16px", fontSize: "0.82rem", fontWeight: 700 }}>v{cust.ver}</td>
                                                <td style={{ padding: "16px", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>{cust.date}</td>
                                                <td style={{ padding: "16px", borderTopRightRadius: "12px", borderBottomRightRadius: "12px", fontSize: "0.82rem" }}>
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: cust.health === "Optimal" ? "#10B981" : "#F59E0B", fontWeight: 800 }}>
                                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: cust.health === "Optimal" ? "#10B981" : "#F59E0B" }} />
                                                        {cust.health}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* 5. Reviews Tab */}
                        {activeDetailTab === "reviews" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s" }}>
                                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>Customer Reviews</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {[
                                        { user: "Marcus V.", comment: "Working great for our finance department. Reconciles everything in seconds.", stars: 5 },
                                        { user: "Nikolass P.", comment: "Setup took a bit of time but support helped us link our custom CRM.", stars: 4 }
                                    ].map((r, i) => (
                                        <div key={i} style={{ background: "var(--muted)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                                <span style={{ fontWeight: 800, fontSize: "0.82rem" }}>{r.user}</span>
                                                <div style={{ display: "flex", color: "#F59E0B" }}>
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill={s <= r.stars ? "#F59E0B" : "none"} stroke="none" />)}
                                                </div>
                                            </div>
                                            <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted-foreground)" }}>&quot;{r.comment}&quot;</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 6. Deployments Tab */}
                        {activeDetailTab === "deployments" && (
                            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.4fr", gap: "32px", animation: "fadeIn 0.3s" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>Container Specifications</h4>
                                    <div style={{ background: "var(--muted)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px", fontSize: "0.82rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--muted-foreground)" }}>Base Docker Image:</span>
                                            <span style={{ fontWeight: 800 }}>{wizardData.dockerImage}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--muted-foreground)" }}>Allocated CPU Limit:</span>
                                            <span style={{ fontWeight: 800 }}>{wizardData.cpu} Core</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--muted-foreground)" }}>RAM Threshold:</span>
                                            <span style={{ fontWeight: 800 }}>{wizardData.ram}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span style={{ color: "var(--muted-foreground)" }}>Target Deploy Region:</span>
                                            <span style={{ fontWeight: 800 }}>{wizardData.region}</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: "var(--muted)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border)" }}>
                                    <h4 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: 800 }}>Active Nodes Resource Allocation</h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "0.78rem" }}>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span>CPU Core Usage</span>
                                                <span style={{ fontWeight: 800 }}>24%</span>
                                            </div>
                                            <div style={{ width: "100%", height: "6px", background: "var(--card)", borderRadius: "100px" }}>
                                                <div style={{ width: "24%", height: "100%", background: "#10B981", borderRadius: "100px" }} />
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span>Memory Usage</span>
                                                <span style={{ fontWeight: 800 }}>58%</span>
                                            </div>
                                            <div style={{ width: "100%", height: "6px", background: "var(--card)", borderRadius: "100px" }}>
                                                <div style={{ width: "58%", height: "100%", background: "#F59E0B", borderRadius: "100px" }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 7. Logs Tab */}
                        {activeDetailTab === "logs" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.3s" }}>
                                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>Orchestrator Execution Logs</h4>
                                <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", fontFamily: "monospace", fontSize: "0.78rem", height: "300px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <div>[2026-07-07 18:30:12] <span style={{ color: "#3B82F6" }}>[INFO]</span> Initializing BLONK Container runner...</div>
                                    <div>[2026-07-07 18:30:13] <span style={{ color: "#3B82F6" }}>[INFO]</span> Authenticating Gmail workspace credentials...</div>
                                    <div>[2026-07-07 18:30:15] <span style={{ color: "#10B981" }}>[SUCCESS]</span> Gmail auth verification succeeded.</div>
                                    <div>[2026-07-07 18:30:16] <span style={{ color: "#3B82F6" }}>[INFO]</span> Pulling 14 supplier invoices from inbox attachments...</div>
                                    <div>[2026-07-07 18:30:20] <span style={{ color: "#10B981" }}>[SUCCESS]</span> Dispatched 14 ledger updates to Stripe matching loop.</div>
                                    <div style={{ color: "var(--muted-foreground)" }}>--- End of telemetry buffer ---</div>
                                </div>
                            </div>
                        )}

                        {/* 8. AI Employees Tab */}
                        {activeDetailTab === "employees" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s" }}>
                                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>Assigned AI Agents Team</h4>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                                    {wizardData.aiEmployees.map((agent, i) => (
                                        <div key={i} style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                                            <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "8px" }}>
                                                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "var(--accent)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "0.75rem" }}>AI</div>
                                                <div>
                                                    <span style={{ fontSize: "0.82rem", fontWeight: 800 }}>{agent}</span>
                                                    <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--muted-foreground)" }}>Active subagent</p>
                                                </div>
                                            </div>
                                            <p style={{ margin: "10px 0 0 0", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>
                                                Allowed access to: {wizardData.brainPermissions.join(", ")}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 9. Company Brain Tab */}
                        {activeDetailTab === "brain" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s" }}>
                                <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800 }}>Knowledge Base Permissions</h4>
                                <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px" }}>
                                    <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", marginBottom: "20px" }}>
                                        Indicate categories of vectorized organization documentation this automation has authorization to query:
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "14px" }}>
                                        {["Invoices", "Contracts", "CRM", "Email", "HR Documents", "Financial Reports", "Legal Files"].map((p, idx) => {
                                            const hasAccess = wizardData.brainPermissions.includes(p);
                                            return (
                                                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.82rem" }}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={hasAccess}
                                                        readOnly
                                                        style={{ width: "16px", height: "16px" }}
                                                    />
                                                    <span style={{ fontWeight: 650, color: hasAccess ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                                        {p}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 10. Settings (Edit metadata) Tab */}
                        {activeDetailTab === "settings" && (
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleSaveTemplate(); }}
                                style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s" }}
                            >
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "6px" }}>Automation Name</label>
                                        <input 
                                            type="text" 
                                            value={wizardData.name}
                                            onChange={e => setWizardData({ ...wizardData, name: e.target.value })}
                                            style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "6px" }}>Slug Identifier</label>
                                        <input 
                                            type="text" 
                                            value={wizardData.slug}
                                            onChange={e => setWizardData({ ...wizardData, slug: e.target.value })}
                                            style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)" }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "6px" }}>Short Description</label>
                                    <input 
                                        type="text" 
                                        value={wizardData.shortDesc}
                                        onChange={e => setWizardData({ ...wizardData, shortDesc: e.target.value })}
                                        style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)" }}
                                    />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "6px" }}>Monthly Pricing ($)</label>
                                        <input 
                                            type="number" 
                                            value={wizardData.monthlyPrice}
                                            onChange={e => setWizardData({ ...wizardData, monthlyPrice: parseInt(e.target.value) || 0 })}
                                            style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "6px" }}>n8n Workflow reference ID</label>
                                        <input 
                                            type="text" 
                                            value={wizardData.n8nWorkflowId}
                                            onChange={e => setWizardData({ ...wizardData, n8nWorkflowId: e.target.value })}
                                            style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)" }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "6px" }}>Region Location</label>
                                        <input 
                                            type="text" 
                                            value={wizardData.region}
                                            onChange={e => setWizardData({ ...wizardData, region: e.target.value })}
                                            style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.85rem", background: "var(--muted)", color: "var(--foreground)" }}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSaving}
                                    style={{ height: "40px", width: "120px", display: "flex", gap: "8px", alignItems: "center", justifyContent: "center", background: "#34D186", color: "#FFFFFF", border: "none", borderRadius: "10px", fontWeight: 900, cursor: "pointer" }}
                                >
                                    <Save size={16} />
                                    <span>{isSaving ? "Saving..." : "Save Product"}</span>
                                </button>
                            </form>
                        )}

                    </div>
                </div>
            )}

            {/* 8-STEP CREATE AUTOMATION WIZARD (Overlay Portal) */}
            {isWizardOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: "20px" }}>
                    <div style={{ width: "900px", height: "650px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", display: "grid", gridTemplateColumns: "240px 1fr", overflow: "hidden", boxShadow: "var(--shadow-premium)" }}>
                        
                        {/* Left Steps tracker list */}
                        <div style={{ background: "var(--muted)", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "20px", borderRight: "1px solid var(--border)" }}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "16px" }}>
                                <Settings size={16} color="var(--accent)" />
                                <span style={{ fontSize: "0.8rem", fontWeight: 950 }}>PRODUCT ENGINE</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {[
                                    { s: 1, label: "General details" },
                                    { s: 2, label: "Pricing model" },
                                    { s: 3, label: "Workflow blueprint" },
                                    { s: 4, label: "App Integrations" },
                                    { s: 5, label: "AI Employees team" },
                                    { s: 6, label: "Brain Permissions" },
                                    { s: 7, label: "Cloud Deployment" },
                                    { s: 8, label: "Marketplace list" }
                                ].map((step) => {
                                    const isDone = wizardStep > step.s;
                                    const isCur = wizardStep === step.s;
                                    return (
                                        <div key={step.s} style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "0.78rem" }}>
                                            <div style={{ 
                                                width: "20px", 
                                                height: "20px", 
                                                borderRadius: "50%", 
                                                border: isCur || isDone ? "none" : "1px solid var(--border)", 
                                                background: isDone ? "#34D186" : (isCur ? "var(--accent)" : "transparent"), 
                                                color: isCur || isDone ? "#FFFFFF" : "var(--muted-foreground)", 
                                                display: "flex", 
                                                alignItems: "center", 
                                                justifyContent: "center",
                                                fontWeight: 900,
                                                fontSize: "0.65rem" 
                                            }}>
                                                {isDone ? <Check size={10} strokeWidth={3} /> : step.s}
                                            </div>
                                            <span style={{ 
                                                fontWeight: isCur ? 850 : 650, 
                                                color: isCur ? "var(--foreground)" : "var(--muted-foreground)" 
                                            }}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Main Step form fields */}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                            
                            {/* Wizard Header */}
                            <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900 }}>Create Automation Product</h3>
                                    <p style={{ margin: "2px 0 0 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Configure the deployment steps for your customers</p>
                                </div>
                                <button 
                                    onClick={() => setIsWizardOpen(false)}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted-foreground)" }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Wizard Body Form Scrollable Container */}
                            <div style={{ padding: "32px", flexGrow: 1, overflowY: "auto" }}>
                                
                                {/* Step 1: General */}
                                {wizardStep === 1 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>AUTOMATION PRODUCT NAME</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Invoice Processing AI"
                                                value={wizardData.name}
                                                onChange={e => setWizardData({ ...wizardData, name: e.target.value })}
                                                style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                            />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>SLUG IDENTIFIER</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="invoice-processing-ai"
                                                    value={wizardData.slug}
                                                    onChange={e => setWizardData({ ...wizardData, slug: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>CATEGORY (SECTOR)</label>
                                                <select 
                                                    value={wizardData.category}
                                                    onChange={e => setWizardData({ ...wizardData, category: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.82rem", fontWeight: 700 }}
                                                >
                                                    <option value="Finance">Finance</option>
                                                    <option value="Marketing">Marketing</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="Support">Support</option>
                                                    <option value="Operations">Operations</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>SHORT DESCRIPTION</label>
                                            <input 
                                                type="text" 
                                                placeholder="Extract supplier invoices from email attachments and reconcile records."
                                                value={wizardData.shortDesc}
                                                onChange={e => setWizardData({ ...wizardData, shortDesc: e.target.value })}
                                                style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                            />
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>ESTIMATED SETUP TIME</label>
                                                <input 
                                                    type="text" 
                                                    value={wizardData.setupTime}
                                                    onChange={e => setWizardData({ ...wizardData, setupTime: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>DIFFICULTY SCALE</label>
                                                <select 
                                                    value={wizardData.difficulty}
                                                    onChange={e => setWizardData({ ...wizardData, difficulty: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--muted)", color: "var(--foreground)", fontSize: "0.82rem", fontWeight: 700 }}
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Pricing */}
                                {wizardStep === 2 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>MONTHLY PRICE ($)</label>
                                                <input 
                                                    type="number" 
                                                    value={wizardData.monthlyPrice}
                                                    onChange={e => setWizardData({ ...wizardData, monthlyPrice: parseInt(e.target.value) || 0 })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>SETUP ONBOARDING FEE ($)</label>
                                                <input 
                                                    type="number" 
                                                    value={wizardData.setupFee}
                                                    onChange={e => setWizardData({ ...wizardData, setupFee: parseInt(e.target.value) || 0 })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>FREE TRIAL DAYS</label>
                                                <input 
                                                    type="number" 
                                                    value={wizardData.trialDays}
                                                    onChange={e => setWizardData({ ...wizardData, trialDays: parseInt(e.target.value) || 0 })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>CURRENCY CODE</label>
                                                <input 
                                                    type="text" 
                                                    value={wizardData.currency}
                                                    onChange={e => setWizardData({ ...wizardData, currency: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <input 
                                                    type="checkbox"
                                                    id="wizard-popular"
                                                    checked={wizardData.popularBadge}
                                                    onChange={e => setWizardData({ ...wizardData, popularBadge: e.target.checked })}
                                                    style={{ width: "18px", height: "18px" }}
                                                />
                                                <label htmlFor="wizard-popular" style={{ fontSize: "0.8rem", fontWeight: 700 }}>Show Popular Badge</label>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <input 
                                                    type="checkbox"
                                                    id="wizard-featured"
                                                    checked={wizardData.featuredBadge}
                                                    onChange={e => setWizardData({ ...wizardData, featuredBadge: e.target.checked })}
                                                    style={{ width: "18px", height: "18px" }}
                                                />
                                                <label htmlFor="wizard-featured" style={{ fontSize: "0.8rem", fontWeight: 700 }}>Show Featured Badge</label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Workflow */}
                                {wizardStep === 3 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>n8n MASTER WORKFLOW REFERENCE ID</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. 182"
                                                value={wizardData.n8nWorkflowId}
                                                onChange={e => setWizardData({ ...wizardData, n8nWorkflowId: e.target.value })}
                                                style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>OR UPLOAD n8n WORKFLOW JSON</label>
                                            <textarea 
                                                rows={5}
                                                placeholder='{"nodes": [...], "connections": {...}}'
                                                value={wizardData.workflowJson}
                                                onChange={e => setWizardData({ ...wizardData, workflowJson: e.target.value })}
                                                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)", fontFamily: "monospace", resize: "none" }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Integrations */}
                                {wizardStep === 4 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800 }}>Select App Integrations Required</h4>
                                        <p style={{ margin: "2px 0 16px 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>These apps become mandatory connected accounts during end-user activation.</p>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                                            {["Gmail", "Slack", "OpenAI", "Google Drive", "Stripe", "HubSpot", "Notion", "Discord"].map((app) => {
                                                const checked = wizardData.integrations.includes(app);
                                                return (
                                                    <div 
                                                        key={app} 
                                                        onClick={() => {
                                                            const updated = checked 
                                                                ? wizardData.integrations.filter(i => i !== app) 
                                                                : [...wizardData.integrations, app];
                                                            setWizardData({ ...wizardData, integrations: updated });
                                                        }}
                                                        style={{ 
                                                            display: "flex", 
                                                            alignItems: "center", 
                                                            gap: "10px", 
                                                            padding: "12px", 
                                                            background: checked ? "rgba(52, 209, 134, 0.08)" : "var(--muted)", 
                                                            border: checked ? "1px solid #34D186" : "1px solid var(--border)", 
                                                            borderRadius: "8px", 
                                                            cursor: "pointer",
                                                            fontSize: "0.8rem",
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        <input 
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => {}} // Controlled by div click
                                                            style={{ width: "16px", height: "16px" }}
                                                        />
                                                        <span>{app}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: AI Employees */}
                                {wizardStep === 5 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800 }}>Assign AI Subagents Team</h4>
                                        <p style={{ margin: "2px 0 16px 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Add specialized roles from your Vector Memory Hub</p>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                                            {["Marcus Supervisor", "Invoice Reader", "Invoice Drafter", "Payment Chaser", "Lead Intake", "Support Agent"].map((agent) => {
                                                const checked = wizardData.aiEmployees.includes(agent);
                                                return (
                                                    <div 
                                                        key={agent} 
                                                        onClick={() => {
                                                            const updated = checked 
                                                                ? wizardData.aiEmployees.filter(i => i !== agent) 
                                                                : [...wizardData.aiEmployees, agent];
                                                            setWizardData({ ...wizardData, aiEmployees: updated });
                                                        }}
                                                        style={{ 
                                                            display: "flex", 
                                                            alignItems: "center", 
                                                            gap: "10px", 
                                                            padding: "12px", 
                                                            background: checked ? "rgba(59, 130, 246, 0.08)" : "var(--muted)", 
                                                            border: checked ? "1px solid #3B82F6" : "1px solid var(--border)", 
                                                            borderRadius: "8px", 
                                                            cursor: "pointer",
                                                            fontSize: "0.8rem",
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        <input 
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => {}}
                                                            style={{ width: "16px", height: "16px" }}
                                                        />
                                                        <span>{agent}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Step 6: Brain Permissions */}
                                {wizardStep === 6 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <h4 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 800 }}>Company Brain Data Scoping</h4>
                                        <p style={{ margin: "2px 0 16px 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Select documents categories the automation is permitted to access</p>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                                            {["Invoices", "Contracts", "CRM", "Email", "HR Documents", "Financial Reports", "Legal Files"].map((perm) => {
                                                const checked = wizardData.brainPermissions.includes(perm);
                                                return (
                                                    <div 
                                                        key={perm} 
                                                        onClick={() => {
                                                            const updated = checked 
                                                                ? wizardData.brainPermissions.filter(i => i !== perm) 
                                                                : [...wizardData.brainPermissions, perm];
                                                            setWizardData({ ...wizardData, brainPermissions: updated });
                                                        }}
                                                        style={{ 
                                                            display: "flex", 
                                                            alignItems: "center", 
                                                            gap: "10px", 
                                                            padding: "12px", 
                                                            background: checked ? "rgba(139, 92, 246, 0.08)" : "var(--muted)", 
                                                            border: checked ? "1px solid #8B5CF6" : "1px solid var(--border)", 
                                                            borderRadius: "8px", 
                                                            cursor: "pointer",
                                                            fontSize: "0.8rem",
                                                            fontWeight: 700
                                                        }}
                                                    >
                                                        <input 
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => {}}
                                                            style={{ width: "16px", height: "16px" }}
                                                        />
                                                        <span>{perm}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Step 7: Cloud Deployment */}
                                {wizardStep === 7 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "16px" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>DOCKER CONTAINER IMAGE</label>
                                                <input 
                                                    type="text" 
                                                    value={wizardData.dockerImage}
                                                    onChange={e => setWizardData({ ...wizardData, dockerImage: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>DEPLOY REGION</label>
                                                <input 
                                                    type="text" 
                                                    value={wizardData.region}
                                                    onChange={e => setWizardData({ ...wizardData, region: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>CPU ALLOCATION</label>
                                                <input 
                                                    type="text" 
                                                    value={wizardData.cpu}
                                                    onChange={e => setWizardData({ ...wizardData, cpu: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>RAM LIMIT</label>
                                                <input 
                                                    type="text" 
                                                    value={wizardData.ram}
                                                    onChange={e => setWizardData({ ...wizardData, ram: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>DISK SIZE</label>
                                                <input 
                                                    type="text" 
                                                    value={wizardData.disk}
                                                    onChange={e => setWizardData({ ...wizardData, disk: e.target.value })}
                                                    style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 8: Marketplace Listing */}
                                {wizardStep === 8 && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>SEO META DESCRIPTION</label>
                                            <input 
                                                type="text" 
                                                value={wizardData.seoDesc}
                                                onChange={e => setWizardData({ ...wizardData, seoDesc: e.target.value })}
                                                style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>BULLET FEATURES LIST</label>
                                            <textarea 
                                                rows={3}
                                                placeholder="Reconcile Stripe records&#10;Extract PDF attachments"
                                                value={wizardData.features}
                                                onChange={e => setWizardData({ ...wizardData, features: e.target.value })}
                                                style={{ width: "100%", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px", fontSize: "0.8rem", background: "var(--muted)", color: "var(--foreground)", resize: "none" }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)", marginBottom: "4px" }}>RELEASE NOTES</label>
                                            <input 
                                                type="text" 
                                                value={wizardData.releaseNotes}
                                                onChange={e => setWizardData({ ...wizardData, releaseNotes: e.target.value })}
                                                style={{ width: "100%", height: "38px", border: "1px solid var(--border)", borderRadius: "8px", padding: "0 12px", fontSize: "0.82rem", background: "var(--muted)", color: "var(--foreground)" }}
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Wizard Footer Navigation */}
                            <div style={{ padding: "20px 32px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", background: "var(--muted)" }}>
                                <button
                                    onClick={() => setWizardStep(prev => Math.max(1, prev - 1))}
                                    disabled={wizardStep === 1}
                                    style={{ height: "36px", padding: "0 16px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", color: "var(--foreground)", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 800 }}
                                >
                                    <ChevronLeft size={14} />
                                    <span>Back</span>
                                </button>

                                {wizardStep < 8 ? (
                                    <button
                                        onClick={() => setWizardStep(prev => Math.min(8, prev + 1))}
                                        style={{ height: "36px", padding: "0 16px", background: "var(--accent)", color: "#FFFFFF", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 800 }}
                                    >
                                        <span>Next Step</span>
                                        <ChevronRight size={14} />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSaveTemplate()}
                                        disabled={isSaving}
                                        style={{ height: "36px", padding: "0 20px", background: "#34D186", color: "#FFFFFF", border: "none", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", fontWeight: 900 }}
                                    >
                                        <Save size={14} />
                                        <span>{isSaving ? "Saving..." : "Deploy Product"}</span>
                                    </button>
                                )}
                            </div>

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}
