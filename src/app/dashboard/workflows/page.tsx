"use client";

import styles from "./workflows.module.css";
import React, { useState, useEffect } from "react";
import ModalPortal from "@/app/components/ModalPortal";
import { Skeleton } from "@/app/components/Skeleton";

export default function WorkflowsPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [templates, setTemplates] = useState<any[]>([]);
    const [activeWorkflowNames, setActiveWorkflowNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [configureTemplate, setConfigureTemplate] = useState<any>(null);
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);
    const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({});
    const [helpStep, setHelpStep] = useState<any>(null);

    const blueprintMap: Record<string, any> = {
        "Lead Automation": {
            logic: ["New lead submits form on website", "Extract contact details & preferences", "Push to Salesforce/HubSpot CRM", "Send personalized welcome email sequence"],
            impact: { time: "Saves ~15h/week", accuracy: "100% Capture Rate" },
            sample: "Lead #A982 Successfully Synced"
        },
        "Client Onboarding": {
            logic: ["Signed contract received via DocuSign", "Create dedicated Google Drive folder workspace", "Invite client and project manager to new Slack channel", "Schedule 30-min kickoff Zoom meeting"],
            impact: { time: "Saves ~5h/week", accuracy: "0 Missed Steps" },
            sample: "Project Setup Complete"
        },
        "Invoice Processing": {
            logic: ["Receive invoice PDF via email attachment", "Extract vendor, amount, and due date (OCR)", "Match line items against approved Purchase Orders", "Draft payment in Xero/QuickBooks for approval"],
            impact: { time: "Saves ~20h/month", accuracy: "99.5% Match Rate" },
            sample: "Payment Drafted: Invoice REF-882"
        }
    };

    const handlePreviewClick = (template: any) => {
        const blueprint = blueprintMap[template.name] || {
            logic: ["Trigger event occurs", "Data processing step", "Action executed in target app"],
            impact: { time: "Saves ~2h/week", accuracy: "100%" },
            sample: "Task Completed"
        };
        setPreviewTemplate({ ...template, blueprint });
    };

    const [isDeploying, setIsDeploying] = useState(false);
    const [isCapacityFull, setIsCapacityFull] = useState(false);
    const [usageLimits, setUsageLimits] = useState({ loops: 1 });

    const categories = ["All", "Accounting", "Law", "HR", "IT", "General"];

    useEffect(() => {
        fetchMarketplace();
        const script = document.createElement("script");
        script.src = "/n8n-demo.js";
        script.type = "module";
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const fetchMarketplace = async () => {
        try {
            const [res, usageRes] = await Promise.all([
                fetch('/api/workflows'),
                fetch('/api/usage')
            ]);
            const data = await res.json();
            const usage = await usageRes.json();

            if (data.templates) {
                setTemplates(data.templates);
                setActiveWorkflowNames(data.activeWorkflows);
            }
            if (usage && !usage.error) {
                const isFull = usage.activeLoops >= usage.activeLoopsLimit;
                setIsCapacityFull(isFull);
                setUsageLimits({ loops: usage.activeLoopsLimit });
            }
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
                    if (typeof parsed === 'string') return robustParse(parsed);
                    return Array.isArray(parsed) ? parsed : [];
                } catch (e) { return []; }
            }
            return [];
        };

        const reqs = robustParse(template.requirements);
        const guide = robustParse(template.setupGuide);

        if (reqs.length > 0 || guide.length > 0) {
            setConfigureTemplate({ ...template, parsedReqs: reqs, parsedGuide: guide });
            setTemplateInputs({});
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
                    performance: "0",
                    inputs
                })
            });

            if (res.ok) {
                showToast(`Loop "${template.name}" requested! Admin will configure the backend.`);
                setConfigureTemplate(null);
                fetchMarketplace();
            }
        } catch (error) {
            console.error("Error deploying workflow:", error);
        } finally {
            setIsDeploying(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const filteredTemplates = templates.filter(wf => {
        const matchesSearch = wf.name.toLowerCase().includes(search.toLowerCase()) ||
            (wf.description && wf.description.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = selectedCategory === "All" || wf.sector === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className={styles.workflowsContainer}>


            <div className={styles.marketplaceActions}>
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
                <div className={styles.searchWrapper}>
                    <input
                        type="text"
                        placeholder="Search automations..."
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className={styles.workflowGrid}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} height="350px" borderRadius="32px" />
                    ))}
                </div>
            ) : (
                <div className={styles.workflowGrid}>
                    {filteredTemplates.map(wf => (
                        <div key={wf.id} className={styles.workflowCard}>
                            {wf.featured === 1 && <div className={styles.cardFeatured}>Featured</div>}
                            <div className={styles.cardHeader}>
                                <div className={styles.iconContainer}>
                                    <span style={{ fontSize: '32px' }}>{wf.icon || '⚙️'}</span>
                                </div>
                                <h3>{wf.name}</h3>
                                <p>{wf.description}</p>
                            </div>

                            <div className={styles.metadataGrid}>
                                <div className={styles.metaItem}>
                                    <label>Category</label>
                                    <span>{wf.sector}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <label>Value</label>
                                    <span style={{ color: 'var(--accent)', fontWeight: 950 }}>Saves {wf.savings || '10h/mo'}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <label>Adoption</label>
                                    <span>Used by {Math.floor(Math.random() * 200) + 50} teams</span>
                                </div>
                            </div>

                             <div className={styles.cardFooter}>
                                    <button className={styles.btnPrimary} onClick={() => handleAddClick(wf)}>
                                        Add to Firm
                                    </button>
                                    <button className={styles.btnSecondary} onClick={() => handlePreviewClick(wf)}>
                                        Preview
                                    </button>
                            </div>
                        </div>
                    ))}
                    {filteredTemplates.length === 0 && (
                        <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '100px 0', opacity: 0.5 }}>
                            <div style={{ fontWeight: 800 }}>No workflows match your search.</div>
                        </div>
                    )}
                </div>
            )}

            {toast && (
                <div className={styles.toast}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    {toast}
                </div>
            )}

            {configureTemplate && (
                <ModalPortal>
                    <div className={styles.guideModal}>
                        <div className={styles.guideContainer}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div className={styles.iconContainer}>
                                    {configureTemplate.icon || '⚙️'}
                                </div>
                                <div>
                                    <h2 className={styles.sectionTitle}>Set up {configureTemplate.name}</h2>
                                    <p className={styles.guideStepText}>Follow these simple steps to start automating.</p>
                                </div>
                            </div>
                            <button onClick={() => setConfigureTemplate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Visual How It Works */}
                        <div className={styles.visualSteps}>
                            <div className={`${styles.visualStep} ${styles.visualStepActive}`}>
                                <div className={styles.stepIconBox}>🔌</div>
                                <div className={styles.stepLabel}>Connect</div>
                            </div>
                            <div className={styles.stepConnector} />
                            <div className={styles.visualStep}>
                                <div className={styles.stepIconBox}>⚙️</div>
                                <div className={styles.stepLabel}>Configure</div>
                            </div>
                            <div className={styles.stepConnector} />
                            <div className={styles.visualStep}>
                                <div className={styles.stepIconBox}>🚀</div>
                                <div className={styles.stepLabel}>Result</div>
                            </div>
                        </div>

                        {/* Requirements / Connections */}
                        {configureTemplate.parsedReqs && configureTemplate.parsedReqs.length > 0 && (
                            <div style={{ marginBottom: '48px' }}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionNumber}>1</div>
                                    <h3 className={styles.sectionTitle}>Connect Services</h3>
                                </div>
                                <div className={styles.requirementsList}>
                                    {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                        <div key={idx} className={styles.requirementCard}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                                <div className={styles.reqIcon}>
                                                    {req.name.toLowerCase().includes('stripe') ? '💳' : 
                                                     req.name.toLowerCase().includes('google') ? '🔍' : 
                                                     req.name.toLowerCase().includes('notion') ? '📝' : '🔌'}
                                                </div>
                                                <div>
                                                    <div className={styles.reqName}>{req.name}</div>
                                                    <div className={styles.helpLink} onClick={() => setHelpStep(req)}>
                                                        Where to find this?
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <button className={styles.btnSecondary} onClick={() => setHelpStep(req)}>Get API Key</button>
                                                <button className={styles.btnPrimary} onClick={() => setHelpStep(req)}>Connect</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Setup Guide */}
                        {configureTemplate.parsedGuide && configureTemplate.parsedGuide.length > 0 && (
                            <div style={{ marginBottom: '48px' }}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionNumber}>2</div>
                                    <h3 className={styles.sectionTitle}>Setup Guide</h3>
                                </div>
                                <div className={styles.setupGuideContainer}>
                                    {configureTemplate.parsedGuide.map((step: any, idx: number) => (
                                        <div key={idx} className={styles.guideStep}>
                                            <div className={styles.guideStepNumber}>{idx + 1}</div>
                                            <div>
                                                <h4 className={styles.guideStepTitle}>{step.title}</h4>
                                                <p className={styles.guideStepText}>{step.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Configuration Form */}
                        {configureTemplate.parsedReqs && configureTemplate.parsedReqs.length > 0 && (
                            <div style={{ marginBottom: '48px' }}>
                                <div className={styles.sectionHeader}>
                                    <div className={styles.sectionNumber}>3</div>
                                    <h3 className={styles.sectionTitle}>Configuration</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                        <div key={idx}>
                                            <label className={styles.configLabel}>
                                                {req.name} {req.required && <span style={{ color: 'var(--destructive)' }}>*</span>}
                                            </label>
                                            <input 
                                                className={styles.configInput}
                                                type={req.type === 'file' ? 'file' : 'text'}
                                                placeholder={req.example || `Paste your ${req.name} here...`}
                                                value={req.type === 'file' ? undefined : (templateInputs[req.name] || '')}
                                                onChange={e => setTemplateInputs({...templateInputs, [req.name]: e.target.value})}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ display: 'flex', gap: '16px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                            <button className={styles.btnSecondary} style={{ flex: 1 }} onClick={() => setConfigureTemplate(null)}>Cancel</button>
                            <button className={styles.btnPrimary} style={{ flex: 1 }} disabled={isDeploying} onClick={() => deployWorkflow(configureTemplate, templateInputs)}>
                                {isDeploying ? 'Deploying...' : 'Deploy Automation'}
                            </button>
                        </div>
                        </div>
                    </div>

                    {/* API Guide Modal */}
                    {helpStep && (
                        <div className={styles.guideModal} style={{ zIndex: 1100, background: 'rgba(0,0,0,0.6)' }}>
                            <div className={styles.guideContainer} style={{ maxWidth: '500px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 className={styles.sectionTitle}>Guide: {helpStep.name}</h3>
                                    <button onClick={() => setHelpStep(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ background: 'var(--muted)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border)' }}>
                                        <p className={styles.guideStepText}>
                                            {helpStep.help || `To find your ${helpStep.name}, log in to your service dashboard, navigate to Settings or API section, and copy the value provided.`}
                                        </p>
                                    </div>
                                    <button className={styles.btnPrimary} onClick={() => setHelpStep(null)}>Got it</button>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalPortal>
            )}

            {previewTemplate && (
                <ModalPortal>
                    <div className={styles.guideModal}>
                        <div className={styles.guideContainer} style={{ maxWidth: '700px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                <div className={styles.iconContainer}>
                                    {previewTemplate.icon || '⚙️'}
                                </div>
                                <div>
                                    <h2 className={styles.sectionTitle}>{previewTemplate.name}</h2>
                                    <p className={styles.guideStepText}>Workflow Preview</p>
                                </div>
                            </div>
                            <button onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {previewTemplate.workflow ? (
                                <div style={{ width: '100%', height: '500px', background: '#FAFAFA', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05)' }}>
                                    {/* @ts-ignore */}
                                    <n8n-demo 
                                        workflow={JSON.stringify(typeof previewTemplate.workflow === 'string' ? JSON.parse(previewTemplate.workflow) : (previewTemplate.workflow || {}))}
                                    />
                                </div>
                            ) : (
                                <div style={{ background: 'var(--muted)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                                    <h3 className={styles.metricLabel} style={{ marginBottom: '20px', display: 'block' }}>Trigger & Action Diagram</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {previewTemplate.blueprint.logic.map((step: string, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%', background: 'var(--card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: idx === 0 ? 'var(--accent-muted)' : 'var(--muted)', color: idx === 0 ? 'var(--accent)' : 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{idx === 0 ? '⚡' : '→'}</div>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--foreground)', fontWeight: 800 }}>{step}</p>
                                                </div>
                                                {idx < previewTemplate.blueprint.logic.length - 1 && <div style={{ width: '2px', height: '16px', background: 'var(--border)', alignSelf: 'center' }}></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ padding: '24px', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                    <label className={styles.metricLabel}>Projected Savings</label>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--accent)' }}>{previewTemplate.blueprint.impact.time}</div>
                                </div>
                                <div style={{ padding: '24px', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                    <label className={styles.metricLabel}>Precision</label>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--foreground)' }}>{previewTemplate.blueprint.impact.accuracy}</div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                            <button className={styles.btnPrimary} onClick={() => { setPreviewTemplate(null); handleAddClick(previewTemplate); }}>Use Template</button>
                        </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
