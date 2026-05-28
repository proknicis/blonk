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
        title: "100% Data Sovereignty",
        desc: "All workflows execute within your firewalls. Zero external caching, zero middleman data storage, and compliance by default.",
        Icon: IconShield,
    },
    {
        title: "Zero API Markups",
        desc: "Communicate directly with OpenAI, Anthropic, or database endpoints. Pay the raw resource costs without platform markups.",
        Icon: IconTrending,
    },
    {
        title: "Logical Ownership",
        desc: "Every blueprint is licensed as open-standard JSON. Export, copy, fork, or run your logic on local containers without lock-in.",
        Icon: IconUnlock,
    }
];

const standardItems = [
    'Sovereign n8n JSON file license',
    'Lifetime blueprint updates & patches',
    'Technical setup & deployment guide',
    'Local VPS or Cloud deploy ready',
    'Email documentation support',
];

const bundleItems = [
    'Lifetime access to full workflow catalog',
    'Full system & database provisioning',
    '3 hours of direct engineering support',
    'Priority deployment updates',
    'GRC compliance architecture guide',
];


export default function HomePage() {
    return (
        <div className={styles.container}>
            <div className={styles.mainContent}>

                {/* ── REDESIGNED SOVEREIGN HERO SECTION ── */}
                <section className={styles.heroSection}>
                    {/* Background Grid Lines */}
                    <div className={styles.gridOverlay} />
                    
                    {/* Top System Status Signals */}
                    <div className={styles.statusTelemetry}>
                        <span className={styles.statusDot} />
                        <span className={styles.statusText}>SYSTEM ACTIVE: SECURE VPS ISOLATED NODE</span>
                        <span className={styles.telemetryDivider}>|</span>
                        <span className={styles.statusText}>LATENCY: 120MS</span>
                        <span className={styles.telemetryDivider}>|</span>
                        <span className={styles.statusText}>COMPLIANCE: SOC-2 / HIPAA READY</span>
                    </div>

                    <div className={styles.heroHeader}>
                        <span className={styles.heroEyebrow}>DECOUPLED OPERATIONAL ENGINE</span>
                        <h1 className={styles.heroTitle}>
                            Sovereign execution<br />for critical workflows.
                        </h1>
                        <p className={styles.heroSub}>
                            Run production-ready automation pipelines on your own private infrastructure. Own the logical code, secure your proprietary data, and eliminate vendor seat-taxes permanently.
                        </p>
                        
                        <div className={styles.heroActions}>
                            <Link href="/login" className={styles.heroPrimaryBtn}>
                                Start saving time
                                <IconArrow />
                            </Link>
                            <Link href="/process" className={styles.heroSecondaryBtn}>
                                Read Architecture
                            </Link>
                        </div>
                    </div>

                    {/* The Active Spreadsheet & Pipeline Visual */}
                    <div className={styles.canvasContainer}>
                        {/* The main spreadsheet card */}
                        <div className={styles.spreadsheetCard}>
                            <div className={styles.sheetHeader}>
                                <div className={styles.sheetTabs}>
                                    <span className={`${styles.sheetTab} ${styles.sheetTabActive}`}>raw_inputs.csv</span>
                                    <span className={styles.sheetTab}>validated_leads</span>
                                    <span className={styles.sheetTab}>billing_sync</span>
                                </div>
                                <div className={styles.sheetControls}>
                                    <span className={styles.sheetStatus}>● Active Syncing</span>
                                </div>
                            </div>
                            
                            {/* Spreadsheet Grid */}
                            <div className={styles.sheetGrid}>
                                <div className={styles.sheetRowHeader}>
                                    <div></div>
                                    <div>A: TIMESTAMP</div>
                                    <div>B: SOURCE</div>
                                    <div>C: PAYLOAD</div>
                                    <div>D: STATUS</div>
                                </div>
                                <div className={styles.sheetRow}>
                                    <div className={styles.rowNumber}>1</div>
                                    <div>22:15:32</div>
                                    <div>inbox@firm.com</div>
                                    <div>{`{"type": "invoice", "id": 1092, "amount": 1490.00}`}</div>
                                    <div><span className={styles.statusBadgeGreen}>Processed</span></div>
                                </div>
                                <div className={styles.sheetRow}>
                                    <div className={styles.rowNumber}>2</div>
                                    <div>22:15:34</div>
                                    <div>stripe_webhook</div>
                                    <div>{`{"event": "charge.succeeded", "invoice": "in_923a"}`}</div>
                                    <div><span className={styles.statusBadgeGreen}>Processed</span></div>
                                </div>
                                <div className={styles.sheetRow}>
                                    <div className={styles.rowNumber}>3</div>
                                    <div>22:15:40</div>
                                    <div>portal_upload</div>
                                    <div>{`{"file": "client_ledger_q2.xlsx", "rows": 890}`}</div>
                                    <div><span className={styles.statusBadgeGreen}>Processed</span></div>
                                </div>
                                <div className={styles.sheetRow}>
                                    <div className={styles.rowNumber}>4</div>
                                    <div>22:16:01</div>
                                    <div>api_gateway</div>
                                    <div>{`{"query": "sync_crm_contacts", "team_id": "usr_99"}`}</div>
                                    <div><span className={styles.statusBadgeGreen}>Processed</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Asymmetric Supporting UI: Floating Terminal Overlay */}
                        <div className={styles.floatingTerminal}>
                            <div className={styles.terminalHeader}>
                                <div className={styles.terminalControls}>
                                    <span className={styles.termRed}></span>
                                    <span className={styles.termYellow}></span>
                                    <span className={styles.termGreen}></span>
                                </div>
                                <span className={styles.terminalTitle}>blonk-node-telemetry</span>
                            </div>
                            <div className={styles.terminalBody}>
                                <div className={styles.termLine}>$ blonk start-engine --sovereign</div>
                                <div className={styles.termLineSuccess}>✓ Isolated core container initialized</div>
                                <div className={styles.termLine}>✓ Decrypted local vault credentials</div>
                                <div className={styles.termLineSuccess}>✓ Connected to OpenAI model API (Direct Key)</div>
                                <div className={styles.termLine}>● Syncing database ledger records...</div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Strip under the hero */}
                    <div className={styles.heroTrustStrip}>
                        <span className={styles.trustTitle}>TRUSTED FOR SECURE OPERATIONS</span>
                        <div className={styles.trustLogos}>
                            <span>AUDITED GRC BLUEPRINTS</span>
                            <span className={styles.trustDot}>•</span>
                            <span>SOC-2 READINESS</span>
                            <span className={styles.trustDot}>•</span>
                            <span>AES-256 VAULT ENCRYPTION</span>
                            <span className={styles.trustDot}>•</span>
                            <span>100% DATA SOVEREIGNTY</span>
                        </div>
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

                        <div className={styles.sovLayout}>
                            <div className={styles.sovContent}>
                                <div className={styles.sovFeaturesList}>
                                    {sovereigntyFeatures.map((f, i) => {
                                        const FeatureIcon = f.Icon;
                                        return (
                                            <div key={i} className={styles.sovFeatureItem}>
                                                <div className={styles.sovIconWrapper}>
                                                    <FeatureIcon />
                                                </div>
                                                <div className={styles.sovFeatureText}>
                                                    <h3 className={styles.sovTitle}>{f.title}</h3>
                                                    <p className={styles.sovDesc}>{f.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Right Side Visual Terminal */}
                            <div className={styles.sovVisual}>
                                <div className={styles.sovVisualHeader}>
                                    <span className={styles.sovVisualDot} />
                                    <span className={styles.sovVisualTitle}>Private Node Telemetry</span>
                                </div>
                                <div className={styles.sovVisualBody}>
                                    <div className={styles.sovTelemetryRow}>
                                        <span>Status</span>
                                        <span className={styles.sovTelemetryStatus}>Active & Sovereign</span>
                                    </div>
                                    <div className={styles.sovTelemetryRow}>
                                        <span>Data Routing</span>
                                        <span className={styles.sovTelemetryValue}>Local Loopback Only</span>
                                    </div>
                                    <div className={styles.sovTelemetryRow}>
                                        <span>Compliance GRC</span>
                                        <span className={styles.sovTelemetryBadge}>SOC-2 Ready</span>
                                    </div>
                                    <div className={styles.sovTelemetryConsole}>
                                        <div className={styles.telemetryLine}>$ blonk-node start --sovereign</div>
                                        <div className={styles.telemetryLine} style={{ color: 'var(--accent)' }}>✓ Isolated core container initialized</div>
                                        <div className={styles.telemetryLine}>✓ Local database handshake verified</div>
                                        <div className={styles.telemetryLine}>✓ Zero-leak proxy listening on :443</div>
                                    </div>
                                </div>
                            </div>
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
                                <div className={styles.pricingAmount}>$149<span className={styles.pricingPer}>/blueprint</span></div>
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
                <div className={styles.footerGrid}>
                    <div className={styles.footerBrandCol}>
                        <div className={styles.footerLogo}>
                            BLONK<span className={styles.footerLogoDot} />
                        </div>
                        <p className={styles.footerBrandDesc}>
                            Decoupled workflow execution. Designed for security-critical, data-intensive professional services.
                        </p>
                    </div>

                    <div className={styles.footerCol}>
                        <h4 className={styles.footerColTitle}>Blueprints</h4>
                        <div className={styles.footerColLinks}>
                            <Link href="/login" className={styles.footerLink}>Intake Triage</Link>
                            <Link href="/login" className={styles.footerLink}>Invoice Chaser</Link>
                            <Link href="/login" className={styles.footerLink}>Onboarding Flow</Link>
                            <Link href="/login" className={styles.footerLink}>AI OCR Extractor</Link>
                        </div>
                    </div>

                    <div className={styles.footerCol}>
                        <h4 className={styles.footerColTitle}>Platform</h4>
                        <div className={styles.footerColLinks}>
                            <Link href="/services" className={styles.footerLink}>Sovereignty</Link>
                            <Link href="/showcase" className={styles.footerLink}>Integrations</Link>
                            <Link href="/pricing" className={styles.footerLink}>Pricing</Link>
                            <Link href="/sandbox" className={styles.footerLink}>Sandbox</Link>
                        </div>
                    </div>

                    <div className={styles.footerCol}>
                        <h4 className={styles.footerColTitle}>Compliance</h4>
                        <div className={styles.footerColLinks}>
                            <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
                            <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
                            <Link href="/process" className={styles.footerLink}>SOC-2 Overview</Link>
                            <Link href="/about" className={styles.footerLink}>About Us</Link>
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <span>© 2026 BLONK ASSETS LLC. All rights reserved.</span>
                    <span>Built for professional services firms.</span>
                </div>
            </footer>
        </div>
    );
}

