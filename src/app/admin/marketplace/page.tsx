"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../dashboard/page.module.css";
import { 
    Plus, 
    Search, 
    Zap, 
    Trash2, 
    Edit3, 
    Activity, 
    TrendingUp, 
    ShieldCheck,
    RefreshCcw,
    Layers,
    ArrowUpRight,
    Eye,
    Copy,
    EyeOff,
    Star,
    Euro,
    ShoppingCart,
    BarChart
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";
import adminStyles from "../admin.module.css";

export default function MarketplaceManagementPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        totalRevenue: 0,
        avgConversion: 0
    });

    const [previewingTemplate, setPreviewingTemplate] = useState<any>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    useEffect(() => {
        fetchTemplates();
        const script = document.createElement("script");
        script.src = "/n8n-demo.js";
        script.type = "module";
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const fetchTemplates = async () => {
        try {
            const res = await fetch('/api/admin/templates');
            const data = await res.json();
            if (Array.isArray(data)) {
                setTemplates(data);
                const published = data.filter(t => t.status === 'Live').length;
                const revenue = data.reduce((acc, t) => acc + (parseFloat(t.revenue) || 0), 0);
                const conversions = data.map(t => parseFloat(t.conversionRate) || 0);
                const avgConv = conversions.length > 0 ? conversions.reduce((a, b) => a + b, 0) / conversions.length : 0;
                
                setStats({
                    total: data.length,
                    published: published,
                    totalRevenue: revenue,
                    avgConversion: avgConv
                });
            }
        } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };

    const updatePrice = async (template: any, newPrice: string) => {
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...template, price: parseFloat(newPrice) })
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchTemplates();
            setEditingPriceId(null);
        } catch (e: any) { 
            console.error("Price calibration failure:", e);
            alert(`Instruction Failure: Failed to update monetization parameters. ${e.message}`);
        }
    };

    const duplicateTemplate = async (template: any) => {
        try {
            const { id, createdAt, updatedAt, ...rest } = template;
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...rest, name: `${rest.name} (Copy)`, status: 'Draft' })
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            alert("Success: Protocol cloned into 'Draft' state.");
            fetchTemplates();
        } catch (e: any) { 
            console.error("Protocol cloning failure:", e);
            alert(`Fleet Instruction Failure: ${e.message}`);
        }
    };

    const toggleStatus = async (template: any, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...template, status: newStatus })
            });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchTemplates();
        } catch (e: any) { 
            console.error("Status state mutation failure:", e);
            alert(`Institutional Alert: Failed to transition protocol state. ${e.message}`);
        }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Permanently purge this administrative protocol? This action is irreversible.")) return;
        try {
            const res = await fetch(`/api/admin/templates?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            fetchTemplates();
        } catch (e: any) { 
            console.error("Protocol decommissioning failure:", e);
            alert(`Fleet Decommissioning Failure: ${e.message}`);
        }
    };

    const handlePreview = (template: any) => {
        setIsPreviewLoading(true);
        setPreviewingTemplate(template);
        setTimeout(() => setIsPreviewLoading(false), 800);
    };

    const filteredTemplates = templates.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.sector?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SkeletonRow = () => (
        <tr className={adminStyles.registryRow}>
            <td>
                <div className={adminStyles.loopDetail}>
                    <Skeleton width="48px" height="48px" borderRadius="14px" />
                    <div>
                        <Skeleton width="180px" height="20px" style={{ marginBottom: '8px' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <Skeleton width="80px" height="12px" />
                            <Skeleton width="40px" height="12px" />
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Skeleton width="90px" height="18px" />
                    <Skeleton width="110px" height="12px" />
                </div>
            </td>
            <td><Skeleton width="60px" height="20px" /></td>
            <td><Skeleton width="120px" height="32px" borderRadius="100px" /></td>
            <td><div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><Skeleton width="38px" height="38px" borderRadius="10px" /><Skeleton width="38px" height="38px" borderRadius="10px" /><Skeleton width="38px" height="38px" borderRadius="10px" /></div></td>
        </tr>
    );

    return (
        <div className={adminStyles.dashboard}>
            <div className={adminStyles.integrityPanel}>
                <div className={adminStyles.integrityHub}>
                    <div className={adminStyles.statusIndicatorHealthy}><div className={adminStyles.beaconPulse} /></div>
                    <div>
                        <h2 className={adminStyles.panelTitle}>Marketplace Registry: Synchronized</h2>
                        <p className={adminStyles.panelSubtitle}>Template library is globally distributed across firm nodes.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.refreshBtn} onClick={fetchTemplates} style={{ width: '48px', height: '48px', marginRight: '12px' }}>
                        <RefreshCcw size={18} className={isLoading ? styles.spinning : ''} />
                    </button>
                    <button className={adminStyles.refreshBtn} style={{ width: 'auto', padding: '0 24px', background: 'var(--foreground)', color: 'var(--background)', border: 'none' }} onClick={() => router.push("/admin/marketplace/builder")}>
                        <Plus size={16} style={{ marginRight: '8px' }} /> Provision Protocol
                    </button>
                </div>
            </div>

            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Library Assets</span>
                        <Layers size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="40px" /> : stats.total}</div>
                    <div className={adminStyles.metricDetail}>Provisioned marketplace protocols</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Total Liquidity</span>
                        <Euro size={14} color="var(--accent)" />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="40px" /> : `€${stats.totalRevenue.toLocaleString()}`}</div>
                    <div className={adminStyles.metricDetail}>Aggregate platform revenue</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Avg Conversion</span>
                        <TrendingUp size={14} color="var(--accent)"/>
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="80px" height="40px" /> : `${stats.avgConversion.toFixed(1)}%`}</div>
                    <div className={adminStyles.metricDetail}>Investor to operator conversion</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>Protocol State</span>
                        <ShieldCheck size={14} color="var(--accent)" />
                    </div>
                    <div className={adminStyles.metricAmount}>V3.4</div>
                    <div className={adminStyles.metricDetail}>Sovereign encryption standards</div>
                </div>
            </div>

            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Protocol Catalog</h3>
                        <p className={adminStyles.registrySubtitle}>Orchestrate the institutional marketplace library.</p>
                    </div>
                    <div className={adminStyles.searchContainer}>
                        <Search size={18} className={adminStyles.searchIcon} />
                        <input 
                            type="text" 
                            placeholder="Filter protocols by name or sector..." 
                            className={adminStyles.searchField} 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={adminStyles.tableWrapper}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>Protocol Product</th>
                                <th className={adminStyles.registryTH}>Monetization</th>
                                <th className={adminStyles.registryTH}>Conversion</th>
                                <th className={adminStyles.registryTH}>Operational State</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : (
                                filteredTemplates.map(t => (
                                    <tr key={t.id} className={adminStyles.registryRow}>
                                        <td>
                                            <div className={adminStyles.loopDetail}>
                                                <div className={adminStyles.loopIcon}>
                                                    {t.icon === 'Zap' ? <Zap size={20} /> : <Layers size={20} />}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div className={adminStyles.loopName}>{t.name}</div>
                                                        {t.featured && <Star size={14} color="var(--accent)" fill="var(--accent)" />}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                        <code className={adminStyles.identityHash}>{t.sector?.toUpperCase() || "GENERAL"}</code>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 800 }}>ID: {t.id.substring(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 950, color: 'var(--foreground)' }}>
                                                {editingPriceId === t.id ? (
                                                    <input 
                                                        autoFocus
                                                        style={{ background: 'var(--muted)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '8px', width: '100px', color: 'var(--foreground)', fontWeight: 950, outline: 'none' }}
                                                        value={tempPrice}
                                                        onChange={e => setTempPrice(e.target.value)}
                                                        onBlur={() => updatePrice(t, tempPrice)}
                                                        onKeyDown={e => e.key === 'Enter' && updatePrice(t, tempPrice)}
                                                    />
                                                ) : (
                                                    <div onClick={() => { setEditingPriceId(t.id); setTempPrice(String(t.price || 0)); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Euro size={14} color="var(--muted-foreground)" />
                                                        {parseFloat(t.price || 0).toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 800, marginTop: '2px' }}>Revenue: €{(parseFloat(t.revenue) || 0).toLocaleString()}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ fontWeight: 950, color: 'var(--accent)' }}>{parseFloat(t.conversionRate || 0).toFixed(1)}%</div>
                                                <TrendingUp size={12} color="var(--accent)" />
                                            </div>
                                        </td>
                                        <td>
                                            <select 
                                                className={adminStyles.filterBtn}
                                                style={{ padding: '6px 16px', borderRadius: '100px', border: '1px solid var(--border)', background: t.status === 'Live' ? 'var(--accent-muted)' : 'var(--muted)', color: t.status === 'Live' ? 'var(--accent)' : 'var(--muted-foreground)', fontWeight: 950, fontSize: '0.7rem' }}
                                                value={t.status}
                                                onChange={(e) => toggleStatus(t, e.target.value)}
                                            >
                                                <option value="Draft">DRAFT</option>
                                                <option value="Live">LIVE</option>
                                                <option value="Hidden">HIDDEN</option>
                                            </select>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className={adminStyles.actionIconBtn} onClick={() => handlePreview(t)} title="Preview Workflow"><Eye size={16} /></button>
                                                <button className={adminStyles.actionIconBtn} onClick={() => duplicateTemplate(t)} title="Clone Protocol"><Copy size={16} /></button>
                                                <button className={adminStyles.actionIconBtn} onClick={() => router.push(`/admin/marketplace/builder?id=${t.id}`)} title="Edit Configuration"><Edit3 size={16} /></button>
                                                <button className={adminStyles.actionIconBtn} style={{ color: 'var(--destructive)' }} onClick={() => deleteTemplate(t.id)} title="Purge Protocol"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PROTOCOL PREVIEW MODAL */}
            {previewingTemplate && (
                <div className={adminStyles.modalOverlay} onClick={() => setPreviewingTemplate(null)}>
                    <div className={adminStyles.modal} style={{ maxWidth: '1000px' }} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader} style={{ padding: '32px 48px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--muted-foreground)' }}>Protocol Preview</span>
                                    </div>
                                    <h3 className={adminStyles.modalTitle} style={{ fontSize: '1.75rem' }}>{previewingTemplate.name}</h3>
                                    <p className={adminStyles.modalSubtitle}>Sovereign n8n Workflow Visualization</p>
                                </div>
                                <button className={adminStyles.refreshBtn} onClick={() => setPreviewingTemplate(null)} style={{ border: 'none', background: 'var(--muted)' }}>
                                    <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                                </button>
                            </div>
                        </div>

                        <div className={adminStyles.modalBody} style={{ padding: '0', position: 'relative', height: '600px', background: '#FAFAFA' }}>
                            {isPreviewLoading ? (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--card)', zIndex: 10 }}>
                                    <RefreshCcw size={40} className={styles.spinning} color="var(--accent)" />
                                    <p style={{ marginTop: '24px', fontWeight: 950, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>Initializing Preview Engine...</p>
                                </div>
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '0 0 40px 40px', overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.05)' }}>
                                    {/* @ts-ignore */}
                                    <n8n-demo 
                                        workflow={JSON.stringify(typeof previewingTemplate.workflow === 'string' ? JSON.parse(previewingTemplate.workflow) : (previewingTemplate.workflow || { 
                                            nodes: [
                                                { name: 'Onboarding Webhook', type: 'Webhook', position: [100, 250] },
                                                { name: 'Protocol Logic', type: 'Code', position: [350, 250] },
                                                { name: 'Secure Database', type: 'MySQL', position: [600, 250] }
                                            ]
                                        }))}
                                    />
                                    {/* Fallback if logic requires it */}
                                    <noscript>Preview not available</noscript>
                                </div>
                            )}
                        </div>
                        
                        <div className={adminStyles.modalFooter} style={{ padding: '24px 48px' }}>
                             <button className={adminStyles.refreshBtn} style={{ width: 'auto', padding: '0 32px', height: '52px', borderRadius: '16px', background: 'var(--foreground)', color: 'var(--background)' }} onClick={() => router.push(`/admin/marketplace/builder?id=${previewingTemplate.id}`)}>
                                Edit Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
