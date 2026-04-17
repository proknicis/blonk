"use client";

import React from 'react';

interface SparklineProps {
    data: number[];
    color: string;
}

export function Sparkline({ data, color }: SparklineProps) {
    if (!data || data.length < 2) return null;
    
    return (
        <svg width="100" height="30" viewBox="0 0 100 30" style={{ overflow: 'visible' }}>
            <path
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={`M ${data.map((val, i) => `${(i / (data.length - 1)) * 100},${30 - (val / 100) * 30}`).join(' L ')}`}
                style={{ 
                    filter: `drop-shadow(0 0 4px ${color}44)`,
                    strokeDasharray: '10, 5',
                    animation: 'sparklineFlow 10s linear infinite'
                }}
            />
            <style jsx>{`
                @keyframes sparklineFlow {
                    from { stroke-dashoffset: 100; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </svg>
    );
}
