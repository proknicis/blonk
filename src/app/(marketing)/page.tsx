import Link from "next/link";
import styles from "./home.module.css";
import React from "react";

const IconUser = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);
const IconBilling = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
);
const IconChart = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
);
const IconDoc = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
);
const IconAudit = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
);
const IconAlert = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
);
const IconLock = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const IconEye = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);
const IconArrow = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
    </svg>
);
const IconCheck = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const IconWarning = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);

const results = [
    {
        hours: "12h", badge: "Client Onboarding",
        task: "Stop manually entering client data into your CRM.",
        description: "Blonk pulls client information from intake forms and pushes it to your CRM, billing system, and document folder — the moment a client signs.",
        Icon: IconUser,
    },
    {
        hours: "8h", badge: "Billing & Collections",
        task: "Stop chasing overdue invoices by hand.",
        description: "Blonk monitors your billing daily. When an invoice goes 7 days overdue, it sends a polite reminder — from your email address, in your tone.",
        Icon: IconBilling,
    },
    {
        hours: "6h", badge: "Financial Reconciliation",
        task: "Stop copy-pasting data between spreadsheets.",
        description: "Blonk connects your accounting software, payroll system, and bank — reconciling records automatically every morning before your team starts work.",
        Icon: IconChart,
    },
    {
        hours: "4h", badge: "Document Generation",
        task: "Stop manually preparing standard documents.",
        description: "Blonk generates NDAs, engagement letters, and status reports from templates — pre-filled with client data — ready for review in seconds.",
        Icon: IconDoc,
    },
];

const governance = [
    { title: "Full Audit Trail", description: "Every action is logged with a timestamp, source, and outcome. Ready for compliance review at any time.", Icon: IconAudit },
    { title: "Instant Error Alerts", description: "If any step fails, your team is notified by email or Slack within 60 seconds — not discovered days later.", Icon: IconAlert },
    { title: "Your Data, Isolated", description: "Your firm runs on its own private infrastructure. No data is shared between clients or stored outside your control.", Icon: IconLock },
    { title: "Simple Status View", description: "See today's results in one glance: tasks ran, what succeeded, what needs attention — no technical knowledge required.", Icon: IconEye },
];

const featureItems = [
    'Up to 5 automated processes',
    '5 team member seats',
    'Full audit trail & error alerts',
    'Slack + email notifications',
    'Setup & onboarding included',
];
const enterpriseItems = [
    'Unlimited automated processes',
    'Unlimited team seats',
    'Private, isolated infrastructure',
    'Dedicated account manager',
    'Custom compliance reporting',
];

export default function HomePage() {
    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>

                {/* ── HERO — Video Only ── */}
                <section className={styles.heroVideo}>
                    <video className={styles.heroBgVideo} src="/hero-video.mp4" autoPlay loop muted playsInline />
                    <div className={styles.heroFade} />
                    <div className={styles.heroCta}>
                        <Link href="/login" className={styles.heroCtaBtn}>
                            Start saving time
                            <IconArrow />
                        </Link>
                    </div>
                </section>

                {/* ── DASHBOARD PREVIEW ── */}
                <section className={styles.section} style={{ background: '#fafafa' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>What your team sees</span>
                            <h2 className={styles.sectionTitle}>No code. No complexity.<br />Just results.</h2>
                            <p className={styles.sectionSub}>
                                Your lawyers and accountants never see a single line of code. They see a clean dashboard — and a number that tells them how much work Blonk did today.
                            </p>
                        </div>

                        <div className={styles.dashPanel}>
                            <div className={styles.dashHeader}>
                                <div className={styles.dashPulse}>
                                    <span className={styles.dashPulseDot} />
                                    <span className={styles.dashPulseLabel}>Today — Monday, April 14</span>
                                </div>
                                <span className={styles.dashBadgeGreen}>All systems running</span>
                            </div>

                            <div className={styles.dashStats}>
                                {[
                                    { value: '150', label: 'Tasks completed today', accent: false },
                                    { value: '0', label: 'Errors or failures', accent: true },
                                    { value: '26h', label: 'Staff time saved today', accent: false },
                                ].map((s, i) => (
                                    <div key={i} className={styles.dashStat} style={{ borderRight: i < 2 ? '1px solid #f0f0f0' : 'none' }}>
                                        <div className={styles.dashStatValue} style={{ color: s.accent ? '#34D186' : '#111' }}>{s.value}</div>
                                        <div className={styles.dashStatLabel}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.dashLog}>
                                <div className={styles.dashLogHeading}>Recent activity</div>
                                {[
                                    { time: '09:02', action: 'Client onboarding — Merged & Co.', detail: 'Contract sent, CRM updated, folder created' },
                                    { time: '09:15', action: 'Invoice reminder — 3 overdue accounts', detail: 'Reminders sent from anna@yourfirm.com' },
                                    { time: '10:30', action: 'Payroll reconciliation — April 2026', detail: 'Matched 94/94 entries automatically' },
                                    { time: '11:45', action: 'NDA generated — Goldstein Partners', detail: 'Document ready in your shared folder' },
                                ].map((row, i, arr) => (
                                    <div key={i} className={styles.dashRow} style={{ borderBottom: i < arr.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                                        <div className={styles.dashRowLeft}>
                                            <span className={styles.dashRowTime}>{row.time}</span>
                                            <div>
                                                <div className={styles.dashRowAction}>{row.action}</div>
                                                <div className={styles.dashRowDetail}>{row.detail}</div>
                                            </div>
                                        </div>
                                        <span className={styles.dashBadgeGreen}>Done</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── RESULTS ── */}
                <section className={styles.section} style={{ background: '#fff' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>Business results</span>
                            <h2 className={styles.sectionTitle}>What Blonk actually does<br />for your firm.</h2>
                            <p className={styles.sectionSub}>
                                Each of these runs automatically, every day — without anyone on your team lifting a finger.
                            </p>
                        </div>

                        <div className={styles.resultsGrid}>
                            {results.map((r, i) => (
                                <div key={i} className={styles.resultCard}>
                                    <div className={styles.resultCardTop}>
                                        <div>
                                            <div className={styles.eyebrow} style={{ marginBottom: 10 }}>{r.badge}</div>
                                            <div className={styles.resultTask}>{r.task}</div>
                                        </div>
                                        <div className={styles.resultIcon}>
                                            <r.Icon />
                                        </div>
                                    </div>
                                    <p className={styles.resultDesc}>{r.description}</p>
                                    <div className={styles.resultMetric}>
                                        <span className={styles.resultHours}>{r.hours}</span>
                                        <span className={styles.resultHoursLabel}>saved per week, per assistant</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── GOVERNANCE ── */}
                <section className={styles.section} style={{ background: '#0d0d0d' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>Built for regulated industries</span>
                            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>You are in control.<br />We just do the work.</h2>
                            <p className={styles.sectionSub} style={{ color: 'rgba(255,255,255,0.45)' }}>
                                Designed for firms where a missed step or a data leak has real consequences.
                            </p>
                        </div>

                        <div className={styles.govGrid}>
                            {governance.map((g, i) => (
                                <div key={i} className={styles.govCard}>
                                    <div className={styles.govIcon}>
                                        <g.Icon />
                                    </div>
                                    <div className={styles.govTitle}>{g.title}</div>
                                    <p className={styles.govDesc}>{g.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* Error alert example */}
                        <div className={styles.alertBox}>
                            <div className={styles.alertBoxLabel}>Example — what an error notification looks like</div>
                            <div className={styles.alertCard}>
                                <div className={styles.alertIcon}>
                                    <IconWarning />
                                </div>
                                <div className={styles.alertBody}>
                                    <div className={styles.alertTitle}>Invoice sync failed — Goldstein Partners</div>
                                    <div className={styles.alertMeta}>Today at 09:32 · Step 2 of 4 · Could not connect to billing portal (timeout)</div>
                                    <div className={styles.alertActions}>
                                        <span className={styles.alertTagGreen}>Retry in 15 min</span>
                                        <span className={styles.alertTagMuted}>View full log</span>
                                    </div>
                                </div>
                            </div>
                            <p className={styles.alertFooter}>Your team receives this within 60 seconds. Not 3 days later when a client calls.</p>
                        </div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section className={styles.section} style={{ background: '#fafafa' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>Pricing</span>
                            <h2 className={styles.sectionTitle}>Pays for itself in week one.</h2>
                            <p className={styles.sectionSub}>
                                30 hours saved a week × $80/hr = $9,600/month recovered. Before you even factor in client experience.
                            </p>
                        </div>

                        <div className={styles.pricingGrid}>
                            {/* Professional */}
                            <div className={styles.pricingCard}>
                                <div className={styles.pricingTier}>Professional</div>
                                <div className={styles.pricingAmount}>$833<span className={styles.pricingPer}>/mo</span></div>
                                <p className={styles.pricingDesc}>
                                    For firms with 5–20 staff. Covers your top 5 most time-consuming admin processes. Full setup included.
                                </p>
                                <div className={styles.pricingDivider} />
                                <ul className={styles.pricingList}>
                                    {featureItems.map(f => (
                                        <li key={f} className={styles.pricingItem}>
                                            <span className={styles.pricingCheck}><IconCheck /></span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/login" className={styles.pricingCta}>Get started <IconArrow /></Link>
                            </div>

                            {/* Enterprise */}
                            <div className={styles.pricingCardDark}>
                                <div className={styles.pricingBadge}>Most Popular</div>
                                <div className={styles.pricingTier} style={{ color: 'rgba(255,255,255,0.4)' }}>Enterprise</div>
                                <div className={styles.pricingAmount} style={{ color: '#fff' }}>Custom<span className={styles.pricingPer} style={{ color: 'rgba(255,255,255,0.3)' }}>/usage</span></div>
                                <p className={styles.pricingDesc} style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    For firms with 20+ staff. Unlimited processes, unlimited seats, private infrastructure.
                                </p>
                                <div className={styles.pricingDivider} style={{ background: 'rgba(255,255,255,0.08)' }} />
                                <ul className={styles.pricingList}>
                                    {enterpriseItems.map(f => (
                                        <li key={f} className={styles.pricingItem} style={{ color: 'rgba(255,255,255,0.8)' }}>
                                            <span className={styles.pricingCheck}><IconCheck /></span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/login" className={styles.pricingCtaGreen}>Book a demo <IconArrow /></Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── FINAL CTA ── */}
                <section className={styles.ctaSection}>
                    <div className={styles.ctaSectionInner}>
                        <h2 className={styles.ctaTitle}>Your team is doing work<br />a computer should handle.</h2>
                        <p className={styles.ctaSub}>Let Blonk take the repetitive admin off their plate — permanently.</p>
                        <Link href="/login" className={styles.ctaMainBtn}>
                            Start saving time this week
                            <IconArrow />
                        </Link>
                    </div>
                </section>
            </div>

            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerLogo}>
                        BLONK<span className={styles.footerLogoDot} />
                    </div>
                    <div className={styles.footerLinks}>
                        <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
                        <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
                    </div>
                </div>
                <div className={styles.footerBottom}>
                    <span>© 2026 BLONK ASSETS LLC.</span>
                    <span>Built for professional services firms.</span>
                </div>
            </footer>
        </div>
    );
}
