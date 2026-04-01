import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function AboutPage() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>STRATEGIC ORIGIN</span>
                <h1 className={styles.title}>About BLONK<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.1em', height: '0.1em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '2px' }}></span></h1>
                
                <div style={{ maxWidth: 800, fontSize: '1.25rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>We are building the autonomous world. 
                    BLONK was established by a collective of institutional governance experts and sovereign cloud architects. 
                    Our mission is to establish the secure operating layer for high-value professional services.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                <div className={styles.card}>
                    <h3 className={styles.card_title}>Sovereign Focus</h3>
                    <p className={styles.card_text}>We believe that institutional data belongs in departmental vaults, not public indices. Our cloud sits on a private, sovereign backbone.</p>
                </div>
                <div className={styles.card}>
                    <h3 className={styles.card_title}>Autonomous Logic</h3>
                    <p className={styles.card_text}>Every administrative task is logic-mapped and cryptographically executed, removing human-level friction and error points.</p>
                </div>
            </div>

            <section className={styles.footer_cta}>
                <h2 style={{ fontSize: '3rem', fontWeight: 950, marginBottom: 40, textTransform: 'uppercase' }}>Join the Network?</h2>
                <Link href="/setup" style={{ background: '#fff', color: '#000', padding: '20px 48px', borderRadius: '100px', fontWeight: 900, textDecoration: 'none' }}>Establish Trust.</Link>
            </section>
        </div>
    );
}
