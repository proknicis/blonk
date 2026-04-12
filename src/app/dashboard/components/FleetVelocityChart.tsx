"use client";

import React, { useState, useEffect, useMemo } from "react";
import styles from "../page.module.css";
import { TrendingUp, Clock, Info } from "lucide-react";

interface ChartLine {
    name: string;
    data: number[];
}

export default function FleetVelocityChart({ initialData }: { initialData: ChartLine[] }) {
    const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [chartLines, setChartLines] = useState<ChartLine[]>(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);

    useEffect(() => {
        if (range !== '24h') {
            refreshData();
        } else {
            setChartLines(initialData);
        }
    }, [range]);

    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch(`/api/admin/velocity?range=${range}`);
            if (!response.ok) throw new Error("API Failure");
            const data = await response.json();
            if (Array.isArray(data)) setChartLines(data);
        } catch (error) {
            console.error("Velocity sync failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const getXLabels = () => {
        if (range === '24h') return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
        if (range === '7d') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'];
    };

    const labels = getXLabels();

    // SMOOTH CURVE LOGIC (Cubic Bezier Calculation)
    const getCurvePath = (data: number[], max: number, isArea = false) => {
        if (data.length < 2) return "";
        const width = 1000;
        const height = 240;
        const xStep = width / (data.length - 1);
        
        let path = `M 0 ${height - (data[0] / max) * height}`;
        
        for (let i = 0; i < data.length - 1; i++) {
            const x0 = i * xStep;
            const y0 = height - (data[i] / max) * height;
            const x1 = (i + 1) * xStep;
            const y1 = height - (data[i + 1] / max) * height;
            
            const cp1x = x0 + (x1 - x0) / 2;
            const cp1y = y0;
            const cp2x = x0 + (x1 - x0) / 2;
            const cp2y = y1;
            
            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x1} ${y1}`;
        }

        if (isArea) {
            path += ` V ${height} H 0 Z`;
        }
        
        return path;
    };

    const maxValue = useMemo(() => {
        const all = chartLines.flatMap(l => l.data);
        return Math.max(...all, 50) + 10;
    }, [chartLines]);

    return (
        <div style={{ position: 'relative', width: '100%', animation: 'chartIn 0.8s ease' }}>
            
            {/* TOOLSET BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F0FAF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D186' }}>
                       <TrendingUp size={24} style={{ margin: 'auto' }}/>
                   </div>
                   <div>
                       <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 950, color: '#111', letterSpacing: '-0.04em' }}>Fleet Velocity</h4>
                       <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>Autonomous data throughput across active sectors</span>
                   </div>
                </div>

                <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    {(['24h', '7d', '30d'] as const).map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: range === r ? '#111' : 'transparent',
                                color: range === r ? '#FFFFFF' : '#64748B',
                                fontSize: '0.75rem',
                                fontWeight: 950,
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* CHART CANVAS */}
            <div 
                style={{ position: 'relative', height: '300px', width: '100%', marginBottom: '24px' }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                {/* SVG RENDERING */}
                <svg width="100%" height="100%" viewBox="0 0 1000 240" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34D186" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#34D186" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* HORIZONTAL GRID */}
                    {[0, 0.25, 0.5, 0.75, 1].map(v => (
                        <line 
                            key={v} 
                            x1="0" y1={240 * v} 
                            x2="1000" y2={240 * v} 
                            stroke="#F1F5F9" 
                            strokeWidth="1" 
                            strokeDasharray={v === 1 ? "" : "4 4"}
                        />
                    ))}

                    {chartLines.map((line, idx) => (
                        <g key={idx}>
                            {/* AREA FILL */}
                            <path 
                                d={getCurvePath(line.data, maxValue, true)} 
                                fill={idx === 0 ? "url(#areaGradient)" : "url(#areaGradient2)"} 
                                style={{ transition: 'all 0.6s ease' }}
                            />
                            {/* MAIN LINE */}
                            <path 
                                d={getCurvePath(line.data, maxValue, false)} 
                                fill="none" 
                                stroke={idx === 0 ? "#34D186" : "#0EA5E9"} 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                style={{ transition: 'all 0.6s ease' }}
                            />
                        </g>
                    ))}

                    {/* INTERACTION OVERLAY (Transparent column detection) */}
                    {chartLines[0]?.data.map((_, i) => {
                        const x = (i / (chartLines[0].data.length - 1)) * 1000;
                        return (
                            <rect 
                                key={i}
                                x={x - 20} y="0" width="40" height="240"
                                fill="transparent"
                                style={{ cursor: 'crosshair' }}
                                onMouseEnter={() => setHoverIndex(i)}
                            />
                        );
                    })}

                    {/* HOVER INDICATOR */}
                    {hoverIndex !== null && (
                        <line 
                           x1={(hoverIndex / (chartLines[0].data.length - 1)) * 1000} 
                           y1="0" x2={(hoverIndex / (chartLines[0].data.length - 1)) * 1000} 
                           y2="240" 
                           stroke="#111" 
                           strokeWidth="1" 
                        />
                    )}
                </svg>

                {/* DYNAMIC TOOLTIP */}
                {hoverIndex !== null && (
                    <div style={{
                        position: 'absolute',
                        top: '-60px',
                        left: `${(hoverIndex / (chartLines[0].data.length - 1)) * 100}%`,
                        transform: 'translateX(-50%)',
                        background: '#111',
                        color: '#FFFFFF',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 950,
                        zIndex: 20,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        animation: 'tooltipIn 0.2s ease-out'
                    }}>
                        <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>
                           {labels[Math.floor(hoverIndex / (chartLines[0].data.length / labels.length))] || 'Live Point'}
                        </div>
                        {chartLines.map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: i === 0 ? '#34D186' : '#0EA5E9' }} />
                                {l.data[hoverIndex]} <span style={{ opacity: 0.6 }}>OPS</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* X-AXIS LABELS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {labels.map((label, i) => <span key={i}>{label}</span>)}
            </div>

            {/* LEGEND BOX */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap',
                gap: '24px 32px', 
                marginTop: '32px', 
                padding: '24px', 
                background: '#F8FAFC', 
                borderRadius: '20px', 
                border: '1px solid #E2E8F0',
                width: '100%',
                boxSizing: 'border-box'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#34D186' }} />
                   <div>
                       <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#111' }}>Sovereign Flow</div>
                       <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Primary Loop Throughput</div>
                   </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: '#0EA5E9' }} />
                   <div>
                       <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#111' }}>Subsystem Mirror</div>
                       <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700 }}>Mirrored Data Sync</div>
                   </div>
               </div>
            </div>

            <style jsx>{`
                @keyframes chartIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes tooltipIn { from { opacity: 0; transform: translateY(5px) translateX(-50%); } to { opacity: 1; transform: translateY(0) translateX(-50%); } }
            `}</style>
        </div>
    );
}
