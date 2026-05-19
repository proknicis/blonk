"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, X, Check, Loader2 } from "lucide-react";
import styles from "./marketplace.module.css";

const FALLBACK_WORKFLOWS = [
    {
        id: "tpl-ai-support",
        name: "AI Support Agent",
        description: "Automated customer support with OpenAI — triage tickets, draft replies, and escalate when needed.",
        sector: "IT",
        price: 149,
        setupTime: "~20 min",
        color: "#3B82F6",
    },
    {
        id: "tpl-discord-mod",
        name: "Discord Moderation Bot",
        description: "Moderate channels, welcome members, and enforce rules with configurable automations.",
        sector: "General",
        price: 99,
        setupTime: "~15 min",
        color: "#8B5CF6",
    },
    {
        id: "tpl-etsy",
        name: "Etsy Auto Reply",
        description: "Reply to Etsy messages automatically using templates and order context.",
        sector: "General",
        price: 79,
        setupTime: "~12 min",
        color: "#F59E0B",
    },
    {
        id: "tpl-tiktok",
        name: "TikTok Lead Scraper",
        description: "Capture leads from TikTok engagement and sync to your CRM or spreadsheet.",
        sector: "Marketing",
        price: 129,
        setupTime: "~18 min",
        color: "#EF4444",
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

    useEffect(() => {
        fetch("/api/marketplace")
            .then((r) => r.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setTemplates(data);
                else setTemplates(FALLBACK_WORKFLOWS);
            })
            .catch(() => setTemplates(FALLBACK_WORKFLOWS))
            .finally(() => setLoading(false));
    }, []);

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
            <div>
                <h1 className={styles.headerTitle}>Marketplace</h1>
                <p className={styles.headerSub}>Order pre-built workflows — dedicated server, n8n, and full setup included.</p>
            </div>

            {loading ? (
                <p style={{ color: "#64748b", fontWeight: 700 }}>Loading workflows…</p>
            ) : (
                <div className={styles.grid}>
                    {templates.map((wf) => (
                        <div key={wf.id} className={styles.card}>
                            <div className={styles.cardIcon} style={{ background: `${wf.color || "#10B981"}18`, color: wf.color || "#10B981" }}>
                                <Zap size={24} />
                            </div>
                            <h3 className={styles.cardTitle}>{wf.name}</h3>
                            <p className={styles.cardDesc}>{wf.description || "Professional automation workflow."}</p>
                            <div className={styles.cardPrice}>
                                {getPrice(wf) > 0 ? `€${getPrice(wf).toFixed(0)}` : "Free"}
                            </div>
                            <button type="button" className={styles.orderBtn} onClick={() => setSelected(wf)}>
                                Order Workflow
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {selected && (
                <div className={styles.overlay} onClick={() => !paying && setSelected(null)}>
                    <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                        <button type="button" className={styles.closeBtn} onClick={() => setSelected(null)} aria-label="Close">
                            <X size={18} />
                        </button>
                        <h2 className={styles.panelTitle}>Workflow: {selected.name}</h2>
                        <p style={{ margin: 0, color: "#64748b", fontWeight: 700 }}>
                            Setup Time: {selected.setupTime || "~20 min"}
                        </p>
                        <div>
                            <p style={{ fontWeight: 950, marginBottom: 12 }}>Includes:</p>
                            <ul className={styles.includesList}>
                                {["Dedicated Server", "n8n Setup", "Full Configuration", "Testing"].map((item) => (
                                    <li key={item}>
                                        <Check size={18} color="#10B981" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <p style={{ fontSize: "1.25rem", fontWeight: 950, color: "#10B981" }}>
                            €{getPrice(selected).toFixed(2)}
                        </p>
                        <button type="button" className={styles.payBtn} disabled={paying} onClick={startPayment}>
                            {paying ? <><Loader2 size={18} style={{ verticalAlign: "middle" }} /> Processing…</> : "Continue to Payment"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
