import Link from "next/link";
import styles from "./pricing.module.css";

const plans = [
    {
        name: "Starter",
        price: "299",
        description: "Perfect for boutiques getting started with automation.",
        features: ["5 Custom Workflows", "1,000 Tasks per month", "Standard Templates", "Email Support", "Secure Infrastructure"]
    },
    {
        name: "Growth",
        price: "899",
        description: "The professional standard for scaling firms.",
        features: ["Unlimited Workflows", "10,000 Tasks per month", "Custom Integration Library", "Priority Human Support", "Advanced Compliance Logs", "Team Collaboration"],
        highlighted: true
    },
    {
        name: "Custom",
        price: "PoA",
        description: "Bespoke workforce for national and global firms.",
        features: ["White-glove implementation", "Unlimited Tasks", "On-premise deployment", "Dedicated Success Manager", "Custom Model Training", "SLA Guarantees"]
    }
];

export default function PricingPage() {
    return (
        <div className="section">
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Simple, <span className="gradient-text">transparent</span> pricing.</h1>
                    <p className="secondary-text">Scalable solutions for professional services. No hidden setup fees.</p>
                </div>

                <div className={styles.grid}>
                    {plans.map((plan) => (
                        <div key={plan.name} className={`${styles.card} ${plan.highlighted ? styles.highlighted : ''}`}>
                            {plan.highlighted && <div className={styles.tag}>RECOMMENDED</div>}
                            <h3>{plan.name}</h3>
                            <p className={styles.desc}>{plan.description}</p>
                            <div className={styles.price}>
                                {plan.price !== "PoA" && <span>$</span>}
                                {plan.price}
                                {plan.price !== "PoA" && <small>/mo</small>}
                            </div>

                            <ul className={styles.features}>
                                {plan.features.map(f => <li key={f}>{f}</li>)}
                            </ul>

                            <Link
                                href={plan.name === "Custom" ? "/sales" : "/setup"}
                                className={plan.highlighted ? "button-primary" : "button-secondary"}
                                style={{ width: '100%', textAlign: 'center' }}
                            >
                                {plan.name === "Custom" ? "Talk to Sales" : "Get Started"}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className={styles.reassurance}>
                    <div className={styles.reassuranceItem}>
                        <strong>14-day free trial</strong>
                        <span>Test BLONK with zero risk.</span>
                    </div>
                    <div className={styles.reassuranceItem}>
                        <strong>Cancel anytime</strong>
                        <span>No long-term contracts.</span>
                    </div>
                    <div className={styles.reassuranceItem}>
                        <strong>Enterprise Security</strong>
                        <span>SOC2 Compliant by default.</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
