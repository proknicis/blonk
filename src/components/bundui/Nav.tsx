"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Nav.module.css";

export default function PremiumNav() {
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            if (typeof window !== "undefined") {
                setScrolled(window.scrollY > 120);
            }
        };
        
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!mounted) return null;

    return (
        <nav className={styles.nav_wrapper}>
            <div className={`${styles.pill_nav} ${scrolled ? styles.scrolled : ""}`}>
                <Link href="/" className={`${styles.nav_logo} ${scrolled ? styles.visible : ""}`}>
                    BLONK<span className={styles.logo_dot}></span>
                </Link>
                
                <div className={styles.links_group}>
                    <Link href="/process">Process</Link>
                    <Link href="/services">Services</Link>
                    <Link href="/about">About</Link>
                    <Link href="/showcase">Showcase</Link>
                    <Link href="/pricing">Pricing</Link>
                </div>

                <Link href="/setup" className={`${styles.nav_cta} ${scrolled ? styles.visible : ""}`}>
                    Get started
                </Link>
            </div>
        </nav>
    );
}
