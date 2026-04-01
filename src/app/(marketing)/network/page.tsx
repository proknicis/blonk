import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function GlobalNetwork() {
    const locations = [
        { city: "London", region: "EMEA", lat: "51.5074° N", long: "0.1278° W" },
        { city: "New York", region: "AMER", lat: "40.7128° N", long: "74.0060° W" },
        { city: "Singapore", region: "APAC", lat: "1.3521° N", long: "103.8198° E" },
        { city: "Zurich", region: "EMEA", lat: "47.3769° N", long: "8.5417° E" },
        { city: "Dubai", region: "MENA", lat: "25.2048° N", long: "55.2708° E" },
        { city: "San Francisco", region: "AMER", lat: "37.7749° N", long: "122.4194° W" },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>GLOBAL SOVEREIGN INFRASTRUCTURE</span>
                <h1 className={styles.title}>Global Network<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.1em', height: '0.1em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '2px' }}></span></h1>
                
                <div style={{ maxWidth: 800, fontSize: '1.25rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>Deploy your autonomous modules across our globally distributed sovereign cloud infrastructure. Zero-latency governance, mirrored across the world's most secure departmental zones.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {locations.map(loc => (
                    <div key={loc.city} className={styles.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent-primary)', letterSpacing: '0.1em' }}>{loc.region}</span>
                            <div style={{ width: 12, height: 12, background: 'var(--accent-primary)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent-primary)' }}></div>
                        </div>
                        <h3 className={styles.card_title}>{loc.city}</h3>
                        <div style={{ fontVariantNumeric: 'tabular-nums', color: '#888', fontSize: '0.9rem', fontWeight: 600 }}>
                            <div>{loc.lat}</div>
                            <div>{loc.long}</div>
                        </div>
                    </div>
                ))}
            </div>

            <footer className={styles.footer}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.06em', color: '#000' }}>BLONK<span style={{ display: 'inline-block', width: 6, height: 6, background: '#34D186', marginLeft: 1, borderRadius: 1 }}></span></div>
                    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <Link href="/privacy" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Privacy Policy</Link>
                        <Link href="/terms" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Terms of Service</Link>
                        <Link href="/network" style={{ color: '#000', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 900 }}>Global Network</Link>
                    </div>
                </div>
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span>© 2026 BLONK ASSETS LLC.</span>
                    <span>SOVEREIGN CLOUD INFRASTRUCTURE</span>
                </div>
            </footer>
        </div>
    );
}
