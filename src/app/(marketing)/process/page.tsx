import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function ProcessPage() {
    const steps = [
        { t: "1. Handshake", d: "Secure cryptographic integration with your existing stack. We establish a sovereign bridge in under 5 minutes." },
        { t: "2. Mapping", d: "Our autonomous units ingest your departmental workflows, mapping every friction point and leakage zone." },
        { t: "3. Deployment", d: "Vertical SaaS modules are provisioned. Your sovereign workforce begins executing background admin in 48 hours." },
        { t: "4. Governance", d: "A closed-loop system of SOC-2 certified reconciliation begins. Every operation is cryptographically audited." },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>OPERATIONAL DIRECTIVE</span>
                <h1 className={styles.title}>The Process<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.1em', height: '0.1em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '2px' }}></span></h1>
                
                <div style={{ maxWidth: 800, fontSize: '1.25rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>We've automated the administrative friction of institutional governance. Our four-stage deployment ensures your firm reaches sovereign vertical scale with zero operational interruption.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {steps.map(s => (
                    <div key={s.t} className={styles.card}>
                        <h3 className={styles.card_title}>{s.t}</h3>
                        <p className={styles.card_text}>{s.d}</p>
                    </div>
                ))}
            </div>

            <section className={styles.footer_cta}>
                <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: 40, textTransform: 'uppercase' }}>Ready to initialize?</h2>
                <Link href="/setup" style={{ background: '#fff', color: '#000', padding: '20px 48px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none' }}>Start Handshake.</Link>
            </section>
        </div>
    );
}
