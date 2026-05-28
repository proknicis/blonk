import Link from "next/link";
import styles from "./home.module.css";
import React from "react";
import HeroVideo from "./HeroVideo";

const IconArrow = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const IconCheck = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconMail = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 7l-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);

const IconBilling = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
);

const IconUsers = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconCpu = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="15" x2="23" y2="15" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="15" x2="4" y2="15" />
    </svg>
);

const IconShield = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IconUnlock = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
);

const IconTrending = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const IconSliders = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="2" y1="14" x2="6" y2="14" />
        <line x1="10" y1="8" x2="14" y2="8" />
        <line x1="18" y1="16" x2="22" y2="16" />
    </svg>
);

const IconRepeat = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
);

const IconFileCheck = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <polyline points="9 15 11 17 15 13" />
    </svg>
);

const IconZap = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const IconLink = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);


const workflows = [
    {
        title: "Intake Triage & AI Draft",
        price: "$149",
        desc: "Ingests incoming emails, classifies intent, extracts key entity details, updates CRM systems, and schedules follow-up drafts.",
        apps: ["Gmail", "HubSpot", "OpenAI"],
        Icon: IconMail,
        color: "#f8fafc",
    },
    {
        title: "Invoice Auto-Chaser",
        price: "$199",
        desc: "Automates daily collections monitoring. Scans unpaid ledger balances, matches Stripe bank receipts, and dispatches reminders.",
        apps: ["QuickBooks", "Stripe", "Gmail"],
        Icon: IconBilling,
        color: "#f8fafc",
    },
    {
        title: "Client Onboarding Flow",
        price: "$149",
        desc: "Executed upon signature. Creates secure Google Drive directories, provisions Slack channels, and schedules kickoff tasks.",
        apps: ["DocuSign", "Drive", "Slack"],
        Icon: IconUsers,
        color: "#f8fafc",
    },
    {
        title: "AI Invoice OCR Extractor",
        price: "$249",
        desc: "Extracts line items, totals, and invoice metadata from raw documents using GPT-Vision, syncing findings directly to your ledger.",
        apps: ["Gmail", "GPT-4o", "Sheets"],
        Icon: IconCpu,
        color: "#f8fafc",
    }
];

const sovereigntyFeatures = [
    {
        title: "Decoupled Architecture",
        desc: "You purchase the n8n execution files. Run them on local, cloud, or hybrid instances with no downstream vendor lock-in.",
        Icon: IconUnlock,
    },
    {
        title: "100% Data Sovereignty",
        desc: "Your data routes strictly through your corporate nodes. Zero external middleman processing. SOC-2 and HIPAA compliant by default.",
        Icon: IconShield,
    },
    {
        title: "Direct API Execution",
        desc: "Execute queries directly with OpenAI and Google. Pay zero gateway markups, platform premiums, or usage overhead.",
        Icon: IconTrending,
    },
    {
        title: "Modifiable Logical Canvas",
        desc: "Full code ownership allows internal GRC and IT teams to extend, modify, or pivot the workflow logic on n8n drag-and-drop grids.",
        Icon: IconSliders,
    }
];

const standardItems = [
    'Sovereign n8n JSON file license',
    'Lifetime blueprint updates & patches',
    'Technical setup & deployment guide',
    'Local VPS or Cloud deploy ready',
    'Documentation & community support',
];

const bundleItems = [
    'Lifetime access to full workflow catalog',
    'Full system & database provisioning',
    '3 hours of custom engineering support',
    'Priority deployment updates',
    'GRC compliance architecture guide',
];

export default function HomePage() {
    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>

                {/* ── HERO — Video Only ── */}
                <section className={styles.heroVideo}>
                    <HeroVideo speed={1} />
                    <div className={styles.heroFade} />
                    <div className={styles.heroCta}>
                        <Link href="/login" className={styles.heroCtaBtn}>
                            Start saving time
                            <IconArrow />
                        </Link>
                    </div>
                </section>

                {/* ── SECTION 1: REDESIGNED OPERATIONAL FLOW ── */}
                <section className={styles.flowSection}>
                    <div className={styles.flowInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>OPERATIONAL FLOW</span>
                            <h2 className={styles.sectionTitle}>From incoming data to structured output</h2>
                            <p className={styles.sectionSub}>
                                BLONK standardizes spreadsheet-driven operations by routing fragmented inputs through a clean, repeatable execution layer.
                            </p>
                        </div>

                        {/* Horizontal / Grid-based process explanation */}
                        <div className={styles.flowGrid}>
                            <div className={styles.flowStep}>
                                <div className={styles.flowStepHeader}>
                                    <span className={styles.flowStepNum}>01 / CAPTURE</span>
                                    <span className={styles.flowNodeDot} />
                                </div>
                                <h3 className={styles.flowStepTitle}>Ingest raw inputs</h3>
                                <p className={styles.flowStepDesc}>
                                    Automatically monitor inbox submissions, API payloads, or spreadsheet uploads as they arrive. No manual downloads or CSV shuffling required.
                                </p>
                            </div>

                            <div className={styles.flowStep}>
                                <div className={styles.flowStepHeader}>
                                    <span className={styles.flowStepNum}>02 / STRUCTURE</span>
                                    <span className={styles.flowNodeDot} />
                                </div>
                                <h3 className={styles.flowStepTitle}>Parse and validate</h3>
                                <p className={styles.flowStepDesc}>
                                    Standardize messy formats, resolve structural anomalies, and validate rows against custom corporate business rules in real-time.
                                </p>
                            </div>

                            <div className={styles.flowStep}>
                                <div className={styles.flowStepHeader}>
                                    <span className={styles.flowStepNum}>03 / DISPATCH</span>
                                    <span className={styles.flowNodeDot} />
                                </div>
                                <h3 className={styles.flowStepTitle}>Write to target ledger</h3>
                                <p className={styles.flowStepDesc}>
                                    Route cleaned and formatted records directly into your core systems, CRMs, databases, or ERPs through secure, direct API integrations.
                                </p>
                            </div>

                            <div className={styles.flowStep}>
                                <div className={styles.flowStepHeader}>
                                    <span className={styles.flowStepNum}>04 / GRC AUDIT</span>
                                    <span className={styles.flowNodeDot} />
                                </div>
                                <h3 className={styles.flowStepTitle}>Monitor & log exceptions</h3>
                                <p className={styles.flowStepDesc}>
                                    Track performance stats, download immutable audit trails, and manage edge-case exceptions through a single visual interface.
                                </p>
                            </div>
                        </div>

                        {/* Secondary Proof Strip */}
                        <div className={styles.trustStrip}>
                            <div className={styles.trustItem}>
                                <div className={styles.trustLabel}>
                                    <IconRepeat />
                                    Built for Scale
                                </div>
                                <p className={styles.trustDesc}>
                                    Processes millions of rows without memory degradation or server lag.
                                </p>
                            </div>

                            <div className={styles.trustItem}>
                                <div className={styles.trustLabel}>
                                    <IconFileCheck />
                                    Auditable Ledger
                                </div>
                                <p className={styles.trustDesc}>
                                    Every database transaction is permanently logged with an immutable execution history.
                                </p>
                            </div>

                            <div className={styles.trustItem}>
                                <div className={styles.trustLabel}>
                                    <IconZap />
                                    Sovereign Execution
                                </div>
                                <p className={styles.trustDesc}>
                                    Zero middleman routing. Your proprietary data never leaves your environment.
                                </p>
                            </div>

                            <div className={styles.trustItem}>
                                <div className={styles.trustLabel}>
                                    <IconLink />
                                    Enterprise Integrations
                                </div>
                                <p className={styles.trustDesc}>
                                    Connects across Postgres, Stripe, HubSpot, Slack, and your existing custom toolset.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 2: WORKFLOW LIBRARY (Corporate Catalog) ── */}
                <section className={styles.section} style={{ background: '#ffffff' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>Enterprise Catalog</span>
                            <h2 className={styles.sectionTitle}>Sovereign Automations.</h2>
                            <p className={styles.sectionSub}>
                                Access a portfolio of pre-packaged, production-tested enterprise workflows. Deploy instantly to your firm's local cluster.
                            </p>
                        </div>

                        <div className={styles.catalogGrid}>
                            {workflows.map((wf, idx) => {
                                const CardIcon = wf.Icon;
                                return (
                                    <div key={idx} className={styles.catalogCard}>
                                        <div className={styles.catalogHeader}>
                                            <div className={styles.catalogIconWrapper} style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                                                <CardIcon />
                                            </div>
                                            <div className={styles.catalogPrice}>{wf.price}</div>
                                        </div>
                                        <h3 className={styles.catalogTitle}>{wf.title}</h3>
                                        <p className={styles.catalogDesc}>{wf.desc}</p>
                                        <div className={styles.catalogDivider} />
                                        <div className={styles.catalogFooter}>
                                            <div className={styles.catalogApps}>
                                                {wf.apps.map(app => (
                                                    <span key={app} className={styles.appTag}>{app}</span>
                                                ))}
                                            </div>
                                            <Link href="/login" className={styles.catalogBuyBtn}>Buy License</Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 3: SOVEREIGN EXECUTION ── */}
                <section className={styles.section} style={{ background: '#09090b' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow} style={{ color: 'var(--accent)', borderColor: 'rgba(52,209,134,0.3)', background: 'rgba(52,209,134,0.06)' }}>Compliance & Governance</span>
                            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Sovereign Infrastructure.</h2>
                            <p className={styles.sectionSub} style={{ color: '#a1a1aa' }}>
                                Unlike standard SaaS platforms that route your proprietary logic and data through third-party servers, Blonk keeps your execution local.
                            </p>
                        </div>

                        <div className={styles.sovGrid}>
                            {sovereigntyFeatures.map((f, i) => {
                                const FeatureIcon = f.Icon;
                                return (
                                    <div key={i} className={styles.sovCard}>
                                        <div className={styles.sovIconWrapper} style={{ color: 'var(--accent)' }}>
                                            <FeatureIcon />
                                        </div>
                                        <h3 className={styles.sovTitle}>{f.title}</h3>
                                        <p className={styles.sovDesc}>{f.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 4: PRICING ── */}
                <section className={styles.section} style={{ background: '#fafafa' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>Pricing Plans</span>
                            <h2 className={styles.sectionTitle}>One-Time Purchases. No Subscriptions.</h2>
                            <p className={styles.sectionSub}>
                                Own the logical architecture of your operations. Deploy individual templates or secure the full catalog.
                            </p>
                        </div>

                        <div className={styles.pricingGrid}>
                            {/* Standard Workflow */}
                            <div className={styles.pricingCard}>
                                <div className={styles.pricingTier}>Single License</div>
                                <div className={styles.pricingAmount}>From $99<span className={styles.pricingPer}>/workflow</span></div>
                                <p className={styles.pricingDesc}>
                                    A lifetime blueprint license for any single pre-configured workflow template in our catalog.
                                </p>
                                <div className={styles.pricingDivider} />
                                <ul className={styles.pricingList}>
                                    {standardItems.map(f => (
                                        <li key={f} className={styles.pricingItem}>
                                            <span className={styles.pricingCheck}><IconCheck /></span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/login" className={styles.pricingCta}>Browse Workflows <IconArrow /></Link>
                            </div>

                            {/* Institutional Bundle */}
                            <div className={styles.pricingCardDark}>
                                <div className={styles.pricingBadge}>Enterprise</div>
                                <div className={styles.pricingTier} style={{ color: 'rgba(255,255,255,0.4)' }}>Institutional Pack</div>
                                <div className={styles.pricingAmount} style={{ color: '#fff' }}>$1,499<span className={styles.pricingPer} style={{ color: 'rgba(255,255,255,0.3)' }}>/one-time</span></div>
                                <p className={styles.pricingDesc} style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Full catalog unlock with custom setup assistance, future blueprint releases, and database provisioning support.
                                </p>
                                <div className={styles.pricingDivider} style={{ background: 'rgba(255,255,255,0.08)' }} />
                                <ul className={styles.pricingList}>
                                    {bundleItems.map(f => (
                                        <li key={f} className={styles.pricingItem} style={{ color: 'rgba(255,255,255,0.8)' }}>
                                            <span className={styles.pricingCheck}><IconCheck /></span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link href="/login" className={styles.pricingCtaGreen}>Buy Automations Bundle <IconArrow /></Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 5: FINAL CTA ── */}
                <section className={styles.ctaSection}>
                    <div className={styles.ctaSectionInner}>
                        <h2 className={styles.ctaTitle}>Own the automations that<br />drive your operations.</h2>
                        <p className={styles.ctaSub}>Establish a decoupled workflow execution layer. Deploy Blonk blueprints to your local stack today.</p>
                        <Link href="/login" className={styles.ctaMainBtn}>
                            Deploy automations now
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
