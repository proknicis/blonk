import Link from "next/link";
import styles from "./sectors.module.css";

const sectors = [
    {
        slug: "accounting",
        name: "Accounting",
        pains: "Stop manually reconciling invoices and chasing bank feeds.",
        outcome: "DSO reduced by 40%.",
        previewColor: "#34D186"
    },
    {
        slug: "law",
        name: "Law",
        pains: "Automate contract filing and initial discovery reviews.",
        outcome: "Save 12 hours/week per associate.",
        previewColor: "#34D186"
    },
    {
        slug: "hr",
        name: "HR",
        pains: "Streamline onboarding and document verification.",
        outcome: "99% faster onboarding cycle.",
        previewColor: "#34D186"
    },
    {
        slug: "insurance",
        name: "Insurance",
        pains: "Automate claims processing and policy renewals.",
        outcome: "Zero-error submission rate.",
        previewColor: "#34D186"
    },
    {
        slug: "marketing",
        name: "Marketing",
        pains: "Manage campaign reporting and client feedback loops.",
        outcome: "Double your managed account load.",
        previewColor: "#34D186"
    }
];

export default function SectorsPage() {
    return (
        <div className="section">
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Impact in every <span className="gradient-text">sector.</span></h1>
                    <p className="secondary-text">Select your sector to see how BLONK automates your specific pain points.</p>
                </div>

                <div className={styles.grid}>
                    {sectors.map((sector) => (
                        <Link href={`/sectors/${sector.slug}`} key={sector.slug} className={styles.card}>
                            <div className={styles.cardPreview} style={{ backgroundColor: 'var(--bg-main)' }}>
                                <div className={styles.miniUi}>
                                    <div className={styles.miniBar} style={{ width: '60%', background: 'var(--accent-primary)' }} />
                                    <div className={styles.miniBar} style={{ width: '80%', background: 'var(--text-main)', opacity: 0.1 }} />
                                    <div className={styles.miniBar} style={{ width: '40%', background: 'var(--text-main)', opacity: 0.1 }} />
                                </div>
                            </div>
                            <div className={styles.cardContent}>
                                <h3>{sector.name}</h3>
                                <p className="secondary-text">{sector.pains}</p>
                                <div className={styles.outcomePill}>
                                    <span>Impact:</span>
                                    <strong>{sector.outcome}</strong>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
