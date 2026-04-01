import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function ServicesPage() {
    const services = [
        { t: "Institutional Intake", d: "100% automated extraction and reconciliation of high-value professional services documentation." },
        { t: "Sovereign GRC", d: "Autonomous governance, risk, and compliance syncs across globally distributed departmental layers." },
        { t: "Admin Abstraction", d: "Zero-latency background administrative processing for legal and accounting vertical loops." },
        { t: "Secure Vaults", d: "Cryptographically segmented storage for firm-critical client assets and departmental keys." },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>VERTICAL SOLUTIONS</span>
                <h1 className={styles.title}>Services<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.1em', height: '0.1em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '2px' }}></span></h1>
                
                <div style={{ maxWidth: 800, fontSize: '1.25rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>We've automated the administrative friction of institutional governance. Our four-stage deployment ensures your firm reaches sovereign vertical scale with zero operational interruption.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {services.map(s => (
                    <div key={s.t} className={styles.card}>
                        <h3 className={styles.card_title}>{s.t}</h3>
                        <p className={styles.card_text}>{s.d}</p>
                    </div>
                ))}
            </div>

            <section className={styles.footer_cta}>
                <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: 40, textTransform: 'uppercase' }}>Ready to deploy?</h2>
                <Link href="/setup" style={{ background: '#fff', color: '#000', padding: '20px 48px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none' }}>Initialize Module.</Link>
            </section>
        </div>
    );
}
