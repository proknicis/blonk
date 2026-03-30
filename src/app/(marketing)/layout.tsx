import Link from "next/link";
import styles from "./marketing.module.css";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.wrapper}>
            <nav className={styles.premium_nav}>
                <Link href="/" className={styles.nav_logo}>
                    BLONK<span className="gradient-text">.</span>
                </Link>
                <div className={styles.nav_links}>
                    <Link href="/sectors">Solutions</Link>
                    <Link href="/pricing">Pricing</Link>
                    <Link href="/about">About</Link>
                    <Link href="/login">Portal Login</Link>
                </div>
                <div className={styles.nav_actions}>
                    <Link href="/setup" className="button-primary button-pill" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>Commit Protocol</Link>
                </div>
            </nav>
            <main>{children}</main>

        </div>
    );
}
