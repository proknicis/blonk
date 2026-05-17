import styles from "./help.module.css";
import React from "react";

export default function HelpPage() {
    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        Documentation
                    </h3>
                    <p>Explore our comprehensive guides on agent deployment, loop optimization, and financial oversight structures.</p>
                </div>

                <div className={styles.card}>
                    <h3>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Direct Support
                    </h3>
                    <p>Connect with our expert loop engineers for customized configurations and high-performance agent tuning.</p>
                </div>
            </div>

            <div className={styles.faqSection}>
                <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>

                <div className={styles.faqItem}>
                    <h4>How do I scale my agent workforce?</h4>
                    <p>Navigate to the Settings panel and adjust your Operational Capacity. New agents can be deployed through the "Digital Office" command interface.</p>
                </div>

                <div className={styles.faqItem}>
                    <h4>What are "Operational Loops"?</h4>
                    <p>Loops are the core autonomous units of work that agents execute. These can include document discovery, financial reconciliation, or market analysis.</p>
                </div>

                <div className={styles.faqItem}>
                    <h4>Can I export financial reports?</h4>
                    <p>Yes, visit the Reports section to generate PDF, CSV, or raw JSON exports of all autonomous financial data.</p>
                </div>
            </div>
        </div>
    );
}
