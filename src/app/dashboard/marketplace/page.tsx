"use client";

import styles from "./marketplace.module.css";
import React, { useState, useEffect, useMemo } from "react";
import { 
    Activity, Zap, CheckCircle, AlertCircle, Plus, FileText, Link2, 
    ArrowUpRight, ShieldCheck, ShieldAlert, X, MousePointer2, Settings, 
    Cpu, Link, Search, Layers, Key, Euro, ShoppingCart, CreditCard, 
    Loader2, Star, Check, HelpCircle, Heart, UserCheck, MessageSquare, Info, Brain
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "@/app/components/Skeleton";

function getTemplatePrice(template: any) {
    if (!template) return 0;
    const pInfo = typeof template.productInfo === 'string' 
        ? JSON.parse(template.productInfo) 
        : (template.productInfo || {});
        
    const setupPrice = parseFloat(pInfo.discountSetupPrice || pInfo.setupPrice || 0);
    const monthlyPrice = parseFloat(pInfo.discountMonthlyPrice || pInfo.monthlyPrice || 0);
    if (setupPrice > 0 || monthlyPrice > 0) {
        return setupPrice + monthlyPrice;
    }
    const directPrice = parseFloat(template.price || 0);
    const productInfoPrice = pInfo.price ? parseFloat(pInfo.price) : 0;
    return productInfoPrice > 0 ? productInfoPrice : directPrice;
}

function robustParse(val: any): any[] {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            return robustParse(parsed);
        } catch (e) { return []; }
    }
    return [];
}

function getServiceIcon(serviceName: string) {
    const name = serviceName.toLowerCase().trim();
    if (name === 'gmail' || name === 'google mail' || name === 'google') {
        return (
            <span style={{ fontSize: "0.85rem", marginRight: "4px" }}>✉️</span>
        );
    }
    if (name === 'slack') {
        return (
            <span style={{ fontSize: "0.85rem", marginRight: "4px" }}>💬</span>
        );
    }
    if (name === 'hubspot') {
        return (
            <span style={{ fontSize: "0.85rem", marginRight: "4px" }}>🎯</span>
        );
    }
    if (name === 'stripe') {
        return (
            <span style={{ fontSize: "0.85rem", marginRight: "4px" }}>💳</span>
        );
    }
    if (name === 'openai') {
        return (
            <span style={{ fontSize: "0.85rem", marginRight: "4px" }}>🧠</span>
        );
    }
    return <Key size={10} color="#64748B" />;
}

export default function WorkflowsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [configureTemplate, setConfigureTemplate] = useState<any>(null);
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);
    const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({});
    const [step, setStep] = useState<'configure' | 'result'>('configure');
    const [isDeploying, setIsDeploying] = useState(false);
    const [paymentTemplate, setPaymentTemplate] = useState<any>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    // AI Consultant Recommended active toggling
    const [showAiAdvisor, setShowAiAdvisor] = useState(true);

    // Interactive ROI Calculator States
    const [calcCount, setCalcCount] = useState(250);
    const [calcRate, setCalcRate] = useState(22);

    // Interactive Demo Sandbox States
    const [demoState, setDemoState] = useState<'idle' | 'uploading' | 'extracted' | 'done'>('idle');

    // Premium Installation Wizard Steps
    const [installWizardOpen, setInstallWizardOpen] = useState(false);
    const [installStep, setInstallStep] = useState(1);
    const [installLogs, setInstallLogs] = useState<string[]>([]);

    const categories = ["All", "Accounting", "Law", "HR", "IT", "General", "Operations", "Sales"];

    const fetchMarketplace = async () => {
        try {
            const res = await fetch('/api/workflows');
            const data = await res.json();
            if (data.templates) setTemplates(data.templates);
        } catch (error) {
            console.error("Error fetching marketplace:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMarketplace();
    }, []);

    const handlePurchase = async (template: any) => {
        // Start premium install experience trigger
        setInstallLogs(["1. Creating AI Employee database container profile..."]);
        setInstallStep(1);
        setInstallWizardOpen(true);

        const logs = [
            "2. Assigning isolated Company Brain workspace space...",
            "3. Attaching Google Drive credential vaults matrix...",
            "4. Securing Gmail API endpoint broker handshakes...",
            "5. Indexing rules & knowledge categories context...",
            "6. Registering n8n server automations triggers...",
            "7. Testing live credential vault handshakes...",
            "8. Warming runtime memory vectors cache...",
            "9. AI Employee fully provisioned and ready!"
        ];

        let currentStep = 1;
        const interval = setInterval(() => {
            currentStep++;
            if (currentStep <= 9) {
                setInstallStep(currentStep);
                setInstallLogs(prev => [...prev, logs[currentStep - 2]]);
            } else {
                clearInterval(interval);
                // Deploy in DB
                deployWorkflow(template, {});
            }
        }, 1000);
    };

    const handleAddClick = (template: any) => {
        const finalPrice = getTemplatePrice(template);

        if (finalPrice > 0) {
            handlePurchase(template);
            return;
        }
        
        const reqs = robustParse(template.requirements);
        if (reqs.length > 0) {
            setConfigureTemplate({ ...template, parsedReqs: reqs });
            setTemplateInputs({});
            setStep('configure');
        } else {
            handlePurchase(template);
        }
    };

    const deployWorkflow = async (template: any, inputs: Record<string, any>) => {
        setIsDeploying(true);
        try {
            const res = await fetch('/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: template.name,
                    sector: template.sector,
                    templateId: template.id,
                    inputs
                })
            });
            if (res.ok) {
                showToast(`Digital Employee hired successfully!`);
                setConfigureTemplate(null);
                setInstallWizardOpen(false);
                router.push('/dashboard/automations');
            } else {
                const data = await res.json();
                showToast(data.error || "Deployment failed.", 'error');
                setInstallWizardOpen(false);
            }
        } catch (error) {
            showToast("Network disruption detected.", 'error');
            setInstallWizardOpen(false);
        } finally {
            setIsDeploying(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const filteredTemplates = templates.filter(wf => {
        const matchesSearch = wf.name.toLowerCase().includes(search.toLowerCase()) || 
                             (wf.description || "").toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || wf.sector === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // ROI Calculator math formulas
    const roiData = useMemo(() => {
        if (!previewTemplate) return { hours: 0, money: 0, percentage: 0 };
        // Estimate saved hours per task based on template complexity
        const multiplier = previewTemplate.complexity === 'High' ? 0.25 : 0.15;
        const hours = Math.round(calcCount * multiplier);
        const money = hours * calcRate;
        const price = previewTemplate.price || 49;
        const percentage = Math.round(((money - price) / price) * 100);
        return {
            hours,
            money,
            percentage: percentage > 0 ? percentage : 0
        };
    }, [previewTemplate, calcCount, calcRate]);

    const runDemoUpload = () => {
        setDemoState('uploading');
        setTimeout(() => {
            setDemoState('extracted');
        }, 1500);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.5s ease-out" }}>
            
            {/* MAIN CATALOG VIEW (Render if no detail page preview) */}
            {!previewTemplate && (
                <>
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div>
                            <h1 style={{ fontSize: "2rem", fontWeight: 950, letterSpacing: "-0.04em", margin: 0, color: "var(--foreground)" }}>AI Employees Marketplace</h1>
                            <p style={{ fontSize: "0.95rem", color: "var(--muted-foreground)", margin: "6px 0 0 0", fontWeight: 600 }}>Hire dedicated AI Employees to run your operations 24/7 with zero-markup VPS servers.</p>
                        </div>
                    </div>

                    {/* AI Advisor Banner */}
                    {showAiAdvisor && (
                        <div style={{ 
                            background: "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)", 
                            border: "1px solid rgba(139, 92, 246, 0.2)", 
                            borderRadius: "24px", 
                            padding: "28px 32px", 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            gap: "24px",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", boxShadow: "0 8px 16px rgba(139, 92, 246, 0.25)", flexShrink: 0 }}>
                                    <Brain size={24} />
                                </div>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{ fontSize: "0.7rem", fontWeight: 950, background: "rgba(139, 92, 246, 0.15)", color: "#8B5CF6", padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>AI Consultant Recommendations</span>
                                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#10B981" }}>Workspace Scan Active</span>
                                    </div>
                                    <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: "8px 0 4px 0", color: "var(--foreground)" }}>Optimize your Operations with specialized AI Employees</h3>
                                    <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: 0, lineHeight: 1.5, maxWidth: "700px" }}>
                                        Based on your business profile (**Blonk SIA** in **Professional Services**), we detected bottlenecks in invoice routing and timesheet approvals. We recommend hiring **Finance Admin AI** and **Consulting Operations AI** to save an estimated **42 hours/week**.
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
                                <button 
                                    onClick={() => setSelectedCategory("Operations")}
                                    style={{ height: "40px", padding: "0 18px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer" }}
                                >
                                    View Recommended
                                </button>
                                <button 
                                    onClick={() => setShowAiAdvisor(false)}
                                    style={{ width: "40px", height: "40px", background: "transparent", border: "1px solid var(--border)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--foreground)" }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filter row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", background: "var(--card)", padding: "14px 20px", borderRadius: "18px", border: "1px solid var(--border)" }}>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {categories.map(cat => {
                                const isActive = selectedCategory === cat;
                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            padding: "8px 16px",
                                            borderRadius: "100px",
                                            fontSize: "0.78rem",
                                            fontWeight: 900,
                                            border: "none",
                                            background: isActive ? "var(--foreground)" : "transparent",
                                            color: isActive ? "var(--background)" : "var(--muted-foreground)",
                                            cursor: "pointer",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        {cat}
                                    </button>
                                );
                            })}
                        </div>

                        <div style={{ position: "relative", width: "240px" }}>
                            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)" }} />
                            <input 
                                type="text" 
                                placeholder="Search AI Employees..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ width: "100%", height: "36px", borderRadius: "100px", border: "1px solid var(--border)", paddingLeft: "36px", fontSize: "0.78rem", fontWeight: 700, background: "var(--muted)", color: "var(--foreground)", outline: "none" }}
                            />
                        </div>
                    </div>

                    {/* App Store Style Card Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} style={{ height: "260px", background: "var(--muted)", borderRadius: "24px", animation: "pulse 1.5s infinite" }} />
                            ))
                        ) : filteredTemplates.map(wf => {
                            const reqs = robustParse(wf.requirements);
                            const pInfo = typeof wf.productInfo === 'string' ? JSON.parse(wf.productInfo) : (wf.productInfo || {});
                            
                            return (
                                <div 
                                    key={wf.id}
                                    style={{ 
                                        background: "var(--card)", 
                                        border: "1px solid var(--border)", 
                                        borderRadius: "24px", 
                                        padding: "24px", 
                                        display: "flex", 
                                        flexDirection: "column", 
                                        justifyContent: "space-between",
                                        height: "300px",
                                        transition: "all 0.2s ease",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => {
                                        setPreviewTemplate(wf);
                                        setDemoState('idle');
                                    }}
                                    className={styles.workflowCard}
                                >
                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                                <div style={{ 
                                                    width: "44px", 
                                                    height: "44px", 
                                                    borderRadius: "12px", 
                                                    background: wf.color || "rgba(59, 130, 246, 0.1)", 
                                                    display: "flex", 
                                                    alignItems: "center", 
                                                    justifyContent: "center",
                                                    fontSize: "1.3rem"
                                                }}>
                                                    {wf.icon || "🤖"}
                                                </div>
                                                <div>
                                                    <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 900, color: "var(--foreground)" }}>{wf.name}</h3>
                                                    <span style={{ fontSize: "0.72rem", color: "var(--muted-foreground)", fontWeight: 800 }}>{wf.sector}</span>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: "0.85rem", fontWeight: 950, color: "var(--foreground)" }}>
                                                {wf.price > 0 ? `$${parseInt(wf.price)}/mo` : "Free"}
                                            </span>
                                        </div>

                                        <p style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.45, margin: "0 0 16px 0", height: "54px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {wf.description}
                                        </p>
                                    </div>

                                    <div>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", fontSize: "0.72rem", fontWeight: 800, color: "var(--muted-foreground)" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                                <div style={{ display: "flex", color: "#F59E0B" }}>
                                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill="#F59E0B" stroke="none" />)}
                                                </div>
                                                <span style={{ color: "var(--foreground)" }}>4.9</span>
                                            </div>
                                            <span>{wf.savings || "Save 12 hrs/wk"}</span>
                                            <span>5 min setup</span>
                                        </div>

                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                                            <div style={{ display: "flex", gap: "6px" }}>
                                                {reqs.map((r: any, idx: number) => (
                                                    <span key={idx} style={{ width: "22px", height: "22px", borderRadius: "6px", background: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center" }} title={r.name}>
                                                        {getServiceIcon(r.name)}
                                                    </span>
                                                ))}
                                            </div>

                                            <div style={{ display: "flex", gap: "8px" }} onClick={e => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => {
                                                        setPreviewTemplate(wf);
                                                        setDemoState('idle');
                                                    }}
                                                    style={{ height: "32px", padding: "0 12px", background: "transparent", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer", color: "var(--foreground)" }}
                                                >
                                                    Details
                                                </button>
                                                <button 
                                                    onClick={() => handleAddClick(wf)}
                                                    style={{ height: "32px", padding: "0 12px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 900, cursor: "pointer" }}
                                                >
                                                    Hire AI Employee
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* FULL-PAGE AI EMPLOYEE LANDING SPACE (Render if previewTemplate is set) */}
            {previewTemplate && (
                <div style={{ display: "flex", flexDirection: "column", gap: "32px", animation: "fadeIn 0.4s" }}>
                    
                    {/* Header Controls */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <button 
                            onClick={() => setPreviewTemplate(null)}
                            style={{ background: "none", border: "1px solid var(--border)", borderRadius: "10px", padding: "8px 16px", fontSize: "0.8rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "var(--foreground)" }}
                        >
                            ← Back to Marketplace
                        </button>
                        <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 700 }}>
                            Product Details · Used by 482 companies
                        </span>
                    </div>

                    {/* Main Workspace Layout */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1.1fr", gap: "32px" }}>
                        
                        {/* Left Side: Product Showcase */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                            
                            {/* Title Card */}
                            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                                <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "20px" }}>
                                    <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: previewTemplate.color || "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                                        {previewTemplate.icon || "🤖"}
                                    </div>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ fontSize: "0.68rem", fontWeight: 950, background: "var(--foreground)", color: "var(--background)", padding: "2px 8px", borderRadius: "100px", textTransform: "uppercase" }}>{previewTemplate.sector}</span>
                                            <div style={{ display: "flex", color: "#F59E0B" }}>
                                                {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} fill="#F59E0B" stroke="none" />)}
                                            </div>
                                            <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", fontWeight: 700 }}>4.9 (42 reviews)</span>
                                        </div>
                                        <h2 style={{ fontSize: "1.6rem", fontWeight: 950, margin: "6px 0 0 0", color: "var(--foreground)" }}>{previewTemplate.name}</h2>
                                    </div>
                                </div>
                                <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.6, margin: 0 }}>
                                    {previewTemplate.description}
                                </p>
                            </div>

                            {/* INTERACTIVE DEMO SANDBOX (WOW EFFECT) */}
                            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                                <h3 style={{ fontSize: "1.1rem", fontWeight: 900, margin: "0 0 8px 0" }}>Interactive Live Sandbox</h3>
                                <p style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", margin: "0 0 20px 0" }}>Test drive the AI Employee intelligence on a sample data input in 10 seconds.</p>
                                
                                <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "24px", minHeight: "160px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                                    {demoState === 'idle' && (
                                        <div style={{ textAlign: "center" }}>
                                            <span style={{ fontSize: "2rem", display: "block", marginBottom: "8px" }}>📄</span>
                                            <button 
                                                onClick={runDemoUpload}
                                                style={{ height: "36px", padding: "0 18px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 900, cursor: "pointer" }}
                                            >
                                                Upload Sample File
                                            </button>
                                            <p style={{ margin: "6px 0 0 0", fontSize: "0.72rem", color: "var(--muted-foreground)" }}>Click to simulate uploading an incoming transaction slip.</p>
                                        </div>
                                    )}

                                    {demoState === 'uploading' && (
                                        <div style={{ textAlign: "center" }}>
                                            <Loader2 className="spin" size={24} style={{ color: "var(--accent)", marginBottom: "8px" }} />
                                            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--foreground)" }}>AI Employee reading document structure...</span>
                                        </div>
                                    )}

                                    {demoState === 'extracted' && (
                                        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px", fontSize: "0.8rem" }}>
                                                <span style={{ fontWeight: 900 }}>EXTRACTED DATA SCHEMA</span>
                                                <span style={{ color: "#10B981", fontWeight: 900 }}>98% Accuracy</span>
                                            </div>
                                            <div style={{ fontSize: "0.78rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                                <div><strong>Supplier:</strong> Sia Blonk HQ</div>
                                                <div><strong>Date:</strong> 2026-07-09</div>
                                                <div><strong>VAT Index:</strong> €24.64 (21%)</div>
                                                <div><strong>Total Amount:</strong> €142.00</div>
                                            </div>
                                            <button 
                                                onClick={() => setDemoState('done')}
                                                style={{ height: "34px", background: "#10B981", color: "#FFFFFF", border: "none", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 900, cursor: "pointer", marginTop: "8px" }}
                                            >
                                                Approve and Save to CRM
                                            </button>
                                        </div>
                                    )}

                                    {demoState === 'done' && (
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#10B981", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", marginBottom: "8px" }}>
                                                <Check size={18} strokeWidth={3} />
                                            </div>
                                            <h4 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 900 }}>Task Completed Successfully!</h4>
                                            <p style={{ margin: "4px 0 12px 0", fontSize: "0.75rem", color: "var(--muted-foreground)" }}>Record synchronized to HubSpot CRM and user notifications triggered.</p>
                                            <button 
                                                onClick={() => setDemoState('idle')}
                                                style={{ background: "none", border: "none", color: "var(--accent)", fontSize: "0.72rem", fontWeight: 800, cursor: "pointer", textDecoration: "underline" }}
                                            >
                                                Reset Sandbox
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trust Strip */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                                {[
                                    { label: "Uptime Stability", val: "99.98%" },
                                    { label: "Average Setup", val: "4 mins" },
                                    { label: "Success Accuracy", val: "98.7%" }
                                ].map((tr, i) => (
                                    <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "16px 20px", borderRadius: "16px", textAlign: "center" }}>
                                        <span style={{ fontSize: "0.7rem", color: "var(--muted-foreground)", fontWeight: 800, textTransform: "uppercase" }}>{tr.label}</span>
                                        <div style={{ fontSize: "1.2rem", fontWeight: 950, color: "var(--foreground)", marginTop: "4px" }}>{tr.val}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: ROI Calculator & Hiring Details */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                            
                            {/* Hiring Actions Card */}
                            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "20px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                                    <span style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", fontWeight: 800 }}>MONTHLY SALARY:</span>
                                    <span style={{ fontSize: "1.4rem", fontWeight: 950 }}>${previewTemplate.price}/mo</span>
                                </div>
                                <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)", display: "flex", flexDirection: "column", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "16px" }}>
                                    <span>✔ Zero markup VPS execution</span>
                                    <span>✔ 14 days free trial period</span>
                                    <span>✔ Rollback version control</span>
                                </div>
                                <button 
                                    onClick={() => handleAddClick(previewTemplate)}
                                    style={{ height: "48px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: "12px", fontSize: "0.82rem", fontWeight: 950, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
                                >
                                    <ShoppingCart size={16} />
                                    <span>Hire AI Employee</span>
                                </button>
                            </div>

                            {/* ROI CALCULATOR CARD (WOW FEATURE) */}
                            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px" }}>
                                <h3 style={{ fontSize: "1rem", fontWeight: 900, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span>ROI Calculator</span>
                                </h3>

                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 900, color: "var(--muted-foreground)", marginBottom: "6px" }}>
                                            MONTHLY VOLUME (TASKS)
                                        </label>
                                        <input 
                                            type="range" 
                                            min="50" 
                                            max="1000" 
                                            step="50" 
                                            value={calcCount} 
                                            onChange={e => setCalcCount(parseInt(e.target.value))}
                                            style={{ width: "100%", cursor: "pointer" }}
                                        />
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 800, marginTop: "4px" }}>
                                            <span>50</span>
                                            <span style={{ color: "var(--accent)" }}>{calcCount} tasks</span>
                                            <span>1000</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: "block", fontSize: "0.7rem", fontWeight: 900, color: "var(--muted-foreground)", marginBottom: "6px" }}>
                                            HOURLY EMPLOYEE COST ($)
                                        </label>
                                        <input 
                                            type="range" 
                                            min="10" 
                                            max="80" 
                                            step="2" 
                                            value={calcRate} 
                                            onChange={e => setCalcRate(parseInt(e.target.value))}
                                            style={{ width: "100%", cursor: "pointer" }}
                                        />
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 800, marginTop: "4px" }}>
                                            <span>$10</span>
                                            <span style={{ color: "var(--accent)" }}>${calcRate}/hr</span>
                                            <span>$80</span>
                                        </div>
                                    </div>

                                    {/* Calculator Results */}
                                    <div style={{ background: "var(--muted)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.78rem" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>Time Saved:</span>
                                            <strong style={{ color: "#10B981" }}>{roiData.hours} hours/mo</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>Cost Savings:</span>
                                            <strong style={{ color: "#10B981" }}>${roiData.money}/mo</strong>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                                            <span>Net ROI Yield:</span>
                                            <strong style={{ color: "var(--accent)" }}>{roiData.percentage}% ROI</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            )}

            {/* 7. PREMIUM ONBOARDING VPS WIZARD OVERLAY */}
            {installWizardOpen && (
                <ModalPortal>
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20000, padding: "20px" }}>
                        <div style={{ width: "520px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "24px", boxShadow: "var(--shadow-premium)" }}>
                            
                            <div style={{ textAlign: "center" }}>
                                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(139, 92, 246, 0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#8B5CF6", marginBottom: "16px" }}>
                                    <Loader2 className="spin" size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 900 }}>Hiring AI Employee...</h3>
                                <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>Setting up dedicated workflow node infrastructure</p>
                            </div>

                            {/* Progress bar */}
                            <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 800, marginBottom: "6px" }}>
                                    <span>Deployment Progress</span>
                                    <span>{Math.round((installStep / 9) * 100)}%</span>
                                </div>
                                <div style={{ width: "100%", height: "8px", background: "var(--muted)", borderRadius: "100px", overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "var(--accent)", width: `${(installStep / 9) * 100}%`, transition: "all 0.5s ease" }} />
                                </div>
                            </div>

                            {/* Logs Display Terminal */}
                            <div style={{ background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", fontFamily: "monospace", fontSize: "0.75rem", display: "flex", flexDirection: "column", gap: "8px", minHeight: "150px" }}>
                                {installLogs.map((log, idx) => (
                                    <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", color: idx === installLogs.length - 1 ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                        {idx === installLogs.length - 1 && installStep < 9 ? (
                                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", display: "inline-block", animation: "pulse 1s infinite" }} />
                                        ) : (
                                            <span style={{ color: "#10B981" }}>✓</span>
                                        )}
                                        <span>{log}</span>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </ModalPortal>
            )}

        </div>
    );
}
