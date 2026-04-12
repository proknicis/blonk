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

    useEffect(() => {
        fetchTemplates();
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
            if (res.ok) {
                fetchTemplates();
                setEditingPriceId(null);
            }
        } catch (e) { console.error(e); }
    };

    const duplicateTemplate = async (template: any) => {
        try {
            const { id, createdAt, ...rest } = template;
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...rest, name: `${rest.name} (Copy)`, status: 'Draft' })
            });
            if (res.ok) fetchTemplates();
        } catch (e) { console.error(e); }
    };

    const toggleStatus = async (template: any, newStatus: string) => {
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...template, status: newStatus })
            });
            if (res.ok) fetchTemplates();
        } catch (e) { console.error(e); }
    };

    const toggleFeatured = async (template: any) => {
        try {
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...template, featured: !template.featured })
            });
            if (res.ok) fetchTemplates();
        } catch (e) { console.error(e); }
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Permanently delete this template?")) return;
        try {
            const res = await fetch(`/api/admin/templates?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchTemplates();
        } catch (e) { console.error(e); }
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
                        <Skeleton width="100px" height="12px" />
                    </div>
                </div>
            </td>
            <td><Skeleton width="100px" height="24px" /></td>
            <td><Skeleton width="80px" height="24px" /></td>
            <td><Skeleton width="120px" height="28px" borderRadius="100px" /></td>
            <td><div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}><Skeleton width="38px" height="38px" borderRadius="10px" /><Skeleton width="38px" height="38px" borderRadius="10px" /></div></td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            <div className={adminStyles.integrityPanel}>
                <div className={adminStyles.integrityHub}>
                    <div className={adminStyles.statusBeacon}><div className={adminStyles.beaconPulse} /></div>
                    <div>
                        <h4 className={adminStyles.panelTitle}>Marketplace Registry: Synchronized</h4>
                        <p className={adminStyles.panelSubtitle}>Template library is globally distributed across firm nodes.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.refreshBtn} style={{ background: 'var(--foreground)', color: 'var(--background)', border: 'none' }} onClick={() => router.push("/admin/marketplace/builder")}>
                        <Plus size={16} /> Provision New Protocol
                    </button>
                </div>
            </div>

            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>LIBRARY ASSETS</span>
                        <Layers size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="40px" /> : stats.total}</div>
                    <div className={adminStyles.metricDetail}>Provisioned protocols</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>TOTAL REVENUE</span>
                        <Euro size={14} color="var(--accent)" />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="40px" /> : `€${stats.totalRevenue.toLocaleString()}`}</div>
                    <div className={adminStyles.metricDetail}>Marketplace liquidity</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>AVG CONVERSION</span>
                        <TrendingUp size={14} color="var(--accent)"/>
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="80px" height="40px" /> : `${stats.avgConversion.toFixed(1)}%`}</div>
                    <div className={adminStyles.metricDetail}>Visitor to buyer ratio</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>SECURITY STATE</span>
                        <ShieldCheck size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>V3.4</div>
                    <div className={adminStyles.metricDetail}>Protocol encryption version</div>
                </div>
            </div>

            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Protocol Catalog</h3>
                        <p className={adminStyles.registrySubtitle}>Orchestrate the institutional marketplace library.</p>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input 
                            type="text" 
                            placeholder="Filter protocols..." 
                            className={adminStyles.mainInput} 
                            style={{ padding: '12px 16px 12px 48px', width: '320px', borderRadius: '16px' }}
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
                                <th className={adminStyles.registryTH}>Price & Yield</th>
                                <th className={adminStyles.registryTH}>Conversion</th>
                                <th className={adminStyles.registryTH}>Sovereign Status</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Controls</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <>
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
                                                    <div className={adminStyles.identityHash} style={{ width: 'fit-content', marginTop: '4px' }}>{t.sector?.toUpperCase() || "GENERAL"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 800, color: 'var(--foreground)' }}>
                                                {editingPriceId === t.id ? (
                                                    <input 
                                                        autoFocus
                                                        style={{ background: 'var(--muted)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '6px', width: '80px', color: 'var(--foreground)' }}
                                                        value={tempPrice}
                                                        onChange={e => setTempPrice(e.target.value)}
                                                        onBlur={() => updatePrice(t, tempPrice)}
                                                    />
                                                ) : (
                                                    <div onClick={() => { setEditingPriceId(t.id); setTempPrice(String(t.price || 0)); }} style={{ cursor: 'pointer' }}>
                                                        €{parseFloat(t.price || 0).toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Yield: €{(parseFloat(t.revenue) || 0).toLocaleString()}</div>
                                        </td>
                                        <td><div style={{ fontWeight: 950, color: 'var(--accent)' }}>{parseFloat(t.conversionRate || 0).toFixed(1)}%</div></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <select 
                                                    style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '100px', fontWeight: 950 }}
                                                    value={t.status}
                                                    onChange={(e) => toggleStatus(t, e.target.value)}
                                                >
                                                    <option value="Draft">DRAFT</option>
                                                    <option value="Live">LIVE</option>
                                                    <option value="Hidden">HIDDEN</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className={adminStyles.actionIconBtn} onClick={() => router.push(`/admin/marketplace/builder?id=${t.id}`)}><Edit3 size={16} /></button>
                                                <button className={adminStyles.actionIconBtn} style={{ color: 'var(--destructive)' }} onClick={() => deleteTemplate(t.id)}><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
