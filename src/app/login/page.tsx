"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import styles from "./login.module.css";
import React from "react";

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    
    // "register", "login", "mfa"
    const [mode, setMode] = useState<"login" | "register" | "mfa">("login");
    const [previousMode, setPreviousMode] = useState<"login" | "register">("login");

    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState("");
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    
    const [mfaCode, setMfaCode] = useState("");
    const [expectedCode, setExpectedCode] = useState("");

    // Redirection Guard: If already authenticated, proceed to dashboard
    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    useEffect(() => {
        const errorType = searchParams.get("error");
        if (errorType === "CredentialsSignin") {
            setError("Identity verification failed. Please check your credentials.");
        }
    }, [searchParams]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, email: val });
        
        const lower = val.toLowerCase();
        if (lower.includes("@gmail.com") || lower.includes("@yahoo.com") || lower.includes("@hotmail.com")) {
            setWarning("Institutional access requires a corporate domain, but we'll accept this for the demo.");
        } else {
            setWarning("");
        }
    }

    const simulateLoadingSteps = async () => {
        setIsLoading(true);
        setLoadingStage("Encrypting Identity...");
        await new Promise(r => setTimeout(r, 800));
        setLoadingStage("Provisioning Fleet...");
        await new Promise(r => setTimeout(r, 800));
        setLoadingStage("Access Granted.");
        await new Promise(r => setTimeout(r, 400));
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (mode !== "mfa") {
            if (mode === "register" && formData.password !== formData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            // Proceed to MFA step
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            setExpectedCode(generatedCode);
            // Log to terminal where Next.js runs and browser console for easy access during development
            console.log(`\n\n[AUTHORIZATION REQUIRED]: Your MFA Code is: ${generatedCode}\n\n`);
            
            setPreviousMode(mode);
            setMode("mfa");
        } else {
            // Processing MFA -> Finalize Auth
            if (mfaCode !== expectedCode) {
                setError("Invalid MFA code. Please check the console output.");
                return;
            }
            
            await simulateLoadingSteps();

            try {
                if (previousMode === "login") {
                    const result = await signIn("credentials", {
                        email: formData.email,
                        password: formData.password,
                        redirect: false,
                    });

                    if (result?.error) throw new Error("Invalid credentials. Access denied.");
                    router.push("/dashboard");
                } else {
                    // Registration
                    const res = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: formData.email,
                            password: formData.password,
                            name: formData.name || "Institutional Operator"
                        }),
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Establishment failure.");

                    await signIn("credentials", {
                        email: formData.email,
                        password: formData.password,
                        callbackUrl: "/setup"
                    });
                }
            } catch (err: any) {
                setError(err.message);
                setIsLoading(false);
                setMode(previousMode);
            }
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(52, 209, 134, 0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }}></div>
            <div style={{ position: 'absolute', bottom: '5%', left: '30%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 0, 0, 0.02) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }}></div>

            <div className={styles.leftSidebar}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logo_dot}></div>
                    BLONK
                </Link>
                <div className={styles.sidebarContent}>
                    <h1 className={styles.sidebarTitle}>Command<br />Terminal.</h1>
                    <p className={styles.sidebarText}>Establish your institutional identity and access high-stakes autonomous infrastructure for your firm.</p>
                </div>
                
                <div style={{ marginTop: 'auto', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ width: '40px', height: '1px', background: 'var(--border)' }}></div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>System Active</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--muted-foreground)', opacity: 0.4, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        Sovereign Fleet v3.1 / Secure
                    </div>
                </div>
            </div>

            <div className={styles.rightContent}>
                <div className={styles.container}>
                    {mode !== "mfa" ? (
                        <>
                            <div className={styles.header}>
                                <h2 className={styles.title}>{mode === "login" ? "Identity." : "Integrate."}</h2>
                                <p className={styles.subtitle}>
                                    {mode === "login" ? "Enter your safe-credentials to reach your dashboard." : "Create your institutional profile to start automating."}
                                </p>
                            </div>

                            <div className={styles.authTabs}>
                                <div 
                                    className={`${styles.tab} ${mode === "login" ? styles.activeTab : ""}`}
                                    onClick={() => { setMode("login"); setError(""); }}
                                >
                                    Sign In
                                </div>
                                <div 
                                    className={`${styles.tab} ${mode === "register" ? styles.activeTab : ""}`}
                                    onClick={() => { setMode("register"); setError(""); }}
                                >
                                    Register
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.header}>
                            <h2 className={styles.title}>MFA Required.</h2>
                            <p className={styles.subtitle}>
                                Please enter the verification code from your authenticator app or email.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className={styles.errorMsg}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {error}
                            </div>
                        </div>
                    )}

                    {warning && mode === "register" && (
                        <div style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)', color: '#D97706', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.8rem', fontWeight: 700, marginBottom: 24 }}>
                            {warning}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={handleAuth}>
                        {mode === "register" && (
                            <div className={styles.formGroup}>
                                <label className={styles.modernLabel}>Full Name</label>
                                <input
                                    type="text"
                                    className={styles.modernInput}
                                    placeholder="Institutional Operator"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        )}
                        
                        {mode !== "mfa" ? (
                            <>
                                <div className={styles.formGroup}>
                                    <label className={styles.modernLabel}>Fleet Email</label>
                                    <input
                                        type="email"
                                        className={styles.modernInput}
                                        placeholder="name@firm.ai"
                                        required
                                        value={formData.email}
                                        onChange={handleEmailChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.modernLabel}>Safe-Password</label>
                                    <input
                                        type="password"
                                        className={styles.modernInput}
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                {mode === "register" && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.modernLabel}>Verify Password</label>
                                        <input
                                            type="password"
                                            className={styles.modernInput}
                                            placeholder="••••••••"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.formGroup}>
                                <label className={styles.modernLabel}>6-Digit Code</label>
                                <input
                                    type="text"
                                    className={styles.modernInput}
                                    placeholder="000000"
                                    required
                                    value={mfaCode}
                                    onChange={(e) => setMfaCode(e.target.value)}
                                    maxLength={6}
                                    style={{ letterSpacing: "0.2em", fontSize: "1.2rem", textAlign: "center" }}
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={isLoading}
                        >
                            {isLoading ? loadingStage : mode === "mfa" ? "Verify Identity" : mode === "login" ? "Initialize Session" : "Establish Integration"}
                        </button>
                    </form>

                    {mode !== "mfa" && (
                        <>
                            <div className={styles.divider}>
                                <div className={styles.dividerLine}></div>
                                <span>AUTONOMOUS AUTH</span>
                                <div className={styles.dividerLine}></div>
                            </div>

                            <button className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                </svg>
                                Google Sync Handshake
                            </button>
                        </>
                    )}

                    <div style={{ marginTop: 40, textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                        By establishing access, you agree to the <Link href="/terms" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 700 }}>Institutional Protocols</Link>.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className={styles.pageWrapper}><p style={{ color: 'var(--muted-foreground)', padding: 40 }}>Initializing institutional authentication gateway...</p></div>}>
            <AuthContent />
        </Suspense>
    );
}
