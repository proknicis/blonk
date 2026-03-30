import Link from "next/link";
import styles from "../sectors.module.css";

// Mock data for individual sector pages
const sectorData: Record<string, any> = {
    accounting: {
        name: "Accounting",
        headline: "Automate Finance Admin.",
        description: "Reclaim 20+ hours a month on manual reconciliation and data entry.",
        features: [
            { title: "Smart Reconciliation", desc: "No more matching bank feeds manually." },
            { title: "Invoice Extraction", desc: "System reads and files every invoice automatically." },
            { title: "Client Reminders", desc: "Friendly bots chase late payments so you don't have to." }
        ]
    },
    law: {
        name: "Law",
        headline: "Faster Contract Review.",
        description: "Automate the grunt work of contract analysis and filing.",
        features: [
            { title: "Clause Detection", desc: "System highlights risky clauses instantly." },
            { title: "Automatic Filing", desc: "Documents are organized in your DMS without human touch." },
            { title: "Discovery Support", desc: "Summarize thousands of documents in seconds." }
        ]
    }
    // Others would be populated similarly
};

export default function SectorDetailPage({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const sector = sectorData[slug] || sectorData.accounting; // Fallback to accounting for demo

    return (
        <div className="section">
            <div className="container">
                <div className={styles.detailHero}>
                    <Link href="/sectors" className={styles.backLink}>← Back to Sectors</Link>
                    <h1 className={styles.title}>{sector.name} <span className="gradient-text">Automation.</span></h1>
                    <p className={styles.subtitle}>{sector.description}</p>
                    <div className={styles.heroActions}>
                        <Link href="/setup" className="button-primary">Start {sector.name} setup</Link>
                    </div>
                </div>

                <div className={styles.featureGrid}>
                    {sector.features.map((f: any, i: number) => (
                        <div key={i} className={styles.featureItem}>
                            <h3>{f.title}</h3>
                            <p className="secondary-text">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <section className={styles.faqSection}>
                    <h2>Pricing & Delivery</h2>
                    <div className={styles.faqGrid}>
                        <div className={styles.faqItem}>
                            <strong>How long to go live?</strong>
                            <p className="secondary-text">Typically under 15 minutes for standard {sector.name} workflows.</p>
                        </div>
                        <div className={styles.faqItem}>
                            <strong>Integration needed?</strong>
                            <p className="secondary-text">We connect natively to Xero, QuickBooks, Clio, and common ERPs.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
