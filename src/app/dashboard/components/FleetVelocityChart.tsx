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
        <div style={{ position: 'relative', width: '100%', animation: 'chartIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            
            {/* TOOLSET BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                   <div style={{ 
                       width: '52px', 
                       height: '52px', 
                       borderRadius: '16px', 
                       background: 'linear-gradient(135deg, #F0FAF5 0%, #E6F6EF 100%)', 
                       display: 'flex', 
                       alignItems: 'center', 
                       justifyContent: 'center', 
                       color: '#34D186',
                       boxShadow: '0 4px 12px rgba(52, 209, 134, 0.08)'
                   }}>
                       <TrendingUp size={26} />
                   </div>
                   <div>
                       <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 950, color: '#0F172A', letterSpacing: '-0.04em' }}>Fleet Velocity</h4>
                       <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Autonomous data throughput across active sectors</span>
                   </div>
                </div>

                <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                    {(['24h', '7d', '30d'] as const).map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            style={{
                                padding: '8px 18px',
                                borderRadius: '11px',
                                border: 'none',
                                background: range === r ? '#111' : 'transparent',
                                color: range === r ? '#FFFFFF' : '#64748B',
                                fontSize: '0.8rem',
                                fontWeight: 950,
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* CHART CANVAS */}
            <div 
                style={{ position: 'relative', height: '320px', width: '100%', marginBottom: '24px' }}
                onMouseLeave={() => setHoverIndex(null)}
            >
                {/* SVG RENDERING */}
                <svg width="100%" height="100%" viewBox="0 0 1000 240" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#34D186" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#34D186" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="areaGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.15" />
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
                            strokeWidth="1.5" 
                            strokeDasharray={v === 1 ? "" : "6 6"}
                        />
                    ))}

                    {chartLines.map((line, idx) => (
                        <g key={idx}>
                            {/* AREA FILL */}
                            <path 
                                d={getCurvePath(line.data, maxValue, true)} 
                                fill={idx === 0 ? "url(#areaGradient)" : "url(#areaGradient2)"} 
                                style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                            {/* MAIN LINE WITH GLOW */}
                            <path 
                                d={getCurvePath(line.data, maxValue, false)} 
                                fill="none" 
                                stroke={idx === 0 ? "#34D186" : "#0EA5E9"} 
                                strokeWidth="4.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                filter={idx === 0 ? "url(#glow)" : ""}
                                style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                            />
                        </g>
                    ))}

                    {/* INTERACTION OVERLAY */}
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

                    {/* HOVER CROSSHAIR */}
                    {hoverIndex !== null && (
                        <g style={{ transition: '0.1s' }}>
                            <line 
                               x1={(hoverIndex / (chartLines[0].data.length - 1)) * 1000} 
                               y1="0" x2={(hoverIndex / (chartLines[0].data.length - 1)) * 1000} 
                               y2="240" 
                               stroke="#0F172A" 
                               strokeWidth="1.5" 
                               strokeDasharray="4 2"
                            />
                            <circle 
                                cx={(hoverIndex / (chartLines[0].data.length - 1)) * 1000}
                                cy={240 - (chartLines[0].data[hoverIndex] / maxValue) * 240}
                                r="6"
                                fill="#34D186"
                                stroke="#FFF"
                                strokeWidth="3"
                                boxShadow="0 0 10px rgba(52, 209, 134, 0.5)"
                            />
                        </g>
                    )}
                </svg>

                {/* DYNAMIC INSTITUTIONAL TOOLTIP */}
                {hoverIndex !== null && (
                    <div style={{
                        position: 'absolute',
                        top: '-10px',
                        left: `${(hoverIndex / (chartLines[0].data.length - 1)) * 100}%`,
                        transform: 'translate(-50%, -100%)',
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        padding: '16px 20px',
                        borderRadius: '16px',
                        fontSize: '0.9rem',
                        fontWeight: 950,
                        zIndex: 100,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        border: '1px solid rgba(255,255,255,0.1)',
                        animation: 'tooltipIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <Clock size={12} /> {labels[Math.floor(hoverIndex / (chartLines[0].data.length / labels.length))] || 'Live Transmission'}
                        </div>
                        {chartLines.map((l, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', marginBottom: i === 0 ? '6px' : '0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? '#34D186' : '#0EA5E9' }} />
                                    <span style={{ opacity: 0.8 }}>{i === 0 ? 'Core Velocity' : 'Secondary Mirror'}</span>
                                </div>
                                <span style={{ color: i === 0 ? '#34D186' : '#0EA5E9' }}>{l.data[hoverIndex]} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>OPS</span></span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* X-AXIS LABELS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.8rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 4px' }}>
                {labels.map((label, i) => <span key={i}>{label}</span>)}
            </div>

            {/* DYNAMIC LEGEND & INSIGHTS */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px', 
                marginTop: '40px', 
                padding: '24px', 
                background: '#FFFFFF', 
                borderRadius: '24px', 
                border: '1px solid #F1F5F9',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.04)',
                width: '100%',
                boxSizing: 'border-box'
            }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52, 209, 134, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D186' }}>
                       <Zap size={20} />
                   </div>
                   <div>
                       <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#1E293B' }}>Sovereign Flow</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Primary Loop Throughput</div>
                   </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0EA5E9' }}>
                       <TrendingUp size={20} />
                   </div>
                   <div>
                       <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#1E293B' }}>Subsystem Mirror</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Mirrored Data Sync</div>
                   </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                       <Info size={20} />
                   </div>
                   <div>
                       <div style={{ fontSize: '0.9rem', fontWeight: 950, color: '#1E293B' }}>Peak Yield</div>
                       <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{Math.max(...chartLines[0].data)} Ops Peak</div>
                   </div>
               </div>
            </div>

            <style jsx>{`
                @keyframes chartIn { 
                    from { opacity: 0; transform: translateY(20px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                @keyframes tooltipIn { 
                    from { opacity: 0; transform: translate(-50%, -95%); } 
                    to { opacity: 1; transform: translate(-50%, -100%); } 
                }
            `}</style>
        </div>
    );
}
