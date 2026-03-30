import Link from "next/link";
import styles from "./home.module.css";
import React from "react";
import BentoGrids from "@/components/bundui/bento-grid";

export default function HomePage() {
    return (
        <div className={styles.container}>
            {/* --- Hero Section --- */}
            <section className={styles.hero}>
                <div className={styles.hero_content}>
                    <span className={styles.label_cap}>Institutional-Grade Workforce</span>
                    <h1 className={styles.hero_h1}>
                        Secure. Compliant. <br/>Autonomous Scaling.
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#64748B', maxWidth: 640, margin: '0 auto 48px', lineHeight: 1.6 }}>
                        The world's premier administrative infrastructure for professional firms. Automate high-stakes governance and audit workflows with zero-leakage security.
                    </p>
                    <div className={styles.hero_sub}>
                        <Link href="/setup" className="button-primary" style={{ padding: '16px 40px', borderRadius: '12px', fontSize: '1.1rem' }}>
                            Start Integration
                        </Link>
                        <Link href="/setup?demo=true" className="button-secondary" style={{ padding: '16px 40px', borderRadius: '12px', fontSize: '1.1rem', marginLeft: 16 }}>
                            Request Demo
                        </Link>
                    </div>
                </div>
                <div className={styles.platform_viz}>
                    <div className={styles.browser_mockup}>
                        <div className={styles.browser_header}>
                            <div className={styles.browser_dots}>
                                <div className={styles.dot} />
                                <div className={styles.dot} />
                                <div className={styles.dot} />
                            </div>
                        </div>
                        <div className={styles.browser_screen}>
                            <div style={{ width: 220, borderRight: '1px solid #F1F5F9', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ height: 16, width: '80%', background: '#F1F5F9', borderRadius: 4 }} />
                                <div style={{ height: 16, width: '60%', background: '#F8FAFC', borderRadius: 4 }} />
                                <div style={{ height: 16, width: '70%', background: '#F1F5F9', borderRadius: 4 }} />
                                <div style={{ marginTop: 'auto', height: 40, width: '100%', background: '#F8FAFC', borderRadius: 12 }} />
                            </div>
                            <div style={{ flex: 1, padding: 40 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
                                    <div style={{ width: '30%', height: 12, background: '#F1F5F9', borderRadius: 4 }} />
                                    <div style={{ width: 80, height: 12, background: '#F1F5F9', borderRadius: 4 }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                                    {[1, 2, 3].map(i => (
                                        <div key={i} style={{ padding: 24, background: '#FAFAFB', border: '1px solid #F1F5F9', borderRadius: 16 }}>
                                            <div style={{ width: 32, height: 10, background: '#EFF2F6', borderRadius: 5, marginBottom: 12 }} />
                                            <div style={{ height: 8, width: '80%', background: '#F1F5F9', borderRadius: 4 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Capabilities Section --- */}
            <section className={styles.grid_section}>
                <div className="container">
                    <div className={styles.section_header}>
                        <span className={styles.label_cap}>Capabilities</span>
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: 24 }}>Specialized Workforce Modules.</h2>
                        <p style={{ fontSize: '1.2rem', color: '#64748B', lineHeight: 1.6 }}>Deploy targeted autonomous units that integrate directly with your existing Practice Management Software.</p>
                    </div>
                    <div className={styles.template_grid}>
                        {[
                            { title: 'Legal Settlement', desc: 'Secure, automated reconciliation for trust accounts and client escrow movements.', link: '/sectors/legal' },
                            { title: 'Governance Guard', desc: 'Continuous compliance monitoring with real-time risk mitigation triggers.', link: '/sectors/finance' },
                            { title: 'Firm Analytics', desc: 'Predictive ROI modeling on administrative output and workforce efficiency.', link: '/sectors/consulting' }
                        ].map((item, i) => (
                            <Link href={item.link || '/sectors'} key={i} className={styles.template_card} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className={styles.card_icon}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                                </div>
                                <h4 className={styles.card_h4}>{item.title}</h4>
                                <p className={styles.card_p}>{item.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Anatomy Section (BundUI Bento Grid) --- */}
            <BentoGrids />

            {/* --- Integration Timeline Section (Modern) --- */}
            <section style={{ padding: '140px 0', borderTop: '1px solid #F1F5F9', background: '#FAFAFA' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <span className={styles.label_cap}>Deployment</span>
                        <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                            Rapid Governance Integration.
                        </h2>
                    </div>

                    {/* Step connector row */}
                    <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>

                        {/* Connecting line */}
                        <div style={{
                            position: 'absolute',
                            top: 28,
                            left: 'calc(16.66% + 20px)',
                            right: 'calc(16.66% + 20px)',
                            height: 2,
                            background: 'linear-gradient(90deg, #34D186 0%, #34D186 50%, #E2E8F0 50%, #E2E8F0 100%)',
                            zIndex: 0,
                        }} />

                        {/* Step numbers row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48, position: 'relative', zIndex: 1 }}>
                            {[
                                { n: '01', active: true },
                                { n: '02', active: true },
                                { n: '03', active: false },
                            ].map(({ n, active }) => (
                                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 56, height: 56,
                                        borderRadius: '50%',
                                        background: active ? '#34D186' : '#E2E8F0',
                                        color: active ? '#fff' : '#94A3B8',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.05em',
                                        boxShadow: active ? '0 0 0 6px rgba(52,209,134,0.15)' : 'none',
                                        transition: 'all 0.3s ease',
                                    }}>
                                        {n}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Phase cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                            {[
                                {
                                    phase: 'Phase 01',
                                    title: 'Protocol Mapping',
                                    days: 'DAY 0–07',
                                    desc: 'Systemic evaluation of administrative logic and sovereign cloud integrity via deep-surface diagnostics and vulnerability mapping.',
                                    active: true,
                                },
                                {
                                    phase: 'Phase 02',
                                    title: 'Unit Integration',
                                    days: 'DAY 08–21',
                                    desc: 'Synchronized deployment of specialized autonomous workforce modules across mission-critical departmental command layers.',
                                    active: true,
                                },
                                {
                                    phase: 'Phase 03',
                                    title: 'Governance Autonomy',
                                    days: 'DAY 22+',
                                    desc: 'Transition to continuous, self-correcting equilibrium with real-time audit-ready compliance and generative workforce scaling.',
                                    active: false,
                                },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    background: item.active ? '#101112' : '#fff',
                                    border: item.active ? '1px solid #222' : '1px solid #E2E8F0',
                                    borderRadius: 20,
                                    padding: '36px 32px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 16,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase',
                                            letterSpacing: '0.15em', color: '#34D186',
                                        }}>
                                            {item.phase}
                                        </span>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em',
                                            color: item.active ? '#4A5568' : '#94A3B8',
                                            background: item.active ? 'rgba(255,255,255,0.07)' : '#F8FAFC',
                                            padding: '4px 10px', borderRadius: 6,
                                        }}>
                                            {item.days}
                                        </span>
                                    </div>
                                    <h3 style={{
                                        fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.03em',
                                        color: item.active ? '#fff' : '#101112',
                                        lineHeight: 1.2,
                                    }}>
                                        {item.title}
                                    </h3>
                                    <p style={{
                                        fontSize: '0.95rem', lineHeight: 1.75, fontWeight: 500,
                                        color: item.active ? '#94A3B8' : '#64748B',
                                    }}>
                                        {item.desc}
                                    </p>
                                    <div style={{
                                        marginTop: 'auto', paddingTop: 20,
                                        borderTop: `1px solid ${item.active ? 'rgba(255,255,255,0.08)' : '#F1F5F9'}`,
                                        display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: item.active ? '#34D186' : '#CBD5E1',
                                        }} />
                                        <span style={{
                                            fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            color: item.active ? '#34D186' : '#94A3B8',
                                        }}>
                                            {item.active ? 'Active Phase' : 'Upcoming'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Pricing Section --- */}
            <section style={{ padding: '140px 0', background: '#0A0A0B', position: 'relative', overflow: 'hidden' }}>
                {/* Subtle grid bg */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.03,
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    pointerEvents: 'none',
                }} />
                {/* Green glow */}
                <div style={{
                    position: 'absolute', top: '-20%', right: '10%',
                    width: 600, height: 600,
                    background: 'radial-gradient(circle, rgba(52,209,134,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: 80 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#34D186', display: 'block', marginBottom: 16 }}>Pricing</span>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.04em', color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
                            Flexible Security.
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '1.1rem', maxWidth: 480, margin: '0 auto' }}>
                            Institutional infrastructure priced for every stage of growth.
                        </p>
                    </div>

                    {/* Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto' }}>

                        {/* Starter Card */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 24,
                            padding: '48px 40px',
                            display: 'flex', flexDirection: 'column', gap: 0,
                            backdropFilter: 'blur(12px)',
                        }}>
                            <div style={{ marginBottom: 32 }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#64748B' }}>Starter</span>
                                <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.05em', color: '#fff', lineHeight: 1 }}>$12</span>
                                    <span style={{ fontSize: '1rem', color: '#475569', fontWeight: 700 }}>/month</span>
                                </div>
                                <p style={{ color: '#475569', fontSize: '0.9rem', marginTop: 12, lineHeight: 1.6 }}>
                                    For growing firms establishing their governance baseline.
                                </p>
                            </div>

                            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }} />

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 40, flex: 1 }}>
                                {[
                                    'Core Governance Engine',
                                    'Standard Audit Support',
                                    'Institutional Vault (5 seats)',
                                    'Email Support',
                                ].map(f => (
                                    <li key={f} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(52,209,134,0.12)', border: '1px solid rgba(52,209,134,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D186" strokeWidth="3.5"><path d="M20 6 9 17l-5-5"/></svg>
                                        </div>
                                        <span style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 500 }}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/setup?tier=starter" style={{
                                display: 'block', textAlign: 'center',
                                padding: '16px 24px', borderRadius: 14,
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#fff', fontWeight: 800, fontSize: '0.95rem',
                                textDecoration: 'none',
                                transition: 'border-color 0.2s, background 0.2s',
                                background: 'transparent',
                                letterSpacing: '0.02em',
                            }}>
                                Get Started
                            </Link>
                        </div>

                        {/* Institutional Card — Featured */}
                        <div style={{
                            background: '#fff',
                            borderRadius: 24,
                            padding: '48px 40px',
                            display: 'flex', flexDirection: 'column',
                            position: 'relative',
                            boxShadow: '0 0 0 1px rgba(52,209,134,0.4), 0 32px 80px rgba(0,0,0,0.5)',
                        }}>
                            {/* Badge */}
                            <div style={{
                                position: 'absolute', top: 22, right: 22,
                                background: '#34D186', color: '#fff',
                                fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.12em',
                                textTransform: 'uppercase', padding: '5px 12px', borderRadius: 8,
                            }}>
                                MOST COMMON
                            </div>

                            <div style={{ marginBottom: 32 }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#34D186' }}>Institutional</span>
                                <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                    <span style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-0.05em', color: '#101112', lineHeight: 1 }}>$833</span>
                                    <span style={{ fontSize: '1rem', color: '#94A3B8', fontWeight: 700 }}>/month</span>
                                </div>
                                <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 12, lineHeight: 1.6 }}>
                                    For professional services firms requiring sovereign-grade infrastructure.
                                </p>
                            </div>

                            <div style={{ height: 1, background: '#F1F5F9', marginBottom: 32 }} />

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 40, flex: 1 }}>
                                {[
                                    'Strategic Audit Suite',
                                    'Private Sovereign Cloud',
                                    '24/7 Priority GRC Support',
                                    'Unlimited Seats + SSO',
                                    'Dedicated Compliance Manager',
                                ].map(f => (
                                    <li key={f} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(52,209,134,0.1)', border: '1px solid rgba(52,209,134,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34D186" strokeWidth="3.5"><path d="M20 6 9 17l-5-5"/></svg>
                                        </div>
                                        <span style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600 }}>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link href="/setup?tier=institutional" style={{
                                display: 'block', textAlign: 'center',
                                padding: '16px 24px', borderRadius: 14,
                                background: '#101112', color: '#fff',
                                fontWeight: 800, fontSize: '0.95rem',
                                textDecoration: 'none', letterSpacing: '0.02em',
                            }}>
                                Scale Now →
                            </Link>
                        </div>
                    </div>

                    {/* Trust strip */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 48, marginTop: 56, flexWrap: 'wrap' }}>
                        {([
                            {
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D186" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                ),
                                text: 'SOC-2 Type II Certified',
                            },
                            {
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D186" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
                                    </svg>
                                ),
                                text: 'Setup in under 15 minutes',
                            },
                            {
                                icon: (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D186" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>
                                    </svg>
                                ),
                                text: '30-day money-back guarantee',
                            },
                        ] as { icon: React.ReactNode; text: string }[]).map(({ icon, text }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                {icon}
                                <span style={{ color: '#475569', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.02em' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- Final CTA --- */}
            <section className={styles.bottom_area}>
                <div className="container">
                    <h2 style={{ fontSize: '4.5rem', fontWeight: 950, marginBottom: 40, letterSpacing: '-0.06em' }}>Scale the Exception.</h2>
                    <Link href="/setup" className="button-primary" style={{ padding: '24px 60px', borderRadius: '16px', fontSize: '1.25rem', display: 'inline-block' }}>
                        Integrate BLONK
                    </Link>
                </div>
            </section>

            {/* --- Perfect Footer --- */}
            <footer className={styles.footer}>
                <div className={styles.footer_grid}>
                    <div className={styles.footer_column}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 950, marginBottom: 24 }}>BLONK<span className="gradient-text">.</span></div>
                        <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: 1.6, maxWidth: 320 }}>Institutional governance, redefined by autonomous administrative oversight. Secure. Soveign. Compliant.</p>
                    </div>
                    {[
                        { h: 'Platform', links: [{ n: 'Dashboard', h: '/dashboard' }, { n: 'Intelligence', h: '/sectors' }, { n: 'Security', h: '/security' }] },
                        { h: 'Company', links: [{ n: 'About Us', h: '/about' }, { n: 'Pricing', h: '/pricing' }, { n: 'Network', h: '/network' }] },
                        { h: 'Legal', links: [{ n: 'Privacy Policy', h: '/privacy' }, { n: 'Terms of Service', h: '/terms' }, { n: 'Strategic Audit', h: '/audit' }] }
                    ].map(c => (
                        <div key={c.h} className={styles.footer_column}>
                            <h4>{c.h}</h4>
                            <ul className={styles.footer_links}>
                                {c.links.map(l => (
                                    <li key={l.n}><Link href={l.h}>{l.n}</Link></li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className={styles.footer_bottom}>
                    <span>© 2026 BLONK ASSETS LLC. ALL RIGHTS RESERVED.</span>
                    <div style={{ display: 'flex', gap: 32 }}>
                        <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>PRIVACY</Link>
                        <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>TERMS</Link>
                        <Link href="/cookies" style={{ color: 'inherit', textDecoration: 'none' }}>COOKIES</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
