"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import React from "react";

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Identity verification failed.');

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            {/* --- Left Sidebar: Branding & Security --- */}
            <div className={styles.leftSidebar}>
                <Link href="/" className={styles.logo}>
                    BLONK<span className={styles.logo_dot}></span>
                </Link>
                <div className={styles.sidebarContent}>
                    <h1 className={styles.sidebarTitle}>Command<br />Terminal.</h1>
                    <p className={styles.sidebarText}>Welcome back to your high-stakes administrative infrastructure. Access your firm's specialized autonomous units.</p>
                </div>
                <div style={{ position: 'relative', marginTop: 'auto', zIndex: 10, fontSize: '0.85rem', fontWeight: 900, color: '#999', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    Sovereign v2.5 / Secure
                </div>
            </div>

            {/* --- Right Content: Form Area --- */}
            <div className={styles.rightContent}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Identity.</h2>
                        <p className={styles.subtitle}>Enter your institutional credentials to reach your dashboard.</p>
                    </div>

                    {error && (
                        <div style={{ padding: '16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '12px', border: '1px solid #FED7D7', fontSize: '0.9rem', fontWeight: 800, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                            {error}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div>
                            <label className={styles.modernLabel}>Institutional Email</label>
                            <input
                                type="email"
                                className={styles.modernInput}
                                placeholder="name@firm.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                <label className={styles.modernLabel} style={{ marginBottom: 0 }}>Safe-Password</label>
                                <Link href="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 900, color: '#999', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Recovery
                                </Link>
                            </div>
                            <input
                                type="password"
                                className={styles.modernInput}
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Initialize Session"}
                        </button>
                    </form>

                    <div className={styles.footer}>
                        <p>No account yet? <Link href="/setup">Establish Integration</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
