import PremiumNav from "@/components/bundui/Nav";
import styles from "./marketing.module.css";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.wrapper}>
            <PremiumNav />
            <main>{children}</main>
        </div>
    );
}
