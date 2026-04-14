"use client";

import React from "react";
import { TrendingUp, AlertTriangle, Zap } from "lucide-react";

const roiData = [
    { month: "Nov", saved: 6200, cost: 833 },
    { month: "Dec", saved: 7100, cost: 833 },
    { month: "Jan", saved: 8400, cost: 833 },
    { month: "Feb", saved: 9100, cost: 833 },
    { month: "Mar", saved: 9600, cost: 833 },
    { month: "Apr", saved: 9800, cost: 833 },
];

const heatmapData: Record<string, number> = {
    "2026-04-01": 0, "2026-04-02": 1, "2026-04-03": 0, "2026-04-04": 0,
    "2026-04-07": 0, "2026-04-08": 3, "2026-04-09": 0, "2026-04-10": 0, "2026-04-11": 1,
    "2026-04-14": 1, "2026-04-15": 0, "2026-04-16": 0, "2026-04-17": 0, "2026-04-18": 0,
};

const days = Object.keys(heatmapData);

function heatColor(val: number) {
    if (val === 0) return "rgba(52,209,134,0.15)";
    if (val === 1) return "rgba(245,158,11,0.4)";
    return "rgba(239,68,68,0.6)";
}

const maxSaved = Math.max(...roiData.map(d => d.saved));

export default function ReportsPage() {
    const totalSaved = roiData.reduce((a, b) => a + b.saved, 0);
    const totalCost = roiData.reduce((a, b) => a + b.cost, 0);
    const roi = Math.round(((totalSaved - totalCost) / totalCost) * 100);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--accent)", marginBottom: 6 }}>Intelligence</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 950, letterSpacing: "-0.03em", margin: 0 }}>Analytics & Reports</h2>
                <p style={{ fontSize: "0.88rem", color: "var(--muted-foreground)", marginTop: 6 }}>
                    ROI tracking, error diagnostics, and predictive intelligence — ready for your next board presentation.
                </p>
            </div>

            {/* Summary KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                {[
                    { label: "Total Value Recovered", value: `$${totalSaved.toLocaleString()}`, sub: "Last 6 months" },
                    { label: "Platform Cost", value: `$${totalCost.toLocaleString()}`, sub: "Last 6 months" },
                    { label: "Net ROI", value: `${roi}%`, sub: "Return on investment", accent: true },
                    { label: "Hours Saved", value: "1,140h", sub: "Last 6 months" },
                ].map((k, i) => (
                    <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: "24px 28px" }}>
                        <div style={{ fontSize: "1.9rem", fontWeight: 950, letterSpacing: "-0.05em", color: k.accent ? "var(--accent)" : "var(--foreground)", marginBottom: 4 }}>{k.value}</div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--foreground)", marginBottom: 3 }}>{k.label}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted-foreground)" }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* ROI Chart */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: "28px 32px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
                    <TrendingUp size={18} style={{ color: "var(--accent)" }} />
                    <div style={{ fontWeight: 900, fontSize: "1rem" }}>Monthly Value vs. Cost</div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 160 }}>
                    {roiData.map((d, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, height: 140, justifyContent: "flex-end" }}>
                                <div title={`$${d.saved.toLocaleString()} saved`} style={{ width: "60%", height: `${(d.saved / maxSaved) * 120}px`, background: "var(--accent)", borderRadius: "6px 6px 0 0", minHeight: 8, opacity: 0.85 }} />
                                <div title={`$${d.cost} cost`} style={{ width: "35%", height: `${(d.cost / maxSaved) * 120}px`, background: "var(--foreground)", borderRadius: "4px 4px 0 0", minHeight: 4, opacity: 0.3 }} />
                            </div>
                            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)" }}>{d.month}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.75rem", fontWeight: 700, color: "var(--muted-foreground)" }}>
                        <div style={{ width: 10, height: 10, background: "var(--accent)", borderRadius: 2 }} /> Value recovered
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.75rem", fontWeight: 700, color: "var(--muted-foreground)" }}>
                        <div style={{ width: 10, height: 10, background: "var(--foreground)", borderRadius: 2, opacity: 0.3 }} /> Platform cost
                    </div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Error Heatmap */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: "28px 32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <AlertTriangle size={18} style={{ color: "#f59e0b" }} />
                        <div style={{ fontWeight: 900, fontSize: "1rem" }}>Error Rate Heatmap</div>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", marginBottom: 16 }}>April 2026 — failures per day</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {days.map(day => (
                            <div key={day} title={`${day}: ${heatmapData[day]} error(s)`} style={{ width: 34, height: 34, borderRadius: 8, background: heatColor(heatmapData[day]), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: heatmapData[day] > 0 ? "#fff" : "rgba(52,209,134,0.6)", cursor: "default" }}>
                                {new Date(day).getDate()}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 16 }}>
                        {[["rgba(52,209,134,0.15)", "0 errors"], ["rgba(245,158,11,0.4)", "1 error"], ["rgba(239,68,68,0.6)", "2+ errors"]].map(([c, l]) => (
                            <div key={l as string} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", fontWeight: 700, color: "var(--muted-foreground)" }}>
                                <div style={{ width: 10, height: 10, background: c as string, borderRadius: 3 }} /> {l}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Predictive Maintenance */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: "28px 32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                        <Zap size={18} style={{ color: "var(--accent)" }} />
                        <div style={{ fontWeight: 900, fontSize: "1rem" }}>Predictive Intelligence</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {[
                            { label: "Quota forecast", value: "12 days", sub: "At current volume, data quota exhausted in ~12 days. Recommend upgrade.", color: "#f59e0b" },
                            { label: "Top process at risk", value: "Invoice Loop", sub: "3 failures this month — 40% above baseline. Review connection config.", color: "#ef4444" },
                            { label: "System health", value: "Stable", sub: "All other processes running within expected parameters.", color: "var(--accent)" },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: "16px 18px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 14 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                    <div style={{ fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--muted-foreground)" }}>{item.label}</div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 900, color: item.color }}>{item.value}</div>
                                </div>
                                <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{item.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
