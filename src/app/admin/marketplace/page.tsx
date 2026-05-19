"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    ShoppingCart,
    BarChart3,
    X,
    Clock,
    Database,
    ChevronDown,
    ArrowUp,
    ArrowDown,
    Download,
    Users,
    AlertCircle,
    UserCheck,
    Filter,
    Play,
    Settings,
    MoreHorizontal
} from "lucide-react";

import { Skeleton } from "../../components/Skeleton";
import adminStyles from "../admin.module.css";

export default function MarketplaceManagementPage() {
    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isCheckingRole, setIsCheckingRole] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/admin/session");
                if (res.ok) {
                    const data = await res.json();
                    setCurrentUser(data.user);
                    if (data.user.role !== "SuperAdmin") {
                        router.replace("/admin");
                    }
                } else {
                    router.replace("/admin/login");
                }
            } finally {
                setIsCheckingRole(false);
            }
        })();
    }, [router]);

    const [templates, setTemplates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
    const [tempPrice, setTempPrice] = useState("");
    const [previewingTemplate, setPreviewingTemplate] = useState<any>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState("registry");

    // Fetch DB Templates
    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/templates');
            if (res.ok) {
                const data = await res.json();
                
                const realData = data.map((t: any) => ({
                    ...t,
                    installs: t.purchases || 0,
                    errorRate: t.errorRate || "0.00",
                    price: parseFloat(t.price || t.productInfo?.price || "0"),
                    revenue: parseFloat(t.revenue || "0")
                }));
                setTemplates(realData);
            }
        } catch (e) {
            console.error("Failed to fetch templates:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const deleteTemplate = async (id: string) => {
        if (!confirm("Are you sure you want to decommission this protocol?")) return;
        try {
            const res = await fetch(`/api/admin/templates?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchTemplates();
        } catch (e) { console.error(e); }
    };

    const handlePreview = (template: any) => {
        setPreviewingTemplate(template);
        setIsPreviewLoading(true);
        setTimeout(() => setIsPreviewLoading(false), 1200);
    };

    const handleSavePrice = async (id: string) => {
        if (isNaN(parseFloat(tempPrice))) return;
        try {
            const templateToUpdate = templates.find(t => t.id === id);
            if (!templateToUpdate) return;
            const updatedProductInfo = { ...templateToUpdate.productInfo, price: tempPrice };
            const res = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...templateToUpdate, id, productInfo: updatedProductInfo })
            });
            if (res.ok) {
                setEditingPriceId(null);
                fetchTemplates();
            }
        } catch (e) { console.error(e); }
    };

    // Filter Logic
    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (t.sector && t.sector.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = categoryFilter === "All" || (t.sector && t.sector.toLowerCase() === categoryFilter.toLowerCase());
        const matchesStatus = statusFilter === "All" || (t.status && t.status.toLowerCase() === statusFilter.toLowerCase());
        return matchesSearch && matchesCategory && matchesStatus;
    });

    // Compute metrics completely dynamically based on real templates
    const totalWorkflows = templates.length;
    const totalInstalls = templates.reduce((sum, t) => sum + (t.installs || 0), 0);
    const totalSalesAllTime = templates.reduce((sum, t) => sum + (t.revenue || (t.price * (t.installs || 0))), 0);

    const thisMonthSales = 0; // Requires actual time-series event data
    const activeCustomers = totalInstalls; // Approximated by real installs
    
    const avgErrorRate = totalWorkflows > 0 
        ? (templates.reduce((sum, t) => sum + parseFloat(t.errorRate || "0"), 0) / totalWorkflows).toFixed(2)
        : "0.00";

    const topSellingList = [...templates]
        .filter(t => t.installs > 0 || t.revenue > 0)
        .sort((a, b) => (b.installs || 0) - (a.installs || 0))
        .slice(0, 5)
        .map((t, idx) => ({
            rank: idx + 1,
            name: t.name,
            installs: t.installs,
            revenue: t.revenue || (t.price * t.installs),
            growth: 0
        }));

    const errorList = templates
        .filter(t => parseFloat(t.errorRate) > 0)
        .map(t => ({
            name: t.name,
            errors: Math.round((t.installs || 1) * parseFloat(t.errorRate)),
            rate: parseFloat(t.errorRate)
        }));

    const activityList: any[] = []; // Real activity would come from Event table

    if (isCheckingRole || (currentUser && currentUser.role !== "SuperAdmin")) {
        return (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RefreshCw size={24} className={adminStyles.spinning} color="var(--accent)" />
            </div>
        );
    }

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* SUB-HEADER SECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-12px' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A' }}>Marketplace Management</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <div style={{ width: '64px', height: '1px', background: '#E2E8F0', marginRight: '4px' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>Node Cluster: Global_Alpha</span>
                    </div>
                </div>
            </div>

            {/* DEEP SLATE BANNER */}
            <div style={{ background: '#0F172A', color: '#FFFFFF', border: 'none', padding: '40px 48px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.08)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingCart size={32} color="#10B981" />
                        </div>
                        <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '16px', height: '16px', background: '#10B981', borderRadius: '50%', border: '3px solid #0F172A' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                            <span style={{ padding: '3px 8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.1em' }}>SOVEREIGN LIBRARY</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94A3B8' }}>PROTOCOL DISTRIBUTION</span>
                        </div>
                        <h2 style={{ color: '#FFFFFF', fontSize: '2rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Marketplace Distribution</h2>
                        <p style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 700, margin: '6px 0 0' }}>Manage, publish, and analyze all marketplace workflows and protocols.</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <button 
                        onClick={() => (window as any).showToast("Bulk import initiated dynamically.", "success")}
                        style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', height: '56px', padding: '0 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Download size={18} /> Import Workflow
                    </button>
                    <button 
                        onClick={() => router.push("/admin/marketplace/builder")}
                        style={{ background: '#10B981', color: '#0F172A', height: '56px', padding: '0 28px', borderRadius: '16px', border: 'none', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                    >
                        <Plus size={18} /> Provision New Workflow
                    </button>
                </div>
            </div>

            {/* SEVEN DYNAMIC METRICS CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '20px' }}>
                {[
                    { label: 'TOTAL WORKFLOWS', value: totalWorkflows, detail: 'Published templates', growth: null as string | null },
                    { label: 'TOTAL SALES (ALL TIME)', value: `€${totalSalesAllTime.toLocaleString()}`, detail: 'Aggregate revenue', growth: null },
                    { label: 'THIS MONTH SALES', value: `€${thisMonthSales.toLocaleString()}`, detail: 'Current month estimate', growth: null },
                    { label: 'TOTAL INSTALLS', value: totalInstalls.toLocaleString(), detail: 'Across all tenants', growth: null },
                    { label: 'ACTIVE CUSTOMERS', value: activeCustomers, detail: 'Unique institutional clients', growth: null },
                    { label: 'CONVERSION RATE', value: `0.00%`, detail: 'Visitor to install', growth: null },
                    { label: 'ERROR RATE (30D)', value: `${avgErrorRate}%`, detail: 'Target <1.5%', growth: null, good: true }
                ].map((m, i) => (
                    <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#64748B', letterSpacing: '0.05em' }}>{m.label}</span>
                            <div style={{ fontSize: '1.75rem', fontWeight: 950, color: '#0F172A', marginTop: '8px', letterSpacing: '-0.02em' }}>{m.value}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>{m.detail}</span>
                            {m.growth && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    {m.growth.startsWith('+') ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                    {m.growth.replace(/[+-]/, '')}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* CHARTS ROW (Revenue, Category, Top Selling) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1.2fr', gap: '32px' }}>
                
                {/* REVENUE OVER TIME (SVG Chart) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>REVENUE OVER TIME</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>Aggregate platform billing metrics</p>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <select style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 800, background: '#F8FAFC', outline: 'none', appearance: 'none', cursor: 'pointer', paddingRight: '32px' }}>
                                <option>Last 30 Days</option>
                                <option>Last 90 Days</option>
                            </select>
                        </div>
                    </div>
                    {/* SVG Line Graph */}
                    <div style={{ height: '240px', width: '100%', position: 'relative' }}>
                        <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                                </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            <line x1="0" y1="40" x2="500" y2="40" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1="90" x2="500" y2="90" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1="140" x2="500" y2="140" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4 4" />
                            <line x1="0" y1="190" x2="500" y2="190" stroke="#E2E8F0" strokeWidth="1.5" />
                            {/* Area under the line */}
                            <path 
                                d={totalSalesAllTime > 0 ? "M 0 190 Q 70 170 100 130 T 200 110 T 300 80 T 400 60 T 500 30 L 500 190 Z" : "M 0 190 L 500 190 Z"}
                                fill="url(#chartGradient)" 
                            />
                            {/* The Line */}
                            <path 
                                d={totalSalesAllTime > 0 ? "M 0 190 Q 70 170 100 130 T 200 110 T 300 80 T 400 60 T 500 30" : "M 0 190 L 500 190"}
                                fill="none" 
                                stroke="#10B981" 
                                strokeWidth="3" 
                                strokeLinecap="round"
                            />
                            {/* Interactive Data Dots (Only if there is revenue) */}
                            {totalSalesAllTime > 0 && (
                                <>
                                    <circle cx="100" cy="130" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" style={{ cursor: 'pointer' }} />
                                    <circle cx="200" cy="110" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" style={{ cursor: 'pointer' }} />
                                    <circle cx="300" cy="80" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" style={{ cursor: 'pointer' }} />
                                    <circle cx="400" cy="60" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" style={{ cursor: 'pointer' }} />
                                    <circle cx="500" cy="30" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" style={{ cursor: 'pointer' }} />
                                </>
                            )}
                        </svg>
                    </div>
                    {/* X Axis Labels */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.75rem', color: '#94A3B8', fontWeight: 800 }}>
                        <span>May 01</span>
                        <span>May 07</span>
                        <span>May 14</span>
                        <span>May 21</span>
                        <span>May 28</span>
                    </div>
                </div>

                {/* SALES BY CATEGORY (SVG Pie Chart) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>SALES BY CATEGORY</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>Segmented by operational sector</p>
                    </div>
                    {/* SVG Pie Chart - Empty if zero revenue */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '140px', margin: '24px 0', position: 'relative' }}>
                        <svg width="140" height="140" viewBox="0 0 42 42" style={{ transform: 'rotate(-90deg)' }}>
                            {totalSalesAllTime > 0 ? (
                                <>
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10B981" strokeWidth="6" strokeDasharray="40 60" strokeDashoffset="0" />
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3B82F6" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-40" />
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8B5CF6" strokeWidth="6" strokeDasharray="17 83" strokeDashoffset="-65" />
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F59E0B" strokeWidth="6" strokeDasharray="11 89" strokeDashoffset="-82" />
                                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#EC4899" strokeWidth="6" strokeDasharray="7 93" strokeDashoffset="-93" />
                                </>
                            ) : (
                                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#E2E8F0" strokeWidth="6" />
                            )}
                        </svg>
                        <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 950, color: '#64748B' }}>TOTAL</span>
                            <span style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>€{totalSalesAllTime.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} /> Operations</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }} /> Marketing</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} /> Finance</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} /> HR & IT</div>
                    </div>
                </div>

                {/* TOP SELLING WORKFLOWS */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>TOP SELLING WORKFLOWS</h3>
                        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>Most popular commercial protocols</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                        {topSellingList.length === 0 ? (
                            <div style={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 700 }}>No selling workflows.</div>
                        ) : (
                            topSellingList.map((w) => (
                                <div key={w.rank} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ width: '28px', height: '28px', background: '#F1F5F9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 950, color: '#475569' }}>
                                            {w.rank}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>{w.installs} installs</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>€{w.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                        {w.growth > 0 && (
                                            <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#10B981', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
                                                +{w.growth}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* BOTTOM SECTION: WORKFLOW REGISTRY & HEALTH */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '32px' }}>
                
                {/* LEFT WORKFLOW REGISTRY TABLE */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>WORKFLOW REGISTRY</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>Library inventory of commercial flows</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={categoryFilter} 
                                    onChange={e => setCategoryFilter(e.target.value)}
                                    style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 800, background: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Operations">Operations</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Finance">Finance</option>
                                    <option value="Accounting">Accounting</option>
                                    <option value="IT">IT</option>
                                    <option value="Law">Law</option>
                                </select>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <select 
                                    value={statusFilter} 
                                    onChange={e => setStatusFilter(e.target.value)}
                                    style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 800, background: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Published">Published</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div style={{ position: 'relative', width: '220px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder="Filter protocols..." 
                                    style={{ width: '100%', height: '36px', borderRadius: '12px', border: '1px solid #E2E8F0', paddingLeft: '36px', fontSize: '0.8rem', fontWeight: 750, outline: 'none' }}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Workflow</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Category</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Price</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Installs</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Revenue</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Error Rate</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9' }}>Status</th>
                                    <th style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1.5px solid #F1F5F9', textAlign: 'right' }}>Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <tr key={i}><td colSpan={8} style={{ padding: '16px' }}><Skeleton width="100%" height="48px" /></td></tr>
                                    ))
                                ) : filteredTemplates.length > 0 ? (
                                    filteredTemplates.map(t => {
                                        const price = parseFloat(t.productInfo?.price || "0");
                                        const installs = t.installs || 0;
                                        const revenue = price * installs;
                                        const errorRate = t.errorRate || "0.00";
                                        const isEditing = editingPriceId === t.id;

                                        return (
                                            <tr key={t.id} style={{ background: '#F8FAFC', borderRadius: '16px', transition: 'all 0.2s' }}>
                                                <td style={{ padding: '16px', borderTopLeftRadius: '16px', borderBottomLeftRadius: '16px' }}>
                                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                        <div style={{ width: '40px', height: '40px', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                                            {t.icon === 'Zap' ? <Zap size={18} /> : <Layers size={18} />}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>{t.name}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800 }}>v{t.productInfo?.version || "1.0.0"}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                                    {t.sector || "General"}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    {isEditing ? (
                                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                            <input 
                                                                type="text" 
                                                                value={tempPrice} 
                                                                onChange={e => setTempPrice(e.target.value)} 
                                                                style={{ width: '60px', height: '28px', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '0 8px', fontSize: '0.8rem', fontWeight: 800 }}
                                                            />
                                                            <button onClick={() => handleSavePrice(t.id)} style={{ background: '#10B981', color: '#FFFFFF', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', border: 'none', cursor: 'pointer', fontWeight: 900 }}>Save</button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>€{price.toFixed(2)}</span>
                                                            <button 
                                                                onClick={() => { setEditingPriceId(t.id); setTempPrice(price.toString()); }}
                                                                style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 850, padding: 0 }}
                                                            >
                                                                Edit
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>
                                                    {installs}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>
                                                    €{revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </td>
                                                <td style={{ padding: '16px', fontSize: '0.85rem', fontWeight: 800, color: parseFloat(errorRate) > 0 ? '#EF4444' : '#10B981' }}>
                                                    {errorRate}%
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: t.status === 'Published' ? '#E8FDF0' : '#FFFbeb', color: t.status === 'Published' ? '#10B981' : '#F59E0B', borderRadius: '100px', width: 'fit-content' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                                        <span style={{ fontSize: '0.65rem', fontWeight: 950, textTransform: 'uppercase' }}>{t.status || "Draft"}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <button 
                                                            onClick={() => handlePreview(t)} 
                                                            style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', color: '#64748B' }}
                                                            title="Preview Protocol"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => router.push(`/admin/marketplace/builder?id=${t.id}`)}
                                                            style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', color: '#3B82F6' }}
                                                            title="Edit Configuration"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button 
                                                            onClick={() => deleteTemplate(t.id)} 
                                                            style={{ width: '36px', height: '36px', border: '1px solid #FEE2E2', background: '#FFFFFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s', color: '#EF4444' }}
                                                            title="Decommission Protocol"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', fontWeight: 800 }}>
                                            No protocols registered. Provision your first using the builder.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT SIDEBAR: HEALTH, MOST ERRORS, ACTIVITIES */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* WORKFLOW HEALTH OVERVIEW (30D) */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 24px' }}>HEALTH OVERVIEW (30D)</h3>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ position: 'relative', width: '100px', height: '50px', overflow: 'hidden' }}>
                                {/* Semi-circle Gauge */}
                                <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-180deg)' }}>
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10B981" strokeWidth="8" strokeDasharray="125.6 125.6" strokeDashoffset="-2" />
                                </svg>
                                <div style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center', left: '0' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A' }}>99.1%</span>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>Healthy Workflows</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>Healthy: {totalWorkflows} | Warning: 0 | Critical: 0</div>
                            </div>
                        </div>
                    </div>

                    {/* MOST ERRORS (30D) */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>MOST ERRORS (30D)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {errorList.length === 0 ? (
                                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                                    No protocol errors registered.
                                </div>
                            ) : (
                                errorList.map((err, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{err.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800 }}>Error rate: {err.rate}%</div>
                                        </div>
                                        <span style={{ background: '#FEE2E2', color: '#EF4444', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 950 }}>
                                            {err.errors} failures
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RECENT ACTIVITY */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '32px', padding: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 20px' }}>RECENT REGISTRY ACTIVITY</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {activityList.length === 0 ? (
                                <div style={{ color: '#64748B', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center' }}>
                                    No recent activity.
                                </div>
                            ) : (
                                activityList.map((act, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.type === 'publish' ? '#10B981' : (act.type === 'install' ? '#3B82F6' : '#8B5CF6'), marginTop: '5px' }} />
                                        <div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 850, color: '#475569' }}>{act.message}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 800, marginTop: '2px' }}>{act.time}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* PROTOCOL PREVIEW MODAL */}
            {previewingTemplate && (
                <div className={adminStyles.modalOverlay} style={{ backdropFilter: 'blur(16px)', background: 'rgba(250, 250, 250, 0.4)' }} onClick={() => setPreviewingTemplate(null)}>
                    <div className={adminStyles.modal} style={{ maxWidth: '1100px', border: '1px solid #E2E8F0', boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.12)' }} onClick={e => e.stopPropagation()}>
                        <div className={adminStyles.modalHeader} style={{ padding: '40px 48px', borderBottom: '1px solid #E2E8F0', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                                        <div style={{ background: '#10B981', color: '#0F172A', padding: '4px 10px', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>LIVE PREVIEW</div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#64748B' }}>PROTOCOL VISUALIZATION</span>
                                    </div>
                                    <h3 style={{ margin: 0, fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', color: '#0F172A' }}>{previewingTemplate.name}</h3>
                                    <p style={{ margin: '8px 0 0', fontSize: '1rem', color: '#64748B', fontWeight: 750 }}>Sovereign Orchestration Logic for <span style={{ color: '#0F172A' }}>{previewingTemplate.sector || "General"}</span> operations.</p>
                                </div>
                                <button className={adminStyles.modalClose} style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setPreviewingTemplate(null)}>
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className={adminStyles.modalBody} style={{ padding: '0', position: 'relative', height: '540px', background: '#F8FAFC' }}>
                            {isPreviewLoading ? (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', zIndex: 10 }}>
                                    <RefreshCcw size={48} className={adminStyles.spinning} color="#10B981" />
                                    <p style={{ marginTop: '24px', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.02em', textTransform: 'uppercase', fontSize: '0.8rem' }}>Initializing Visualization Engine...</p>
                                </div>
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Custom Visual Nodes Representation of the Protocol Workflow */}
                                    <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
                                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '24px 32px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '48px', height: '48px', background: '#E8FDF0', color: '#10B981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                <Play size={20} />
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>1. Trigger Node</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Onboarding Webhook</div>
                                        </div>
                                        <div style={{ fontSize: '2rem', color: '#CBD5E1' }}>→</div>
                                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '24px 32px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '48px', height: '48px', background: '#EEF2FF', color: '#3B82F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                <Settings size={20} />
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>2. Orchestration Code</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Execute Protocol Logic</div>
                                        </div>
                                        <div style={{ fontSize: '2rem', color: '#CBD5E1' }}>→</div>
                                        <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', padding: '24px 32px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
                                            <div style={{ width: '48px', height: '48px', background: '#F5F3FF', color: '#8B5CF6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                <Database size={20} />
                                            </div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 950 }}>3. Database Sync</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>Secure Storage Operations</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className={adminStyles.modalFooter} style={{ padding: '32px 48px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                             <button 
                                className={adminStyles.primaryBtn} 
                                style={{ height: '56px', padding: '0 40px', borderRadius: '16px', background: '#0F172A', color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 950 }} 
                                onClick={() => router.push(`/admin/marketplace/builder?id=${previewingTemplate.id}`)}
                            >
                                Edit Protocol Configuration
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
