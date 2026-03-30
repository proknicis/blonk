"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./marketplace.module.css";

export default function MarketplaceManagementPage() {
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
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
                
                // Calculate Stats
                const published = data.filter(t => t.status === 'Published').length;
                setStats({
                    total: data.length,
                    published: published,
                    avgSavings: "125+ hrs" // Simulation of value created
                });
            }
        } catch (error) { 
            console.error(error); 
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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Marketplace Management</h1>
                    <p className={styles.subtitle}>Configure the library of professional automation templates for your clients.</p>
                </div>
                <button className={styles.btnPrimary} onClick={() => router.push("/admin/marketplace/builder")}>
                    + Create New Workflow
                </button>
            </header>

            <div className={styles.statsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Total Templates</div>
                    <div className={styles.statValue}>{stats.total}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Live on Market</div>
                    <div className={styles.statValue}>{stats.published}</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statLabel}>Efficiency Impact</div>
                    <div className={styles.statValue} style={{ color: '#10B981' }}>{stats.avgSavings}</div>
                </div>
            </div>

            <main className={styles.mainContent}>
                <div className={styles.toolbar}>
                    <div className={styles.searchWrapper}>
                        <span className={styles.searchIcon}>🔍</span>
                        <input 
                            className={styles.searchInput} 
                            placeholder="Find templates by name, sector or description..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Template</th>
                            <th>Sector</th>
                            <th>Est. Savings</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTemplates.length === 0 ? (
                            <tr>
                                <td colSpan={5} className={styles.emptyState}>
                                    <div className={styles.emptyTitle}>No templates found</div>
                                    <div className={styles.emptyText}>Try adjusting your search term or create a new template from scratch.</div>
                                </td>
                            </tr>
                        ) : (
                            filteredTemplates.map(t => (
                                <tr key={t.id} className={styles.tr}>
                                    <td>
                                        <div className={styles.templateInfo}>
                                            <div className={styles.templateIcon}>{t.icon || "⚡"}</div>
                                            <div>
                                                <div className={styles.templateName}>{t.name}</div>
                                                <div className={styles.templateDesc} title={t.description}>{t.description || "No description provided."}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.sectorBadge}>{t.sector || "General"}</span>
                                    </td>
                                    <td>
                                        <span className={styles.savingsText}>{t.savings || "—"}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${t.status === 'Published' ? styles.statusPublished : styles.statusDraft}`}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                                            {t.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <button className={styles.btnAction} onClick={() => alert("Editor integration coming soon!")}>Details</button>
                                            <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => deleteTemplate(t.id)}>Remove</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </main>
        </div>
    );
}
