"use client";

import styles from "./registry.module.css";
import React, { useState, useEffect } from "react";
import { Activity, Zap, CheckCircle, AlertCircle, Plus, FileText, Link2, ArrowUpRight, ShieldCheck, ShieldAlert, X, MousePointer2, Settings, Cpu, Link, Search, Layers, Key, Euro, ShoppingCart } from "lucide-react";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "@/app/components/Skeleton";

export default function WorkflowsPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [configureTemplate, setConfigureTemplate] = useState<any>(null);
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);
    const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({});
    const [helpStep, setHelpStep] = useState<any>(null);
    const [deployResult, setDeployResult] = useState<any>(null);
    const [step, setStep] = useState<'configure' | 'result'>('configure');
    const [isDeploying, setIsDeploying] = useState(false);

    // Custom workflow request wizard
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [customForm, setCustomForm] = useState({ name: '', category: 'General', description: '', tools: '', urgency: 'normal', timeline: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [aiMatches, setAiMatches] = useState<any[]>([]);

    // AI match: find marketplace templates that overlap with the description
    const findAiMatches = (description: string) => {
        if (!description.trim() || templates.length === 0) { setAiMatches([]); return; }
        const words = description.toLowerCase().split(/\W+/).filter(w => w.length > 3);
        const scored = templates.map(t => {
            const haystack = `${t.name} ${t.description} ${t.sector}`.toLowerCase();
            const score = words.filter(w => haystack.includes(w)).length;
            return { ...t, score };
        }).filter(t => t.score > 0).sort((a: any, b: any) => b.score - a.score).slice(0, 3);
        setAiMatches(scored);
    };

    const handleCustomRequest = async () => {
        if (!customForm.name.trim() || !customForm.description.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: `Custom Workflow Request: ${customForm.name}`,
                    message: `**Workflow:** ${customForm.name}\n**Category:** ${customForm.category}\n\n**What to automate:**\n${customForm.description}\n\n**Tools / Apps:** ${customForm.tools || 'Not specified'}\n**Urgency:** ${customForm.urgency}\n**Timeline:** ${customForm.timeline || 'Flexible'}`,
                })
            });
            if (res.ok) { setWizardStep(4); }
            else { const err = await res.json(); showToast(err.error || 'Submission failed.', 'error'); }
        } catch { showToast('Network error. Please try again.', 'error'); }
        finally { setIsSubmitting(false); }
    };

    const openCustomModal = () => {
        setCustomForm({ name: '', category: 'General', description: '', tools: '', urgency: 'normal', timeline: '' });
        setWizardStep(1); setAiMatches([]); setShowCustomModal(true);
    };


    const categories = ["All", "Accounting", "Law", "HR", "IT", "General"];

    useEffect(() => {
        fetchMarketplace();
    }, []);

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

    const handleAddClick = (template: any) => {
        const price = parseFloat(template.price || 0);
        
        // If template has a price, redirect to marketplace for payment
        if (price > 0) {
            window.location.href = '/dashboard/marketplace';
            return;
        }
        
        // Free templates use the old configuration flow
        const robustParse = (val: any) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
                try {
                    const parsed = JSON.parse(val);
                    return robustParse(parsed);
                } catch (e) { return []; }
            }
            return [];
        };

        const reqs = robustParse(template.requirements);
        if (reqs.length > 0) {
            setConfigureTemplate({ ...template, parsedReqs: reqs });
            setTemplateInputs({});
            setStep('configure');
            setDeployResult(null);
        } else {
            deployWorkflow(template, {});
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
            const data = await res.json();
            if (res.ok) {
                setDeployResult(data.orchestration || {});
                setStep('result');
                showToast(`Orchestration sequence initiated!`);
            } else {
                showToast(data.error || "Deployment failed.", 'error');
            }
        } catch (error) {
            showToast("Network disruption detected.", 'error');
        } finally {
            setIsDeploying(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const filteredTemplates = templates.filter(wf => {
        const matchesSearch = wf.name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || wf.sector === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className={styles.workflowsContainer}>
            {/* HEADER */}
            <div className={styles.header}>
                <h1 className={styles.title}>Marketplace</h1>
                <p className={styles.subtitle}>
                    Add powerful, pre-built workflows to automate and scale your operations.
                </p>
            </div>

            {/* FILTERS & SEARCH */}
            <div className={styles.filterRow}>
                <div className={styles.filterTabs}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterTab} ${selectedCategory === cat ? styles.filterTabActive : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <div className={styles.searchSort}>
                    <div className={styles.searchBox}>
                        <Search size={18} color="#94A3B8" />
                        <input
                            type="text"
                            placeholder="Search automations..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <select className={styles.sortSelect}>
                        <option>Most Popular</option>
                        <option>Newest</option>
                    </select>
                </div>
            </div>

            {/* TRUST STRIP */}
            <div className={styles.trustStrip}>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Zap size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>98+</span>
                        <span className={styles.trustDesc}>Workflows Available</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><ShieldCheck size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>Trusted</span>
                        <span className={styles.trustDesc}>Built by experts</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Activity size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>Instant Use</span>
                        <span className={styles.trustDesc}>No coding needed</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><Plus size={24} /></div>
                    <div className={styles.trustContent}>
                        <span className={styles.trustTitle}>Updated</span>
                        <span className={styles.trustDesc}>New loops weekly</span>
                    </div>
                </div>
            </div>

            {/* FEATURED WORKFLOWS */}
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Featured Workflows</h2>
                <Link href="#" className={styles.viewAllLink}>
                    View all workflows <ArrowUpRight size={16} />
                </Link>
            </div>

            {isLoading ? (
                <div className={styles.workflowGrid}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ height: '360px', background: '#F8FAFC', borderRadius: '24px', animation: 'pulse 2s infinite' }} />
                    ))}
                </div>
            ) : (
                <div className={styles.workflowGrid}>
                    {filteredTemplates.map(wf => {
                        const iconColor = wf.sector === 'Accounting' ? '#10B981' : (wf.sector === 'Law' ? '#8B5CF6' : '#3B82F6');
                        return (
                            <div key={wf.id} className={styles.workflowCard}>
                                <div className={styles.cardIcon} style={{ background: `${iconColor}15`, color: iconColor }}>
                                    <Zap size={24} />
                                </div>
                                <div className={styles.cardContent}>
                                    <h3 className={styles.cardTitle}>{wf.name}</h3>
                                    <p className={styles.cardDesc}>{wf.description}</p>
                                    <div className={styles.categoryTag} style={{ background: `${iconColor}15`, color: iconColor }}>{wf.sector}</div>
                                </div>
                                <div className={styles.cardStats}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statValue}>1.2K</span>
                                        <span className={styles.statLabel}>Installs</span>
                                    </div>
                                    <div className={styles.statItem} style={{ textAlign: 'right' }}>
                                        <span className={styles.statValue} style={{ color: parseFloat(wf.price || 0) > 0 ? '#10B981' : '#0F172A' }}>
                                            {parseFloat(wf.price || 0) > 0 ? `€${parseFloat(wf.price).toFixed(2)}` : 'Free'}
                                        </span>
                                        <span className={styles.statLabel}>Price</span>
                                    </div>
                                </div>
                                <div className={styles.cardActions}>
                                    <button className={styles.btnDetails}>View Details</button>
                                    <button className={styles.btnInstall} onClick={() => handleAddClick(wf)}>Install</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* CUSTOM REQUEST SECTION */}
            <div className={styles.customSection}>
                <div className={styles.customLeft}>
                    <h2>Can't find what you need?</h2>
                    <p>Request a custom workflow tailored to your unique business processes.</p>
                    <button className={styles.btnRequest} onClick={openCustomModal}>
                        Request Custom Workflow <ArrowUpRight size={18} />
                    </button>
                    <div className={styles.responseNote}>
                        <CheckCircle size={16} /> Our team will get back to you within 24 hours.
                    </div>
                </div>
                <div className={styles.howItWorks}>
                    <span className={styles.howHeader}>How it works</span>
                    <div className={styles.stepGrid}>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><FileText size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>1. Tell us your needs</span>
                                <p className={styles.stepDesc}>Fill out a short form and explain what you want to automate.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><MousePointer2 size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>2. We design it</span>
                                <p className={styles.stepDesc}>Our automation experts create a tailored workflow for you.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><Settings size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>3. Review & approve</span>
                                <p className={styles.stepDesc}>Review the workflow and request any adjustments needed.</p>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIcon}><Zap size={20} /></div>
                            <div>
                                <span className={styles.stepNumber}>4. We deliver & set up</span>
                                <p className={styles.stepDesc}>We deliver, install, and help you get it running smoothly.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* INSTALL MODAL */}
            {configureTemplate && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setConfigureTemplate(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={() => setConfigureTemplate(null)}>
                                <X size={20} />
                            </button>
                            {step === 'configure' ? (
                                <>
                                    <h2 className={styles.onboardingTitle}>Install {configureTemplate.name}</h2>
                                    <p className={styles.onboardingSubtitle}>Configure your parameters to begin orchestration.</p>
                                    <div className={styles.configFieldset}>
                                        {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                            <div key={idx} className={styles.formGroup}>
                                                <label className={styles.fieldLabel}>{req.name.replace(/_/g, ' ')}</label>
                                                <input
                                                    className={styles.fieldInput}
                                                    type="text"
                                                    placeholder={req.example || `Specify ${req.name}...`}
                                                    onChange={e => setTemplateInputs({ ...templateInputs, [req.name]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button className={styles.btnInstall} style={{ width: '100%', height: '56px', marginTop: '32px' }} disabled={isDeploying} onClick={() => deployWorkflow(configureTemplate, templateInputs)}>
                                        {isDeploying ? 'Deploying...' : 'Install Workflow'}
                                    </button>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ width: '64px', height: '64px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <CheckCircle size={32} color="white" />
                                    </div>
                                    <h2 className={styles.onboardingTitle}>Workflow Installed</h2>
                                    <p className={styles.onboardingSubtitle}>Orchestration has been initiated successfully.</p>
                                    <button className={styles.btnInstall} style={{ width: '100%' }} onClick={() => setConfigureTemplate(null)}>Return to Marketplace</button>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalPortal>
            )}

            {/* CUSTOM WORKFLOW REQUEST WIZARD */}
            {showCustomModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowCustomModal(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 560, padding: 0, overflow: 'hidden', borderRadius: 28 }}>

                            {/* Dark header with progress */}
                            <div style={{ background: 'linear-gradient(135deg,#0F172A 0%,#1E293B 100%)', padding: '28px 32px 24px', position: 'relative' }}>
                                <button className={styles.closeButton} onClick={() => setShowCustomModal(false)} style={{ color: 'rgba(255,255,255,0.4)', top: 18, right: 18 }}>
                                    <X size={20} />
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: wizardStep < 4 ? 24 : 0 }}>
                                    <div style={{ width: 44, height: 44, background: 'rgba(16,185,129,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16,185,129,0.3)' }}>
                                        <Zap size={20} color="#10B981" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 950, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Custom Build</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#fff', letterSpacing: '-0.02em' }}>Request a Workflow</div>
                                    </div>
                                </div>
                                {wizardStep < 4 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                        {[{ n: 1, l: 'Basics' }, { n: 2, l: 'Describe' }, { n: 3, l: 'Urgency' }].map((s, i) => (
                                            <React.Fragment key={s.n}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                                    <div style={{
                                                        width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: wizardStep > s.n ? '#10B981' : wizardStep === s.n ? '#fff' : 'rgba(255,255,255,0.08)',
                                                        color: wizardStep > s.n ? '#fff' : wizardStep === s.n ? '#0F172A' : 'rgba(255,255,255,0.3)',
                                                        fontWeight: 950, fontSize: '0.8rem', transition: 'all 0.3s',
                                                        border: wizardStep === s.n ? 'none' : '1px solid rgba(255,255,255,0.12)'
                                                    }}>
                                                        {wizardStep > s.n ? '✓' : s.n}
                                                    </div>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: wizardStep === s.n ? '#fff' : 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>{s.l}</span>
                                                </div>
                                                {i < 2 && <div style={{ flex: 1, height: 1, background: wizardStep > s.n ? '#10B981' : 'rgba(255,255,255,0.1)', marginBottom: 18, transition: 'background 0.3s', marginLeft: 6, marginRight: 6 }} />}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Step body */}
                            <div style={{ padding: '28px 32px 32px' }}>

                                {/* STEP 1 — Basics */}
                                {wizardStep === 1 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                        <div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 950, color: '#0F172A', marginBottom: 4 }}>What would you like to automate?</div>
                                            <div style={{ fontSize: '0.83rem', color: '#94A3B8', fontWeight: 600 }}>Give your workflow a name and pick a category.</div>
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Workflow Name *</label>
                                            <input className={styles.fieldInput} type="text" autoFocus
                                                placeholder="e.g. Monthly Invoice Reconciliation"
                                                value={customForm.name}
                                                onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                                                style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Category</label>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                                                {['Accounting', 'Law', 'HR', 'IT', 'Marketing', 'Sales', 'General'].map(cat => (
                                                    <button key={cat} onClick={() => setCustomForm(f => ({ ...f, category: cat }))} style={{
                                                        padding: '7px 16px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.15s',
                                                        background: customForm.category === cat ? '#0F172A' : '#F8FAFC',
                                                        color: customForm.category === cat ? '#fff' : '#475569',
                                                        border: customForm.category === cat ? 'none' : '1px solid #F1F5F9'
                                                    }}>{cat}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <button className={styles.btnInstall} disabled={!customForm.name.trim()}
                                            style={{ width: '100%', height: 50, marginTop: 4, opacity: !customForm.name.trim() ? 0.5 : 1 }}
                                            onClick={() => { findAiMatches(customForm.name); setWizardStep(2); }}>
                                            Continue →
                                        </button>
                                    </div>
                                )}

                                {/* STEP 2 — Describe + AI Match */}
                                {wizardStep === 2 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        <div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 950, color: '#0F172A', marginBottom: 4 }}>Describe the workflow</div>
                                            <div style={{ fontSize: '0.83rem', color: '#94A3B8', fontWeight: 600 }}>The more detail, the faster we can build it.</div>
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>What should it do? *</label>
                                            <textarea rows={4} autoFocus
                                                placeholder="e.g. When a new invoice arrives via email, extract the data, match it to our CRM, and notify the finance team on Slack..."
                                                value={customForm.description}
                                                onChange={e => { setCustomForm(f => ({ ...f, description: e.target.value })); findAiMatches(e.target.value + ' ' + customForm.name); }}
                                                style={{ width: '100%', boxSizing: 'border-box', background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, padding: '12px 16px', fontSize: '0.88rem', fontWeight: 600, lineHeight: 1.7, resize: 'vertical', outline: 'none', color: '#0F172A', fontFamily: 'inherit' }}
                                            />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Apps & tools involved</label>
                                            <input className={styles.fieldInput} type="text"
                                                placeholder="e.g. Gmail, Airtable, Slack, HubSpot..."
                                                value={customForm.tools}
                                                onChange={e => setCustomForm(f => ({ ...f, tools: e.target.value }))}
                                                style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>

                                        {/* AI MATCH SUGGESTIONS */}
                                        {aiMatches.length > 0 && (
                                            <div style={{ background: 'linear-gradient(135deg,#F0FDF4,#ECFDF5)', border: '1px solid #A7F3D0', borderRadius: 16, padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                                                    <Zap size={13} color="#10B981" />
                                                    <span style={{ fontSize: '0.72rem', fontWeight: 950, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em' }}>BLONK found similar workflows already in the marketplace</span>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {aiMatches.map((m, i) => (
                                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderRadius: 12, border: '1px solid #D1FAE5', cursor: 'pointer' }}
                                                            onClick={() => { setShowCustomModal(false); handleAddClick(m); }}>
                                                            <div style={{ width: 34, height: 34, background: '#10B98115', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                <Zap size={16} color="#10B981" />
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</div>
                                                                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>{m.sector} · Click to install</div>
                                                            </div>
                                                            <ArrowUpRight size={14} color="#10B981" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#6EE7B7', fontWeight: 700, marginTop: 10, textAlign: 'center' }}>
                                                    Not quite right? Continue to request a custom build ↓
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={() => setWizardStep(1)} style={{ flex: 1, height: 50, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, fontWeight: 950, color: '#64748B', cursor: 'pointer', fontSize: '0.88rem' }}>← Back</button>
                                            <button className={styles.btnInstall} disabled={!customForm.description.trim()}
                                                style={{ flex: 2, height: 50, opacity: !customForm.description.trim() ? 0.5 : 1 }}
                                                onClick={() => setWizardStep(3)}>Continue →</button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 — Urgency */}
                                {wizardStep === 3 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                                        <div>
                                            <div style={{ fontSize: '1.05rem', fontWeight: 950, color: '#0F172A', marginBottom: 4 }}>When do you need it?</div>
                                            <div style={{ fontSize: '0.83rem', color: '#94A3B8', fontWeight: 600 }}>Set urgency so we can prioritise your request correctly.</div>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {[
                                                { value: 'low', label: 'Low priority', sub: 'Within 2 weeks — no rush', emoji: '🟢' },
                                                { value: 'normal', label: 'Normal', sub: 'Within 1 week — standard', emoji: '🔵' },
                                                { value: 'high', label: 'High priority', sub: 'Within 2 days — important', emoji: '🟡' },
                                                { value: 'urgent', label: 'Urgent', sub: 'ASAP — critical to business', emoji: '🔴' },
                                            ].map(opt => (
                                                <div key={opt.value} onClick={() => setCustomForm(f => ({ ...f, urgency: opt.value }))} style={{
                                                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.15s',
                                                    background: customForm.urgency === opt.value ? '#0F172A' : '#F8FAFC',
                                                    border: `1px solid ${customForm.urgency === opt.value ? '#0F172A' : '#F1F5F9'}`,
                                                }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{opt.emoji}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 950, fontSize: '0.88rem', color: customForm.urgency === opt.value ? '#fff' : '#0F172A' }}>{opt.label}</div>
                                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: customForm.urgency === opt.value ? 'rgba(255,255,255,0.5)' : '#94A3B8' }}>{opt.sub}</div>
                                                    </div>
                                                    {customForm.urgency === opt.value && <CheckCircle size={17} color="#10B981" />}
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Preferred delivery date (optional)</label>
                                            <input className={styles.fieldInput} type="date"
                                                value={customForm.timeline}
                                                onChange={e => setCustomForm(f => ({ ...f, timeline: e.target.value }))}
                                                style={{ width: '100%', boxSizing: 'border-box' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button onClick={() => setWizardStep(2)} style={{ flex: 1, height: 50, background: '#F8FAFC', border: '1px solid #F1F5F9', borderRadius: 14, fontWeight: 950, color: '#64748B', cursor: 'pointer', fontSize: '0.88rem' }}>← Back</button>
                                            <button className={styles.btnInstall} disabled={isSubmitting}
                                                style={{ flex: 2, height: 50, opacity: isSubmitting ? 0.6 : 1 }}
                                                onClick={handleCustomRequest}>{isSubmitting ? 'Submitting...' : 'Submit Request ✓'}</button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4 — Success */}
                                {wizardStep === 4 && (
                                    <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                                        <div style={{ width: 76, height: 76, background: 'linear-gradient(135deg,#10B981,#059669)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 24px rgba(16,185,129,0.28)' }}>
                                            <CheckCircle size={38} color="white" />
                                        </div>
                                        <h2 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0F172A', marginBottom: 8 }}>Request Sent!</h2>
                                        <p style={{ color: '#64748B', fontWeight: 600, lineHeight: 1.6, maxWidth: 340, margin: '0 auto 24px', fontSize: '0.9rem' }}>
                                            Your workflow <strong style={{ color: '#0F172A' }}>"{customForm.name}"</strong> has been submitted. We'll get back to you within 24 hours.
                                        </p>
                                        <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px 18px', marginBottom: 24, textAlign: 'left', border: '1px solid #F1F5F9' }}>
                                            {[{ l: 'Workflow', v: customForm.name }, { l: 'Category', v: customForm.category }, { l: 'Urgency', v: customForm.urgency }].map(item => (
                                                <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8' }}>{item.l}</span>
                                                    <span style={{ fontSize: '0.8rem', fontWeight: 950, color: '#0F172A', textTransform: 'capitalize' }}>{item.v}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button className={styles.btnInstall} style={{ width: '100%', height: 50 }} onClick={() => setShowCustomModal(false)}>Back to Marketplace</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}

            {toast && <div className={styles.toast}><CheckCircle size={20} /> {toast}</div>}
        </div>
    );
}
