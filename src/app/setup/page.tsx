"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import styles from "./setup.module.css";
import { completeSetup } from "./actions";
import React from "react";

export default function SetupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [step, setStep] = useState(1);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("");
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        firmName: "",
        industry: "",
        goal: ""
    });

    // Auto-fill from session if available
    useEffect(() => {
        if (session?.user?.email) {
            setFormData(prev => ({ ...prev, email: session.user?.email || "" }));
        }
    }, [session, status]);

    const tasks = [
        "Establishing Secure Handshake...",
        "Cryptographic Key Generation...",
        "Firm Instance Provisioning...",
        "Intelligent Unit Initialization...",
        "Deploying Governance Guard..."
    ];

    useEffect(() => {
        if (isProvisioning) {
            let current = 0;
            const interval = setInterval(() => {
                current += 1;
                setProgress(current);
                const taskIndex = Math.floor((current / 100) * tasks.length);
                setCurrentTask(tasks[Math.min(taskIndex, tasks.length - 1)]);
                if (current >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setStep(4), 500);
                }
            }, 25);
            return () => clearInterval(interval);
        }
    }, [isProvisioning]);

    const industries = [
        { id: 'Law', label: 'Legal Services', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg> },
        { id: 'Accounting', label: 'Financial / Tax', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> },
        { id: 'Insurance', label: 'Insurance Proxy', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> },
        { id: 'HR', label: 'Recruitment / HR', icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step < 3) return setStep(step + 1);

        setIsProvisioning(true);
        setError("");
        
        try {
            const result = await completeSetup({
                email: formData.email,
                password: formData.password,
                firmName: formData.firmName,
                industry: formData.industry,
                goal: formData.goal
            });
            
            if (result.error) throw new Error(result.error);

            // If it was a new registration, we might need a manual sign-in,
            // but for now the user is either existing (Google) or needs auto-login.
            if (!session) {
                await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    redirect: false
                });
            }
        } catch (err: any) {
            setError(err.message);
            setIsProvisioning(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* --- Left Column: Institutional Anchor --- */}
            <div className={styles.leftColumn}>
                <Link href="/" className={styles.logo}>
                    BLONK<span className={styles.logo_dot}></span>
                </Link>
                <div className={styles.sidebarContent}>
                    <span className={styles.visualTag}>Sovereign Handshaking</span>
                    <h1 className={styles.sidebarTitle}>Integration<br />Provisioning.</h1>
                    <p className={styles.sidebarText}>Establish your sovereign firm instance in minutes. We automate the administrative friction, you focus on the exceptions.</p>
                </div>
                <div style={{ marginTop: 'auto', fontSize: '0.75rem', fontWeight: 900, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
                    SECURE PROTOCOL / {formData.email?.toUpperCase() || "IDENTITY PENDING"}
                </div>
            </div>

            {/* --- Right Column: Interaction Area --- */}
            <div className={styles.rightColumn}>
                <div className={styles.formContainer}>
                    {step < 4 && !isProvisioning && (
                        <div className={styles.stepWrapper}>
                            <span className={styles.stepLabel}>Step 0{step} / 03</span>
                            <div className={styles.stepIndicator}>
                                {[1, 2, 3].map(s => <div key={s} className={`${styles.dot} ${step >= s ? styles.dotActive : ''}`} />)}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.05)', color: '#EF4444', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '0.85rem', fontWeight: 800, marginBottom: 32 }}>
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>{session ? "Identity Confirmed." : "Authentication credentials required for initial setup."}</h1>
                            <p className={styles.subtitle}>
                                {session 
                                    ? `Operator identified as ${session.user?.email}. Proceed to firm context.` 
                                    : "Identify yourself as the firm's strategic administrator to initialize the server fleet."}
                            </p>
                            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
                                {!session ? (
                                    <>
                                        <div className={styles.inputWrapper}>
                                            <label className={styles.inputLabel}>Work Email</label>
                                            <input type="email" className={styles.input} placeholder="name@firm.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                        </div>
                                        <div className={styles.inputWrapper}>
                                            <label className={styles.inputLabel}>Safe-Password</label>
                                            <input type="password" className={styles.input} placeholder="••••••••" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                        </div>
                                        <button type="submit" className={styles.submitBtn}>Initialize Secure Setup</button>
                                        
                                        <div className={styles.divider}>
                                            <div className={styles.dividerLine}></div>
                                            <span>OR</span>
                                            <div className={styles.dividerLine}></div>
                                        </div>

                                        <button type="button" className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/setup' })}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                                <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                            </svg>
                                            Google Sync Handshake
                                        </button>
                                    </>
                                ) : (
                                    <button type="submit" className={styles.submitBtn}>Initialize Secure Setup</button>
                                )}
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Firm Context.</h1>
                            <p className={styles.subtitle}>Configuring the environment for your institution.</p>
                            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Institutional Name</label>
                                    <input type="text" className={styles.input} placeholder="e.g. Prokopecs Legal Group" required value={formData.firmName} onChange={e => setFormData({ ...formData, firmName: e.target.value })} />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Sector Objective</label>
                                    <div className={styles.industryGrid}>
                                        {industries.map(ind => (
                                            <div key={ind.id} className={`${styles.industryCard} ${formData.industry === ind.id ? styles.industryCardActive : ''}`} onClick={() => setFormData({ ...formData, industry: ind.id })}>
                                                <div className={styles.industryIcon}>{ind.icon}</div>
                                                <div className={styles.industryLabel}>{ind.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className={styles.submitBtn} disabled={!formData.firmName || !formData.industry}>Deploy Configuration</button>
                            </form>
                        </div>
                    )}

                    {step === 3 && !isProvisioning && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Strategic Directives.</h1>
                            <p className={styles.subtitle}>Select the primary focus for your autonomous fleet.</p>
                            <div className={styles.form} style={{ marginTop: '40px' }}>
                                {[
                                    { t: "Institutional Intake", d: "Standardize extraction from high-value legal/financial docs." },
                                    { t: "Autonomous Communication", d: "Govern stakeholder engagement via intelligent units." },
                                    { t: "Operational Scaling", d: "Reduce internal friction with sovereign workflow mappings." }
                                ].map(goal => (
                                    <div key={goal.t} className={`${styles.industryCard} ${formData.goal === goal.t ? styles.industryCardActive : ''}`} style={{ display: 'flex', gap: '20px', alignItems: 'center', textAlign: 'left' }} onClick={() => setFormData({ ...formData, goal: goal.t })}>
                                        <div style={{ flex: 1 }}>
                                            <div className={styles.industryLabel} style={{ fontSize: '1rem' }}>{goal.t}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600, marginTop: '4px' }}>{goal.d}</div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleSubmit} className={styles.submitBtn} disabled={!formData.goal}>Establish System Ledger</button>
                            </div>
                        </div>
                    )}

                    {isProvisioning && step !== 4 && (
                        <div className={styles.provisioningContainer}>
                            <h1 className={styles.title}>Fleet Provisioning.</h1>
                            <p style={{ color: '#64748B', fontWeight: 600, marginBottom: 32 }}>Deploying your firm's high-stakes autonomous infrastructure...</p>
                            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
                            <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', letterSpacing: '0.05em' }}>{currentTask}</div>
                        </div>
                    )}

                    {step === 4 && (
                        <div style={{ textAlign: 'center' }}>
                            <div className={styles.checkmarkCircle}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <h1 className={styles.title}>Deployment Success.</h1>
                            <p className={styles.subtitle}>Your specialized instance for <strong>{formData.firmName}</strong> is now live on the Sovereign Fleet.</p>
                            <Link href="/dashboard" className={styles.submitBtn} style={{ display: 'flex', textDecoration: 'none', justifyContent: 'center', alignItems: 'center', marginTop: '48px' }}>Access Command Terminal</Link>
                        </div>
                    )}

                    {step > 1 && step < 4 && !isProvisioning && !session && (
                        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
                            <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                                Protocol Reversion
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

