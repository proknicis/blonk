import styles from "./about.module.css";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="section">
            <div className="container">
                <div className={styles.hero}>
                    <h1 className={styles.title}>The mission behind <span className="gradient-text">BLONK.</span></h1>
                    <p className={styles.subtitle}>
                        We believe professional services should be defined by high-value strategy,
                        not administrative friction.
                    </p>
                </div>

                <div className={styles.content}>
                    <div className={styles.section}>
                        <h2>Why we exist</h2>
                        <p className="secondary-text">
                            Every year, associates at law and accounting firms spend over 800 hours on tasks that don't require their expertise:
                            filing documents, reconciling invoices, and chasing signatures.
                            BLONK was born to reclaim that time.
                        </p>
                    </div>

                    <div className={styles.foundersGrid}>
                        <div className={styles.founderCard}>
                            <div className={styles.avatar} />
                            <h3>Nikolass Prokopecs</h3>
                            <p className="secondary-text">CEO & Co-founder. Former Partner at Vertex Law.</p>
                        </div>
                        <div className={styles.founderCard}>
                            <div className={styles.avatar} />
                            <h3>Nikolass Prokopecs</h3>
                            <p className="secondary-text">CTO & Co-founder. Ex-Lead Engineer at ForgeOS.</p>
                        </div>
                    </div>

                    <div className={styles.ctaCard}>
                        <h2>Ready to transform your firm?</h2>
                        <p className="secondary-text">Join 500+ innovative firms already scaling with BLONK.</p>
                        <div className={styles.ctaActions}>
                            <Link href="/setup" className="button-primary">Get Started</Link>
                            <Link href="/pricing" className="button-secondary">View pricing</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
