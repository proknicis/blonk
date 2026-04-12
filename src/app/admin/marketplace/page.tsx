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
        } catch (error) { 
            console.error(error); 
        } finally {
            setIsLoading(false);
        }
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

    const calculateQualityScore = (t: any) => {
        let score = 0;
        if (t.description && t.description.length > 100) score += 30;
        else if (t.description) score += 15;
        
        if (Array.isArray(t.setupGuide) && t.setupGuide.length > 2) score += 40;
        else if (Array.isArray(t.setupGuide) && t.setupGuide.length > 0) score += 20;
        
        if (t.description?.includes('http')) score += 10; // Simple check for images/links
        if (t.productInfo?.valueProp) score += 20;
        
        return Math.min(score, 100);
    };

    const getServiceIcons = (requirements: any) => {
        const reqs = Array.isArray(requirements) ? requirements : [];
        const icons: string[] = [];
        const text = JSON.stringify(reqs).toLowerCase();
        
        if (text.includes('stripe')) icons.push('💳');
        if (text.includes('notion')) icons.push('📝');
        if (text.includes('slack')) icons.push('💬');
        if (text.includes('google')) icons.push('🔍');
        if (text.includes('openai') || text.includes('gpt')) icons.push('🤖');
        
        return icons.slice(0, 3);
    };

    const formatValue = (savings: string) => {
        if (!savings) return "—";
        if (savings.includes('hrs') || savings.includes('h/')) return `Saves ~${savings}`;
        if (savings.includes('$') || savings.includes('€')) return `${savings} value`;
        return savings;
    };

    const deleteTemplate = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this template? This cannot be undone.")) return;
        try {
            const res = await fetch(`/api/admin/templates?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchTemplates();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const filteredTemplates = templates.filter(t => 
        t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const SkeletonRow = () => (
        <tr className={adminStyles.registryRow}>
            <td>
                <div className={adminStyles.loopDetail}>
                    <Skeleton width="44px" height="44px" borderRadius="12px" />
                    <div>
                        <Skeleton width="140px" height="18px" style={{ marginBottom: '6px' }} />
                        <Skeleton width="220px" height="12px" />
                    </div>
                </div>
            </td>
            <td><Skeleton width="100px" height="24px" borderRadius="10px" /></td>
            <td><Skeleton width="70px" height="20px" /></td>
            <td><Skeleton width="100px" height="28px" borderRadius="100px" /></td>
            <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Skeleton width="40px" height="40px" borderRadius="10px" />
                    <Skeleton width="40px" height="40px" borderRadius="10px" />
                </div>
            </td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            <div className={adminStyles.integrityPanel}>
                <div className={adminStyles.integrityHub}>
                    <div className={adminStyles.statusBeacon}>
                        <div className={adminStyles.beaconPulse} />
                    </div>
                    <div>
                        <h4 className={adminStyles.panelTitle}>Marketplace Registry: Secure</h4>
                        <p className={adminStyles.panelSubtitle}>Template library is synchronized across all institutional firm nodes.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.actionBtnPrimary} onClick={() => router.push("/admin/marketplace/builder")}>
                        <Plus size={16} /> Create Terminal Loop
                    </button>
                </div>
            </div>

            <div className={adminStyles.metricMatrix}>
                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>LIBRARY ASSETS</span>
                        <Layers size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.total}</div>
                    <div className={adminStyles.metricDetail}>Provisioned protocol templates</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>TOTAL REVENUE</span>
                        <Euro size={14} color="#34D186" />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : `€${stats.totalRevenue.toLocaleString()}`}</div>
                    <div className={adminStyles.metricDetail}>Aggregated marketplace sales</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>AVG CONVERSION</span>
                        <TrendingUp size={14} color="#34D186"/>
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="100px" height="32px" /> : `${stats.avgConversion.toFixed(1)}%`}</div>
                    <div className={adminStyles.metricDetail}>Marketplace visitor to buyer</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>ENCRYPTION STATUS</span>
                        <ShieldCheck size={14} />
                    </div>
                    <div className={adminStyles.metricAmount}>Sovereign</div>
                    <div className={adminStyles.metricDetail}>End-to-end node encryption</div>
                </div>
            </div>

            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Template Catalog</h3>
                        <p className={adminStyles.registrySubtitle}>Maintain the institutional library of autonomous firm protocols.</p>
                    </div>
                    <div className={styles.searchWrapper} style={{ width: '400px' }}>
                        <Search className={styles.searchIcon} size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter by protocol name or sector..." 
                            className={styles.searchInput} 
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
                                <th className={adminStyles.registryTH}>Price & Revenue</th>
                                <th className={adminStyles.registryTH}>Conversion</th>
                                <th className={adminStyles.registryTH}>Score & Status</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : (
                                <>
                                    {filteredTemplates.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '80px 0', textAlign: 'center' }}>
                                                <Layers size={48} style={{ color: '#EAEAEA', marginBottom: '20px' }} />
                                                <p style={{ fontWeight: 900, color: '#111', fontSize: '1.1rem' }}>No protocols found</p>
                                                <p style={{ color: '#94A3B8', fontWeight: 700 }}>Adjust your search parameters or initialize a new loop.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTemplates.map(t => (
                                            <tr key={t.id} className={adminStyles.registryRow}>
                                                <td>
                                                    <div className={adminStyles.loopDetail}>
                                                        <div className={adminStyles.loopIcon} style={{ fontSize: '24px' }}>
                                                            {t.icon === 'Zap' ? '⚡' : t.icon}
                                                        </div>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div className={adminStyles.loopName}>{t.name}</div>
                                                                {t.featured && <Star size={14} color="#34D186" fill="#34D186" />}
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                                <span className={adminStyles.loopSector} style={{ border: '1px solid #EAEAEA', padding: '2px 8px', borderRadius: '6px' }}>{t.sector || "GENERAL"}</span>
                                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                                    {getServiceIcons(t.requirements).map((icon, i) => (
                                                                        <span key={i} title="Requirement" style={{ fontSize: '12px' }}>{icon}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        {editingPriceId === t.id ? (
                                                            <input 
                                                                autoFocus
                                                                className={styles.input} 
                                                                style={{ width: '80px', height: '32px', fontSize: '0.9rem' }}
                                                                value={tempPrice}
                                                                onChange={e => setTempPrice(e.target.value)}
                                                                onBlur={() => updatePrice(t, tempPrice)}
                                                                onKeyDown={e => e.key === 'Enter' && updatePrice(t, tempPrice)}
                                                            />
                                                        ) : (
                                                            <div 
                                                                style={{ fontWeight: 950, color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                                onClick={() => { setEditingPriceId(t.id); setTempPrice(String(t.price || 0)); }}
                                                            >
                                                                €{parseFloat(t.price || 0).toFixed(2)} <Edit3 size={10} color="#94A3B8" />
                                                            </div>
                                                        )}
                                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
                                                            Revenue: <span style={{ color: '#111' }}>€{(parseFloat(t.revenue) || 0).toLocaleString()}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                                                            {t.purchases || 0} sales
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <div style={{ fontWeight: 950, color: '#34D186', fontSize: '1rem' }}>
                                                            {parseFloat(t.conversionRate || 0).toFixed(1)}%
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
                                                            Value: {formatValue(t.savings)}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div className={`${adminStyles.statusBadge} ${t.status === 'Live' ? adminStyles.statusActive : (t.status === 'Draft' ? adminStyles.statusPending : '')}`} style={{ 
                                                                background: t.status === 'Hidden' ? '#F1F5F9' : (t.status === 'Testing' ? '#FEF3C7' : undefined),
                                                                color: t.status === 'Hidden' ? '#64748B' : (t.status === 'Testing' ? '#92400E' : undefined)
                                                            }}>
                                                                <div className={adminStyles.statusPulse} style={{ display: (t.status === 'Hidden' || t.status === 'Draft') ? 'none' : 'block' }} />
                                                                <span>{t.status?.toUpperCase() || 'DRAFT'}</span>
                                                            </div>
                                                            <select 
                                                                style={{ border: 'none', background: 'none', color: '#94A3B8', fontSize: '10px', cursor: 'pointer', fontWeight: 900 }}
                                                                value={t.status}
                                                                onChange={(e) => toggleStatus(t, e.target.value)}
                                                            >
                                                                <option value="Draft">Draft</option>
                                                                <option value="Live">Live</option>
                                                                <option value="Hidden">Hidden</option>
                                                                <option value="Testing">Testing</option>
                                                            </select>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ flex: 1, height: '4px', background: '#F1F5F9', borderRadius: '10px', overflow: 'hidden' }}>
                                                                <div style={{ width: `${calculateQualityScore(t)}%`, height: '100%', background: calculateQualityScore(t) > 80 ? '#34D186' : '#F59E0B' }} />
                                                            </div>
                                                            <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#64748B' }}>{calculateQualityScore(t)}%</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            className={adminStyles.iconBtn}
                                                            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                                                            onClick={() => router.push(`/dashboard/workflows/setup?id=${t.id}`)}
                                                            title="Preview as User"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            className={adminStyles.iconBtn}
                                                            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                                                            onClick={() => toggleFeatured(t)}
                                                            title={t.featured ? "Unfeature" : "Feature in Marketplace"}
                                                        >
                                                            <Star size={16} fill={t.featured ? "#34D186" : "none"} color={t.featured ? "#34D186" : "currentColor"} />
                                                        </button>
                                                        <button 
                                                            className={adminStyles.iconBtn}
                                                            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                                                            onClick={() => duplicateTemplate(t)}
                                                            title="Duplicate Protocol"
                                                        >
                                                            <Copy size={16} />
                                                        </button>
                                                        <div style={{ width: '1px', background: '#EAEAEA', margin: '0 4px' }} />
                                                        <button 
                                                            className={adminStyles.actionBtnPrimary}
                                                            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px' }}
                                                            onClick={() => router.push(`/admin/marketplace/builder?id=${t.id}`)}
                                                            title="Edit Product"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button 
                                                            className={adminStyles.actionBtnDelete}
                                                            style={{ width: '36px', height: '36px', borderRadius: '10px' }}
                                                            onClick={() => deleteTemplate(t.id)}
                                                            title="Delete Product"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

