"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, X, Check, Loader2, Search, SlidersHorizontal, Layers, ShieldCheck, ZapIcon, Clock, ArrowRight, MessageSquare, PencilLine, ClipboardCheck, Rocket } from "lucide-react";
import styles from "./marketplace.module.css";

const CATEGORIES = ["All", "Accounting", "Law", "HR", "IT", "General"];

const FALLBACK_WORKFLOWS = [
    {
        id: "tpl-ai-support",
        name: "Invoice Automation",
        description: "Extract invoice data, validate, and sync to your accounting tool automatically.",
        sector: "Accounting",
        price: 149,
        setupTime: "~20 min",
        color: "#10B981",
        installs: "1.2K",
        rating: "4.9",
        includes: ["Dedicated Server", "n8n Setup", "Full Configuration", "Testing"]
    },
    {
        id: "tpl-discord-mod",
        name: "Employee Onboarding",
        description: "Automate the onboarding process: forms, accounts, notifications, and more.",
        sector: "HR",
        price: 99,
        setupTime: "~15 min",
        color: "#3B82F6",
        installs: "892",
        rating: "4.8",
        includes: ["Dedicated Server", "n8n Setup", "Full Configuration", "Testing"]
    },
    {
        id: "tpl-etsy",
        name: "Contract Manager",
        description: "Track contracts, renewals, and send reminders before important dates.",
        sector: "Law",
        price: 79,
        setupTime: "~12 min",
        color: "#8B5CF6",
        installs: "654",
        rating: "4.9",
        includes: ["Dedicated Server", "n8n Setup", "Full Configuration", "Testing"]
    },
    {
        id: "tpl-tiktok",
        name: "Lead Enrichment",
        description: "Enrich leads with data, score them, and send qualified leads to your CRM.",
        sector: "General",
        price: 129,
        setupTime: "~18 min",
        color: "#F59E0B",
        installs: "1.5K",
        rating: "4.7",
        includes: ["Dedicated Server", "n8n Setup", "Full Configuration", "Testing"]
    },
    {
        id: "tpl-support",
        name: "Support Ticket Sync",
        description: "Sync support tickets from multiple channels to your project management tool.",
        sector: "IT",
        price: 119,
        setupTime: "~25 min",
        color: "#06B6D4",
        installs: "732",
        rating: "4.6",
        includes: ["Dedicated Server", "n8n Setup", "Full Configuration", "Testing"]
    },
];

function getPrice(t: any) {
    const p = parseFloat(t.price || 0);
    const pi = t.productInfo ? parseFloat(t.productInfo.price || 0) : 0;
    return pi > 0 ? pi : p;
}

export default function MarketplacePage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<any | null>(null);
    const [paying, setPaying] = useState(false);
    
    // Filtering states
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("Most Popular");

    useEffect(() => {
        if (selected) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [selected]);

    useEffect(() => {
        fetch("/api/marketplace")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const enriched = data.map((t: any) => ({
                        ...t,
                        installs: t.purchases || Math.floor(Math.random() * 1000) + 50,
                        rating: (4.5 + Math.random() * 0.5).toFixed(1)
                    }));
                    setTemplates(enriched);
                } else {
                    setTemplates(FALLBACK_WORKFLOWS);
                }
            })
            .catch(() => setTemplates(FALLBACK_WORKFLOWS))
            .finally(() => setLoading(false));
    }, []);

    const filteredTemplates = templates.filter(t => {
        const matchesCategory = activeCategory === "All" || t.sector === activeCategory;
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (new URLSearchParams(window.location.search).get("canceled") === "true") {
            alert("Payment canceled.");
            router.replace("/dashboard/marketplace");
        }
    }, [router]);

    const startPayment = async () => {
        const userId = (session?.user as any)?.id;
        if (!selected || !userId) return;
        setPaying(true);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    templateId: selected.id,
                    amount: getPrice(selected),
                    userId,
                }),
            });
            const data = await res.json();
            if (data.checkoutUrl) window.location.href = data.checkoutUrl;
            else alert(data.error || "Checkout failed");
        } catch {
            alert("Could not start payment");
        } finally {
            setPaying(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.headerContainer}>
                <div>
                    <h1 className={styles.headerTitle}>Marketplace</h1>
                    <p className={styles.headerSub}>Add powerful, pre-built workflows to automate and scale your operations.</p>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filterSection}>
                <div className={styles.categories}>
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat} 
                            className={`${styles.categoryBtn} ${activeCategory === cat ? styles.categoryBtnActive : ""}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                <div className={styles.searchSortBar}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search automations..." 
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select className={styles.sortSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option>Most Popular</option>
                        <option>Newest</option>
                        <option>Highest Rated</option>
                    </select>
                </div>
            </div>

            {/* Trust Strip */}
            <div className={styles.trustStrip}>
                <div className={styles.trustItem}>
                    <div className={styles.trustIconBox}><Layers size={20} /></div>
                    <div className={styles.trustInfo}>
                        <span className={styles.trustLabel}>98+</span>
                        <span className={styles.trustSub}>Workflows Available</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIconBox}><ShieldCheck size={20} /></div>
                    <div className={styles.trustInfo}>
                        <span className={styles.trustLabel}>Trusted</span>
                        <span className={styles.trustSub}>Built by automation experts</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIconBox}><ZapIcon size={20} /></div>
                    <div className={styles.trustInfo}>
                        <span className={styles.trustLabel}>Instant Use</span>
                        <span className={styles.trustSub}>Add and run in minutes</span>
                    </div>
                </div>
                <div className={styles.trustItem}>
                    <div className={styles.trustIconBox}><Clock size={20} /></div>
                    <div className={styles.trustInfo}>
                        <span className={styles.trustLabel}>Always Updated</span>
                        <span className={styles.trustSub}>New workflows added weekly</span>
                    </div>
                </div>
            </div>

            {/* Workflows Grid */}
            <section>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>Featured Workflows</h2>
                    <a href="#" className={styles.viewAll}>View all workflows <ArrowRight size={16} style={{ marginLeft: 4, verticalAlign: 'middle' }} /></a>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: "#64748b", fontWeight: 700, padding: 40 }}>
                        <Loader2 className="spinning" size={24} />
                        <span>Synchronizing marketplace registry…</span>
                    </div>
                ) : (
                    <div className={styles.grid}>
                        {filteredTemplates.map((wf) => (
                            <div key={wf.id} className={styles.card}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardIconLarge} style={{ background: `${wf.color || "#10B981"}15`, color: wf.color || "#10B981" }}>
                                        <Zap size={32} />
                                    </div>
                                    <h3 className={styles.cardTitle}>{wf.name}</h3>
                                    <p className={styles.cardDesc}>{wf.description || "Professional automation workflow."}</p>
                                    <span className={styles.cardTag}>{wf.sector || "General"}</span>
                                </div>
                                
                                <div className={styles.cardStats}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statValue}>{wf.installs || "1.2K"}</span>
                                        <span className={styles.statLabel}>Installs</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statValue}>⭐ {wf.rating || "4.9"}</span>
                                        <span className={styles.statLabel}>Rating</span>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <button className={styles.viewDetailsBtn} onClick={() => setSelected(wf)}>View Details</button>
                                    <button className={styles.installBtn} onClick={() => setSelected(wf)}>Install</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Custom Request */}
            <section className={styles.customRequest}>
                <div className={styles.requestLeft}>
                    <h2 className={styles.requestTitle}>Can't find what you need?</h2>
                    <p className={styles.requestSub}>Request a custom workflow tailored to your unique business processes.</p>
                    <button className={styles.requestBtn}>
                        Request Custom Workflow <ArrowRight size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 800, fontSize: '0.9rem' }}>
                        <Check size={16} /> Our team will get back to you within 24 hours.
                    </div>
                </div>

                <div className={styles.howItWorks}>
                    <h3 className={styles.howTitle}>How it works</h3>
                    <div className={styles.stepsGrid}>
                        <div className={styles.stepConnector} />
                        <div className={styles.stepItem}>
                            <div className={styles.stepIconBox}><PencilLine size={20} /></div>
                            <div className={styles.stepInfo}>
                                <span className={styles.stepLabel}>1. Tell us your needs</span>
                                <span className={styles.stepDesc}>Fill out a short form and explain what you want.</span>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIconBox}><MessageSquare size={20} /></div>
                            <div className={styles.stepInfo}>
                                <span className={styles.stepLabel}>2. We design it</span>
                                <span className={styles.stepDesc}>Our automation experts create a tailored workflow for you.</span>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIconBox}><ClipboardCheck size={20} /></div>
                            <div className={styles.stepInfo}>
                                <span className={styles.stepLabel}>3. Review & approve</span>
                                <span className={styles.stepDesc}>Review the workflow and request any adjustments.</span>
                            </div>
                        </div>
                        <div className={styles.stepItem}>
                            <div className={styles.stepIconBox}><Rocket size={20} /></div>
                            <div className={styles.stepInfo}>
                                <span className={styles.stepLabel}>4. We deliver & set up</span>
                                <span className={styles.stepDesc}>We deliver, install, and help you get it running smoothly.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            {selected && (
                <div className={styles.overlay} onClick={() => !paying && setSelected(null)}>
                    <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className={styles.closeBtn} onClick={() => setSelected(null)}>
                            <X size={20} />
                        </button>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div className={styles.cardIconLarge} style={{ background: `${selected.color || "#10B981"}15`, color: selected.color || "#10B981" }}>
                                <Zap size={40} />
                            </div>
                            <h2 className={styles.panelTitle}>{selected.name}</h2>
                            <p style={{ fontSize: '1.1rem', color: "#64748b", fontWeight: 600, lineHeight: 1.6 }}>{selected.description}</p>
                        </div>

                        <div style={{ background: '#f8fafc', padding: 24, borderRadius: 24, border: '1px solid #f1f5f9' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 950, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>What's included</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {(selected.includes || ["Dedicated Server", "n8n Setup", "Full Configuration", "Testing"]).map((item: string) => (
                                    <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '0.95rem' }}>
                                        <Check size={18} color="#10B981" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 800, color: '#64748b' }}>Investment</span>
                                <span style={{ fontSize: "2rem", fontWeight: 950, color: "#0f172a" }}>
                                    €{getPrice(selected).toFixed(2)}
                                </span>
                            </div>
                            <button type="button" className={styles.payBtn} disabled={paying} onClick={startPayment} style={{ height: 64, borderRadius: 20, fontSize: '1.1rem', fontWeight: 950 }}>
                                {paying ? <><Loader2 className="spinning" size={24} /> Processing Registry…</> : "Continue to Deployment →"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
