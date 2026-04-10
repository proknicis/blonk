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
import adminStyles from "../admin.module.css";

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
                        <span className={adminStyles.metricTag}>LIVE DISTRIBUTION</span>
                        <div className={adminStyles.statusPulse} style={{ background: '#34D186', width: '8px', height: '8px' }} />
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="40px" height="32px" /> : stats.published}</div>
                    <div className={adminStyles.metricDetail}>Active in regional marketplace</div>
                </div>

                <div className={adminStyles.adminMetricCard}>
                    <div className={adminStyles.metricMeta}>
                        <span className={adminStyles.metricTag}>EFFICIENCY GAIN</span>
                        <TrendingUp size={14} color="#34D186"/>
                    </div>
                    <div className={adminStyles.metricAmount}>{isLoading ? <Skeleton width="100px" height="32px" /> : stats.avgSavings}</div>
                    <div className={adminStyles.metricDetail}>Aggregated operator savings</div>
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
                                <th className={adminStyles.registryTH}>Protocol Name</th>
                                <th className={adminStyles.registryTH}>Institutional Sector</th>
                                <th className={adminStyles.registryTH}>Automation Value</th>
                                <th className={adminStyles.registryTH}>Deployment Status</th>
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
                                                <p style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '1.1rem' }}>No protocols found</p>
                                                <p style={{ color: '#94A3B8', fontWeight: 700 }}>Adjust your search parameters or initialize a new loop.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTemplates.map(t => (
                                            <tr key={t.id} className={adminStyles.registryRow}>
                                                <td>
                                                    <div className={adminStyles.loopDetail}>
                                                        <div className={adminStyles.loopIcon}>
                                                            {t.icon || "⚡"}
                                                        </div>
                                                        <div>
                                                            <div className={adminStyles.loopName}>{t.name}</div>
                                                            <div className={adminStyles.loopSector}>
                                                                {t.description?.substring(0, 60) || "System protocol description pending."}...
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={adminStyles.statusBadge} style={{ background: '#F8F9FA', color: '#0A0A0A', border: '1px solid #EAEAEA' }}>
                                                        <span>{t.sector || "GENERAL"}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div style={{ fontWeight: 950, color: '#34D186', fontSize: '0.95rem' }}>
                                                        {t.savings || "—"}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={`${adminStyles.statusBadge} ${t.status === 'Published' ? adminStyles.statusActive : adminStyles.statusPending}`}>
                                                        <div className={adminStyles.statusPulse} />
                                                        <span>{t.status === 'Published' ? 'LIVE' : 'DRAFT'}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            className={adminStyles.actionBtnPrimary}
                                                            style={{ width: '40px', padding: 0 }}
                                                            onClick={() => router.push(`/admin/marketplace/builder?id=${t.id}`)}
                                                            title="Edit Protocol"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button 
                                                            className={adminStyles.actionBtnDelete}
                                                            onClick={() => deleteTemplate(t.id)}
                                                            title="Delete Protocol"
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

