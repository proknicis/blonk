import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function TermsOfService() {
    const clauses = [
        { t: "1. Operational Environment", d: "By accessing the BLONK autonomous workforce, you are establishing an institutional handshake within our sovereign cloud network. All modules are for professional services use cases only." },
        { t: "2. Cryptographic Integrity", d: "You are responsible for the security of your departmental keys. Any manual override of our governance logic must be authorized through a secondary strategic admin node." },
        { t: "3. Vertical Scalability", d: "Licensing is governed by departmental usage and capacity loops. We provide unlimited vertical scale, provided the integration architecture remains within our SOC-2 guardrails." },
        { t: "4. Sovereign Liability", d: "Liability is abstracted through our proprietary sovereign cloud layer. We guarantee 99.9% operational precision for all background administrative tasks." },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>GOVERNANCE HANDSHAKE</span>
                <h1 className={styles.title}>Terms of Service<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.15em', height: '0.15em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '4px' }}></span></h1>
                
                <div style={{ maxWidth: 840, fontSize: '1.3rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>These terms define the institutional bridge between your firm's administrative requirements and BLONK's sovereign vertical stack. By using our services, you agree to zero-compromise excellence.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {clauses.map(c => (
                    <div key={c.t} className={styles.card}>
                        <h3 className={styles.card_title}>{c.t}</h3>
                        <p className={styles.card_text}>{c.d}</p>
                    </div>
                ))}
            </div>

            <section className={styles.footer_cta}>
                <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: 40, textTransform: 'uppercase' }}>Ready for scale?</h2>
                <Link href="/setup" style={{ background: '#fff', color: '#000', padding: '20px 48px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none' }}>Establish Trust.</Link>
            </section>
        </div>
    );
}
