"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import styles from "./setup.module.css";
import React from "react";

function SetupContent() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [step, setStep] = useState(2); // Starting at 2 logically (1 is login)
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState("");
    
    const [formData, setFormData] = useState({
        industry: "",
        teamSize: "",
        region: "",
        selectedLoop: "",
        invites: ["", "", ""]
    });

    const tasks = [
        "Deploying nodes...",
        "Syncing institutional protocols...",
        "Establishing Sovereign Space...",
        "Validating compliance constraints...",
        "Finalizing Fleet configuration..."
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
                    setTimeout(() => {
                        setIsProvisioning(false);
                        setStep(4);
                    }, 500);
                }
            }, 35);
            return () => clearInterval(interval);
        }
    }, [isProvisioning]);

    const industries = [
        { id: 'Law', label: 'Law Firm', icon: '⚖️' },
        { id: 'Accounting', label: 'Accounting', icon: '📊' },
        { id: 'Insurance', label: 'Insurance', icon: '🛡️' },
        { id: 'HR', label: 'HR Agency', icon: '👥' }
    ];

    const teamSizes = ["1-5 Operators", "6-20 Operators", "21-50 Operators", "50+ Operators"];
    const regions = [
        { id: "eu", label: "EU-Frankfurt", desc: "GDPR Compliant Node" },
        { id: "us", label: "US-East", desc: "SOC2 Accelerated Node" }
    ];

    const loops = [
        { id: "invoice", name: "Automatic Invoice Processor", desc: "Syncs billing & reminds overdue clients." },
        { id: "onboard", name: "Client Onboarding System", desc: "Extracts intake data and generates NDAs." }
    ];

    const handleNext = () => {
        if (step === 2) {
            setIsProvisioning(true);
        } else if (step === 4) {
            setStep(5);
        } else if (step === 5) {
            router.push("/dashboard");
        }
    };

    const isNonOwner = status === 'authenticated' && (session?.user as any)?.role !== 'OWNER';

    if (status === 'loading') {
        return <div className={styles.wrapper}><div style={{ padding: '64px', textAlign: 'center', width: '100%', color: '#64748B', fontWeight: 800 }}>Initializing verification...</div></div>;
    }

    if (isNonOwner) {
        return (
            <div className={styles.wrapper}>
                <div style={{ padding: '64px', textAlign: 'center', width: '100%', color: '#64748B', fontWeight: 800 }}>
                    Initializing workspace traversal...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
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
                    SECURE PROTOCOL / {session?.user?.email?.toUpperCase() || "IDENTITY CONFIGURED"}
                </div>
            </div>

            <div className={styles.rightColumn}>
                <div className={styles.formContainer}>
                    {!isProvisioning && (
                        <div className={styles.stepWrapper}>
                            <span className={styles.stepLabel}>Initialization Step 0{step === 2 ? 1 : step === 4 ? 2 : 3} / 03</span>
                            <div className={styles.stepIndicator}>
                                {[2, 4, 5].map(s => <div key={s} className={`${styles.dot} ${step >= s ? styles.dotActive : ''}`} />)}
                            </div>
                        </div>
                    )}

                    {step === 2 && !isProvisioning && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Institutional Profile.</h1>
                            <p className={styles.subtitle}>Configure the foundation of your sovereign fleet so we can adjust compliance thresholds.</p>
                            
                            <div className={styles.form} style={{ marginTop: '40px' }}>
                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>What institution do you represent?</label>
                                    <div className={styles.industryGrid}>
                                        {industries.map(ind => (
                                            <div key={ind.id} className={`${styles.industryCard} ${formData.industry === ind.id ? styles.industryCardActive : ''}`} onClick={() => setFormData({ ...formData, industry: ind.id })}>
                                                <div className={styles.industryIcon}>{ind.icon}</div>
                                                <div className={styles.industryLabel}>{ind.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Fleet Size (Operators)</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {teamSizes.map(size => (
                                            <div key={size} className={`${styles.industryCard} ${formData.teamSize === size ? styles.industryCardActive : ''}`} onClick={() => setFormData({ ...formData, teamSize: size })} style={{ padding: '16px', textAlign: 'center' }}>
                                                <div className={styles.industryLabel} style={{ fontSize: '0.85rem' }}>{size}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.inputWrapper}>
                                    <label className={styles.inputLabel}>Sovereign Region</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        {regions.map(r => (
                                            <div key={r.id} className={`${styles.industryCard} ${formData.region === r.id ? styles.industryCardActive : ''}`} onClick={() => setFormData({ ...formData, region: r.id })} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div className={styles.industryLabel}>{r.label}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>{r.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleNext} className={styles.submitBtn} disabled={!formData.industry || !formData.teamSize || !formData.region}>
                                    Provision Infrastructure
                                </button>
                            </div>
                        </div>
                    )}

                    {isProvisioning && (
                        <div className={styles.provisioningContainer}>
                            <h1 className={styles.title}>Fleet Provisioning.</h1>
                            <p style={{ color: '#64748B', fontWeight: 600, marginBottom: 32 }}>Deploying your firm's high-stakes autonomous infrastructure...</p>
                            <div className={styles.progressBar}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div>
                            <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A', letterSpacing: '0.05em' }}>{currentTask}</div>
                        </div>
                    )}

                    {step === 4 && !isProvisioning && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Hello, {session?.user?.name || "Operator"}.</h1>
                            <p className={styles.subtitle}>Your environment is ready. Would you like to initialize your first Loop?</p>
                            
                            <div className={styles.form} style={{ marginTop: '40px' }}>
                                {loops.map(loop => (
                                    <div key={loop.id} className={`${styles.industryCard} ${formData.selectedLoop === loop.id ? styles.industryCardActive : ''}`} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }} onClick={() => setFormData({ ...formData, selectedLoop: loop.id })}>
                                        <div className={styles.industryLabel} style={{ fontSize: '1.05rem' }}>{loop.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>{loop.desc}</div>
                                    </div>
                                ))}

                                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                    <button onClick={handleNext} className={styles.submitBtn} style={{ flex: 1 }} disabled={!formData.selectedLoop}>
                                        Initialize Selected
                                    </button>
                                    <button onClick={handleNext} style={{ flex: 1, background: 'transparent', border: '1px solid #E2E8F0', padding: '16px', borderRadius: '16px', fontWeight: 800, color: '#64748B', cursor: 'pointer' }}>
                                        Skip for now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div className={styles.header}>
                            <h1 className={styles.title}>Strategic Personnel.</h1>
                            <p className={styles.subtitle}>Invite your strategic partners to the firm's command space.</p>
                            
                            <div className={styles.form} style={{ marginTop: '40px' }}>
                                {[0, 1, 2].map(index => (
                                    <div key={index} className={styles.inputWrapper}>
                                        <input
                                            type="email"
                                            className={styles.input}
                                            placeholder={`Partner ${index + 1} Email`}
                                            value={formData.invites[index]}
                                            onChange={e => {
                                                const newInvites = [...formData.invites];
                                                newInvites[index] = e.target.value;
                                                setFormData({ ...formData, invites: newInvites });
                                            }}
                                        />
                                    </div>
                                ))}

                                <button onClick={handleNext} className={styles.submitBtn} style={{ marginTop: '16px' }}>
                                    Dispatch Invites & Enter Dashboard
                                </button>
                                <button onClick={handleNext} style={{ width: '100%', background: 'transparent', border: 'none', padding: '16px', fontWeight: 800, color: '#64748B', cursor: 'pointer', marginTop: '8px' }}>
                                    Continue alone
                                </button>
                            </div>
                        </div>
                    )}

                    {step > 2 && step <= 5 && !isProvisioning && (
                        <div style={{ marginTop: '48px', display: 'flex', justifyContent: 'center' }}>
                            <button className={styles.backBtn} onClick={() => setStep(step === 5 ? 4 : 2)}>
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

export default function SetupPage() {
    return (
        <Suspense fallback={<div className={styles.wrapper}><p style={{ color: 'white', padding: 40 }}>Initializing institutional provisioning engine...</p></div>}>
            <SetupContent />
        </Suspense>
    );
}
