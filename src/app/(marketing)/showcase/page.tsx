import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function ShowcasePage() {
    const cases = [
        { t: "Global Legal Firm", d: "Automated 85% of intake and GRC reconciliation across 12 countries. Zero operational friction during deployment." },
        { t: "Strategic Accountant", d: "Reduced administrative overhead by 92%. SOC-2 certified vaults deployed for all high-value client assets." },
        { t: "Insurance Proxy", d: "Autonomous vertical module established for real-time risk assessment and departmental sync." },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>PROVEN ARCHITECTURE</span>
                <h1 className={styles.title}>Showcase<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.1em', height: '0.1em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '2px' }}></span></h1>
                
                <div style={{ maxWidth: 800, fontSize: '1.25rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>Explore how institutional-grade firms are leveraging BLONK to reach sovereign vertical scale. These are real results from real deployments.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {cases.map(c => (
                    <div key={c.t} className={styles.card}>
                        <h3 className={styles.card_title}>{c.t}</h3>
                        <p className={styles.card_text}>{c.d}</p>
                    </div>
                ))}
            </div>

            <section className={styles.footer_cta}>
                <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: 40, textTransform: 'uppercase' }}>Ready for results?</h2>
                <Link href="/setup" style={{ background: '#fff', color: '#000', padding: '20px 48px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none' }}>Establish Results.</Link>
            </section>
        </div>
    );
}
