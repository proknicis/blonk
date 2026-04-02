"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import React from "react";
import { signIn } from "next-auth/react";

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
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) throw new Error("Identity verification failed. Please check your credentials.");

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

                    <div className={styles.divider}>
                        <div className={styles.dividerLine}></div>
                        <span>OR</span>
                        <div className={styles.dividerLine}></div>
                    </div>

                    <button className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
                        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        Sovereign Google Sync
                    </button>

                    <div className={styles.footer}>
                        <p>No account yet? <Link href="/setup">Establish Integration</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
