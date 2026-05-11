"use client";

import styles from "./workflows.module.css";
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

    // Custom workflow request modal
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customForm, setCustomForm] = useState({ name: '', description: '', urgency: 'normal' });
    const [customStep, setCustomStep] = useState<'form' | 'success'>('form');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCustomRequest = async () => {
        if (!customForm.name.trim() || !customForm.description.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: `Custom Workflow Request: ${customForm.name}`,
                    message: `**Workflow Name:** ${customForm.name}\n\n**Description / Requirements:**\n${customForm.description}\n\n**Urgency:** ${customForm.urgency}`,
                })
            });
            if (res.ok) {
                setCustomStep('success');
            } else {
                const err = await res.json();
                showToast(err.error || 'Submission failed. Please try again.', 'error');
            }
        } catch {
            showToast('Network error. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openCustomModal = () => {
        setCustomForm({ name: '', description: '', urgency: 'normal' });
        setCustomStep('form');
        setShowCustomModal(true);
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
                                        <span className={styles.statValue}>4.9</span>
                                        <span className={styles.statLabel}>Rating</span>
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
                                                    onChange={e => setTemplateInputs({...templateInputs, [req.name]: e.target.value})}
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

            {/* CUSTOM WORKFLOW REQUEST MODAL */}
            {showCustomModal && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setShowCustomModal(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
                            <button className={styles.closeButton} onClick={() => setShowCustomModal(false)}>
                                <X size={20} />
                            </button>

                            {customStep === 'form' ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
                                        <div style={{ width: 52, height: 52, background: '#0F172A', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Zap size={26} color="white" />
                                        </div>
                                        <div>
                                            <h2 className={styles.onboardingTitle} style={{ margin: 0 }}>Request Custom Workflow</h2>
                                            <p className={styles.onboardingSubtitle} style={{ margin: 0 }}>Tell us what you need — we'll build it for you.</p>
                                        </div>
                                    </div>

                                    <div className={styles.configFieldset}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.fieldLabel}>Workflow Name *</label>
                                            <input
                                                className={styles.fieldInput}
                                                type="text"
                                                placeholder="e.g. Monthly Invoice Reconciliation"
                                                value={customForm.name}
                                                onChange={e => setCustomForm(f => ({ ...f, name: e.target.value }))}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.fieldLabel}>Describe what you want to automate *</label>
                                            <textarea
                                                className={styles.fieldInput}
                                                rows={5}
                                                placeholder="Describe the process step by step. Include which apps, tools or data sources are involved..."
                                                value={customForm.description}
                                                onChange={e => setCustomForm(f => ({ ...f, description: e.target.value }))}
                                                style={{ resize: 'vertical', lineHeight: 1.6 }}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.fieldLabel}>Urgency</label>
                                            <select
                                                className={styles.fieldInput}
                                                value={customForm.urgency}
                                                onChange={e => setCustomForm(f => ({ ...f, urgency: e.target.value }))}
                                            >
                                                <option value="low">Low — within 2 weeks</option>
                                                <option value="normal">Normal — within 1 week</option>
                                                <option value="high">High — within 2 days</option>
                                                <option value="urgent">Urgent — ASAP</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        className={styles.btnInstall}
                                        style={{ width: '100%', height: '52px', marginTop: 8, opacity: (!customForm.name.trim() || !customForm.description.trim() || isSubmitting) ? 0.6 : 1 }}
                                        disabled={!customForm.name.trim() || !customForm.description.trim() || isSubmitting}
                                        onClick={handleCustomRequest}
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                    <div className={styles.responseNote} style={{ marginTop: 16, justifyContent: 'center' }}>
                                        <CheckCircle size={15} /> Our team responds within 24 hours.
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ width: '68px', height: '68px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                        <CheckCircle size={34} color="white" />
                                    </div>
                                    <h2 className={styles.onboardingTitle}>Request Submitted!</h2>
                                    <p className={styles.onboardingSubtitle} style={{ maxWidth: 340, margin: '0 auto 32px' }}>
                                        Your custom workflow request for <strong>"{customForm.name}"</strong> has been received. Our team will contact you within 24 hours.
                                    </p>
                                    <button className={styles.btnInstall} style={{ width: '100%' }} onClick={() => setShowCustomModal(false)}>
                                        Back to Marketplace
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalPortal>
            )}

            {toast && <div className={styles.toast}><CheckCircle size={20} /> {toast}</div>}
        </div>
    );
}
