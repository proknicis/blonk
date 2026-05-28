"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./login.module.css";
import React from "react";

// Inline Icons for Visual Polish
const IconShield = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IconFileCheck = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <polyline points="9 15 11 17 15 13" />
    </svg>
);

const IconZap = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);

const IconEye = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const IconEyeOff = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    
    const [mode, setMode] = useState<"login" | "register" | "mfa">("login");
    const [previousMode, setPreviousMode] = useState<"login" | "register">("login");

    const [isLoading, setIsLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState("");
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    
    const [mfaCode, setMfaCode] = useState("");
    const [expectedCode, setExpectedCode] = useState("");

    useEffect(() => {
        const errorType = searchParams.get("error");
        if (errorType === "CredentialsSignin") {
            setError("Authentication failed. Please verify your credentials and try again.");
        }
    }, [searchParams]);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData({ ...formData, email: val });
        
        const lower = val.toLowerCase();
        if (lower.includes("@gmail.com") || lower.includes("@yahoo.com") || lower.includes("@hotmail.com")) {
            setWarning("Enterprise access recommended. Corporate domain suggested.");
        } else {
            setWarning("");
        }
    };

    const simulateLoadingSteps = async () => {
        setIsLoading(true);
        setLoadingStage("Verifying credentials...");
        await new Promise(r => setTimeout(r, 600));
        setLoadingStage("Establishing session...");
        await new Promise(r => setTimeout(r, 600));
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (mode !== "mfa") {
            if (mode === "register" && formData.password !== formData.confirmPassword) {
                setError("Passwords do not match.");
                return;
            }
            
            // Proceed to Verification (OTP) step
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            setExpectedCode(generatedCode);
            
            setIsLoading(true);
            setLoadingStage("Sending verification code...");

            try {
                const res = await fetch("/api/auth/otp", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: formData.email, otp: generatedCode }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Failed to deliver security verification code.");
                }

                setPreviousMode(mode);
                setMode("mfa");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        } else {
            // Finalize authentication
            if (mfaCode !== expectedCode) {
                setError("Verification code is incorrect. Please recheck your email inbox.");
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

                    if (result?.error) throw new Error("Incorrect login email or password.");
                    router.push("/dashboard");
                } else {
                    // Registration
                    const res = await fetch("/api/auth/register", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: formData.email,
                            password: formData.password,
                            name: formData.name || "Enterprise Member"
                        }),
                    });

                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed to establish workspace registry.");

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

    // Live Validation Rules
    const hasMinLength = formData.password.length >= 8;
    const hasNumber = /\d/.test(formData.password);
    const passwordsMatch = formData.password === formData.confirmPassword;

    return (
        <div className={styles.pageWrapper}>
            {/* Visual background details */}
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '350px', height: '350px', background: 'radial-gradient(circle, rgba(52, 209, 134, 0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }}></div>
            <div style={{ position: 'absolute', bottom: '5%', left: '30%', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(0, 0, 0, 0.01) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 1 }}></div>

            {/* Left Sidebar - Product & Trust Panel */}
            <div className={styles.leftSidebar}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.logo_dot}></div>
                    BLONK
                </Link>
                
                <div className={styles.sidebarContent}>
                    <span className={styles.sidebarEyebrow}>Sovereign Workflow Gateway</span>
                    <h1 className={styles.sidebarTitle}>Secure operational execution.</h1>
                    <p className={styles.sidebarText}>
                        Access the BLONK dashboard to provision dedicated VPS nodes, deploy audited automation blueprints, and manage your ledger transactions.
                    </p>

                    <div className={styles.trustList}>
                        <div className={styles.trustItem}>
                            <div className={styles.trustIconWrapper}>
                                <IconShield />
                            </div>
                            <div className={styles.trustText}>
                                <h4 className={styles.trustTitle}>100% Data Sovereignty</h4>
                                <p className={styles.trustDesc}>All workflows execute in isolated tenant nodes within your private boundary.</p>
                            </div>
                        </div>

                        <div className={styles.trustItem}>
                            <div className={styles.trustIconWrapper}>
                                <IconFileCheck />
                            </div>
                            <div className={styles.trustText}>
                                <h4 className={styles.trustTitle}>SOC-2 & GRC Audited</h4>
                                <p className={styles.trustDesc}>Built-in immutable transaction logs and automated threat telemetry.</p>
                            </div>
                        </div>

                        <div className={styles.trustItem}>
                            <div className={styles.trustIconWrapper}>
                                <IconZap />
                            </div>
                            <div className={styles.trustText}>
                                <h4 className={styles.trustTitle}>Direct Endpoint Routing</h4>
                                <p className={styles.trustDesc}>Connect straight to LLMs and SQL ledgers with zero middleman markups.</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className={styles.sidebarFooter}>
                    <div className={styles.statusPulse}>
                        <span className={styles.pulseDot}></span>
                        <span className={styles.statusLabel}>All Nodes Operational</span>
                    </div>
                    <span className={styles.versionLabel}>Fleet Version v3.2</span>
                </div>
            </div>

            {/* Right Side Content - Expanded Balanced Auth Card */}
            <div className={styles.rightContent}>
                <div className={styles.container}>
                    {mode !== "mfa" ? (
                        <>
                            <div className={styles.header}>
                                <h2 className={styles.title}>
                                    {status === "authenticated" ? "Session Detected" : (mode === "login" ? "Welcome back" : "Create account")}
                                </h2>
                                <p className={styles.subtitle}>
                                    {status === "authenticated" 
                                        ? `You are currently authenticated as ${session?.user?.email}.`
                                        : (mode === "login" ? "Enter your credentials to access your active workspace." : "Register your institutional profile to start automating.")}
                                </p>
                            </div>

                            {status !== "authenticated" && (
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
                            )}
                        </>
                    ) : (
                        <div className={styles.header}>
                            <h2 className={styles.title}>Verify your email</h2>
                            <p className={styles.subtitle}>
                                Enter the 6-digit security code sent to your email address to authenticate.
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
                        <div className={styles.warningBox}>
                            {warning}
                        </div>
                    )}

                    {!isMounted || status === "loading" ? (
                        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div className={styles.pulseDot} />
                        </div>
                    ) : (
                        status === "authenticated" ? (
                            <div className={styles.authenticatedPrompt}>
                                <div className={styles.profileSection}>
                                    <div className={styles.profileAvatar}>
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt={session.user.name || ""} className={styles.avatarImg} />
                                        ) : (
                                            <div className={styles.avatarPlaceholder}>
                                                {(session?.user?.name || session?.user?.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.profileInfo}>
                                        <div className={styles.profileName}>{session?.user?.name || "Enterprise Member"}</div>
                                        <div className={styles.profileEmail}>{session?.user?.email}</div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className={styles.submitBtn}
                                    style={{ marginTop: 0 }}
                                >
                                    Go to Dashboard
                                </button>
                                
                                <button
                                    onClick={() => signOut({ redirect: false })}
                                    className={styles.secondaryBtn}
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <form className={styles.form} onSubmit={handleAuth}>
                                {mode === "register" && (
                                    <div className={styles.formGroup}>
                                        <label className={styles.modernLabel}>Full name</label>
                                        <input
                                            type="text"
                                            className={styles.modernInput}
                                            placeholder="Jane Doe"
                                            required
                                            suppressHydrationWarning
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                )}
                                
                                {mode !== "mfa" ? (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label className={styles.modernLabel}>Email address</label>
                                            <input
                                                type="email"
                                                className={styles.modernInput}
                                                placeholder="name@firm.com"
                                                required
                                                suppressHydrationWarning
                                                value={formData.email}
                                                onChange={handleEmailChange}
                                            />
                                        </div>
                                        
                                        <div className={styles.formGroup}>
                                            <label className={styles.modernLabel}>Password</label>
                                            <div className={styles.passwordWrapper}>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className={styles.passwordInput}
                                                    placeholder="••••••••"
                                                    required
                                                    suppressHydrationWarning
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                />
                                                <button
                                                    type="button"
                                                    className={styles.togglePasswordBtn}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    tabIndex={-1}
                                                >
                                                    {showPassword ? <IconEyeOff /> : <IconEye />}
                                                </button>
                                            </div>
                                        </div>

                                        {mode === "register" && (
                                            <div className={styles.formGroup}>
                                                <label className={styles.modernLabel}>Confirm Password</label>
                                                <div className={styles.passwordWrapper}>
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        className={styles.passwordInput}
                                                        placeholder="••••••••"
                                                        required
                                                        suppressHydrationWarning
                                                        value={formData.confirmPassword}
                                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={styles.togglePasswordBtn}
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        tabIndex={-1}
                                                    >
                                                        {showConfirmPassword ? <IconEyeOff /> : <IconEye />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {mode === "register" && formData.password.length > 0 && (
                                            <div className={styles.checklist}>
                                                <div className={`${styles.checkItem} ${hasMinLength ? styles.checkSuccess : styles.checkMuted}`}>
                                                    <span className={styles.checkBullet}>•</span> At least 8 characters
                                                </div>
                                                <div className={`${styles.checkItem} ${hasNumber ? styles.checkSuccess : styles.checkMuted}`}>
                                                    <span className={styles.checkBullet}>•</span> At least one number
                                                </div>
                                                <div className={`${styles.checkItem} ${passwordsMatch && formData.confirmPassword.length > 0 ? styles.checkSuccess : styles.checkMuted}`}>
                                                    <span className={styles.checkBullet}>•</span> Passwords match
                                                </div>
                                            </div>
                                        )}

                                        {mode === "login" && (
                                            <div className={styles.formRow}>
                                                <label className={styles.rememberMe}>
                                                    <input type="checkbox" className={styles.checkbox} />
                                                    <span>Remember me</span>
                                                </label>
                                                <Link href="/forgot-password" className={styles.forgotLink}>
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className={styles.formGroup}>
                                        <label className={styles.modernLabel}>Verification Code</label>
                                        <input
                                            type="text"
                                            className={styles.modernInput}
                                            placeholder="000000"
                                            required
                                            suppressHydrationWarning
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
                                    disabled={isLoading || (mode === "register" && (!hasMinLength || !hasNumber || !passwordsMatch))}
                                    suppressHydrationWarning
                                >
                                    {isLoading ? loadingStage : mode === "mfa" ? "Verify Identity" : mode === "login" ? "Sign In" : "Create Account"}
                                </button>
                            </form>
                        )
                    )}

                    {status !== "authenticated" && mode !== "mfa" && (
                        <>
                            <div className={styles.divider}>
                                <div className={styles.dividerLine}></div>
                                <span>OR</span>
                                <div className={styles.dividerLine}></div>
                            </div>

                            <button className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
                                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                </svg>
                                Continue with Google
                            </button>
                        </>
                    )}

                    <div className={styles.termsNote}>
                        By establishing access, you agree to our <Link href="/terms" className={styles.termsLink}>Institutional Protocols</Link> and <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>.
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
