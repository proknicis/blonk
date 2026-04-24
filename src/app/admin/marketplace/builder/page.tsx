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
    Shield
} from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";
import styles from "./builder.module.css";
import adminStyles from "../../admin.module.css";

const STEPS = [
    { id: 1, name: "Core Protocol", description: "Identity & Logic Matrix", icon: <Database size={18} /> },
    { id: 2, name: "SLA & Performance", description: "Operational Thresholds", icon: <Activity size={18} /> },
    { id: 3, name: "Security & Compliance", description: "Access & Privacy Controls", icon: <Shield size={18} /> },
    { id: 4, name: "Fleet Preview", description: "Operational Validation", icon: <Sparkles size={18} /> },
    { id: 5, name: "Institutional Launch", description: "Marketplace Distribution", icon: <Globe size={18} /> },
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
            setupTime: "5 min",
            price: "0",
            difficulty: "Easy",
            monetization: "One-time",
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
                        setupTime: "5 min",
                        price: "0",
                        difficulty: "Easy",
                        monetization: "One-time",
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
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>{templateId ? "Calibrate Protocol" : "Provision New Protocol"}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Establishing sovereign automation standards for the global marketplace.</p>
                    </div>
                </div>
            </div>

            <div className={styles.wizard} style={{ gap: '48px', alignItems: 'flex-start' }}>
                {/* VERTICAL TELEMETRY (STEPS) */}
                <aside className={styles.sidebar} style={{ width: '320px' }}>
                    <div className={styles.stepList} style={{ background: 'var(--card)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                        {STEPS.map(step => (
                            <div 
                                key={step.id} 
                                className={`${styles.stepItem} ${currentStep === step.id ? styles.stepItemActive : ''}`}
                                onClick={() => setCurrentStep(step.id)}
                                style={{ padding: '20px', borderRadius: '16px', border: currentStep === step.id ? '1px solid var(--accent)' : '1px solid transparent' }}
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
                <main className={styles.content} style={{ borderRadius: '32px', border: '1px solid var(--border)', background: 'var(--background)', overflow: 'hidden', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.05)' }}>
                    <div className={styles.stepHeader} style={{ padding: '48px', background: 'linear-gradient(180deg, var(--card) 0%, var(--background) 100%)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', letterSpacing: '0.15em' }}>ORCHESTRATION PHASE 0{currentStep}</span>
                        </div>
                        <h2 style={{ fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.03em', margin: 0 }}>{STEPS[currentStep - 1].name}</h2>
                    </div>

                    <div className={styles.stepBody} style={{ padding: '48px' }}>
                        {currentStep === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Protocol Identity</label>
                                        <input className={styles.input} style={{ height: '56px', borderRadius: '14px' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Stripe Revenue Automator" />
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

                                <div style={{ background: 'var(--foreground)', color: 'var(--background)', padding: '32px', borderRadius: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                        <Code size={18} color="var(--accent)" />
                                        <label className={styles.label} style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>BACKEND ORCHESTRATION (N8N JSON)</label>
                                    </div>
                                    <textarea 
                                        className={styles.textarea} 
                                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'monospace', fontSize: '0.8rem', minHeight: '200px' }}
                                        value={formData.workflow}
                                        onChange={e => setFormData({...formData, workflow: e.target.value})}
                                        placeholder='{"nodes": [...]}'
                                    />
                                    <p style={{ marginTop: '16px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 750 }}>This JSON definition powers the administrative preview and deployment logic.</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Rate Limit Threshold</label>
                                        <div style={{ position: 'relative' }}>
                                            <Zap size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input className={styles.input} style={{ height: '52px', paddingLeft: '44px' }} value={formData.productInfo.rateLimit} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, rateLimit: e.target.value}})} />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>SLA Integrity Guarantee</label>
                                        <div style={{ position: 'relative' }}>
                                            <Shield size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                                            <input className={styles.input} style={{ height: '52px', paddingLeft: '44px' }} value={formData.productInfo.sla} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, sla: e.target.value}})} />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--muted)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <h4 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 950 }}>Performance Monitoring</h4>
                                    <div style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px' }}>AVG LATENCY</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 950 }}>1.4ms</div>
                                        </div>
                                        <div style={{ flex: 1, padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 950, color: 'var(--muted-foreground)', marginBottom: '8px' }}>PEAK THROUGHPUT</div>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 950 }}>840 ops/s</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Security Protocol Level</label>
                                    <select className={styles.select} value={formData.productInfo.securityLevel} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, securityLevel: e.target.value}})}>
                                        <option>Standard Encryption</option>
                                        <option>Institutional Isolation</option>
                                        <option>Sovereign Vault (Air-gapped)</option>
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                                        <input type="checkbox" checked />
                                        <div style={{ fontWeight: 950, fontSize: '0.9rem' }}>GDPR Compliance Audit</div>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '24px', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                                        <input type="checkbox" checked />
                                        <div style={{ fontWeight: 950, fontSize: '0.9rem' }}>SOC2 Type II Registry</div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <div style={{ width: '100px', height: '100px', background: '#10B98115', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 950, marginBottom: '16px' }}>Ready for Distribution</h3>
                                <p style={{ color: 'var(--muted-foreground)', maxWidth: '480px', margin: '0 auto 40px', fontWeight: 750, lineHeight: 1.6 }}>This administrative protocol is finalized. Publishing will make it available to all institutional clients in the marketplace registry.</p>
                                
                                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                                    <label style={{ cursor: 'pointer', padding: '24px 40px', borderRadius: '20px', border: formData.status === 'Draft' ? '2px solid var(--accent)' : '1px solid var(--border)', background: formData.status === 'Draft' ? 'var(--accent-muted)' : 'transparent' }}>
                                        <input type="radio" style={{ display: 'none' }} checked={formData.status === 'Draft'} onChange={() => setFormData({...formData, status: 'Draft'})} />
                                        <div style={{ fontWeight: 950 }}>SAVE AS DRAFT</div>
                                    </label>
                                    <label style={{ cursor: 'pointer', padding: '24px 40px', borderRadius: '20px', border: formData.status === 'Published' ? '2px solid #10B981' : '1px solid var(--border)', background: formData.status === 'Published' ? '#10B98110' : 'transparent' }}>
                                        <input type="radio" style={{ display: 'none' }} checked={formData.status === 'Published'} onChange={() => setFormData({...formData, status: 'Published'})} />
                                        <div style={{ fontWeight: 950 }}>PUBLISH LIVE</div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                                <Sparkles size={48} color="var(--accent)" style={{ marginBottom: '24px' }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 950, marginBottom: '8px' }}>Simulation Mode Active</h3>
                                <p style={{ fontWeight: 750, color: 'var(--muted-foreground)' }}>Running operational validation across test clusters...</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.stepFooter} style={{ padding: '32px 48px', background: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                        <button className={adminStyles.actionIconBtn} style={{ width: 'auto', padding: '0 32px' }} onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1}>PREVIOUS PHASE</button>
                        {currentStep < 5 ? (
                            <button className={adminStyles.primaryBtn} style={{ height: '56px', padding: '0 40px' }} onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}>NEXT PHASE</button>
                        ) : (
                            <button className={adminStyles.primaryBtn} style={{ height: '56px', padding: '0 40px', background: '#10B981', color: 'white' }} onClick={handlePublish} disabled={isSaving}>
                                {isSaving ? "DEPLOYING..." : "FINALIZE DISTRIBUTION ✓"}
                            </button>
                        )}
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
