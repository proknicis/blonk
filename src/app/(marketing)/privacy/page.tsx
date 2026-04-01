import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function PrivacyPolicy() {
    const sections = [
        { t: "Sovereign Data Shielding", d: "Your institutional data is never integrated into public indices. We utilize cryptographically-segmented vaults to ensure that every departmental workload remains sovereign and isolated." },
        { t: "Autonomous Reconciliation", d: "Every data access event is logged and verified by our autonomous workforce. We maintain a zero-leakage protocol, ensuring that only verified strategic administrators have visibility." },
        { t: "SOC-2 Type II Compliance", d: "Our infrastructure is governed by strict SOC-2 standards. We perform continuous, real-time threat abstraction and departmental monitoring to protect firm-critical assets." },
        { t: "Vault Integrity", d: "Client-critical metadata is stored within high-fidelity hardware security modules (HSM) across our distributed sovereign cloud backbone." },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>LEGAL & GOVERNANCE PROXY</span>
                <h1 className={styles.title}>Privacy Policy<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.15em', height: '0.15em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '4px' }}></span></h1>
                
                <div style={{ maxWidth: 840, fontSize: '1.3rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>At BLONK, privacy is not a policy—it is a core architectural requirement. We leverage sovereign vertical loops to protect the integrity of your professional services data across every departmental layer.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {sections.map(s => (
                    <div key={s.t} className={styles.card}>
                        <h3 className={styles.card_title}>{s.t}</h3>
                        <p className={styles.card_text}>{s.d}</p>
                    </div>
                ))}
            </div>

            <section className={styles.footer_cta}>
                <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: 40, textTransform: 'uppercase' }}>Secure your firm?</h2>
                <Link href="/setup" style={{ background: '#fff', color: '#000', padding: '20px 48px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none' }}>Initialize Shield.</Link>
            </section>
        </div>
    );
}
