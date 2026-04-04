"use client";

import styles from "./workflows.module.css";
import React, { useState, useEffect } from "react";

export default function WorkflowsPage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [templates, setTemplates] = useState<any[]>([]);
    const [activeWorkflowNames, setActiveWorkflowNames] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [configureTemplate, setConfigureTemplate] = useState<any>(null);
    const [templateInputs, setTemplateInputs] = useState<Record<string, any>>({});
    const [isDeploying, setIsDeploying] = useState(false);
    const [isCapacityFull, setIsCapacityFull] = useState(false);
    const [usageLimits, setUsageLimits] = useState({ loops: 1 });

    const categories = ["All", "Accounting", "Law", "HR", "IT", "General"];

    useEffect(() => {
        fetchMarketplace();
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
        const isNotActive = !activeWorkflowNames.includes(wf.name);
        return matchesSearch && matchesCategory && isNotActive;
    });

    return (
        <div className={styles.workflowsContainer}>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1>Automate Everything<span style={{ color: '#34D186' }}>.</span></h1>
                    <p>Select specialized document loops for your firm. Once added, our team will link the autonomous backend to your environment.</p>
                    <div className={styles.heroStats} style={{ marginTop: '32px' }}>
                        <div className={styles.heroStat}>
                            <label>Ready Loops</label>
                            <span>{templates.length}+</span>
                        </div>
                        <div className={styles.heroStat}>
                            <label>Success Rate</label>
                            <span>99.9%</span>
                        </div>
                        <div className={styles.heroStat}>
                            <label>Avg. Setup</label>
                            <span>&lt; 24h</span>
                        </div>
                    </div>
                </div>
            </section>

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
                        placeholder="Search autonomous loops..."
                        className={styles.searchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Connecting to autonomous loop registry...</div>
            ) : (
                <div className={styles.workflowGrid}>
                    {filteredTemplates.map(wf => (
                        <div key={wf.id} className={styles.workflowCard}>
                            {wf.featured === 1 && <div className={styles.cardFeatured}>Featured</div>}
                            <div className={styles.cardHeader}>
                                <div className={styles.iconContainer} style={{ backgroundColor: wf.color || '#F8F9FA' }}>
                                    <span style={{ fontSize: '32px' }}>{wf.icon || '⚙️'}</span>
                                </div>
                                <h3>{wf.name}</h3>
                                <p>{wf.description}</p>
                            </div>

                            <div className={styles.metadataGrid}>
                                <div className={styles.metaItem}>
                                    <label>Sector</label>
                                    <span>{wf.sector}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <label>Avg. Saving</label>
                                    <span>{wf.savings}</span>
                                </div>
                                <div className={styles.metaItem}>
                                    <label>Complexity</label>
                                    <span>{wf.complexity}</span>
                                </div>
                            </div>

                             <div className={styles.cardFooter}>
                                    <button className={styles.btnPrimary} style={{ width: '100%' }} onClick={() => handleAddClick(wf)}>
                                        Add to Firm
                                    </button>
                                    <button className={styles.btnSecondary} style={{ width: '100%' }}>
                                        Preview
                                    </button>
                            </div>
                        </div>
                    ))}
                    {filteredTemplates.length === 0 && (
                        <div className={styles.loading}>No new autonomous loops match your criteria.</div>
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
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: configureTemplate.color || '#F8F9FA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                {configureTemplate.icon || '⚙️'}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Configure Workflow</h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>Provide necessary requirements for {configureTemplate.name}</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '12px' }}>
                            {configureTemplate.parsedGuide && configureTemplate.parsedGuide.length > 0 && (
                                <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginTop: 0, marginBottom: '12px', textTransform: 'uppercase' }}>Setup Instructions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {configureTemplate.parsedGuide.map((step: any, idx: number) => (
                                            <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                                                <div style={{ width: '24px', height: '24px', background: '#0F172A', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>{idx + 1}</div>
                                                <div>
                                                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#0F172A' }}>{step.title}</h4>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', whiteSpace: 'pre-wrap' }}>{step.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {configureTemplate.parsedReqs && configureTemplate.parsedReqs.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase' }}>Required Inputs</h3>
                                    {configureTemplate.parsedReqs.map((req: any, idx: number) => (
                                <div key={idx}>
                                    <label style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px', color: '#1E293B' }}>
                                        {req.name}
                                        {req.isOptional && <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>}
                                    </label>
                                    
                                    {req.type === 'textarea' ? (
                                        <textarea 
                                            className={styles.searchInput}
                                            style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', resize: 'vertical' }}
                                            placeholder={`Enter ${req.name}...`}
                                            value={templateInputs[req.name] || ''}
                                            onChange={e => setTemplateInputs({...templateInputs, [req.name]: e.target.value})}
                                        />
                                    ) : req.type === 'boolean' ? (
                                        <select 
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                                            value={templateInputs[req.name] || ''}
                                            onChange={e => setTemplateInputs({...templateInputs, [req.name]: e.target.value})}
                                        >
                                            <option value="">Select option...</option>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    ) : (
                                        <input 
                                            className={styles.searchInput}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#ffffff' }}
                                            type={req.type === 'file' ? 'file' : 'text'}
                                            placeholder={`Enter ${req.name}...`}
                                            value={req.type === 'file' ? undefined : (templateInputs[req.name] || '')}
                                            onChange={e => setTemplateInputs({...templateInputs, [req.name]: e.target.value})}
                                        />
                                    )}
                                </div>
                            ))}
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button 
                                className={styles.btnSecondary} 
                                style={{ flex: 1, padding: '14px', borderRadius: '8px', fontWeight: 600, border: '1px solid #E2E8F0', background: '#F8FAFC' }}
                                onClick={() => setConfigureTemplate(null)}
                            >
                                Cancel
                            </button>
                            <button 
                                className={styles.btnPrimary} 
                                style={{ flex: 1, padding: '14px', borderRadius: '8px', fontWeight: 600, background: '#1E293B', color: 'white' }}
                                disabled={isDeploying || configureTemplate.parsedReqs.some((r: any) => !r.isOptional && !templateInputs[r.name])}
                                onClick={() => deployWorkflow(configureTemplate, templateInputs)}
                            >
                                {isDeploying ? 'Deploying...' : 'Deploy to Firmware'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
