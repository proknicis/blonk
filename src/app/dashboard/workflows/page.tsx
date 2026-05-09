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
    const [activeWorkflowNames, setActiveWorkflowNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [configureTemplate, setConfigureTemplate] = useState<any>(null);
    const [previewTemplate, setPreviewTemplate] = useState<any>(null);
    const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({});
    const [helpStep, setHelpStep] = useState<any>(null);
    const [deployResult, setDeployResult] = useState<any>(null);
    const [step, setStep] = useState<'configure' | 'result'>('configure');

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
        return () => { 
            const existingScript = document.querySelector('script[src="/n8n-demo.js"]');
            if (existingScript) document.body.removeChild(existingScript); 
        };
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
                    return robustParse(parsed);
                } catch (e) { return []; }
            }
            if (typeof val === 'object' && val !== null) {
                return [val];
            }
            return [];
        };

        const reqs = robustParse(template.requirements);
        const guide = robustParse(template.setupGuide);

        if (reqs.length > 0 || guide.length > 0) {
            setConfigureTemplate({ ...template, parsedReqs: reqs, parsedGuide: guide });
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
                    performance: "0",
                    templateId: template.id,
                    inputs
                })
            });

            const data = await res.json();

            if (res.ok) {
                const orchestration = data.orchestration || {};
                setDeployResult(orchestration);
                
                setTimeout(() => {
                    setStep('result');
                    showToast(`Orchestration sequence initiated!`);
                }, 100);
                
                fetchMarketplace();
            } else {
                showToast(data.details || data.error || "Deployment failed.", 'error');
            }
        } catch (error) {
            console.error("Error deploying workflow:", error);
            showToast("Network disruption detected. Deployment sequence aborted.", 'error');
        } finally {
            setIsDeploying(false);
        }
    };

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleGoogleAuth = () => {
        const width = 600, height = 700;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;
        
        const authWindow = window.open(
            '/api/integrations/google/auth',
            'google-auth',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                const tokens = event.data.tokens;
                setTemplateInputs(prev => ({
                    ...prev,
                    google_creds: 'CONNECTED',
                    authData: tokens
                }));
                showToast("Google account linked successfully!");
                window.removeEventListener('message', handleMessage);
            }
        };

        window.addEventListener('message', handleMessage);
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
                <div className={styles.workflowGrid} id="marketplace-grid">
                    {filteredTemplates.map(wf => (
                        <div key={wf.id} className={styles.workflowCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.iconContainer}>
                                    <span style={{ fontSize: '32px' }}>
                                        {wf.icon === 'Zap' ? <Zap size={32} color="var(--accent)" /> : 
                                         wf.icon === 'Layers' ? <Layers size={32} color="var(--accent)" /> : 
                                         wf.icon === 'ShoppingCart' ? <ShoppingCart size={32} color="var(--accent)" /> :
                                         wf.icon === 'Search' ? <Search size={32} color="var(--accent)" /> :
                                         wf.icon || '⚙️'}
                                    </span>
                                </div>
                                <div className={styles.cardMeta}>
                                    <div className={styles.categoryBadge}>{wf.sector}</div>
                                    <div className={styles.complexityBadge}>Saves {wf.productInfo?.setupTime || wf.savings || '10h/mo'}</div>
                                </div>
                            </div>
                            
                            <div className={styles.cardBody}>
                                <h3 className={styles.workflowName}>{wf.name}</h3>
                                <p className={styles.workflowDesc}>{wf.description}</p>
                            </div>

                            <div className={styles.cardFooter}>
                                <div className={styles.statsRow}>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>{(wf.installs || (wf.id.charCodeAt(0) % 100) + 50)}</span>
                                        <span className={styles.statLabel}>Adoptions</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className={styles.btnSecondary} onClick={() => handlePreviewClick(wf)}>Preview</button>
                                    <button className={styles.btnPrimary} disabled={isDeploying} onClick={() => handleAddClick(wf)}>
                                        {isDeploying ? '...' : 'Install'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTemplates.length === 0 && (
                        <div className={styles.onboardingState}>
                             <div className={styles.onboardingIllustration}><Search size={48} /></div>
                             <h2 className={styles.onboardingTitle}>No Results Found</h2>
                             <p className={styles.onboardingSubtitle}>We couldn't find any workflows matching your current search parameters.</p>
                             <button className={styles.btnInstitutional} onClick={() => setSearch("")}>Reset Search</button>
                        </div>
                    )}
                </div>
            )}

            {toast && (
                <div className={styles.toast}>
                    <CheckCircle size={20} />
                    {toast}
                </div>
            )}

            {configureTemplate && (
                <ModalPortal>
                    <div className={styles.modalOverlay} onClick={() => setConfigureTemplate(null)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <button className={styles.closeButton} onClick={() => setConfigureTemplate(null)}>
                                <X size={20} />
                            </button>

                            {step === 'configure' ? (
                                <>
                                    <div className={styles.provisioningHeader}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
                                            <div className={styles.integrationIcon} style={{ background: 'var(--accent-muted)', color: 'var(--accent)', width: '80px', height: '80px' }}>
                                                <Zap size={40} />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span style={{ padding: '6px 12px', background: 'var(--accent)', color: 'white', borderRadius: '8px', fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase' }}>ORCHESTRATION</span>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Provision Workflow</span>
                                                </div>
                                                <h2 className={styles.sectionTitle} style={{ fontSize: '2.8rem', margin: '8px 0 4px 0', textTransform: 'none' }}>{configureTemplate.name}</h2>
                                                <p className={styles.guideStepText}>Establish secure connections and configure your autonomous loop.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={styles.stepIndicator}>
                                        <div className={`${styles.step} ${styles.stepActive}`}>
                                            <div className={styles.stepIcon}><Link size={24} /></div>
                                            <span className={styles.stepLabel}>Connect</span>
                                        </div>
                                        <div className={styles.step}>
                                            <div className={styles.stepIcon}><Settings size={24} /></div>
                                            <span className={styles.stepLabel}>Configure</span>
                                        </div>
                                        <div className={styles.step}>
                                            <div className={styles.stepIcon}><CheckCircle size={24} /></div>
                                            <span className={styles.stepLabel}>Finish</span>
                                        </div>
                                        <div className={styles.stepLine} />
                                    </div>

                                    <div style={{ marginBottom: '48px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
                                            <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', margin: 0 }}>Step 1: Authorization Registry</h3>
                                        </div>
                                        
                                        <div className={styles.requirementsList}>
                                            {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                                <div key={idx} className={styles.integrationDossier}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                        <div className={styles.integrationIcon}>
                                                            {req.name.toLowerCase().includes('stripe') ? <Euro size={24} color="var(--accent)" /> : 
                                                                req.name.toLowerCase().includes('google') ? <Search size={24} color="var(--accent)" /> : 
                                                                req.name.toLowerCase().includes('notion') ? <FileText size={24} color="var(--accent)" /> : <Key size={24} color="var(--accent)" />}
                                                        </div>
                                                        <div>
                                                            <div className={styles.integrationName}>{req.name === 'google_creds' ? 'Google Cloud Engine' : `${req.name.replace(/_/g, ' ')} Registry`}</div>
                                                            <div className={styles.integrationMeta} onClick={() => setHelpStep(req)}>
                                                                Connect the primary account for this loop <ArrowUpRight size={10} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button 
                                                            className={styles.btnPrimary} 
                                                            style={{ 
                                                                background: templateInputs[req.name] === 'CONNECTED' ? '#10B981' : 'var(--foreground)',
                                                                height: '52px',
                                                                padding: '0 24px',
                                                                borderRadius: '14px'
                                                            }} 
                                                            onClick={() => {
                                                                if (req.name.toLowerCase().includes('google') || req.name.toLowerCase().includes('gmail')) {
                                                                    handleGoogleAuth();
                                                                } else {
                                                                    setHelpStep(req);
                                                                }
                                                            }}
                                                        >
                                                            {templateInputs[req.name] === 'CONNECTED' ? <><CheckCircle size={18} /> CONNECTED</> : 'Secure Connection'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '48px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                            <div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }} />
                                            <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', margin: 0 }}>Step 2: Operational Parameters</h3>
                                        </div>
                                        
                                        <div className={styles.configFieldset}>
                                            {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                                <div key={idx} className={styles.fieldGroup}>
                                                    <label className={styles.fieldLabel}>
                                                        {req.name.replace(/_/g, ' ')} {req.required && <span style={{ color: 'var(--destructive)' }}>*</span>}
                                                    </label>
                                                    {templateInputs[req.name] === 'CONNECTED' ? (
                                                        <div style={{ padding: '20px 28px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '20px', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 950, fontSize: '1rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <CheckCircle size={18} /> Verified Connection
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            className={styles.fieldInput}
                                                            type={req.type === 'file' ? 'file' : 'text'}
                                                            placeholder={req.example || `Specify ${req.name}...`}
                                                            value={req.type === 'file' ? undefined : (templateInputs[req.name] || '')}
                                                            onChange={e => setTemplateInputs({...templateInputs, [req.name]: e.target.value})}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.premiumModalFooter} style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                                        <button className={styles.btnSecondary} onClick={() => setConfigureTemplate(null)}>Abort Setup</button>
                                        <button 
                                            className={styles.btnPrimary} 
                                            style={{ background: 'var(--accent)', color: 'white', width: '280px' }} 
                                            disabled={isDeploying} 
                                            onClick={() => deployWorkflow(configureTemplate, templateInputs)}
                                        >
                                            {isDeploying ? <><Activity size={20} className={styles.pulseDot} /> PROVISIONING...</> : 'Commission Loop'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>
                                        <ShieldCheck size={40} color="white" />
                                    </div>
                                    <h2 className={styles.sectionTitle} style={{ fontSize: '1.8rem', marginBottom: '12px' }}>(COMPLETED)</h2>
                                    <p className={styles.guideStepText} style={{ marginBottom: '48px', fontWeight: 800 }}>The workflow will be set up and synchronized in "x" time, please wait patiently.</p>
                                    
                                    <div style={{ background: '#FAFAFA', borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', textAlign: 'left', marginBottom: '48px' }}>
                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '20px' }}>Deployment report</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>target Server</span>
                                                <span style={{ fontWeight: 950, fontSize: '0.9rem', color: 'var(--accent)' }}>{deployResult?.server}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Server URL</span>
                                                <span style={{ fontWeight: 750, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{deployResult?.serverUrl}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Credentials Status</span>
                                                <span style={{ fontWeight: 950, fontSize: '0.9rem', color: deployResult?.credentialStatus?.includes('Failed') ? '#EF4444' : '#10B981' }}>{deployResult?.credentialStatus}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>n8n Deployment</span>
                                                <span style={{ fontWeight: 950, fontSize: '0.9rem', color: deployResult?.deploymentStatus?.includes('Failed') ? '#EF4444' : '#10B981' }}>{deployResult?.deploymentStatus}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button className={styles.btnPrimary} style={{ height: '64px', borderRadius: '20px', width: '100%' }} onClick={() => setConfigureTemplate(null)}>CLOSE & MONITOR FLEET</button>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalPortal>
            )}

            {helpStep && (
                <ModalPortal>
                    <div className={styles.guideModal} style={{ zIndex: 1100, background: 'rgba(0,0,0,0.6)' }}>
                        <div className={styles.guideContainer} style={{ maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 className={styles.sectionTitle}>Guide: {helpStep.name}</h3>
                                <button onClick={() => setHelpStep(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                                    <X size={20} />
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
                </ModalPortal>
            )}

            {previewTemplate && (
                <ModalPortal>
                    <div className={styles.guideModal}>
                        <div className={styles.guideContainer} style={{ maxWidth: '700px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                    <div className={styles.iconContainer}>
                                        {previewTemplate.icon === 'Zap' ? <Zap size={32} color="var(--accent)" /> : 
                                         previewTemplate.icon === 'Layers' ? <Layers size={32} color="var(--accent)" /> : 
                                         previewTemplate.icon || '⚙️'}
                                    </div>
                                    <div>
                                        <h2 className={styles.sectionTitle}>{previewTemplate.name}</h2>
                                        <p className={styles.guideStepText}>Workflow Architecture Preview</p>
                                    </div>
                                </div>
                                <button onClick={() => setPreviewTemplate(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                                    <X size={24} />
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
                                        <h3 className={styles.sectionTitle} style={{ fontSize: '0.8rem', marginBottom: '20px' }}>Logic Flow Diagram</h3>
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
                                        <label className={styles.fieldLabel}>Projected Savings</label>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--accent)' }}>{previewTemplate.blueprint.impact.time}</div>
                                    </div>
                                    <div style={{ padding: '24px', background: 'var(--muted)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                                        <label className={styles.fieldLabel}>Precision</label>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--foreground)' }}>{previewTemplate.blueprint.impact.accuracy}</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '40px' }}>
                                <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={() => { setPreviewTemplate(null); handleAddClick(previewTemplate); }}>Deploy Blueprint</button>
                            </div>
                        </div>
                    </div>
                </ModalPortal>
            )}
        </div>
    );
}
