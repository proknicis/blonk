"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./setup.module.css";
import { registerUser } from "./actions";
import React from "react";

export default function SetupPage() {
    const router = useRouter();
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
            }, 30);
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
        try {
            const result = await registerUser({
                email: formData.email,
                password: formData.password,
                firmName: formData.firmName,
                industry: formData.industry
            });
            if (result.error) throw new Error(result.error);
        } catch (err: any) {
            setError(err.message);
            setIsProvisioning(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            {/* --- Left Column: Institutional Anchor --- */}
            <div className={styles.leftColumn}>
                <div className={styles.noise} />
                <div className={styles.sidebarGlow} />
                <Link href="/" className={styles.logo}>BLONK<span className="gradient-text">.</span></Link>
                <div className={styles.sidebarContent}>
                    <span className={styles.visualTag}>Strategic Onboarding</span>
                    <h1 className={styles.sidebarTitle}>Integration Protocol.</h1>
                    <p className={styles.sidebarText}>Establish your sovereign firm instance in minutes. We automate the administrative friction, you focus on the exceptions.</p>
                </div>
                <div style={{ position: 'relative', zIndex: 10, fontSize: '0.85rem', fontWeight: 700, opacity: 0.4, letterSpacing: '0.15em' }}>
                    PROTOCOL v5.22.4
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
                        <div style={{ padding: '16px', background: '#FFF5F5', color: '#E53E3E', borderRadius: '12px', border: '1px solid #FED7D7', fontSize: '0.9rem', fontWeight: 700, marginBottom: 32 }}>
                            PROTOCOL ERROR: {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Access Identity.</h1>
                            <p className={styles.subtitle}>Identify yourself as the firm's strategic administrator.</p>
                            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Credential: Work Email</label>
                                    <input type="email" className={styles.input} placeholder="name@firm.com" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Credential: Secure Password</label>
                                    <input type="password" className={styles.input} placeholder="••••••••" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                                <button type="submit" className={`button-primary ${styles.submitBtn}`}>Next Protocol Step</button>
                            </form>
                        </div>
                    )}

                    {step === 2 && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Firm Structure.</h1>
                            <p className={styles.subtitle}>Configure the sovereign environment for your organization.</p>
                            <form className={styles.form} onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Institution Name</label>
                                    <input type="text" className={styles.input} placeholder="e.g. Prokopecs & Partners" required value={formData.firmName} onChange={e => setFormData({ ...formData, firmName: e.target.value })} />
                                </div>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Primary Sector Context</label>
                                    <div className={styles.industryGrid}>
                                        {industries.map(ind => (
                                            <div key={ind.id} className={`${styles.industryCard} ${formData.industry === ind.id ? styles.industryCardActive : ''}`} onClick={() => setFormData({ ...formData, industry: ind.id })}>
                                                <div className={styles.industryIcon}>{ind.icon}</div>
                                                <span className={styles.industryLabel}>{ind.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className={`button-primary ${styles.submitBtn}`} disabled={!formData.firmName || !formData.industry}>Continue Deployment</button>
                            </form>
                        </div>
                    )}

                    {step === 3 && !isProvisioning && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Strategic Focus.</h1>
                            <p className={styles.subtitle}>Select the primary directive for your autonomous units.</p>
                            <div className={styles.form} style={{ marginTop: '40px' }}>
                                {[
                                    { t: "Automated Intake", d: "Standardize data extraction from high-value institutional docs." },
                                    { t: "Client GRC Sync", d: "Govern communication and compliance syncs automatically." },
                                    { t: "Operational Speed", d: "Reduce internal friction with autonomous system mapping." }
                                ].map(goal => (
                                    <div key={goal.t} className={`${styles.industryCard} ${formData.goal === goal.t ? styles.industryCardActive : ''}`} style={{ display: 'flex', gap: '20px', alignItems: 'center' }} onClick={() => setFormData({ ...formData, goal: goal.t })}>
                                        <div style={{ flex: 1 }}>
                                            <div className={styles.industryLabel}>{goal.t}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>{goal.d}</div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleSubmit} className={`button-primary ${styles.submitBtn}`} disabled={!formData.goal}>Establish System Instance</button>
                            </div>
                        </div>
                    )}

                    {isProvisioning && step !== 4 && (
                        <div className={styles.provisioningContainer}>
                            <h1 className={styles.title}>System Provisioning.</h1>
                            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#101112' }}>{currentTask}</div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className={styles.successHeader}>
                            <div className={styles.checkmarkCircle}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                            <h1 className={styles.title}>Deployment Success.</h1>
                            <p className={styles.subtitle}>Your specialized instance for <strong>{formData.firmName}</strong> is now live. All protocols fully operational.</p>
                            <div className={styles.successCard}>
                                <div className={styles.successItem}><span className={styles.successLabel}>Sovereign Link</span><span className={styles.statusBadge}>ACTIVE</span></div>
                                <div className={styles.successItem}><span className={styles.successLabel}>Active Objective</span><span className={styles.successValue}>{formData.goal}</span></div>
                            </div>
                            <Link href="/dashboard" className={`button-primary ${styles.submitBtn}`} style={{ display: 'flex', textDecoration: 'none' }}>Access Command Terminal</Link>
                        </div>
                    )}
                </div>

                {step > 1 && step < 4 && !isProvisioning && (
                    <div className={styles.footer}>
                        <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                            Step Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
