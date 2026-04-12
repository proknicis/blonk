import Link from "next/link";
import styles from "../marketing_pages.module.css";
import React from "react";

export default function PricingPage() {
    return (
        <div className={styles.container}>
            <div className={styles.hero}>
                <span className={styles.label}>LICENSING & SCALE</span>
                <h1 className={styles.title}>Pricing<span style={{ color: 'var(--accent-primary)', display: 'inline-block', width: '0.1em', height: '0.1em', background: 'var(--accent-primary)', marginLeft: '0.05em', borderRadius: '2px' }}></span></h1>
                
                <div style={{ maxWidth: 800, fontSize: '1.25rem', color: '#555', lineHeight: 1.6, fontWeight: 500 }}>
                    <p style={{ marginBottom: 32 }}>Simple. Institutional. Scalable. Select the sovereign tier that fits your firm's administrative requirements.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {/* Pro Card */}
                <div style={{ background: '#FAFAFA', padding: 56, borderRadius: 48, textAlign: 'left', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Institutional</div>
                        <div style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '-0.06em' }}>$833<span style={{ fontSize: '1rem', color: '#666' }}>/mo</span></div>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.6 }}>Deploy a full autonomous workforce module across your critical departmental layers.</p>
                    <div style={{ height: 1, background: '#f0f0f0' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['Core Governance Engine', 'Public Sovereign Cloud', 'SOC-2 Ready Audit', '5 Seat Integrated Vault'].map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '1rem' }}>
                                <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>✓</div>
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/setup" style={{ background: '#111', color: '#FAFAFA', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, marginTop: 'auto' }}>Select Institutional.</Link>
                </div>

                {/* Scale Card — Featured */}
                <div style={{ background: '#FAFAFA', padding: 56, borderRadius: 48, textAlign: 'left', color: '#111', position: 'relative', display: 'flex', flexDirection: 'column', gap: 32, transform: 'translateY(-12px)', border: '1px solid #f0f0f0', boxShadow: '0 40px 80px rgba(0,0,0,0.05)' }}>
                    <div style={{ position: 'absolute', top: 32, right: 32, background: '#34D186', color: '#FAFAFA', fontSize: '0.75rem', fontWeight: 900, padding: '6px 16px', borderRadius: 6 }}>ENTERPRISE</div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Infrastructure</div>
                        <div style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '-0.06em' }}>Inquire</div>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.6 }}>The absolute operating layer for Fortune 500 legal and accounting firms.</p>
                    <div style={{ height: 1, background: '#f0f0f0' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16, color: '#555' }}>
                        {['Private Sovereign Backbone', 'Unlimited Capacity scaling', 'Strategic Compliance Sync', 'Dedicated Key Manager'].map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '1rem' }}>
                                <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>✓</div>
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/setup" style={{ background: '#111', color: '#FAFAFA', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, marginTop: 'auto' }}>Contact Architecture.</Link>
                </div>
            </div>
        </div>
    );
}
