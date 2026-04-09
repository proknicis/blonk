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
    ArrowUpRight
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";

export default function MarketplaceManagementPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        avgSavings: "0 hrs/wk"
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
                const published = data.filter(t => t.status === 'Published').length;
                setStats({
                    total: data.length,
                    published: published,
                    avgSavings: "125+ hrs"
                });
            }
        } catch (error) { 
            console.error(error); 
        } finally {
            setIsLoading(false);
        }
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
        <tr>
            <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Skeleton width="44px" height="44px" borderRadius="14px" />
                    <div>
                        <Skeleton width="120px" height="18px" style={{ marginBottom: '8px' }} />
                        <Skeleton width="200px" height="14px" />
                    </div>
                </div>
            </td>
            <td><Skeleton width="80px" height="24px" borderRadius="8px" /></td>
            <td><Skeleton width="60px" height="18px" /></td>
            <td><Skeleton width="100px" height="24px" borderRadius="12px" /></td>
            <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Skeleton width="36px" height="36px" borderRadius="10px" />
                    <Skeleton width="36px" height="36px" borderRadius="10px" />
                </div>
            </td>
        </tr>
    );

    return (
        <div className={styles.dashboard}>
            {/* STATUS BANNER */}
            <div className={styles.integrityBanner}>
                <div className={styles.integrityInfo}>
                    <div className={styles.statusIndicatorHealthy}>
                        <div className={styles.pulseEffect} />
                    </div>
                    <div>
                        <h4 className={styles.integrityTitle}>Marketplace Infrastructure: Active</h4>
                        <p className={styles.integritySubtitle}>Template library is synchronized across all institutional nodes.</p>
                    </div>
                </div>
                <div className={styles.integrityActions}>
                    <button className={styles.btnInstitutional} onClick={() => router.push("/admin/marketplace/builder")}>
                        <Plus size={16} /> Create Terminal Loop
                    </button>
                </div>
            </div>

            {/* QUICK METRICS */}
            <div className={styles.metricsMatrix}>
                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Library Assets</span>
                        <Layers size={14} className={styles.accentIcon} />
                    </div>
                    <div className={styles.value}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.total}</div>
                    <div className={styles.trend}>Total templates created</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Live Distribution</span>
                        <div className={styles.activeDot} />
                    </div>
                    <div className={styles.value}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.published}</div>
                    <div className={styles.trend}>Active in marketplace</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Est. Value Created</span>
                        <TrendingUp size={14} color="#34D186"/>
                    </div>
                    <div className={styles.value}>{isLoading ? <Skeleton width="100px" height="32px" /> : stats.avgSavings}</div>
                    <div className={styles.trend}>Aggregated efficiency</div>
                </div>

                <div className={styles.metricCard}>
                    <div className={styles.metricHeader}>
                        <span className={styles.label}>Registry Status</span>
                        <ShieldCheck size={14} />
                    </div>
                    <div className={styles.value}>Sovereign</div>
                    <div className={styles.trend}>End-to-end encrypted</div>
                </div>
            </div>

            {/* TEMPLATE REGISTRY */}
            <div className={styles.commandGrid} style={{ gridTemplateColumns: '1fr' }}>
                <div className={styles.activeWorkflows} style={{ padding: '32px' }}>
                    <div className={styles.cardHeader}>
                        <div>
                            <h3 className={styles.cardTitle}>Template Catalog</h3>
                            <p style={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.85rem', marginTop: '4px' }}>Maintain the institutional library of autonomous firm protocols.</p>
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

                    <div style={{ overflowX: 'auto', marginTop: '24px' }}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>Protocol Name</th>
                                    <th>Institutional Sector</th>
                                    <th>Automation Value</th>
                                    <th>Deployment Status</th>
                                    <th style={{ textAlign: 'right' }}>Management</th>
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
                                                    <p style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '1.1rem' }}>No protocols found</p>
                                                    <p style={{ color: '#94A3B8', fontWeight: 700 }}>Adjust your search parameters or initialize a new loop.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTemplates.map(t => (
                                                <tr key={t.id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                            <div style={{ width: '44px', height: '44px', background: '#F8F9FA', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #EAEAEA', fontSize: '1.2rem' }}>
                                                                {t.icon || "⚡"}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 950, color: '#0A0A0A', fontSize: '1rem' }}>{t.name}</div>
                                                                <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {t.description || "System protocol description pending."}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ padding: '6px 12px', background: '#F8F9FA', color: '#0A0A0A', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #EAEAEA' }}>
                                                            {t.sector || "GENERAL"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ fontWeight: 950, color: '#34D186', fontSize: '0.95rem' }}>
                                                            {t.savings || "—"}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            padding: '6px 14px',
                                                            borderRadius: '100px',
                                                            fontSize: '0.7rem',
                                                            fontWeight: 950,
                                                            background: t.status === 'Published' ? '#F0FAF5' : '#F8F9FA',
                                                            color: t.status === 'Published' ? '#34D186' : '#94A3B8',
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}>
                                                            <span style={{ width: '6px', height: '6px', background: 'currentColor', borderRadius: '50%' }}></span>
                                                            {t.status || 'DRAFT'}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                            <button 
                                                                className={styles.btnOutline}
                                                                style={{ width: '40px', height: '40px', borderRadius: '12px', padding: 0 }}
                                                                onClick={() => alert("Editor integration pending")}
                                                            >
                                                                <Edit3 size={18} />
                                                            </button>
                                                            <button 
                                                                style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'none', border: '1px solid #FEE2E2', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                onClick={() => deleteTemplate(t.id)}
                                                            >
                                                                <Trash2 size={18} />
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
        </div>
    );
}

