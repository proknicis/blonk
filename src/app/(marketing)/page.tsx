import Link from "next/link";
import styles from "./home.module.css";
import React from "react";
import BentoGrids from "@/components/bundui/bento-grid";

export default function HomePage() {
    const portraits = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=256&h=256&auto=format&fit=crop",
    ];

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <main className={styles.hero}>
                    <div className={styles.big_title_wrapper}>
                        <h1 className={styles.big_title}>
                            BLONK<span className={styles.title_dot}></span>
                        </h1>
                    </div>

                    <div className={styles.hero_bottom}>
                        <div className={styles.feature_pills}>
                            <div className={styles.feature_pill}>
                                <i className={styles.check_icon}>✓</i> Institutional-grade
                            </div>
                            <div className={styles.feature_pill}>
                                <i className={styles.check_icon}>✓</i> Secure reconciliation
                            </div>
                            <div className={styles.feature_pill}>
                                <i className={styles.check_icon}>✓</i> SOC-2 Certified
                            </div>
                        </div>

                        <div className={styles.cta_center}>
                            <Link href="/setup" className={styles.cta_button}>
                                <span className={styles.cta_text}>Get started</span>
                                <div className={styles.arrow_circle}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </div>
                            </Link>
                        </div>

                        <div className={styles.desc_right}>
                            <h3 className={styles.desc_h3}>
                                Dedicated team of <br/>autonomous workflows.
                            </h3>
                            <p className={styles.desc_p}>
                                Kickstart your governance and receive your results in a matter of 2-3 days. 
                                Enjoy full flexibility of a sovereign workforce for the price of one employee. 
                                No manual calls, or slow audits.
                            </p>
                        </div>
                    </div>
                </main>

                <BentoGrids />

                {/* --- Pricing Section --- */}
                <section style={{ padding: '160px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#34D186', display: 'block', marginBottom: 24 }}>Pricing</span>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: 64 }}>Simple. Integrated. Scaleable.</h2>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
                            {/* Pro Card */}
                            <div style={{ background: '#fff', padding: 56, borderRadius: 48, textAlign: 'left', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Institutional</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.06em' }}>$833<span style={{ fontSize: '1rem', color: '#666' }}>/mo</span></div>
                                </div>
                                <p style={{ fontSize: '1.05rem', color: '#555', lineHeight: 1.6 }}>Deploy a full autonomous workforce module across your critical departmental layers. Includes 24/7 GRC support and SSO integration.</p>
                                <div style={{ height: 1, background: '#f0f0f0' }} />
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {['Core Governance Engine', 'Public Sovereign Cloud', 'Standard Audit Support', '5 Seat Integrated Vault'].map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '0.95rem' }}>
                                            <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>✓</div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/setup" style={{ background: '#000', color: '#fff', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 800, marginTop: 'auto' }}>Initialize BLONK.</Link>
                            </div>

                            {/* Scale Card — Featured */}
                            <div style={{ background: '#000', padding: 56, borderRadius: 48, textAlign: 'left', color: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', gap: 32, transform: 'translateY(-12px)', boxShadow: '0 40px 80px rgba(0,0,0,0.15)' }}>
                                <div style={{ position: 'absolute', top: 32, right: 32, background: '#34D186', color: '#fff', fontSize: '0.7rem', fontWeight: 900, padding: '4px 12px', borderRadius: 6 }}>ELITE</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#666', marginBottom: 8 }}>Enterprise</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.06em' }}>Custom<span style={{ fontSize: '1rem', color: '#444' }}>/usage</span></div>
                                </div>
                                <p style={{ fontSize: '1.05rem', color: '#999', lineHeight: 1.6 }}>The ultimate administrative infrastructure for Fortune 500 legal and accounting practices. Unlimited vertical scaling across any stack.</p>
                                <div style={{ height: 1, background: '#333' }} />
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16, color: '#999' }}>
                                    {['Strategic Audit Suite', 'Private Sovereign Cloud', 'Unlimited Vertical Scaling', 'Dedicated Compliance Manager'].map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '0.95rem' }}>
                                            <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem' }}>✓</div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/setup" style={{ background: '#fff', color: '#000', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 800, marginTop: 'auto' }}>Inquire for Enterprise.</Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section style={{ padding: '160px 24px', textAlign: 'center', background: '#000', color: '#fff' }}>
                    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#34D186', display: 'block', marginBottom: 24 }}>Ready to integrate?</span>
                        <h2 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: 48, lineHeight: 1.05 }}>Establish your sovereign governance today.</h2>
                        <Link href="/setup" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: '#fff', color: '#000', padding: '24px 64px', borderRadius: '100px', fontSize: '1.25rem', fontWeight: 900, textDecoration: 'none', transition: 'transform 0.3s' }}>
                            Scale with BLONK.
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </Link>
                    </div>
                </section>
            </div>

            <footer style={{ padding: '80px 24px 40px', background: '#ffffff', borderTop: '1px solid #f0f0f0', width: '100%', maxWidth: 1400, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.06em', color: '#000' }}>BLONK<span style={{ display: 'inline-block', width: 6, height: 6, background: '#34D186', marginLeft: 1, borderRadius: 1 }}></span></div>
                    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <Link href="/privacy" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Privacy Policy</Link>
                        <Link href="/terms" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Terms of Service</Link>
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
