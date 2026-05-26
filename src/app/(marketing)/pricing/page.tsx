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
                    <p style={{ marginBottom: 32 }}>Buy your workflows once. Own the code and configuration forever. Select the one-time tier that fits your firm's administrative requirements.</p>
                </div>
            </div>

            <div className={styles.card_grid}>
                {/* Standard Card */}
                <div style={{ background: '#FAFAFA', padding: 56, borderRadius: 48, textAlign: 'left', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 32 }}>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Individual Workflows</div>
                        <div style={{ fontSize: '3.6rem', fontWeight: 950, letterSpacing: '-0.06em' }}>From $99<span style={{ fontSize: '1rem', color: '#666' }}>/workflow</span></div>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.6 }}>Each pre-configured workflow template has its own price. Buy only the automations you need.</p>
                    <div style={{ height: 1, background: '#f0f0f0' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {['1 Production-Ready Workflow', 'Lifetime Updates & Bug Fixes', 'Standard Configuration Guide', 'Self-Host or Sovereign Cloud', 'Community Support Access'].map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '1rem' }}>
                                <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>✓</div>
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/setup" style={{ background: '#111', color: '#FAFAFA', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, marginTop: 'auto' }}>Select Standard.</Link>
                </div>

                {/* Bundle Card — Featured */}
                <div style={{ background: '#FAFAFA', padding: 56, borderRadius: 48, textAlign: 'left', color: '#111', position: 'relative', display: 'flex', flexDirection: 'column', gap: 32, transform: 'translateY(-12px)', border: '1px solid #f0f0f0', boxShadow: '0 40px 80px rgba(0,0,0,0.05)' }}>
                    <div style={{ position: 'absolute', top: 32, right: 32, background: '#34D186', color: '#FAFAFA', fontSize: '0.75rem', fontWeight: 900, padding: '6px 16px', borderRadius: 6 }}>POPULAR</div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Institutional Pack</div>
                        <div style={{ fontSize: '4rem', fontWeight: 950, letterSpacing: '-0.06em' }}>$1,499<span style={{ fontSize: '1rem', color: '#666' }}>/bundle</span></div>
                    </div>
                    <p style={{ fontSize: '1.1rem', color: '#555', lineHeight: 1.6 }}>Up to 5 custom-tailored integrations and workflows with full provisioning support.</p>
                    <div style={{ height: 1, background: '#f0f0f0' }} />
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16, color: '#555' }}>
                        {['Up to 5 Premium Workflows', 'Tailored Customization by Our Team', 'Full Database & System Setup', 'Dedicated Onboarding Support', 'SOC-2 Ready Audit Trails'].map(f => (
                            <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '1rem' }}>
                                <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>✓</div>
                                {f}
                            </li>
                        ))}
                    </ul>
                    <Link href="/setup" style={{ background: '#111', color: '#FAFAFA', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, marginTop: 'auto' }}>Select Institutional.</Link>
                </div>
            </div>
        </div>
    );
}
