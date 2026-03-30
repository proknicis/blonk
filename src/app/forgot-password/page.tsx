"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../login/login.module.css";

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.leftSidebar}>
                <div className={styles.sidebarPattern} />
                <div className={styles.sidebarGlow} />
                <div className={styles.logo}>BLONK</div>
                <div className={styles.sidebarContent}>
                    <h1 className={styles.sidebarTitle}>
                        Secure<br />Recovery.
                    </h1>
                    <p className={styles.sidebarText}>
                        Lost access to your command center? Enter your email address below to securely reset your credentials and regain access to your firm's workflows.
                    </p>
                </div>
            </div>

            <div className={styles.rightContent}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h2 className={styles.title}>Reset Password<span className="gradient-text">.</span></h2>
                        <p className={styles.subtitle}>
                            {isSubmitted 
                                ? "Check your email for instructions to reset your password." 
                                : "Enter the email associated with your account to receive a reset link."}
                        </p>
                    </div>

                    {!isSubmitted ? (
                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div>
                                <label className={styles.modernLabel}>Email Address</label>
                                <input
                                    type="email"
                                    className={styles.modernInput}
                                    placeholder="name@firm.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            
                            <button
                                type="submit"
                                className={`button-primary ${styles.submitBtn}`}
                                disabled={isLoading}
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                            <div style={{ 
                                width: '64px', 
                                height: '64px', 
                                background: 'rgba(52, 209, 134, 0.15)', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                color: 'var(--accent-primary)'
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>
                            <button 
                                onClick={() => {setIsSubmitted(false); setEmail("");}}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Try another email
                            </button>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <p>Remember your password? <Link href="/login">Return to login</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
