import Link from "next/link";
import styles from "./home.module.css";
import React from "react";

export default function HomePage() {
    const results = [
        {
            hours: "12h",
            label: "saved per week",
            task: "Stop manually entering client data into your CRM.",
            description: "Blonk automatically pulls new client information from your intake forms and pushes it to your CRM, billing system, and document folder — the moment a client signs.",
            badge: "Client Onboarding",
            icon: "👤",
        },
        {
            hours: "8h",
            label: "saved per week",
            task: "Stop chasing overdue invoices by hand.",
            description: "Blonk monitors your billing system daily. When an invoice goes 7 days overdue, it automatically sends a polite reminder — from your email address, in your tone.",
            badge: "Billing & Collections",
            icon: "💳",
        },
        {
            hours: "6h",
            label: "saved per week",
            task: "Stop copy-pasting data between spreadsheets.",
            description: "Blonk connects your accounting software, payroll system, and bank — reconciling records automatically every morning before your team starts work.",
            badge: "Financial Reconciliation",
            icon: "📊",
        },
        {
            hours: "4h",
            label: "saved per week",
            task: "Stop manually preparing standard documents.",
            description: "Blonk generates NDAs, engagement letters, and status reports from your templates — pre-filled with client data — ready for review in seconds, not hours.",
            badge: "Document Generation",
            icon: "📄",
        },
    ];

    const governance = [
        {
            icon: "🔍",
            title: "Full Audit Trail",
            description: "Every action Blonk takes on your behalf is logged with a timestamp, source, and outcome. Ready for compliance review at any time.",
        },
        {
            icon: "🚨",
            title: "Instant Error Alerts",
            description: "If any step fails, your team is notified by email or Slack within 60 seconds — not discovered 3 days later when a client calls.",
        },
        {
            icon: "🔒",
            title: "Your Data, Isolated",
            description: "Your firm runs on its own private infrastructure. No data is ever shared between clients or stored on third-party servers you don't control.",
        },
        {
            icon: "👁",
            title: "Simple Status View",
            description: "See today's results in one glance: how many tasks ran, what succeeded, what needs attention — no technical knowledge required.",
        },
    ];

    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>

                {/* ── HERO ── */}
                <main className={styles.hero}>
                    <div className={styles.big_title_wrapper}>
                        <h1 className={styles.big_title}>
                            BLONK<span className={styles.title_dot}></span>
                        </h1>
                    </div>

                    <div className={styles.video_wrapper}>
                        <video 
                            className={styles.hero_video}
                            src="/hero-video.mp4" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            poster="/n8n-demo.png"
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div className={styles.hero_bottom}>
                        <div className={styles.feature_pills}>
                            <div className={styles.feature_pill}>
                                <i className={styles.check_icon}>✓</i> No technical skills needed
                            </div>
                            <div className={styles.feature_pill}>
                                <i className={styles.check_icon}>✓</i> Full audit trail included
                            </div>
                            <div className={styles.feature_pill}>
                                <i className={styles.check_icon}>✓</i> Instant error alerts
                            </div>
                        </div>

                        <div className={styles.cta_center}>
                            <Link href="/login" className={styles.cta_button}>
                                <span className={styles.cta_text}>See how it works</span>
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
                                Your team loses 30+ hours<br/>a week to admin work.
                            </h3>
                            <p className={styles.desc_p}>
                                Blonk handles the repetitive tasks that slow down lawyers, accountants, and HR teams — 
                                so your people can focus on work that actually bills.
                            </p>
                        </div>
                    </div>
                </main>

                {/* ── DASHBOARD PREVIEW ── */}
                <section style={{ padding: '80px 24px 120px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 64 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#34D186', display: 'block', marginBottom: 16 }}>
                                What your team sees
                            </span>
                            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: 16, lineHeight: 1.1 }}>
                                No code. No complexity.<br/>Just results.
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                                Your lawyers and accountants never see a single line of code. They see a clean dashboard — 
                                and a green number that tells them how much work Blonk did today.
                            </p>
                        </div>

                        {/* Fake Dashboard Panel */}
                        <div style={{ background: '#fff', borderRadius: 32, border: '1px solid #ebebeb', boxShadow: '0 24px 80px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                            {/* Panel Header */}
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34D186', boxShadow: '0 0 12px #34D186' }} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                                        Today — Monday, April 14
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34D186', background: '#f0fdf4', padding: '4px 12px', borderRadius: 100 }}>
                                    All systems running
                                </span>
                            </div>

                            {/* Stats Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid #f0f0f0' }}>
                                {[
                                    { value: '150', label: 'Tasks completed today', color: '#111' },
                                    { value: '0', label: 'Errors or failures', color: '#34D186' },
                                    { value: '26h', label: 'Staff time saved today', color: '#111' },
                                ].map((stat, i) => (
                                    <div key={i} style={{ padding: '32px', borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
                                        <div style={{ fontSize: '2.8rem', fontWeight: 950, letterSpacing: '-0.05em', color: stat.color, marginBottom: 8 }}>
                                            {stat.value}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#999' }}>{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Actions */}
                            <div style={{ padding: '24px 32px' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#ccc', marginBottom: 20 }}>
                                    Recent activity
                                </div>
                                {[
                                    { time: '09:02', action: 'Client onboarding — Merged & Co.', detail: 'Contract sent, CRM updated, folder created', status: 'Done' },
                                    { time: '09:15', action: 'Invoice reminder — 3 overdue accounts', detail: 'Reminder emails sent from anna@yourfirm.com', status: 'Done' },
                                    { time: '10:30', action: 'Payroll reconciliation — April 2026', detail: 'Matched 94/94 entries automatically', status: 'Done' },
                                    { time: '11:45', action: 'NDA generated — Goldstein Partners', detail: 'Document ready in your shared folder', status: 'Done' },
                                ].map((row, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 3 ? '1px solid #f9f9f9' : 'none' }}>
                                        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#bbb', minWidth: 40 }}>{row.time}</span>
                                            <div>
                                                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111', marginBottom: 2 }}>{row.action}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#999' }}>{row.detail}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#34D186', background: '#f0fdf4', padding: '3px 10px', borderRadius: 100, whiteSpace: 'nowrap' }}>
                                            {row.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── RESULTS SECTION ── */}
                <section style={{ padding: '120px 24px', background: '#fff' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 80 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#34D186', display: 'block', marginBottom: 16 }}>
                                Business results
                            </span>
                            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: 16, lineHeight: 1.1 }}>
                                What Blonk actually does<br/>for your firm.
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: '#666', maxWidth: 520, margin: '0 auto' }}>
                                Each of these runs automatically, every day, in the background — without anyone on your team lifting a finger.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: 24 }}>
                            {results.map((r, i) => (
                                <div key={i} style={{ background: '#fafafa', borderRadius: 32, padding: 48, border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#34D186', marginBottom: 8 }}>
                                                {r.badge}
                                            </div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 950, color: '#111', lineHeight: 1.3 }}>
                                                {r.task}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '2rem' }}>{r.icon}</div>
                                    </div>
                                    <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7 }}>{r.description}</p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingTop: 8, borderTop: '1px solid #ebebeb' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 950, color: '#111', letterSpacing: '-0.05em' }}>{r.hours}</span>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34D186' }}>{r.label}</span>
                                        <span style={{ fontSize: '0.85rem', color: '#999' }}>per assistant</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── GOVERNANCE / SECURITY ── */}
                <section style={{ padding: '120px 24px', background: '#111', color: '#fff' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 80 }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#34D186', display: 'block', marginBottom: 16 }}>
                                Built for regulated industries
                            </span>
                            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: 16, lineHeight: 1.1 }}>
                                You are in control.<br/>We just do the work.
                            </h2>
                            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.5)', maxWidth: 540, margin: '0 auto' }}>
                                Blonk is designed specifically for firms that handle sensitive client data — 
                                where a missed step or a data leak has real consequences.
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                            {governance.map((g, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 28, padding: 40 }}>
                                    <div style={{ fontSize: '2rem', marginBottom: 20 }}>{g.icon}</div>
                                    <div style={{ fontWeight: 950, fontSize: '1.05rem', color: '#fff', marginBottom: 12 }}>{g.title}</div>
                                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{g.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Alert Example */}
                        <div style={{ marginTop: 64, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 28, padding: 40 }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#34D186', marginBottom: 20 }}>
                                Example: what an error alert looks like
                            </div>
                            <div style={{ background: '#1a1a1a', borderRadius: 20, padding: 28, display: 'flex', alignItems: 'flex-start', gap: 20, border: '1px solid #2a2a2a' }}>
                                <div style={{ fontSize: '1.5rem' }}>🚨</div>
                                <div>
                                    <div style={{ fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                                        Blonk Alert: Invoice sync failed — Goldstein Partners
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
                                        Today at 09:32 — Step 2 of 4 failed: Could not connect to billing portal (timeout)
                                    </div>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34D186', background: 'rgba(52,209,134,0.1)', padding: '4px 14px', borderRadius: 100 }}>
                                            Retry automatically in 15 min
                                        </span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.05)', padding: '4px 14px', borderRadius: 100 }}>
                                            View full log
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p style={{ marginTop: 20, fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)' }}>
                                Your team receives this within 60 seconds of failure — not at the end of the week when a client calls to ask what happened.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section style={{ padding: '160px 24px', background: '#fafafa', borderTop: '1px solid #f0f0f0' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#34D186', display: 'block', marginBottom: 24 }}>Pricing</span>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: 16 }}>
                            Pays for itself in week one.
                        </h2>
                        <p style={{ fontSize: '1.05rem', color: '#666', marginBottom: 64 }}>
                            If Blonk saves 30 hours a week across your team, at $80/hr — that's $9,600/month recovered.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 32 }}>
                            {/* Institutional */}
                            <div style={{ background: '#FAFAFA', padding: 56, borderRadius: 48, textAlign: 'left', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 32 }}>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>Professional</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.06em' }}>$833<span style={{ fontSize: '1rem', color: '#666' }}>/mo</span></div>
                                </div>
                                <p style={{ fontSize: '1.05rem', color: '#555', lineHeight: 1.6 }}>
                                    For firms with 5–20 staff. Covers your top 5 most time-consuming admin processes.
                                    Full setup included, results from week one.
                                </p>
                                <div style={{ height: 1, background: '#f0f0f0' }} />
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[
                                        'Up to 5 automated processes',
                                        '5 team member seats',
                                        'Full audit trail & error alerts',
                                        'Slack + email notifications',
                                        'Setup & onboarding included',
                                    ].map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '0.95rem' }}>
                                            <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', flexShrink: 0 }}>✓</div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/login" style={{ background: '#111', color: '#FAFAFA', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 800, marginTop: 'auto' }}>
                                    Get started
                                </Link>
                            </div>

                            {/* Enterprise */}
                            <div style={{ background: '#111', padding: 56, borderRadius: 48, textAlign: 'left', color: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', gap: 32, transform: 'translateY(-12px)', boxShadow: '0 40px 80px rgba(0,0,0,0.12)' }}>
                                <div style={{ position: 'absolute', top: 32, right: 32, background: '#34D186', color: '#111', fontSize: '0.7rem', fontWeight: 900, padding: '4px 12px', borderRadius: 6 }}>MOST POPULAR</div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 900, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Enterprise</div>
                                    <div style={{ fontSize: '3.5rem', fontWeight: 950, letterSpacing: '-0.06em' }}>Custom<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.4)' }}>/usage</span></div>
                                </div>
                                <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                                    For larger firms with 20+ staff and complex, multi-department admin workflows.
                                    Unlimited processes, unlimited team seats, private infrastructure.
                                </p>
                                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {[
                                        'Unlimited automated processes',
                                        'Unlimited team seats',
                                        'Private, isolated infrastructure',
                                        'Dedicated account manager',
                                        'Custom compliance reporting',
                                    ].map(f => (
                                        <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                                            <div style={{ width: 18, height: 18, background: '#34D186', borderRadius: '50%', color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', flexShrink: 0 }}>✓</div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/login" style={{ background: '#34D186', color: '#111', padding: '20px 32px', borderRadius: '100px', textAlign: 'center', textDecoration: 'none', fontWeight: 900, marginTop: 'auto' }}>
                                    Book a demo
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section style={{ padding: '160px 24px', textAlign: 'center', background: '#FAFAFA', color: '#111' }}>
                    <div style={{ maxWidth: 900, margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 950, letterSpacing: '-0.05em', marginBottom: 24, lineHeight: 1.05 }}>
                            Your team is doing work<br/>a computer should handle.
                        </h2>
                        <p style={{ fontSize: '1.15rem', color: '#666', marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
                            Let Blonk take the repetitive admin off their plate — permanently.
                        </p>
                        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 16, background: '#111', color: '#FAFAFA', padding: '24px 64px', borderRadius: '100px', fontSize: '1.25rem', fontWeight: 900, textDecoration: 'none' }}>
                            Start saving time this week.
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
                    <div style={{ fontSize: '1.5rem', fontWeight: 950, letterSpacing: '-0.06em', color: '#111' }}>
                        BLONK<span style={{ display: 'inline-block', width: 6, height: 6, background: '#34D186', marginLeft: 1, borderRadius: 1 }}></span>
                    </div>
                    <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
                        <Link href="/privacy" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Privacy Policy</Link>
                        <Link href="/terms" style={{ color: '#666', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Terms of Service</Link>
                    </div>
                </div>
                <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid #f9f9f9', display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span>© 2026 BLONK ASSETS LLC.</span>
                    <span>Built for professional services firms.</span>
                </div>
            </footer>
        </div>
    );
}
