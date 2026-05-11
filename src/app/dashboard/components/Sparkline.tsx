"use client";

import React from "react";

export default function Sparkline({ data, color = "var(--accent)" }: { data: number[], color?: string }) {
    if (!data || data.length < 2) return <div style={{ width: '80px', height: '24px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }} />;

    const width = 80;
    const height = 24;
    const max = Math.max(...data, 1);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
    }).join(" ");

    return (
        <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
            />
        </svg>
    );
}
