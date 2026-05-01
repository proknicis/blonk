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
                    return robustParse(parsed);
                } catch (e) { return []; }
            }
            if (typeof val === 'object' && val !== null) {
                // If it's a single object, wrap it in an array
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
                console.log("[DEBUG_ORCHESTRATION] Received Data:", orchestration);
                
                // Set result data first
                setDeployResult(orchestration);
                
                // Small delay to ensure state is committed before UI transition
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
                <div className={styles.workflowGrid}>
                    {filteredTemplates.map(wf => (
                        <div key={wf.id} className={styles.workflowCard}>
                            {wf.featured === 1 && <div className={styles.cardFeatured}>Featured</div>}
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
                                    <span style={{ color: 'var(--accent)', fontWeight: 950 }}>Saves {wf.productInfo?.setupTime || wf.savings || '10h/mo'}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <label>Adoption</label>
                                    <span>Used by {(wf.installs || (wf.id.charCodeAt(0) % 100) + 50)} teams</span>
                                </div>
                            </div>

                             <div className={styles.cardFooter}>
                                    <button 
                                        className={styles.btnPrimary} 
                                        disabled={isDeploying}
                                        onClick={() => handleAddClick(wf)}
                                    >
                                        {isDeploying ? 'Processing...' : 'Add to Firm'}
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
                            
                            {/* MISSION CONTROL HEADER */}
                            <div className={styles.modalIntegrityHeader}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                                    <div className={styles.iconContainer} style={{ margin: 0 }}>
                                        {configureTemplate.icon === 'Zap' ? <Zap size={40} color="var(--accent)" /> : <Layers size={40} color="var(--accent)" />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                            <div style={{ padding: '4px 8px', background: 'var(--accent)', color: 'var(--background)', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>ORCHESTRATION</div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)' }}>PROTOCOL INITIALIZATION</span>
                                        </div>
                                        <h2 className={styles.sectionTitle} style={{ fontSize: '2rem' }}>Provision {configureTemplate.name}</h2>
                                        <p className={styles.guideStepText}>Calibrate the autonomous loop for your firm's environment.</p>
                                    </div>
                                </div>
                                <button onClick={() => setConfigureTemplate(null)} style={{ background: 'var(--muted)', border: 'none', cursor: 'pointer', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* PROVISIONING TIMELINE */}
                            <div className={styles.timelineInstitutional}>
                                <div className={`${styles.timelineStep} ${styles.timelineStepActive}`}>
                                    <div className={styles.timelineIconBox}><Link size={20} color="var(--accent)" /></div>
                                    <div className={styles.timelineLabel}>CONNECT</div>
                                </div>
                                <div className={styles.timelineConnector} />
                                <div className={`${styles.timelineStep} ${templateInputs && Object.keys(templateInputs).length > 0 ? styles.timelineStepActive : ''}`}>
                                    <div className={styles.timelineIconBox}><Settings size={20} /></div>
                                    <div className={styles.timelineLabel}>CONFIGURE</div>
                                </div>
                                <div className={styles.timelineConnector} />
                                <div className={styles.timelineStep}>
                                    <div className={styles.timelineIconBox}><Cpu size={20} /></div>
                                    <div className={styles.timelineLabel}>RESULT</div>
                                </div>
                            </div>

                            {/* CONDITIONAL RENDERING BASED ON STEP */}
                            {step === 'configure' ? (
                                <>
                                    {/* INTEGRATION DOSSIERS */}
                                    {configureTemplate.parsedReqs && configureTemplate.parsedReqs.length > 0 && (
                                        <div style={{ marginBottom: '48px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                                <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
                                                <h3 className={styles.sectionTitle} style={{ fontSize: '1rem' }}>STEP 01: ESTABLISH HANDSHAKE</h3>
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
                                                                <div className={styles.integrationName}>{req.name} Registry</div>
                                                                <div className={styles.integrationMeta} onClick={() => setHelpStep(req)}>
                                                                    Retrieve Institutional Credentials <ArrowUpRight size={10} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <button className={styles.btnSecondary} style={{ width: 'auto', padding: '0 20px', height: '44px', borderRadius: '12px' }} onClick={() => setHelpStep(req)}>MANUAL</button>
                                                            <button 
                                                                className={styles.btnPrimary} 
                                                                style={{ 
                                                                    width: 'auto', 
                                                                    padding: '0 24px', 
                                                                    height: '44px', 
                                                                    borderRadius: '12px', 
                                                                    background: templateInputs.google_creds === 'CONNECTED' ? '#10B981' : 'var(--foreground)' 
                                                                }} 
                                                                onClick={() => {
                                                                    if (req.name.toLowerCase().includes('google') || req.name.toLowerCase().includes('gmail')) {
                                                                        handleGoogleAuth();
                                                                    } else {
                                                                        setHelpStep(req);
                                                                    }
                                                                }}
                                                            >
                                                                {templateInputs.google_creds === 'CONNECTED' ? 'CONNECTED' : 'AUTHENTICATE'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* CONFIGURATION FIELDSET */}
                                    <div style={{ marginBottom: '48px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                            <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }} />
                                            <h3 className={styles.sectionTitle} style={{ fontSize: '1rem' }}>STEP 02: CALIBRATE PARAMETERS</h3>
                                        </div>
                                        <div className={styles.configFieldset}>
                                            {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                                <div key={idx} className={styles.fieldGroup}>
                                                    <label className={styles.fieldLabel}>
                                                        {req.name} {req.required && <span style={{ color: 'var(--destructive)' }}>*</span>}
                                                    </label>
                                                    <input 
                                                        className={styles.fieldInput}
                                                        type={req.type === 'file' ? 'file' : 'text'}
                                                        placeholder={req.example || `Enter ${req.name}...`}
                                                        value={req.type === 'file' ? undefined : (templateInputs[req.name] || '')}
                                                        onChange={e => setTemplateInputs({...templateInputs, [req.name]: e.target.value})}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className={styles.premiumModalFooter} style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                                        <button className={styles.btnSecondary} style={{ height: '64px', borderRadius: '20px', width: '200px' }} onClick={() => setConfigureTemplate(null)}>CANCEL</button>
                                        
                                        <button 
                                            className={styles.btnPrimary} 
                                            style={{ height: '64px', borderRadius: '20px', background: 'var(--accent)', color: 'var(--background)', width: '300px' }} 
                                            disabled={isDeploying} 
                                            onClick={async () => {
                                                setIsDeploying(true);
                                                try {
                                                    console.log("[DEBUG] Syncing credentials initiated...");
                                                    let nodes = [];
                                                    try {
                                                        const nodeRes = await fetch('/api/nodes');
                                                        nodes = await nodeRes.json();
                                                    } catch (e) { console.error("Failed to fetch nodes", e); }
                                                    
                                                    const targetNode = Array.isArray(nodes) ? nodes[0] : null;

                                                    const payload = {
                                                        nodeId: targetNode?.id || null,
                                                        type: 'gmailOAuth2Api', 
                                                        name: `Google-Loop-${Date.now()}`,
                                                        data: {
                                                            accessToken: templateInputs.authData?.access_token,
                                                            refreshToken: templateInputs.authData?.refresh_token,
                                                            expiry: templateInputs.authData?.expiry_date,
                                                            scope: templateInputs.authData?.scope,
                                                            tokenType: templateInputs.authData?.token_type
                                                        }
                                                    };

                                                    console.log("[DEBUG] Sending Payload:", payload);

                                                    const res = await fetch('/api/n8n/credentials', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify(payload)
                                                    });
                                                    const data = await res.json();
                                                    if (res.ok) {
                                                        showToast("Credentials provisioned successfully!");
                                                        setStep('result');
                                                        setDeployResult({
                                                            server: targetNode?.name || 'Auto-Selected Node',
                                                            serverUrl: targetNode?.url || 'https://n8n.manadavana.lv',
                                                            credentialStatus: 'Success',
                                                            deploymentStatus: 'Skipped (Provision Only)'
                                                        });
                                                    } else {
                                                        showToast(data.details || data.error, 'error');
                                                    }
                                                } catch (e) {
                                                    showToast("Provisioning failed", 'error');
                                                } finally {
                                                    setIsDeploying(false);
                                                }
                                            }}
                                        >
                                            {isDeploying ? 'PROVISIONING...' : 'PROVISION TO CLUSTER'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 30px rgba(16, 185, 129, 0.3)' }}>
                                        <ShieldCheck size={40} color="white" />
                                    </div>
                                    <h2 className={styles.sectionTitle} style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Orchestration Successful</h2>
                                    <p className={styles.guideStepText} style={{ marginBottom: '48px' }}>The sovereign loop has been provisioned and synchronized with the institutional cluster.</p>
                                    
                                    <div style={{ background: '#FAFAFA', borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', textAlign: 'left', marginBottom: '48px' }}>
                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: '20px' }}>Deployment Dossier</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Target Node</span>
                                                <span style={{ fontWeight: 950, fontSize: '0.9rem', color: 'var(--accent)' }}>{deployResult?.server}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>Node URL</span>
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

                                    <button className={styles.btnPrimary} style={{ height: '64px', borderRadius: '20px' }} onClick={() => setConfigureTemplate(null)}>CLOSE & MONITOR FLEET</button>
                                </div>
                            )}
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
