"use client";

import React, { useState, useEffect } from "react";
import styles from "../page.module.css";

interface ChartLine {
    name: string;
    data: number[];
}

export default function FleetVelocityChart({ initialData }: { initialData: ChartLine[] }) {
    const [range, setRange] = useState<'24h' | '7d' | '30d'>('24h');
    const [chartLines, setChartLines] = useState<ChartLine[]>(initialData);
    const [isRefreshing, setIsRefreshing] = useState(false);

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
            const data = await response.json();
            if (Array.isArray(data)) {
                setChartLines(data);
            }
        } catch (error) {
            console.error("Velocity sync failed", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const getXLabels = () => {
        if (range === '24h') return ['00:00', '06:00', '12:00', '18:00', '23:59'];
        if (range === '7d') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    };

    const labels = getXLabels();

    return (
        <div className={styles.card} style={{ border: '1px solid #EAEAEA', background: '#FFFFFF', padding: '48px', position: 'relative' }}>
            {isRefreshing && <div style={{ position: 'absolute', top: '24px', right: '24px', width: '20px', height: '20px', border: '2px solid #34D186', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 950, color: '#0A0A0A', marginBottom: '8px', letterSpacing: '-0.05em' }}>Fleet Velocity</h2>
                    <p style={{ color: '#64748B', fontSize: '0.9rem', fontWeight: 800 }}>Sovereign performance trajectory tracking ({range.toUpperCase()} Horizon).</p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', background: '#F8F9FA', padding: '6px', borderRadius: '12px', border: '1px solid #EAEAEA' }}>
                    {(['24h', '7d', '30d'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: range === r ? '#0A0A0A' : 'transparent',
                                color: range === r ? '#FFFFFF' : '#94A3B8',
                                fontSize: '0.75rem',
                                fontWeight: 950,
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ position: 'relative', height: '200px', width: '100%', marginBottom: '32px' }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    {/* Grid Lines */}
                    <line x1="0" y1="0" x2="1000" y2="0" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    <line x1="0" y1="100" x2="1000" y2="100" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
                    <line x1="0" y1="200" x2="1000" y2="200" stroke="rgba(0,0,0,0.05)" strokeWidth="2" />

                    {chartLines.map((line, idx) => {
                        const dataPoints = line.data || [];
                        const max = Math.max(...dataPoints, 10);
                        const points = dataPoints.map((val, i) => {
                            const x = (i / (dataPoints.length - 1 || 1)) * 1000;
                            const y = 200 - (val / max) * 180;
                            return `${x},${y}`;
                        }).join(' ');

                        if (!points) return null;

                        return (
                            <path 
                                key={idx} 
                                d={`M ${points}`} 
                                fill="none" 
                                stroke={idx === 0 ? '#34D186' : '#38BDF8'} 
                                strokeWidth="5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                                opacity={0.9 - (idx * 0.2)}
                                style={{ transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                            />
                        );
                    })}
                </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 950, borderTop: '1px solid #F8F9FA', paddingTop: '16px' }}>
                {labels.map((label, i) => (
                    <span key={i}>{label}</span>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '24px', marginTop: '32px', borderTop: '1px solid #F8F9FA', paddingTop: '24px' }}>
                {chartLines.slice(0, 4).map((line, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i === 0 ? '#34D186' : '#38BDF8' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 950, color: '#0A0A0A' }}>{line.name.toUpperCase()}</span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
