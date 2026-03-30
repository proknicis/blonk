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
                <div className={styles.noise} />
                <div className={styles.sidebarGlow} />
                <div className={styles.logo}>BLONK<span className="gradient-text">.</span></div>
                <div className={styles.sidebarContent}>
                    <h1 className={styles.sidebarTitle}>The Secure Operating Layer.</h1>
                    <p className={styles.sidebarText}>Welcome back to your high-stakes command center. Access your firm's autonomous administrative infrastructure.</p>
                </div>
                <div style={{ position: 'relative', zIndex: 10, fontSize: '0.85rem', fontWeight: 700, opacity: 0.4, letterSpacing: '0.15em' }}>
                    SECURE SIGN-IN v2.5
                </div>
            </div>

            {/* --- Right Content: Form Area --- */}
            <div className={styles.rightContent}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Welcome back.</h2>
                        <p className={styles.subtitle}>Enter your institutional credentials to securely reach your dashboard.</p>
                    </div>

                    {error && (
                        <div style={{ padding: '16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '12px', border: '1px solid #FED7D7', fontSize: '0.9rem', fontWeight: 700, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <label className={styles.modernLabel} style={{ marginBottom: 0 }}>Safe-Password</label>
                                <Link href="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#94A3B8', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Password Recovery
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
                            className={`button-primary ${styles.submitBtn}`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying Identity..." : "Sign In to Terminal"}
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
