import Link from "next/link";
import styles from "./home.module.css";
import React from "react";
import HeroVideo from "./HeroVideo";

const IconArrow = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

const IconCheck = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const workflows = [
    {
        title: "Intake Triage & AI Draft",
        price: "$149",
        desc: "Monitors your inbox, uses AI to categorize intent, extracts client details, updates your CRM, and stages a custom follow-up reply.",
        apps: ["Gmail", "HubSpot", "OpenAI"],
        icon: "🧲",
        color: "#EFF6FF",
    },
    {
        title: "Invoice Auto-Chaser",
        price: "$199",
        desc: "Checks payment ledger daily, cross-references bank deposits, and automatically sends polite follow-ups from your address.",
        apps: ["QuickBooks", "Stripe", "Gmail"],
        icon: "🧾",
        color: "#F0FDFA",
    },
    {
        title: "Client Onboarding Flow",
        price: "$149",
        desc: "Triggered on signed contract. Automatically creates shared Google Drive folders, provisions Slack channels, and schedules kickoff meetings.",
        apps: ["DocuSign", "Drive", "Slack"],
        icon: "🤝",
        color: "#FFFBEB",
    },
    {
        title: "AI Invoice OCR Extractor",
        price: "$249",
        desc: "Extracts line items, totals, and tax info from incoming invoice PDFs using GPT-Vision and logs them directly to your ledger.",
        apps: ["Gmail", "GPT-4o", "Sheets"],
        icon: "🧠",
        color: "#FDF2F8",
    }
];

const sovereigntyFeatures = [
    {
        title: "No Vendor Lock-In",
        desc: "You buy the n8n JSON file. It is yours forever. Run it on your local server, cloud, or VPS with no monthly license restrictions.",
        icon: "🔓",
    },
    {
        title: "100% Data Sovereignty",
        desc: "Your data stays in your network. It never touches our servers. Perfect for firms with strict GRC and SOC-2 policies.",
        icon: "🛡️",
    },
    {
        title: "Zero API Cost Markups",
        desc: "Pay directly to OpenAI, HubSpot, and Google. No middleware margins or markup fees on your data executions.",
        icon: "💸",
    },
    {
        title: "Drag & Drop Canvas",
        desc: "Want to change the email template or add a Slack notification? Edit the nodes on the n8n visual builder in seconds.",
        icon: "🎨",
    }
];

const standardItems = [
    'Fully customizable n8n JSON file',
    'Lifetime updates & bug fixes',
    'Standard configuration guide',
    '100% self-hosted or Cloud',
    'Community support access',
];

const bundleItems = [
    'Lifetime access to all workflows',
    'Full system & database setup',
    '3 hours of custom integration help',
    'Dedicated engineer support',
    'Sovereign infrastructure blueprint',
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

                {/* ── SECTION 1: HOW IT WORKS (n8n Engine Simulator) ── */}
                <section className={styles.section} style={{ background: '#fafafa' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>How it works</span>
                            <h2 className={styles.sectionTitle}>Visual, Auditable, and Fast.</h2>
                            <p className={styles.sectionSub}>
                                Blonk workflows execute visually inside n8n. No black-box code. You can see, test, and audit every node execution in real-time.
                            </p>
                        </div>

                        {/* Interactive n8n Visualizer Mockup */}
                        <div className={styles.n8nContainer}>
                            <div className={styles.n8nNodeCard} data-status="success">
                                <div className={styles.n8nHeader}>
                                    <span className={styles.n8nIcon}>✉️</span>
                                    <span className={styles.n8nTitle}>1. Email Trigger</span>
                                    <span className={styles.n8nStatus}>success</span>
                                </div>
                                <div className={styles.n8nBody}>
                                    <div className={styles.n8nJsonTitle}>Parsed Payload:</div>
                                    <pre className={styles.n8nJson}>
{`{
  "from": "john@acme.com",
  "subject": "Need Tax Audit Help",
  "body": "Hi, we need to audit our..."
}`}
                                    </pre>
                                </div>
                            </div>

                            <div className={styles.n8nLine} />

                            <div className={styles.n8nNodeCard} data-status="success">
                                <div className={styles.n8nHeader}>
                                    <span className={styles.n8nIcon}>🧠</span>
                                    <span className={styles.n8nTitle}>2. OpenAI Parser</span>
                                    <span className={styles.n8nStatus}>success</span>
                                </div>
                                <div className={styles.n8nBody}>
                                    <div className={styles.n8nJsonTitle}>AI Classification:</div>
                                    <pre className={styles.n8nJson}>
{`{
  "intent": "corporate_tax_audit",
  "urgency": "high",
  "name": "John Smith"
}`}
                                    </pre>
                                </div>
                            </div>

                            <div className={styles.n8nLine} />

                            <div className={styles.n8nNodeCard} data-status="success">
                                <div className={styles.n8nHeader}>
                                    <span className={styles.n8nIcon}>💼</span>
                                    <span className={styles.n8nTitle}>3. HubSpot CRM</span>
                                    <span className={styles.n8nStatus}>success</span>
                                </div>
                                <div className={styles.n8nBody}>
                                    <div className={styles.n8nJsonTitle}>CRM Result:</div>
                                    <pre className={styles.n8nJson}>
{`{
  "leadCreated": true,
  "leadId": "998271",
  "status": "Assigned"
}`}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 2: WORKFLOW LIBRARY (Our Products) ── */}
                <section className={styles.section} style={{ background: '#ffffff' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>Workflow Library</span>
                            <h2 className={styles.sectionTitle}>Buy once. Deploy in minutes.</h2>
                            <p className={styles.sectionSub}>
                                Choose from our collection of pre-tested, production-ready n8n workflow files. Import them instantly into your setup.
                            </p>
                        </div>

                        <div className={styles.catalogGrid}>
                            {workflows.map((wf, idx) => (
                                <div key={idx} className={styles.catalogCard}>
                                    <div className={styles.catalogHeader}>
                                        <div className={styles.catalogIconWrapper} style={{ backgroundColor: wf.color }}>
                                            <span className={styles.catalogIcon}>{wf.icon}</span>
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
                                        <Link href="/login" className={styles.catalogBuyBtn}>Buy Code</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 3: SOVEREIGN EXECUTION ── */}
                <section className={styles.section} style={{ background: '#09090b' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow} style={{ color: 'var(--accent)', borderColor: 'rgba(52,209,134,0.3)', background: 'rgba(52,209,134,0.06)' }}>Sovereign Infrastructure</span>
                            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>No subscription lock-in.<br />Run it in your own environment.</h2>
                            <p className={styles.sectionSub} style={{ color: '#a1a1aa' }}>
                                Unlike typical SaaS platforms that charge monthly fees to hold your data hostage, Blonk sells you the workflow logic itself.
                            </p>
                        </div>

                        <div className={styles.sovGrid}>
                            {sovereigntyFeatures.map((f, i) => (
                                <div key={i} className={styles.sovCard}>
                                    <div className={styles.sovIconWrapper}>
                                        <span>{f.icon}</span>
                                    </div>
                                    <h3 className={styles.sovTitle}>{f.title}</h3>
                                    <p className={styles.sovDesc}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 4: PRICING ── */}
                <section className={styles.section} style={{ background: '#fafafa' }}>
                    <div className={styles.sectionInner}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.eyebrow}>Pricing Plans</span>
                            <h2 className={styles.sectionTitle}>Simple Licensing. Own it forever.</h2>
                            <p className={styles.sectionSub}>
                                Choose individual templates or unlock our entire catalog with support. No recurring billing cycles.
                            </p>
                        </div>

                        <div className={styles.pricingGrid}>
                            {/* Standard Workflow */}
                            <div className={styles.pricingCard}>
                                <div className={styles.pricingTier}>Single License</div>
                                <div className={styles.pricingAmount}>From $99<span className={styles.pricingPer}>/workflow</span></div>
                                <p className={styles.pricingDesc}>
                                    Buy any individual workflow template from our library. Perfect for solving a specific task.
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
                                <div className={styles.pricingBadge}>Best Value</div>
                                <div className={styles.pricingTier} style={{ color: 'rgba(255,255,255,0.4)' }}>Unlimited Bundle</div>
                                <div className={styles.pricingAmount} style={{ color: '#fff' }}>$1,499<span className={styles.pricingPer} style={{ color: 'rgba(255,255,255,0.3)' }}>/one-time</span></div>
                                <p className={styles.pricingDesc} style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Unlock our entire catalog of pre-built templates, future template releases, and custom setup engineering.
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
                        <h2 className={styles.ctaTitle}>Stop paying monthly for what<br />you can automate once.</h2>
                        <p className={styles.ctaSub}>Get the n8n templates today and deploy them to your own cloud infrastructure instantly.</p>
                        <Link href="/login" className={styles.ctaMainBtn}>
                            Start automating today
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
