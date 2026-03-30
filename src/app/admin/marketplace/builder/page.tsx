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
        icon: "⚡",
        complexity: "Low",
        savings: "",
        inputs: [] as { name: string, type: string, required: boolean, placeholder: string, example: string, help: string }[],
        guide: [] as { title: string, text: string }[],
        webhookUrl: "", // Handled manually later, keeping in state for schema compatibility
        status: "Draft",
    });

    // Step handlers
    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
    const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    // Array Handlers
    const addInput = () => {
        setFormData({ ...formData, inputs: [...formData.inputs, { name: "", type: "text", required: true, placeholder: "", example: "", help: "" }] });
    };
    const updateInput = (idx: number, field: string, val: any) => {
        const arr = [...formData.inputs];
        arr[idx] = { ...arr[idx], [field]: val };
        setFormData({ ...formData, inputs: arr });
    };
    const removeInput = (idx: number) => {
        const arr = [...formData.inputs];
        arr.splice(idx, 1);
        setFormData({ ...formData, inputs: arr });
    };

    const addGuideStep = () => {
        setFormData({ ...formData, guide: [...formData.guide, { title: "", text: "" }] });
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
        if (!formData.description) return;
        setIsImproving(true);
        try {
            const res = await fetch("/api/ai/improve-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    text: formData.description, 
                    name: formData.name, 
                    category: formData.category 
                }),
            });
            const data = await res.json();
            if (data.text) {
                setFormData({ ...formData, description: data.text });
            }
        } catch (e) {
            console.error("[Improve Error]", e);
        } finally {
            setIsImproving(false);
        }
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
                    setupGuide: JSON.stringify(formData.guide),
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
                                        <label className={styles.label}>Category <span className={styles.requiredAsterisk}>*</span></label>
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
                                        Description 
                                        <button 
                                            className={`${styles.aiBtn} ${isImproving ? styles.aiBtnLoading : ""}`} 
                                            onClick={enhanceDescription} 
                                            disabled={isImproving || !formData.description}
                                            title="AI Improve this text"
                                        >
                                            {isImproving ? "✨ Improving..." : "✨ Improve"}
                                        </button>
                                    </label>
                                    <textarea className={styles.textarea} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Explain what this automation achieves..." />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Icon Emoji</label>
                                        <input className={styles.input} value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label}>Complexity</label>
                                        <select className={styles.select} value={formData.complexity} onChange={e => setFormData({...formData, complexity: e.target.value})}>
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Estimated Savings <span className={styles.helpText}>(e.g. 10 hours/week)</span></label>
                                    <input className={styles.input} value={formData.savings} onChange={e => setFormData({...formData, savings: e.target.value})} placeholder="10 hrs/wk, or $5k/mo" />
                                </div>
                            </div>
                        )}

                        {/* STEP 2: USER INPUTS */}
                        {currentStep === 2 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ background: "#EFF6FF", padding: "16px", borderRadius: "12px", border: "1px solid #BFDBFE" }}>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#1E3A8A", fontWeight: 500 }}>
                                        <strong>Pro Tip:</strong> These are the fields the user must fill out before they can activate the loop. Be very clear in your "Help Text" so beginners know exactly what to paste.
                                    </p>
                                </div>

                                {formData.inputs.map((input, idx) => (
                                    <div key={idx} className={styles.builderCard}>
                                        <div className={styles.cardTopRow}>
                                            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#334155" }}>Field #{idx + 1}</h4>
                                            <button className={styles.btnDanger} onClick={() => removeInput(idx)}>✕</button>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Field Name</label>
                                                <input className={styles.input} value={input.name} onChange={e => updateInput(idx, "name", e.target.value)} placeholder="e.g. Google API Key" />
                                            </div>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Type</label>
                                                <select className={styles.select} value={input.type} onChange={e => updateInput(idx, "type", e.target.value)}>
                                                    <option value="text">API Key / Text</option>
                                                    <option value="email">Email</option>
                                                    <option value="textarea">Long Text</option>
                                                    <option value="file">File Upload</option>
                                                    <option value="boolean">Toggle Yes/No</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className={styles.formRow}>
                                            <div className={styles.formGroup}>
                                                <label className={styles.label}>Placeholder / Example</label>
                                                <input className={styles.input} value={input.example} onChange={e => updateInput(idx, "example", e.target.value)} placeholder="e.g. AIzaSyB..." />
                                            </div>
                                            <div className={styles.formGroup} style={{ justifyContent: "center" }}>
                                                <label className={styles.toggleRow}>
                                                    <input type="checkbox" checked={input.required} onChange={e => updateInput(idx, "required", e.target.checked)} />
                                                    Required
                                                </label>
                                            </div>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Help Text (Instructions)</label>
                                            <input className={styles.input} value={input.help} onChange={e => updateInput(idx, "help", e.target.value)} placeholder="e.g. Go to Google Cloud -> APIs -> Credentials to generate a key." />
                                        </div>
                                    </div>
                                ))}

                                <button className={styles.btnAdd} onClick={addInput}>+ Add Input Field</button>
                            </div>
                        )}

                        {/* STEP 3: SETUP GUIDE */}
                        {currentStep === 3 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ background: "#FEF2F2", padding: "16px", borderRadius: "12px", border: "1px solid #FECACA" }}>
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#991B1B", fontWeight: 500 }}>
                                        <strong>CRITICAL:</strong> Non-technical users need exact click-by-click instructions on how to set up their external tools before running this.
                                    </p>
                                </div>

                                {formData.guide.map((step, idx) => (
                                    <div key={idx} className={styles.builderCard}>
                                        <div className={styles.cardTopRow}>
                                            <h4 style={{ margin: 0, fontSize: "0.95rem", color: "#334155" }}>Step {idx + 1}</h4>
                                            <button className={styles.btnDanger} onClick={() => removeGuide(idx)}>✕</button>
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Step Title</label>
                                            <input className={styles.input} value={step.title} onChange={e => updateGuide(idx, "title", e.target.value)} placeholder="e.g. Create OpenAI Account" />
                                        </div>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.label}>Description</label>
                                            <textarea className={styles.textarea} value={step.text} onChange={e => updateGuide(idx, "text", e.target.value)} placeholder="Provide specific instructions..." />
                                        </div>
                                    </div>
                                ))}

                                <button className={styles.btnAdd} onClick={addGuideStep}>+ Add Setup Step</button>
                            </div>
                        )}

                        {/* STEP 4: PREVIEW */}
                        {currentStep === 4 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                                <div className={styles.previewBox}>
                                    <span className={styles.previewLabel}>User Form Preview</span>
                                    <h2 style={{ fontSize: "1.25rem", color: "#0F172A", margin: "0 0 16px" }}>{formData.name || "Untitled Workflow"}</h2>
                                    <p style={{ fontSize: "0.9rem", color: "#64748B", marginBottom: "24px" }}>{formData.description || "Deploy this to the firm dashboard."}</p>
                                    
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                                        {formData.inputs.length === 0 && <p style={{ fontSize: "0.8rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>No dynamic inputs configured.</p>}
                                        {formData.inputs.map((inp, i) => (
                                            <div key={i}>
                                                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.8rem', color: '#1E293B', marginBottom: '6px' }}>
                                                    {inp.name} {inp.required && <span style={{ color: '#EF4444' }}>*</span>}
                                                </label>
                                                {inp.type === 'textarea' ? (
                                                    <textarea style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} placeholder={inp.example || inp.placeholder} disabled />
                                                ) : (
                                                    <input style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} placeholder={inp.example || inp.placeholder} disabled />
                                                )}
                                                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '6px 0 0 0' }}>{inp.help}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className={styles.previewBox}>
                                    <span className={styles.previewLabel}>Setup Instructions Preview</span>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                        {formData.guide.length === 0 && <p style={{ fontSize: "0.8rem", color: "#94A3B8", fontStyle: "italic", margin: 0 }}>No setup steps configured.</p>}
                                        {formData.guide.map((step, i) => (
                                            <div key={i} style={{ display: "flex", gap: "16px" }}>
                                                <div style={{ width: "32px", height: "32px", background: "#0F172A", color: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0 }}>{i + 1}</div>
                                                <div>
                                                    <h4 style={{ margin: "0 0 8px 0", fontSize: "0.95rem", color: "#0F172A" }}>{step.title}</h4>
                                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748B", whiteSpace: "pre-wrap" }}>{step.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 5: PUBLISH */}
                        {currentStep === 5 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", justifyContent: "center", minHeight: "300px", textAlign: "center" }}>
                                <div style={{ width: "64px", height: "64px", background: "#DCFCE7", color: "#16A34A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "16px" }}>⚡</div>
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
