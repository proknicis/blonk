"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    RefreshCcw, 
    ArrowUpRight, 
    Zap, 
    ChevronRight, 
    ShieldCheck, 
    Euro, 
    Clock, 
    Database, 
    Layout, 
    Code, 
    Sparkles, 
    Plus,
    X,
    Cpu,
    Workflow,
    AlertCircle,
    CheckCircle2,
    Lock,
    Globe,
    Activity,
    Shield,
    Key,
    Server,
    Settings,
    Layers,
    FileText,
    MousePointer2,
    Save
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";
import styles from "./builder.module.css";
import adminStyles from "../../admin.module.css";

const STEPS = [
    { id: 1, name: "Protocol Identity", description: "Identity & Core Meta", icon: <Database size={18} /> },
    { id: 2, name: "Marketplace Listing", description: "Pricing & Setup Specs", icon: <Layout size={18} /> },
    { id: 3, name: "Client Requirements", description: "Credentials & API Scope", icon: <Key size={18} /> },
    { id: 4, name: "Operational Logic", description: "n8n Workflow Handshake", icon: <Code size={18} /> },
    { id: 5, name: "Launch Sequence", description: "Final Distribution", icon: <Globe size={18} /> },
];

function BuilderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get('id');
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isImproving, setIsImproving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!templateId);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        category: "General",
        description: "",
        icon: "Zap",
        complexity: "Low",
        savings: "",
        inputs: [] as any[],
        guide: [] as any[],
        webhookUrl: "",
        status: "Draft",
        workflow: "",
        productInfo: {
            valueProp: "",
            targetUser: "SME Owners",
            setupTime: "15 minutes",
            price: "49",
            difficulty: "Medium",
            monetization: "Subscription",
            version: "1.0.0",
            rateLimit: "100 ops/min",
            sla: "99.9%",
            securityLevel: "Institutional"
        }
    });

    useEffect(() => {
        if (templateId) fetchTemplate(templateId);
    }, [templateId]);

    const fetchTemplate = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/templates?id=${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name || "",
                    category: data.sector || "General",
                    description: data.description || "",
                    icon: data.icon || "Zap",
                    complexity: data.complexity || "Low",
                    savings: data.savings || "",
                    inputs: Array.isArray(data.requirements) ? data.requirements : [],
                    guide: Array.isArray(data.setupGuide) ? data.setupGuide : [],
                    webhookUrl: data.webhookUrl || "",
                    status: data.status || "Draft",
                    workflow: data.workflow || "",
                    productInfo: data.productInfo || {
                        valueProp: "",
                        targetUser: "SME Owners",
                        setupTime: "15 minutes",
                        price: "49",
                        difficulty: "Medium",
                        monetization: "Subscription",
                        version: "1.0.0",
                        rateLimit: "100 ops/min",
                        sla: "99.9%",
                        securityLevel: "Institutional"
                    }
                });
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const enhanceDescription = async () => {
        if (!formData.name) return;
        setIsImproving(true);
        await new Promise(r => setTimeout(r, 1800));
        setFormData(prev => ({
            ...prev,
            productInfo: { ...prev.productInfo, valueProp: `The definitive institutional protocol for ${prev.name}.` },
            description: `This autonomous loop streamlines ${prev.name} by orchestrating high-fidelity data streams into actionable outcomes. It eliminates manual overhead, ensures 100% compliance, and accelerates your firm's operational velocity.`
        }));
        setIsImproving(false);
    };

    const handlePublish = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: templateId,
                    ...formData,
                    sector: formData.category,
                    requirements: formData.inputs,
                    setupGuide: formData.guide,
                    featured: true,
                    color: "#F8F9FA"
                })
            });
            if (res.ok) router.push("/admin/marketplace");
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const addInput = () => {
        setFormData({
            ...formData,
            inputs: [...formData.inputs, { id: Date.now().toString(), name: "", type: "text", label: "", placeholder: "", required: true, description: "" }]
        });
    };

    const updateInput = (id: string, updates: any) => {
        setFormData({
            ...formData,
            inputs: formData.inputs.map(input => input.id === id ? { ...input, ...updates } : input)
        });
    };

    const removeInput = (id: string) => {
        setFormData({
            ...formData,
            inputs: formData.inputs.filter(input => input.id !== id)
        });
    };

    if (isLoading) return <div style={{ padding: '80px', textAlign: 'center' }}><RefreshCcw size={40} className={adminStyles.spinning} color="var(--accent)" /></div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* BUILDER HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', border: 'none', padding: '40px 48px', borderRadius: '32px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--background)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Workflow size={32} color="var(--foreground)" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '4px 10px', background: 'var(--accent)', color: 'var(--background)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>ORCHESTRATION STUDIO</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>PROTOCOL BUILDER</span>
                        </div>
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>{templateId ? "Modify Protocol" : "Provision New Protocol"}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Establishing sovereign automation standards for the global marketplace.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button className={adminStyles.primaryBtn} onClick={handlePublish} style={{ background: 'var(--background)', color: 'var(--foreground)', border: 'none', height: '48px', padding: '0 24px' }}>
                        <Save size={18} style={{ marginRight: '8px' }} /> Save Progress
                    </button>
                </div>
            </div>

            <div className={styles.wizard} style={{ gap: '48px', alignItems: 'flex-start' }}>
                {/* VERTICAL STEPS */}
                <aside className={styles.sidebar} style={{ width: '320px', position: 'sticky', top: '32px' }}>
                    <div className={styles.stepList} style={{ background: 'var(--card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        {STEPS.map(step => (
                            <div 
                                key={step.id} 
                                className={`${styles.stepItem} ${currentStep === step.id ? styles.stepItemActive : ''}`}
                                onClick={() => setCurrentStep(step.id)}
                                style={{ padding: '20px', borderRadius: '16px', border: currentStep === step.id ? '1px solid var(--accent)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                            >
                                <div style={{ 
                                    width: '40px', height: '40px', borderRadius: '12px', 
                                    background: currentStep === step.id ? 'var(--accent)' : (currentStep > step.id ? '#10B981' : 'var(--muted)'),
                                    color: currentStep === step.id || currentStep > step.id ? 'var(--background)' : 'var(--muted-foreground)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {currentStep > step.id ? <CheckCircle2 size={20} /> : step.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: currentStep === step.id ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{step.name.toUpperCase()}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 750, opacity: 0.6 }}>{step.description}</div>
                                </div>
                                {currentStep === step.id && <ChevronRight size={16} color="var(--accent)" />}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* STEP CONTENT */}
                <main className={styles.content} style={{ borderRadius: '32px', border: '1px solid var(--border)', background: 'var(--background)', overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.05)', flex: 1 }}>
                    <div className={styles.stepHeader} style={{ padding: '48px', background: 'linear-gradient(180deg, var(--card) 0%, var(--background) 100%)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', letterSpacing: '0.15em' }}>ORCHESTRATION PHASE 0{currentStep}</span>
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>{STEPS[currentStep - 1].name}</h2>
                    </div>

                    <div className={styles.stepBody} style={{ padding: '48px' }}>
                        {/* PHASE 1: PROTOCOL IDENTITY */}
                        {currentStep === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Protocol Name</label>
                                        <input className={styles.input} style={{ height: '56px', borderRadius: '14px' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sovereign Invoice Engine" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Sector Classification</label>
                                        <select className={styles.select} style={{ height: '56px', borderRadius: '14px' }} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option>General</option>
                                            <option>Accounting</option>
                                            <option>Law</option>
                                            <option>Finance</option>
                                            <option>Enterprise</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Operational Description
                                        <button 
                                            className={adminStyles.primaryBtn} 
                                            style={{ height: '32px', fontSize: '0.65rem', padding: '0 12px', borderRadius: '8px', background: 'var(--accent)', color: 'var(--background)' }}
                                            onClick={enhanceDescription}
                                            disabled={isImproving || !formData.name}
                                        >
                                            {isImproving ? "✨ GENERATING..." : "✨ AI ENHANCE"}
                                        </button>
                                    </label>
                                    <textarea className={styles.textarea} style={{ borderRadius: '14px', minHeight: '140px', padding: '20px' }} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe the high-fidelity orchestration logic..." />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Interface Icon</label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {["Zap", "Shield", "Database", "Layers", "Activity"].map(icon => (
                                                <button 
                                                    key={icon}
                                                    onClick={() => setFormData({...formData, icon})}
                                                    style={{ 
                                                        width: '56px', height: '56px', borderRadius: '14px', 
                                                        background: formData.icon === icon ? 'var(--accent)' : 'var(--muted)',
                                                        color: formData.icon === icon ? 'var(--background)' : 'var(--foreground)',
                                                        border: '1px solid var(--border)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                                                    }}
                                                >
                                                    <Zap size={20} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Deployment Version</label>
                                        <input className={styles.input} style={{ height: '56px', borderRadius: '14px' }} value={formData.productInfo.version} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, version: e.target.value}})} placeholder="1.0.0" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PHASE 2: MARKETPLACE LISTING */}
                        {currentStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Access Fee (EUR)</label>
                                        <div style={{ position: 'relative' }}>
                                            <Euro size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input type="number" className={styles.input} style={{ height: '64px', borderRadius: '18px', paddingLeft: '56px', fontSize: '1.25rem', fontWeight: 950 }} value={formData.productInfo.price} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, price: e.target.value}})} />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Deployment Window (Setup Time)</label>
                                        <div style={{ position: 'relative' }}>
                                            <Clock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input className={styles.input} style={{ height: '64px', borderRadius: '18px', paddingLeft: '56px' }} value={formData.productInfo.setupTime} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, setupTime: e.target.value}})} placeholder="e.g. 5 minutes" />
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Institutional Value Proposition</label>
                                    <input className={styles.input} style={{ height: '64px', borderRadius: '18px' }} value={formData.productInfo.valueProp} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, valueProp: e.target.value}})} placeholder="Describe the high-level benefit for the firm..." />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Revenue Model</label>
                                        <select className={styles.select} style={{ height: '64px', borderRadius: '18px' }} value={formData.productInfo.monetization} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, monetization: e.target.value}})}>
                                            <option>Subscription</option>
                                            <option>Per Operation</option>
                                            <option>One-time Licensing</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Target Operator</label>
                                        <select className={styles.select} style={{ height: '64px', borderRadius: '18px' }} value={formData.productInfo.targetUser} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, targetUser: e.target.value}})}>
                                            <option>Institutional Admin</option>
                                            <option>SME Owner</option>
                                            <option>Department Lead</option>
                                            <option>Independent Contractor</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PHASE 3: CLIENT REQUIREMENTS (THE "NEEDED INFO" STEP) */}
                        {currentStep === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div style={{ background: 'var(--muted)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '56px', height: '56px', background: 'var(--accent)', color: 'var(--background)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Key size={24} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950 }}>Credentials & Authentication</h4>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--muted-foreground)', fontWeight: 750 }}>Define what credentials the client must provide to initialize this protocol (API Keys, Login tokens, etc.).</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {formData.inputs.map((input, idx) => (
                                        <div key={input.id} style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ padding: '6px 12px', background: 'var(--foreground)', color: 'var(--background)', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 950 }}>REQUIREMENT #{idx + 1}</span>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 950, color: 'var(--accent)' }}>{input.type.toUpperCase()} FIELD</span>
                                                </div>
                                                <button onClick={() => removeInput(input.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#EF4444', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                    <X size={18} />
                                                </button>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Internal Identifier (Variable Name)</label>
                                                    <input className={styles.input} style={{ height: '52px', borderRadius: '12px', fontFamily: 'monospace' }} value={input.name} onChange={e => updateInput(input.id, { name: e.target.value })} placeholder="e.g. STRIPE_API_KEY" />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Field Type</label>
                                                    <select className={styles.select} style={{ height: '52px', borderRadius: '12px' }} value={input.type} onChange={e => updateInput(input.id, { type: e.target.value })}>
                                                        <option value="text">Standard Text</option>
                                                        <option value="password">Secure Credential / API Key</option>
                                                        <option value="url">Endpoint URL</option>
                                                        <option value="file">File Upload</option>
                                                        <option value="google_sheets">Google Sheets Token</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Public Label (Visible to User)</label>
                                                    <input className={styles.input} style={{ height: '52px', borderRadius: '12px' }} value={input.label} onChange={e => updateInput(input.id, { label: e.target.value })} placeholder="e.g. Your Stripe Secret Key" />
                                                </div>
                                                <div className={styles.formGroup}>
                                                    <label className={styles.label}>Placeholder / Help Text</label>
                                                    <input className={styles.input} style={{ height: '52px', borderRadius: '12px' }} value={input.placeholder} onChange={e => updateInput(input.id, { placeholder: e.target.value })} placeholder="e.g. sk_live_..." />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button 
                                        className={styles.btnAdd} 
                                        onClick={addInput}
                                        style={{ height: '80px', borderRadius: '24px', border: '2px dashed var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', fontSize: '1rem', fontWeight: 950, color: 'var(--muted-foreground)', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <Plus size={24} /> ADD NEW REQUIREMENT
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PHASE 4: OPERATIONAL LOGIC */}
                        {currentStep === 4 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '40px', borderRadius: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Code size={24} color="var(--accent)" />
                                        </div>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, color: 'white' }}>n8n Workflow Handshake</h4>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 750 }}>Paste the definitive JSON orchestration logic for this protocol.</p>
                                        </div>
                                    </div>
                                    <textarea 
                                        className={styles.textarea} 
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.85rem', minHeight: '320px', padding: '32px', borderRadius: '20px' }}
                                        value={formData.workflow}
                                        onChange={e => setFormData({...formData, workflow: e.target.value})}
                                        placeholder='{"nodes": [...]}'
                                    />
                                    <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <AlertCircle size={18} color="var(--accent)" />
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 750 }}>This JSON definition orchestrates the administrative preview and deployment logic across sovereign node clusters.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PHASE 5: LAUNCH SEQUENCE */}
                        {currentStep === 5 && (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ width: '120px', height: '120px', background: '#10B98115', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px' }}>
                                    <ShieldCheck size={64} />
                                </div>
                                <h3 style={{ fontSize: '2.5rem', fontWeight: 950, marginBottom: '16px', letterSpacing: '-0.04em' }}>Protocol Ready for Deployment</h3>
                                <p style={{ color: 'var(--muted-foreground)', maxWidth: '540px', margin: '0 auto 48px', fontWeight: 750, lineHeight: 1.6, fontSize: '1.1rem' }}>This institutional protocol is finalized. Publishing will immediately propagate the definition to the global marketplace registry for all SMEs.</p>
                                
                                <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'Draft'})}
                                        style={{ padding: '32px 48px', borderRadius: '24px', border: formData.status === 'Draft' ? '2px solid var(--accent)' : '1px solid var(--border)', background: formData.status === 'Draft' ? 'var(--accent-muted)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '4px' }}>SAVE AS</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 950 }}>DRAFT STATE</div>
                                    </button>
                                    <button 
                                        onClick={() => setFormData({...formData, status: 'Published'})}
                                        style={{ padding: '32px 48px', borderRadius: '24px', border: formData.status === 'Published' ? '2px solid #10B981' : '1px solid var(--border)', background: formData.status === 'Published' ? '#10B98110' : 'transparent', cursor: 'pointer', transition: 'all 0.2s' }}
                                    >
                                        <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#10B981', marginBottom: '4px' }}>PROMOTE TO</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 950 }}>LIVE REGISTRY</div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.stepFooter} style={{ padding: '40px 48px', background: 'var(--muted)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <button className={adminStyles.actionIconBtn} style={{ width: 'auto', padding: '0 32px', height: '56px', borderRadius: '16px' }} onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1}>PREVIOUS PHASE</button>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            {currentStep < 5 ? (
                                <button className={adminStyles.primaryBtn} style={{ height: '56px', padding: '0 40px', borderRadius: '16px' }} onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}>CONTINUE TO NEXT PHASE <ChevronRight size={18} style={{ marginLeft: '8px' }} /></button>
                            ) : (
                                <button className={adminStyles.primaryBtn} style={{ height: '56px', padding: '0 48px', borderRadius: '16px', background: '#10B981', color: 'white' }} onClick={handlePublish} disabled={isSaving}>
                                    {isSaving ? "DEPLOYING..." : "FINALIZE DISTRIBUTION ✓"}
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function BuilderPage() {
    return (
        <Suspense fallback={<div style={{ padding: '80px', textAlign: 'center' }}><RefreshCcw size={40} className={adminStyles.spinning} color="var(--accent)" /></div>}>
            <BuilderContent />
        </Suspense>
    );
}
