"use client";

import React, { useState } from "react";
import { 
    Activity, 
    Clock, 
    Wifi, 
    ShieldCheck,
    BarChart3,
    Cpu,
    Zap,
    TrendingUp
} from "lucide-react";
import styles from "./reports.module.css";

export default function ReportsClient({ metrics, chartData, throughputData, departmentData }: any) {
    const [timeframe, setTimeframe] = useState("30D");
    
    // Process real throughput data into an SVG string path
    const w = 800;
    const h = 200;
    const maxVal = Math.max(...throughputData, 10);
    const minVal = 0;
    
    const points = throughputData.map((val: number, i: number) => {
        const x = throughputData.length > 1 ? (i / (throughputData.length - 1)) * w : 0;
        const y = h - 20 - ((val - minVal) / (maxVal - minVal)) * (h - 40);
        return `${x},${y}`;
    });
    
    const pathLine = points.length > 0 ? `M${points[0]} ` + points.slice(1).map((p: string) => `L${p}`).join(" ") : `M0,180 L800,180`;
    const pathArea = `${pathLine} L${w},${h} L0,${h} Z`;

    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <div className={styles.eyebrow}>Fleet Intelligence</div>
                    <h2 className={styles.title}>Reports & Analytics</h2>
                    <p className={styles.subtitle}>Institutional performance metrics and real-time fleet telemetrics.</p>
                </div>
            </div>

            {/* Top Row KPIs */}
            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper}><Activity className={styles.kpiIcon} /></div>
                    <div className={styles.kpiValue}>${metrics.operationalROI.toLocaleString()}</div>
                    <div className={styles.kpiLabel}>Operational ROI</div>
                    <div className={styles.kpiSub}>Cost Efficiency: ${metrics.cost.toLocaleString()} spent, ${metrics.savings.toLocaleString()} saved</div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper}><Clock className={styles.kpiIcon} /></div>
                    <div className={styles.kpiValue}>{metrics.hoursReclaimed}% <span className={styles.trendUp}>↑</span></div>
                    <div className={styles.kpiLabel}>Total Hours Reclaimed</div>
                    <div className={styles.kpiSub}>Human-to-AI Ratio improving</div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper}><Zap className={styles.kpiIcon} /></div>
                    <div className={styles.kpiValue}>{metrics.loopLatency}ms</div>
                    <div className={styles.kpiLabel}>Average Loop Latency</div>
                    <div className={styles.kpiSub}>Fleet execution speed</div>
                </div>
                <div className={styles.kpiCard}>
                    <div className={styles.kpiIconWrapper}><ShieldCheck className={styles.kpiIcon} /></div>
                    <div className={styles.kpiValue}>{metrics.healthScore}%</div>
                    <div className={styles.kpiLabel}>System Health Score</div>
                    <div className={styles.kpiSub}>Error Prevention: {metrics.errorsPrevented} mitigated</div>
                </div>
            </div>

            {/* Middle Section: Fleet Throughput Line Chart */}
            <div className={styles.chartCardLarge}>
                <div className={styles.chartHeader}>
                    <div className={styles.chartTitleGroup}>
                        <TrendingUp size={20} className={styles.accentIcon} />
                        <h3>Fleet Throughput</h3>
                    </div>
                    <div className={styles.timeToggles}>
                        {['24H', '7D', '30D', 'Max'].map(tf => (
                            <button 
                                key={tf} 
                                className={`${styles.toggleBtn} ${timeframe === tf ? styles.toggleActive : ''}`}
                                onClick={() => setTimeframe(tf)}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.lineChartArea}>
                    {/* Simulated SVG Line Chart with glow */}
                    <svg viewBox="0 0 800 200" className={styles.svgChart}>
                        <defs>
                            <linearGradient id="glow" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="rgba(16, 185, 129, 0.2)" />
                                <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
                            </linearGradient>
                            <filter id="glowEffect">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <path d={pathArea} fill="url(#glow)" />
                        <path d={pathLine} fill="none" stroke="#10b981" strokeWidth="3" filter="url(#glowEffect)" />
                    </svg>
                </div>
            </div>

            {/* Bottom Section */}
            <div className={styles.bottomGrid}>
                {/* Left Card: Efficiency by Department */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleGroup}>
                            <BarChart3 size={20} className={styles.accentIcon} />
                            <h3>Efficiency by Department</h3>
                        </div>
                    </div>
                    <div className={styles.barChartArea}>
                        {departmentData.map((dep: any, i: number) => (
                            <div key={i} className={styles.barGroup}>
                                <div className={styles.barTrack}>
                                    <div className={styles.barFill} style={{ height: `${dep.value}%` }}></div>
                                </div>
                                <div className={styles.barLabel}>{dep.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Card: Resource Distribution */}
                <div className={styles.chartCard}>
                    <div className={styles.chartHeader}>
                        <div className={styles.chartTitleGroup}>
                            <Cpu size={20} className={styles.accentIcon} />
                            <h3>Resource Distribution</h3>
                        </div>
                    </div>
                    <div className={styles.radialArea}>
                        <div className={styles.radialChart}>
                            <svg viewBox="0 0 100 100" className={styles.radialSvg}>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="12" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - metrics.cpuUsage/100)} transform="rotate(-90 50 50)" />
                            </svg>
                            <div className={styles.radialInner}>
                                <div className={styles.radialValue}>{metrics.cpuUsage}%</div>
                                <div className={styles.radialLabel}>CPU Core</div>
                            </div>
                        </div>
                        <div className={styles.radialChart}>
                            <svg viewBox="0 0 100 100" className={styles.radialSvg}>
                                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="12" />
                                <circle cx="50" cy="50" r="40" fill="none" stroke="#0f172a" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset={251.2 * (1 - metrics.memUsage/100)} transform="rotate(-90 50 50)" />
                            </svg>
                            <div className={styles.radialInner}>
                                <div className={styles.radialValue}>{metrics.memUsage}%</div>
                                <div className={styles.radialLabel}>Memory</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
