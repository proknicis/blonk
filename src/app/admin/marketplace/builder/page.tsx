"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./builder.module.css";

const STEPS = [
    { id: 1, name: "Basic Info", description: "Name and layout" },
    { id: 2, name: "User Inputs", description: "Required fields" },
    { id: 3, name: "Setup Guide", description: "Instructions" },
    { id: 4, name: "Preview", description: "Review UI" },
    { id: 5, name: "Publish", description: "Make it live" },
];

export default function BuilderPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [isImproving, setIsImproving] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        category: "General",
        description: "",
        icon: "Zap", // System default icon
        complexity: "Low",
        savings: "",
        inputs: [] as { 
            name: string, 
            type: string, 
            required: boolean, 
            placeholder: string, 
            example: string, 
            help: string,
            guide?: { link: string, steps: string[], image?: string }
        }[],
        guide: [] as { title: string, text: string, image?: string, video?: string }[],
        webhookUrl: "", // Handled manually later, keeping in state for schema compatibility
        status: "Draft",
        productInfo: {
            valueProp: "",
            targetUser: "SME Owners",
            setupTime: "5 min",
            price: "0",
            difficulty: "Easy"
        }
    });

    const [previewMode, setPreviewTab] = useState<'product' | 'setup'>('product');

    // Step handlers
    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Array Handlers
    const addInput = () => {
        setFormData({ ...formData, inputs: [...formData.inputs, { name: "", type: "text", required: true, placeholder: "", example: "", help: "", guide: { link: "", steps: [""] } }] });
    };
    const updateInput = (idx: number, field: string, val: any) => {
        const arr = [...formData.inputs];
        arr[idx] = { ...arr[idx], [field]: val };
        setFormData({ ...formData, inputs: arr });
    };
    const updateInputGuide = (idx: number, field: string, val: any) => {
        const arr = [...formData.inputs];
        arr[idx] = { ...arr[idx], guide: { ...arr[idx].guide, [field]: val } as any };
        setFormData({ ...formData, inputs: arr });
    };
    const updateInputStep = (idx: number, sIdx: number, val: string) => {
        const arr = [...formData.inputs];
        const steps = [...(arr[idx].guide?.steps || [])];
        steps[sIdx] = val;
        arr[idx] = { ...arr[idx], guide: { ...arr[idx].guide, steps } as any };
        setFormData({ ...formData, inputs: arr });
    };
    const addInputStep = (idx: number) => {
        const arr = [...formData.inputs];
        const steps = [...(arr[idx].guide?.steps || []), ""];
        arr[idx] = { ...arr[idx], guide: { ...arr[idx].guide, steps } as any };
        setFormData({ ...formData, inputs: arr });
    };
    const removeInput = (idx: number) => {
        const arr = [...formData.inputs];
        arr.splice(idx, 1);
        setFormData({ ...formData, inputs: arr });
    };

    const addGuideStep = () => {
        setFormData({ ...formData, guide: [...formData.guide, { title: "", text: "", image: "" }] });
    };
    const updateGuide = (idx: number, field: string, val: any) => {
        const arr = [...formData.guide];
        arr[idx] = { ...arr[idx], [field]: val };
        setFormData({ ...formData, guide: arr });
    };
    const removeGuide = (idx: number) => {
        const arr = [...formData.guide];
        arr.splice(idx, 1);
        setFormData({ ...formData, guide: arr });
    };

    const enhanceDescription = async () => {
        if (!formData.name) return;
        setIsImproving(true);
        // Simulated AI generation for Value Proposition and Description
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                productInfo: {
                    ...prev.productInfo,
                    valueProp: `The definitive institutional protocol for ${prev.name}.`
                },
                description: `This autonomous loop streamlines ${prev.name} by orchestrating high-fidelity data streams into actionable outcomes. It eliminates manual overhead, ensures 100% compliance, and accelerates your firm's operational velocity.`
            }));
            setIsImproving(false);
        }, 1500);
    };

    const generateSetupGuide = async () => {
        if (!formData.name) return;
        setIsImproving(true);
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                guide: [
                    { title: "Authentication", text: `Log in to your ${prev.name} provider and navigate to the security settings.` },
                    { title: "Protocol Connection", text: "Copy the primary API credentials and paste them into the BLONK configuration field." },
                    { title: "System Sync", text: "Run the initial calibration to ensure all production nodes are correctly mapped." }
                ]
            }));
            setIsImproving(false);
        }, 1500);
    };

    const handlePublish = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    sector: formData.category,
                    description: formData.description,
                    savings: formData.savings,
                    complexity: formData.complexity,
                    icon: formData.icon,
                    color: "#F8F9FA",
                    featured: true,
                    requirements: formData.inputs,
                    setupGuide: formData.guide,
                    productInfo: formData.productInfo,
                    webhookUrl: formData.webhookUrl,
                    status: formData.status
                })
            });
            if (res.ok) {
                router.push("/admin/marketplace");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Workflow Builder</h1>
                <p className={styles.subtitle}>Create and publish no-code automations for the firm marketplace.</p>
            </div>

            <div className={styles.wizard}>
                <aside className={styles.sidebar}>
                    <div className={styles.stepList}>
                        {STEPS.map(step => (
                            <div 
                                key={step.id} 
                                className={`${styles.stepItem} ${currentStep === step.id ? styles.stepItemActive : ''} ${currentStep > step.id ? styles.stepItemCompleted : ''}`}
                                onClick={() => setCurrentStep(step.id)}
                            >
                                <div className={styles.stepIcon}>
                                    {currentStep > step.id ? "✓" : step.id}
                                </div>
                                <div>
                                    <div style={{ color: currentStep === step.id ? "#0F172A" : "inherit" }}>{step.name}</div>
                                    <div style={{ fontSize: "0.7rem", fontWeight: 500, opacity: 0.7 }}>{step.description}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                <main className={styles.content}>
                    <div className={styles.stepHeader}>
                        <h2 className={styles.stepTitle}>
                            Step {currentStep}: {STEPS[currentStep - 1].name}
                        </h2>
                        <p className={styles.stepSubtitle}>{STEPS[currentStep - 1].description}</p>
                    </div>

                    <div className={styles.stepBody}>
                        {/* STEP 1: BASIC INFO */}
                        {currentStep === 1 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Workflow Name <span className={styles.requiredAsterisk}>*</span></label>
                                        <input className={styles.input} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Stripe Invoice Sync" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Institutional Category <span className={styles.requiredAsterisk}>*</span></label>
                                        <select className={styles.select} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                            <option>General</option>
                                            <option>Accounting</option>
                                            <option>Law</option>
                                            <option>HR</option>
                                            <option>IT</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Core Value Proposition
                                        <span className={styles.helpText}>(The main benefit for the firm)</span>
                                    </label>
                                    <input className={styles.input} value={formData.productInfo.valueProp} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, valueProp: e.target.value}})} placeholder="e.g. Reduce invoice processing time by 80% with automated matching." />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        Product Description 
                                        <button 
                                            className={`${styles.aiBtn} ${isImproving ? styles.aiBtnLoading : ""}`} 
                                            onClick={enhanceDescription} 
                                            disabled={isImproving || !formData.description}
                                            title="AI Improve this text"
                                        >
                                            {isImproving ? "✨ Generating..." : "✨ AI Generate"}
                                        </button>
                                    </label>
                                    <textarea className={styles.textarea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Explain how this automation works and what it delivers..." />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Target Firm Profile</label>
                                        <select className={styles.select} value={formData.productInfo.targetUser} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, targetUser: e.target.value}})}>
                                            <option>SME Owners</option>
                                            <option>Legal Professionals</option>
                                            <option>Accountants</option>
                                            <option>IT Managers</option>
                                            <option>HR Departments</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Difficulty Level</label>
                                        <select className={styles.select} value={formData.productInfo.difficulty} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, difficulty: e.target.value as any}})}>
                                            <option value="Easy">Easy (No tech needed)</option>
                                            <option value="Medium">Medium (API keys needed)</option>
                                            <option value="Hard">Hard (Advanced config)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Estimated Savings <span className={styles.helpText}>(e.g. 10 hours/week)</span></label>
                                        <input className={styles.input} value={formData.savings} onChange={e => setFormData({...formData, savings: e.target.value})} placeholder="10 hrs/wk, or $5k/mo" />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Setup Time</label>
                                        <select className={styles.select} value={formData.productInfo.setupTime} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, setupTime: e.target.value}})}>
                                            <option>2 min</option>
                                            <option>5 min</option>
                                            <option>10 min</option>
                                            <option>30 min</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Setup Fee / License Price ($)</label>
                                    <input type="number" className={styles.input} value={formData.productInfo.price} onChange={e => setFormData({...formData, productInfo: {...formData.productInfo, price: e.target.value}})} placeholder="0 for free" />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: USER INPUTS */}
                        {currentStep === 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ background: "#EFF6FF", padding: "16px", borderRadius: "12px", border: "1px solid #BFDBFE" }}>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#1E3A8A", fontWeight: 500 }}>
                                        <strong>Pro Tip:</strong> Define the data points the firm needs to provide. Add clear "Where to get this" instructions to ensure successful onboarding.
                                    </p>
                                </div>

                                {formData.inputs.map((input, idx) => (
                                    <div key={idx} className={styles.builderCard}>
                                        <div className={styles.cardTopRow}>
                                            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#334155" }}>Input Field #{idx + 1}</h4>
                                            <button className={styles.btnDanger} onClick={() => removeInput(idx)}>✕</button>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Field Name</label>
                                                <input className={styles.input} value={input.name} onChange={e => updateInput(idx, "name", e.target.value)} placeholder="e.g. Stripe API Secret Key" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Data Type</label>
                                                <select className={styles.select} value={input.type} onChange={e => updateInput(idx, "type", e.target.value)}>
                                                    <option value="api_key">API Secret Key</option>
                                                    <option value="token">Auth Token</option>
                                                    <option value="webhook">Webhook URL</option>
                                                    <option value="email">Email Address</option>
                                                    <option value="text">General Text</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>"Where to find this?" Guide</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <input className={styles.input} value={input.guide?.link} onChange={e => updateInputGuide(idx, "link", e.target.value)} placeholder="Official Documentation Link (optional)" />
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {input.guide?.steps.map((step, sIdx) => (
                                                        <input key={sIdx} className={styles.input} style={{ fontSize: '0.85rem' }} value={step} onChange={e => updateInputStep(idx, sIdx, e.target.value)} placeholder={`Step ${sIdx + 1}: e.g. Open Stripe Dashboard`} />
                                                    ))}
                                                    <button className={styles.aiBtn} style={{ alignSelf: 'flex-start' }} onClick={() => addInputStep(idx)}>+ Add Step</button>
                                                </div>
                                                <div className={styles.imagePlaceholder}>
                                                    <span>Click to add instruction screenshot</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Example Value</label>
                                                <input className={styles.input} value={input.example} onChange={e => updateInput(idx, "example", e.target.value)} placeholder="e.g. sk_live_..." />
                                            </div>
                                            <div className={styles.formGroup} style={{ justifyContent: "center" }}>
                                                <label className={styles.toggleRow}>
                                                    <input type="checkbox" checked={input.required} onChange={e => updateInput(idx, "required", e.target.checked)} />
                                                    Mandatory Requirement
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button className={styles.btnAdd} onClick={addInput}>+ Add Required Input</button>
                            </div>
                        )}

                        {/* STEP 3: SETUP GUIDE */}
                        {currentStep === 3 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ background: "#FEF2F2", padding: "16px", borderRadius: "12px", border: "1px solid #FECACA", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#991B1B", fontWeight: 500 }}>
                                        <strong>Onboarding Strategy:</strong> Break the setup into small, visual actions. Use "AI Assist" to generate standard instructions.
                                    </p>
                                    <button className={styles.aiBtn} onClick={generateSetupGuide} disabled={isImproving || !formData.name}>✨ AI Generate Guide</button>
                                </div>

                                {formData.guide.map((step, idx) => (
                                    <div key={idx} className={styles.builderCard}>
                                        <div className={styles.cardTopRow}>
                                            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#334155" }}>Onboarding Step {idx + 1}</h4>
                                            <button className={styles.btnDanger} onClick={() => removeGuide(idx)}>✕</button>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Action Title</label>
                                            <input className={styles.input} value={step.title} onChange={e => updateGuide(idx, "title", e.target.value)} placeholder="e.g. Authorize Slack Workspace" />
                                        </div>
                                        
                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Instructions</label>
                                                <textarea className={styles.textarea} value={step.text} onChange={e => updateGuide(idx, "text", e.target.value)} placeholder="Explain exactly what the user should do..." />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Visual Aid</label>
                                                <div className={styles.imagePlaceholder} style={{ height: '100%' }}>
                                                    <span>Upload Screenshot / Image</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button className={styles.btnAdd} onClick={addGuideStep}>+ Add Onboarding Step</button>
                            </div>
                        )}

                        {/* STEP 4: PREVIEW */}
                        {currentStep === 4 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                                <div className={styles.previewTabs}>
                                    <button className={`${styles.previewTab} ${previewMode === 'product' ? styles.previewTabActive : ''}`} onClick={() => setPreviewTab('product')}>Marketplace Page</button>
                                    <button className={`${styles.previewTab} ${previewMode === 'setup' ? styles.previewTabActive : ''}`} onClick={() => setPreviewTab('setup')}>Setup Flow</button>
                                </div>

                                {previewMode === 'product' ? (
                                    <div className={styles.previewBox} style={{ border: '2px solid #0F172A', background: '#FAFAF9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#ffffff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>{formData.icon === 'Zap' ? '⚡' : formData.icon}</div>
                                            <div className={`${styles.difficultyBadge} ${formData.productInfo.difficulty === 'Easy' ? styles.difficultyEasy : (formData.productInfo.difficulty === 'Medium' ? styles.difficultyMedium : styles.difficultyHard)}`}>
                                                {formData.productInfo.difficulty}
                                            </div>
                                        </div>
                                        <h2 style={{ fontSize: "1.75rem", fontWeight: 950, color: "#0F172A", margin: "0 0 8px" }}>{formData.name || "Workflow Product Name"}</h2>
                                        <p style={{ fontSize: "1.1rem", color: "#0F172A", fontWeight: 800, marginBottom: '16px' }}>{formData.productInfo.valueProp || "The main benefit of this automation."}</p>
                                        <p style={{ fontSize: "0.95rem", color: "#64748B", marginBottom: "32px", lineHeight: 1.6 }}>{formData.description || "A detailed explanation of how this institutional protocol operates."}</p>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                                            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Value</label>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#34D186' }}>{formData.savings || '—'}</div>
                                            </div>
                                            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Setup</label>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A' }}>{formData.productInfo.setupTime}</div>
                                            </div>
                                            <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase' }}>Fee</label>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A' }}>{parseFloat(formData.productInfo.price) > 0 ? `$${formData.productInfo.price}` : 'FREE'}</div>
                                            </div>
                                        </div>

                                        <button className={styles.btnPrimary} style={{ width: '100%', padding: '18px' }}>Rapid Deploy</button>
                                    </div>
                                ) : (
                                    <div className={styles.previewBox}>
                                        <h3 style={{ fontSize: "1.1rem", color: "#0F172A", margin: "0 0 24px" }}>Step 1: Configuration</h3>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                            {formData.inputs.map((inp, i) => (
                                                <div key={i}>
                                                    <label style={{ display: 'block', fontWeight: 800, fontSize: '0.85rem', color: '#0F172A', marginBottom: '8px' }}>
                                                        {inp.name} {inp.required && <span style={{ color: '#EF4444' }}>*</span>}
                                                    </label>
                                                    <input className={styles.input} style={{ width: '100%' }} placeholder={inp.example} disabled />
                                                    <div className={styles.helpLink} style={{ cursor: 'default' }}>Where to find this?</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 5: PUBLISH */}
                        {currentStep === 5 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", justifyContent: "center", minHeight: "300px", textAlign: "center" }}>
                                <div style={{ width: "64px", height: "64px", background: "#DCFCE7", color: "#16A34A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "16px" }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                </div>
                                <h3 style={{ margin: 0, fontSize: "1.5rem", color: "#0F172A" }}>Ready to Publish</h3>
                                <p style={{ color: "#64748B", maxWidth: "400px", margin: "16px 0 32px" }}>By publishing this loop to the Marketplace, all clients on the platform will be able to review, configure, and rapidly deploy this automated process.</p>
                                
                                <div className={styles.formRow} style={{ width: "100%", maxWidth: "400px" }}>
                                    <label style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "16px", border: formData.status === "Draft" ? "2px solid #3B82F6" : "1px solid #E2E8F0", borderRadius: "12px", background: formData.status === "Draft" ? "#EFF6FF" : "white", cursor: "pointer", fontWeight: "bold", gap: "8px" }}>
                                        <input type="radio" name="status" checked={formData.status === "Draft"} onChange={() => setFormData({...formData, status: "Draft"})} style={{ display: "none" }} />
                                        Save as Draft
                                    </label>
                                    <label style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", padding: "16px", border: formData.status === "Published" ? "2px solid #10B981" : "1px solid #E2E8F0", borderRadius: "12px", background: formData.status === "Published" ? "#ECFDF5" : "white", cursor: "pointer", fontWeight: "bold", gap: "8px" }}>
                                        <input type="radio" name="status" checked={formData.status === "Published"} onChange={() => setFormData({...formData, status: "Published"})} style={{ display: "none" }} />
                                        Publish Live
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.stepFooter}>
                        {currentStep > 1 ? (
                            <button className={styles.btnSecondary} onClick={handlePrev}>← Back</button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 5 ? (
                            <button className={styles.btnPrimary} onClick={handleNext} disabled={!formData.name}>Next Step →</button>
                        ) : (
                            <button className={styles.btnPrimary} onClick={handlePublish} disabled={isSaving || !formData.name}>
                                {isSaving ? "Publishing..." : "Complete & Publish ✓"}
                            </button>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
