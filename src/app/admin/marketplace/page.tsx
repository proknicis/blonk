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

    const Sparkline = ({ data, color }: { data: number[], color: string }) => (
        <svg width="80" height="24" viewBox="0 0 100 30" style={{ overflow: 'visible' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data.map((val, i) => `${(i / (data.length - 1)) * 100},${30 - (val / 100) * 30}`).join(' ')}
                style={{ filter: `drop-shadow(0 0 4px ${color}44)` }}
            />
        </svg>
    );

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* MISSION CONTROL HEADER - MARKETPLACE DISTRIBUTION */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', border: 'none', padding: '40px 48px', borderRadius: '32px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '64px', height: '64px', background: 'var(--background)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
                            <ShoppingCart size={32} color="var(--foreground)" />
                        </div>
                        <div style={{ position: 'absolute', -8: '-8px', -8: '-8px', width: '20px', height: '20px', background: '#10B981', borderRadius: '50%', border: '4px solid var(--foreground)', boxShadow: '0 0 10px #10B981' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '4px 10px', background: 'var(--accent)', color: 'var(--background)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>SOVEREIGN ASSETS</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>PROTOCOL REGISTRY</span>
                        </div>
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Marketplace Distribution</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Institutional Library: <span style={{ color: 'var(--background)' }}>{templates.length} provisioned protocols</span> across global sectors.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button 
                        className={adminStyles.primaryBtn}
                        style={{ background: 'var(--background)', color: 'var(--foreground)', height: '64px', padding: '0 32px', borderRadius: '20px', border: 'none', fontWeight: 950, fontSize: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                        onClick={() => router.push("/admin/marketplace/builder")}
                    >
                        <Plus size={20} style={{ marginRight: '12px' }} /> PROVISION PROTOCOL
                    </button>
                </div>
            </div>

            {/* HIGH-FIDELITY METRICS */}
            <div className={adminStyles.metricMatrix}>
                {[
                    { label: 'Library Assets', value: stats.total, detail: 'Provisioned marketplace protocols', icon: <Layers size={20} /> },
                    { label: 'Total Liquidity', value: `€${stats.totalRevenue.toLocaleString()}`, detail: 'Aggregate platform revenue', icon: <Euro size={20} color="var(--accent)" /> },
                    { label: 'Avg Conversion', value: `${stats.avgConversion.toFixed(1)}%`, detail: 'Investor to operator conversion', icon: <TrendingUp size={20} color="var(--accent)" /> },
                    { label: 'Protocol Stats', value: 'V3.4', detail: 'Sovereign encryption standards', icon: <ShieldCheck size={20} color="var(--accent)" /> }
                ].map((m, i) => (
                    <div key={i} className={adminStyles.adminMetricCard} style={{ padding: '40px' }}>
                        <div className={adminStyles.metricMeta}>
                            <span className={adminStyles.metricTag} style={{ fontSize: '0.7rem', letterSpacing: '0.15em' }}>{m.label}</span>
                            <div style={{ width: '32px', height: '32px', background: 'var(--muted)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {m.icon}
                            </div>
                        </div>
                        <div className={adminStyles.metricAmount} style={{ fontSize: '3rem', margin: '24px 0 12px' }}>{isLoading ? <Skeleton width="80px" height="48px" /> : m.value}</div>
                        <div className={adminStyles.metricDetail} style={{ fontSize: '0.9rem', fontWeight: 750 }}>{m.detail}</div>
                    </div>
                ))}
            </div>

            {/* DISTRIBUTION REGISTRY */}
            <div className={adminStyles.registryCard} style={{ padding: '48px', borderRadius: '40px' }}>
                <div className={adminStyles.registryHeader} style={{ marginBottom: '56px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {["All", "Law", "Finance", "General", "Enterprise"].map(f => (
                            <button 
                                key={f}
                                type="button"
                                style={{ padding: '10px 24px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 950, border: '1px solid var(--border)', background: 'transparent', transition: 'all 0.2s' }}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div style={{ position: 'relative', width: '380px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                        <input 
                            type="text" 
                            placeholder="Filter protocols..." 
                            className={adminStyles.searchField}
                            style={{ paddingLeft: '56px', width: '100%', height: '56px', borderRadius: '16px', background: 'var(--muted)' }}
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
                                <th className={adminStyles.registryTH}>Commercial Status</th>
                                <th className={adminStyles.registryTH}>Growth Pulse</th>
                                <th className={adminStyles.registryTH}>Version</th>
                                <th className={adminStyles.registryTH}>Distribution State</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => <SkeletonRow key={i} />)
                            ) : (
                                filteredTemplates.map(t => (
                                    <tr key={t.id} className={adminStyles.registryRow}>
                                        <td style={{ padding: '32px 16px' }}>
                                            <div className={adminStyles.loopDetail}>
                                                <div style={{ width: '56px', height: '56px', background: 'var(--muted)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--foreground)', border: '1px solid var(--border)' }}>
                                                    {t.icon === 'Zap' ? <Zap size={24} /> : <Layers size={24} />}
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <div className={adminStyles.loopName} style={{ fontSize: '1.1rem' }}>{t.name}</div>
                                                        {t.featured && <div style={{ background: '#10B98120', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 950 }}>FEATURED</div>}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>{t.sector || "GENERAL"}</span>
                                                        <span style={{ color: 'var(--border)' }}>•</span>
                                                        <code style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800 }}>{String(t.id).substring(0, 8)}</code>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 950, color: 'var(--foreground)', fontSize: '1.1rem', marginBottom: '6px' }}>
                                                {editingPriceId === t.id ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Euro size={16} />
                                                        <input 
                                                            autoFocus
                                                            style={{ background: 'var(--muted)', border: '1px solid var(--accent)', padding: '6px 12px', borderRadius: '10px', width: '100px', color: 'var(--foreground)', fontWeight: 950, outline: 'none' }}
                                                            value={tempPrice}
                                                            onChange={e => setTempPrice(e.target.value)}
                                                            onBlur={() => updatePrice(t, tempPrice)}
                                                            onKeyDown={e => e.key === 'Enter' && updatePrice(t, tempPrice)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div onClick={() => { setEditingPriceId(t.id); setTempPrice(String(t.price || 0)); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Euro size={18} color="#10B981" />
                                                        {parseFloat(t.price || 0).toFixed(2)}
                                                        <Edit3 size={12} style={{ opacity: 0.3 }} />
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 850 }}>LIFETIME: <span style={{ color: 'var(--foreground)' }}>€{(parseFloat(t.revenue) || 0).toLocaleString()}</span></div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <Sparkline data={[10, 20, 15, 40, 30, 60, 55]} color="#10B981" />
                                                <div style={{ fontSize: '0.75rem', fontWeight: 950, color: '#10B981', background: '#10B98115', padding: '4px 8px', borderRadius: '6px' }}>
                                                    {t.conversionRate || 0}%
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <code style={{ fontSize: '0.7rem', padding: '6px 10px', background: 'var(--muted)', borderRadius: '8px', fontWeight: 950, color: 'var(--foreground)' }}>v{t.version || '1.0.0'}</code>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: t.status === 'Live' ? '#10B98115' : 'var(--muted)', padding: '8px 16px', borderRadius: '100px', width: 'fit-content' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.status === 'Live' ? '#10B981' : 'var(--muted-foreground)', boxShadow: t.status === 'Live' ? '0 0 10px #10B981' : 'none' }} />
                                                <span style={{ fontWeight: 950, fontSize: "0.7rem", color: t.status === 'Live' ? '#10B981' : 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.status === 'Live' ? 'PUBLISHED' : t.status.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button className={adminStyles.actionIconBtn} onClick={() => handlePreview(t)} title="Preview Engine" style={{ width: '44px', height: '44px' }}><Eye size={18} /></button>
                                                <button className={adminStyles.actionIconBtn} onClick={() => router.push(`/admin/marketplace/builder?id=${t.id}`)} title="Edit Configuration" style={{ width: '44px', height: '44px' }}><Edit3 size={18} /></button>
                                                <button className={adminStyles.actionIconBtn} style={{ width: '44px', height: '44px', color: '#EF4444', border: '1px solid #EF444420' }} onClick={() => deleteTemplate(t.id)} title="Decommission Protocol"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {!isLoading && filteredTemplates.length === 0 && (
                        <div className={adminStyles.emptyState} style={{ padding: '160px 48px' }}>
                             <div style={{ width: '100px', height: '100px', background: 'var(--muted)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                                <ShoppingCart size={48} color="var(--muted-foreground)" />
                             </div>
                             <p style={{ fontWeight: 950, color: 'var(--foreground)', fontSize: '1.5rem', letterSpacing: '-0.02em' }}>No protocols provisioned.</p>
                             <p style={{ color: 'var(--muted-foreground)', fontWeight: 750, marginTop: '12px', maxWidth: '320px', lineHeight: 1.6 }}>Deploy your first administrative protocol using the Builder above.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PROTOCOL PREVIEW MODAL */}
            {previewingTemplate && (
                <div className={adminStyles.modalOverlay} style={{ backdropFilter: 'blur(16px)', background: 'rgba(250, 250, 250, 0.4)' }} onClick={() => setPreviewingTemplate(null)}>
                    <div className={adminStyles.modal} style={{ maxWidth: '1100px', border: '1px solid var(--border)', boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.12)' }} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader} style={{ padding: '40px 48px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, var(--card) 0%, var(--background) 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                                        <div style={{ background: 'var(--accent)', color: 'var(--background)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>LIVE PREVIEW</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--muted-foreground)' }}>PROTOCOL VISUALIZATION</span>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--foreground)' }}>{previewingTemplate.name}</h3>
                                    <p style={{ margin: '8px 0 0', fontSize: '1rem', color: 'var(--muted-foreground)', fontWeight: 750 }}>Sovereign Orchestration Logic for <span style={{ color: 'var(--foreground)' }}>{previewingTemplate.sector || "General"}</span> operations.</p>
                                </div>
                                <button className={adminStyles.modalClose} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPreviewingTemplate(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className={adminStyles.modalBody} style={{ padding: '0', position: 'relative', height: '640px', background: 'var(--background)' }}>
                            {isPreviewLoading ? (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', zIndex: 10 }}>
                                    <RefreshCcw size={48} className={adminStyles.spinning} color="var(--accent)" />
                                    <p style={{ marginTop: '24px', fontWeight: 950, color: 'var(--foreground)', letterSpacing: '-0.02em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Initializing Visualization Engine...</p>
                                </div>
                            ) : (
                                <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
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
                                </div>
                            )}
                        </div>
                        
                        <div className={adminStyles.modalFooter} style={{ padding: '32px 48px', background: 'var(--muted)' }}>
                             <button 
                                className={adminStyles.primaryBtn} 
                                style={{ height: '64px', padding: '0 40px', borderRadius: '20px' }} 
                                onClick={() => router.push(`/admin/marketplace/builder?id=${previewingTemplate.id}`)}
                            >
                                EDIT PROTOCOL CONFIGURATION
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
