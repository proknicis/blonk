"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import styles from "./login.module.css";
import Logo from "../../components/Logo";
import React from "react";

/* ─────────────────────────────────────────────────────────
   ICONS
───────────────────────────────────────────────────────── */
const IcoEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);
const IcoEyeOff = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);
const IcoArrow = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
);
const IcoCheck = () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const IcoZap = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);
const IcoLock = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
);
const IcoCpu = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>
        <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
        <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
        <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
        <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
);

/* Input-card icons */
const IcoBuilding = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
    </svg>
);
const IcoPerson = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
);
const IcoMail = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/>
    </svg>
);
const IcoLockMd = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
    </svg>
);
const IcoUser = () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
);
const IcoShield = () => (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);

/* ─────────────────────────────────────────────────────────
   APP LOGOS
───────────────────────────────────────────────────────── */
const LogoOpenAI = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.75)">
        <path d="M22.28 9.82a6 6 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a6 6 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1A6 6 0 0 0 2.24 19.1a6.05 6.05 0 0 0 6.51 2.9 6 6 0 0 0 4.5 2 6.06 6.06 0 0 0 5.77-4.21 6 6 0 0 0 4-2.9 6.06 6.06 0 0 0-.74-7.07ZM12 21.5a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.8.8 0 0 0 .4-.68V10.2l2.02 1.17a.07.07 0 0 1 .04.05v5.58A4.5 4.5 0 0 1 12 21.5Zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.08 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L8.74 18.5a4.5 4.5 0 0 1-6.4-1.13ZM2.34 7.9A4.49 4.49 0 0 1 4.7 5.92v5.55a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L4.02 13.9A4.5 4.5 0 0 1 2.34 7.9Zm16.6 3.86-5.84-3.37 2.02-1.17a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1V12.4a.79.79 0 0 0-.4-.64Zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.23V6.9a.07.07 0 0 1 .03-.06l4.83-2.79a4.5 4.5 0 0 1 6.68 4.7ZM8.31 12.86l-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.8.8 0 0 0-.4.68v6.72Zm1.1-2.37 2.6-1.5 2.6 1.5v2.99l-2.6 1.5-2.6-1.5Z"/>
    </svg>
);
const LogoSlack = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#E01E5A" d="M5.04 15.07a2.07 2.07 0 1 1-2.07-2.07h2.07Zm1.04 0a2.07 2.07 0 1 1 4.14 0v5.18a2.07 2.07 0 1 1-4.14 0Z"/>
        <path fill="#36C5F0" d="M8.15 5.04a2.07 2.07 0 1 1-2.07-2.07 2.07 2.07 0 0 1 2.07 2.07Zm0 1.04a2.07 2.07 0 1 1 0 4.14H2.97a2.07 2.07 0 1 1 0-4.14Z"/>
        <path fill="#2EB67D" d="M18.96 8.15a2.07 2.07 0 1 1 2.07 2.07h-2.07Zm-1.04 0a2.07 2.07 0 1 1-4.14 0V2.97a2.07 2.07 0 1 1 4.14 0Z"/>
        <path fill="#ECB22E" d="M15.85 18.96a2.07 2.07 0 1 1 2.07 2.07 2.07 2.07 0 0 1-2.07-2.07Zm0-1.04a2.07 2.07 0 1 1 0-4.14h5.18a2.07 2.07 0 1 1 0 4.14Z"/>
    </svg>
);
const LogoStripe = () => (
    <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#635BFF" d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305Z"/>
    </svg>
);
const LogoGoogle = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853"/>
        <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83Z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52Z" fill="#EA4335"/>
    </svg>
);
const LogoHubSpot = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF7A59">
        <path d="M22.08 14.04a4.06 4.06 0 0 0-2.12-3.43V8.56a1.44 1.44 0 0 0 .84-1.32V7.2a1.44 1.44 0 0 0-1.44-1.44h-.04A1.44 1.44 0 0 0 17.88 7.2v.04c0 .6.36 1.12.88 1.35v2.03a4.06 4.06 0 0 0-1.96.94L9.44 6.84a2.5 2.5 0 1 0-.83 1.08l6.98 4.44a4.07 4.07 0 0 0-.4 1.64 4.06 4.06 0 0 0 .62 2.15l-2.14 2.14a1.5 1.5 0 1 0 1.07 1.07l2.14-2.14a4.07 4.07 0 0 0 5.2-3.18Zm-4.76 2.37a2.08 2.08 0 1 1 0-4.16 2.08 2.08 0 0 1 0 4.16Z"/>
    </svg>
);
const LogoBLONK = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
);

/* ─────────────────────────────────────────────────────────
   LIVE FEED EVENTS — 6 rotating events
───────────────────────────────────────────────────────── */
const ALL_FEED_EVENTS = [
    { text: 'Invoice from Acme Corp processed',  result: '↗ Stripe synced',    dot: 'green' },
    { text: 'New lead sarah@tech.com qualified', result: '↗ HubSpot updated',  dot: 'blue'  },
    { text: 'Support ticket #1,042 replied',     result: 'Done · 2m ago',      dot: 'gray'  },
    { text: 'AI draft response generated',       result: '↗ Gmail sent',       dot: 'green' },
    { text: 'Payment $4,200 received',           result: '↗ Invoice matched',  dot: 'blue'  },
    { text: 'Google Drive folder synced',        result: '↗ Notion updated',   dot: 'gray'  },
];

/* ─────────────────────────────────────────────────────────
   SUCCESS STEPS
───────────────────────────────────────────────────────── */
const SUCCESS_STEPS = [
    'Email verified',
    'Preparing your workspace...',
    'Connecting services...',
    'Creating secure workspace...',
];

/* ─────────────────────────────────────────────────────────
   CONNECTION GRAPH
───────────────────────────────────────────────────────── */
const NODES = [
    { id: 'openai',  x: 210, y: 30,  Logo: LogoOpenAI,  float: 'float0', delay: '0s',   dur: '5s'   },
    { id: 'slack',   x: 360, y: 100, Logo: LogoSlack,   float: 'float1', delay: '0.8s', dur: '4.5s' },
    { id: 'stripe',  x: 320, y: 235, Logo: LogoStripe,  float: 'float2', delay: '1.6s', dur: '6s'   },
    { id: 'google',  x: 100, y: 235, Logo: LogoGoogle,  float: 'float3', delay: '2.4s', dur: '5.5s' },
    { id: 'hubspot', x: 60,  y: 100, Logo: LogoHubSpot, float: 'float4', delay: '3.2s', dur: '4.8s' },
];

const PATHS = [
    { id: 'openai',  d: 'M 210 51 C 210 80, 210 108, 210 112',    delay: '0s',   dur: '2.2s' },
    { id: 'slack',   d: 'M 339 106 C 312 112, 276 126, 240 132',   delay: '0.5s', dur: '2.5s' },
    { id: 'stripe',  d: 'M 303 221 C 288 204, 264 183, 239 158',   delay: '1s',   dur: '2.8s' },
    { id: 'google',  d: 'M 117 221 C 132 204, 156 183, 181 158',   delay: '1.5s', dur: '2.4s' },
    { id: 'hubspot', d: 'M 81 106 C 108 112, 144 126, 180 132',    delay: '2s',   dur: '2.6s' },
];

function ConnectionGraph() {
    return (
        <div className={styles.graphWrap}>
            <svg className={styles.connSvg} viewBox="0 0 420 280" preserveAspectRatio="xMidYMid meet" fill="none">
                <defs>
                    <filter id="dotGlow" x="-80%" y="-80%" width="260%" height="260%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                    <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15"/>
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                    </radialGradient>
                </defs>

                <circle cx="210" cy="140" r="45" fill="url(#hubGlow)">
                    <animate attributeName="r" values="40;52;40" dur="4s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.7;0.35;0.7" dur="4s" repeatCount="indefinite"/>
                </circle>

                {PATHS.map(p => (
                    <path key={p.id} d={p.d} stroke="rgba(34,197,94,0.2)" strokeWidth="1.2" strokeDasharray="4 8" strokeLinecap="round"/>
                ))}

                {PATHS.map(p => (
                    <circle key={p.id + '-dot'} r="3" fill="#22c55e" filter="url(#dotGlow)">
                        <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.delay} path={p.d}/>
                        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.08;0.18;0.88;1" dur={p.dur} repeatCount="indefinite" begin={p.delay}/>
                    </circle>
                ))}
            </svg>

            <div className={styles.hub}>
                <div className={styles.hubInner}><LogoBLONK /></div>
            </div>

            {NODES.map(n => (
                <div
                    key={n.id}
                    className={styles.appNode}
                    style={{
                        top:  `calc(${(n.y / 280 * 100).toFixed(2)}% - 21px)`,
                        left: `calc(${(n.x / 420 * 100).toFixed(2)}% - 21px)`,
                        animation: `${n.float} ${n.dur} ${n.delay} ease-in-out infinite`,
                    }}
                >
                    <n.Logo />
                </div>
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   LEFT PANEL — with cycling LIVE feed
───────────────────────────────────────────────────────── */
const DOT_CLASS: Record<string, string> = {
    green: 'dotGreen',
    blue:  'dotBlue',
    gray:  'dotAmber',
};
const RESULT_CLASS: Record<string, string> = {
    green: '',
    blue:  'feedResultMid',
    gray:  'feedResultDone',
};

function LeftPanel() {
    const [feedStart, setFeedStart] = useState(0);
    const [panelMounted, setPanelMounted] = useState(false);

    useEffect(() => {
        setPanelMounted(true);
        const t = setInterval(() => {
            setFeedStart(s => (s + 1) % ALL_FEED_EVENTS.length);
        }, 3500);
        return () => clearInterval(t);
    }, []);

    const events = panelMounted
        ? [0, 1, 2].map(i => ALL_FEED_EVENTS[(feedStart + i) % ALL_FEED_EVENTS.length])
        : ALL_FEED_EVENTS.slice(0, 3);

    return (
        <div className={styles.left}>
            <div className={styles.leftInner}>
                <Link href="/" className={styles.brand} style={{ color: "#FFFFFF" }}>
                    <Logo height={20} />
                </Link>

                <div className={styles.scene}>
                    <ConnectionGraph />
                </div>

                <div className={styles.feedCard}>
                    {/* LIVE header */}
                    <div className={styles.feedHeader}>
                        <span className={styles.feedLiveDot} />
                        <span className={styles.feedLiveLabel}>Live</span>
                    </div>

                    {events.map((ev, i) => (
                        <React.Fragment key={`${feedStart}-${i}`}>
                            {i > 0 && <div className={styles.feedDivider} />}
                            <div className={styles.feedRow}>
                                <div className={styles.feedLeft}>
                                    <div className={`${styles.feedStatusDot} ${styles[DOT_CLASS[ev.dot] as keyof typeof styles]}`} />
                                    <span className={styles.feedText}>{ev.text}</span>
                                </div>
                                <span className={`${styles.feedResult} ${ev.dot !== 'green' ? styles[RESULT_CLASS[ev.dot] as keyof typeof styles] : ''}`}>
                                    {ev.result}
                                </span>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                <div className={styles.copy}>
                    <div className={styles.copyBadge}>
                        <span className={styles.copyBadgeDot} />
                        <span className={styles.copyBadgeText}>Automation Marketplace</span>
                    </div>
                    <h2 className={styles.copyHeadline}>
                        Your business,<br />
                        <span className={styles.copyAccent}>on autopilot.</span>
                    </h2>
                    <div className={styles.copyPills}>
                        <span className={styles.pill}><span className={styles.pillIcon}><IcoZap /></span>Ready in minutes</span>
                        <span className={styles.pill}><span className={styles.pillIcon}><IcoLock /></span>Private infra</span>
                        <span className={styles.pill}><span className={styles.pillIcon}><IcoCpu /></span>AI-powered</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────
   AUTH FORM
───────────────────────────────────────────────────────── */
function AuthContent() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const authed = status === "authenticated" && session?.user && !(session as any).error;

    /* Core state */
    const [mode,     setMode]     = useState<"register" | "login" | "mfa">("register");
    const [prevMode, setPrevMode] = useState<"register" | "login">("register");
    const [form,     setForm]     = useState({ workspace: "", name: "", email: "", password: "" });
    const [showPw,   setShowPw]   = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [loadMsg,  setLoadMsg]  = useState("");
    const [error,    setError]    = useState("");
    const [mounted,  setMounted]  = useState(false);
    const [expected, setExpected] = useState("");

    /* 6-digit OTP */
    const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
    const otpRefs = useRef<Array<HTMLInputElement | null>>(new Array(6).fill(null));

    /* Resend timer */
    const [resendSecs, setResendSecs] = useState(30);
    const [canResend,  setCanResend]  = useState(false);
    const [timerKey,   setTimerKey]   = useState(0); // bump to restart timer

    /* Success overlay */
    const [showSuccess,  setShowSuccess]  = useState(false);
    const [successStep,  setSuccessStep]  = useState(0);
    const [progressPct,  setProgressPct]  = useState(0);

    useEffect(() => { setMounted(true); }, []);

    /* Sign-out on invalid session */
    useEffect(() => {
        if (status === "authenticated" && session && (!session.user || (session as any).error)) {
            signOut({ redirect: false });
        }
    }, [status, session]);

    /* URL error param */
    useEffect(() => {
        if (searchParams.get("error") === "CredentialsSignin") {
            setError("Incorrect email or password.");
            setMode("login");
        }
    }, [searchParams]);

    /* Resend countdown — resets whenever mode enters mfa OR timerKey bumps */
    useEffect(() => {
        if (mode !== 'mfa') return;
        setResendSecs(30);
        setCanResend(false);
        const id = setInterval(() => {
            setResendSecs(prev => {
                if (prev <= 1) { clearInterval(id); setCanResend(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [mode, timerKey]);

    /* Auto-focus first OTP box on MFA entry */
    useEffect(() => {
        if (mode === 'mfa') {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [mode]);

    const switchMode = (m: "register" | "login") => {
        setMode(m); setError('');
    };

    /* OTP box handlers */
    const handleOtpChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const digit = e.target.value.replace(/\D/g, '').slice(-1);
        const next = [...otpDigits];
        next[index] = digit;
        setOtpDigits(next);
        if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (!otpDigits[index] && index > 0) {
                const next = [...otpDigits];
                next[index - 1] = '';
                setOtpDigits(next);
                otpRefs.current[index - 1]?.focus();
            } else {
                const next = [...otpDigits];
                next[index] = '';
                setOtpDigits(next);
            }
        } else if (e.key === 'ArrowLeft'  && index > 0) otpRefs.current[index - 1]?.focus();
        else if   (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!paste) return;
        const next = [...new Array(6).fill('')];
        paste.split('').forEach((c, i) => { next[i] = c; });
        setOtpDigits(next);
        otpRefs.current[Math.min(paste.length, 5)]?.focus();
    };

    const otpValue = otpDigits.join('');

    /* Resend code */
    const handleResend = async () => {
        if (!canResend) return;
        setOtpDigits(['', '', '', '', '', '']);
        setError('');
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setExpected(code);
        try {
            const res = await fetch('/api/auth/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: form.email, otp: code }),
            });
            if (!res.ok) throw new Error('Failed to resend');
        } catch {
            setError('Failed to resend code. Try again.');
        }
        setTimerKey(k => k + 1);
        otpRefs.current[0]?.focus();
    };

    /* Success animation then navigate */
    const runSuccess = async (destination: string) => {
        setShowSuccess(true);
        for (let i = 0; i < SUCCESS_STEPS.length; i++) {
            setSuccessStep(i);
            setProgressPct(Math.round(((i + 1) / SUCCESS_STEPS.length) * 100));
            await new Promise(r => setTimeout(r, 750));
        }
        router.push(destination);
    };

    /* Main submit handler */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (mode !== 'mfa') {
            /* Step 1: send OTP */
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setExpected(code);
            setLoading(true);
            setLoadMsg('Sending code…');
            try {
                const res = await fetch('/api/auth/otp', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ email: form.email, otp: code }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Couldn't send code.");
                setOtpDigits(['', '', '', '', '', '']);
                setPrevMode(mode);
                setMode('mfa');
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
            return;
        }

        /* Step 2: verify OTP */
        if (otpValue.length < 6) { setError('Please enter all 6 digits.'); return; }
        if (otpValue !== expected) { setError('Incorrect code. Check your email.'); return; }

        setLoading(true);
        setLoadMsg('Verifying…');

        try {
            if (prevMode === 'login') {
                const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
                if (result?.error) throw new Error('Incorrect email or password.');
                await runSuccess('/dashboard');
            } else {
                const res = await fetch('/api/auth/register', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        email:    form.email,
                        password: form.password,
                        name:     form.name     || 'Member',
                        firmName: form.workspace || '',
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Registration failed.');
                await signIn('credentials', { email: form.email, password: form.password, redirect: false });
                await runSuccess('/setup');
            }
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
            setShowSuccess(false);
        }
    };

    const isReg = mode === 'register';
    const isLog = mode === 'login';
    const isMfa = mode === 'mfa';

    return (
        <>
            <div className={styles.page}>
                <LeftPanel />

                {/* ── RIGHT PANEL ── */}
                <div className={styles.right}>

                    {/* Top bar — ONLY mode switch */}
                    {!authed && !isMfa && (
                        <div className={styles.rightBar}>
                            <span className={styles.barText}>
                                {isReg ? 'Already have an account?' : 'New to BLONK?'}
                            </span>
                            <button className={styles.barBtn} onClick={() => switchMode(isReg ? 'login' : 'register')} type="button">
                                {isReg ? 'Sign in' : 'Create account'}
                            </button>
                        </div>
                    )}

                    <div className={styles.formArea}>
                        <div className={styles.formWrap}>

                            {/* ── Authenticated ── */}
                            {authed ? (
                                <>
                                    <div className={styles.avatarCircle}><IcoUser /></div>
                                    <h1 className={styles.formTitle}>Welcome back.</h1>
                                    <p className={styles.formSub}>You&apos;re signed in and ready.</p>
                                    <div className={styles.authedCard}>
                                        <div className={styles.authedAvatar}>
                                            {session?.user?.image
                                                ? <img src={session.user.image} alt="" />
                                                : (session?.user?.name || session?.user?.email || 'U').charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <div>
                                            <div className={styles.authedName}>{session?.user?.name || 'Member'}</div>
                                            <div className={styles.authedEmail}>{session?.user?.email}</div>
                                        </div>
                                    </div>
                                    <button className={styles.cta} onClick={() => router.push('/dashboard')}>
                                        Go to Dashboard <span className={styles.ctaArrow}><IcoArrow /></span>
                                    </button>
                                    <div style={{ height: 10 }} />
                                    <button className={styles.ghostBtn} onClick={() => signOut({ redirect: false })}>Sign out</button>
                                </>

                            ) : isMfa ? (
                                /* ── MFA — 6-digit OTP ── */
                                <div className={styles.mfaWrap}>
                                    <div className={styles.mfaAvatarCircle}><IcoShield /></div>

                                    <h1 className={styles.mfaTitle}>Check your email.</h1>
                                    <p className={styles.mfaSub}>
                                        We sent a 6-digit verification code to
                                        <span className={styles.mfaEmail}>{form.email}</span>
                                    </p>

                                    {error && <div className={styles.errorBox} style={{ width: '100%', marginBottom: 16 }}>{error}</div>}

                                    <form style={{ width: '100%' }} onSubmit={handleSubmit}>
                                        {/* 6 individual digit boxes */}
                                        <div className={styles.otpBoxes} onPaste={handleOtpPaste}>
                                            {otpDigits.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={el => { otpRefs.current[i] = el; }}
                                                    className={`${styles.otpBox} ${digit ? styles.otpBoxFilled : ''}`}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={2}
                                                    value={digit}
                                                    suppressHydrationWarning
                                                    onChange={e => handleOtpChange(i, e)}
                                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                                                    aria-label={`Digit ${i + 1}`}
                                                />
                                            ))}
                                        </div>

                                        {/* Resend */}
                                        <div className={styles.resendRow}>
                                            <span>Didn&apos;t receive the code?</span>
                                            {canResend
                                                ? <button type="button" className={styles.resendBtn} onClick={handleResend}>Resend code</button>
                                                : <span>Resend in {resendSecs}s</span>
                                            }
                                        </div>

                                        {/* CTA */}
                                        <button
                                            className={styles.cta}
                                            type="submit"
                                            disabled={loading || otpValue.length < 6}
                                            suppressHydrationWarning
                                            style={{ marginTop: 24 }}
                                        >
                                            {loading
                                                ? <><span className={styles.loadDot}/><span className={styles.loadDot}/><span className={styles.loadDot}/><span style={{ marginLeft: 8 }}>{loadMsg}</span></>
                                                : <>Verify &amp; continue <span className={styles.ctaArrow}><IcoArrow /></span></>
                                            }
                                        </button>

                                        {/* Back — small text link, not a button */}
                                        <button
                                            type="button"
                                            className={styles.backLink}
                                            onClick={() => { setMode(prevMode); setError(''); setOtpDigits(['', '', '', '', '', '']); }}
                                        >
                                            ← Back
                                        </button>
                                    </form>
                                </div>

                            ) : (
                                /* ── Register / Login ── */
                                <>
                                    <div className={styles.avatarCircle}><IcoUser /></div>
                                    <h1 className={styles.formTitle}>
                                        {isReg ? 'Create your account' : 'Welcome back'}
                                    </h1>
                                    <p className={styles.formSub}>
                                        {isReg ? 'Start your automation journey.' : 'Sign in to your workspace.'}
                                    </p>

                                    {isReg && (
                                        <div className={styles.progressDots}>
                                            <div className={`${styles.progressDot} ${styles.progressDotActive}`} />
                                            <div className={styles.progressDot} />
                                            <div className={styles.progressDot} />
                                            <div className={styles.progressDot} />
                                        </div>
                                    )}

                                    {error && <div className={styles.errorBox}>{error}</div>}

                                    {!mounted || status === 'loading' ? (
                                        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div className={styles.loadingRow}>
                                                <span className={styles.loadDot} style={{ background: '#22c55e' }} />
                                                <span className={styles.loadDot} style={{ background: '#22c55e', animationDelay: '0.15s' }} />
                                                <span className={styles.loadDot} style={{ background: '#22c55e', animationDelay: '0.3s' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <form className={styles.form} onSubmit={handleSubmit}>
                                            {isReg && (
                                                <>
                                                    <div className={styles.inputCard}>
                                                        <div className={styles.inputCardIcon}><IcoBuilding /></div>
                                                        <div className={styles.inputCardBody}>
                                                            <span className={styles.inputCardLabel}>Workspace name</span>
                                                            <input className={styles.inputCardField} type="text" placeholder="e.g. Acme Corp" required suppressHydrationWarning value={form.workspace} onChange={e => setForm({ ...form, workspace: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className={styles.inputCard}>
                                                        <div className={styles.inputCardIcon}><IcoPerson /></div>
                                                        <div className={styles.inputCardBody}>
                                                            <span className={styles.inputCardLabel}>Your name</span>
                                                            <input className={styles.inputCardField} type="text" placeholder="e.g. Jane Doe" required suppressHydrationWarning value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            <div className={styles.inputCard}>
                                                <div className={styles.inputCardIcon}><IcoMail /></div>
                                                <div className={styles.inputCardBody}>
                                                    <span className={styles.inputCardLabel}>Email address</span>
                                                    <input className={styles.inputCardField} type="email" placeholder="you@company.com" required suppressHydrationWarning value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className={styles.inputCard}>
                                                <div className={styles.inputCardIcon}><IcoLockMd /></div>
                                                <div className={styles.inputCardBody}>
                                                    <span className={styles.inputCardLabel}>Password</span>
                                                    <input className={styles.inputCardField} type={showPw ? 'text' : 'password'} placeholder="••••••••" required suppressHydrationWarning value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                                                </div>
                                                <div className={styles.inputCardRight}>
                                                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)} tabIndex={-1} aria-label={showPw ? 'Hide password' : 'Show password'}>
                                                        {showPw ? <IcoEyeOff /> : <IcoEye />}
                                                    </button>
                                                </div>
                                            </div>

                                            {isLog && (
                                                <div className={styles.forgotRow}>
                                                    <Link href="/forgot-password" className={styles.forgotLink}>Forgot password?</Link>
                                                </div>
                                            )}

                                            <button className={styles.cta} type="submit" disabled={loading} suppressHydrationWarning style={{ marginTop: 4 }}>
                                                {loading
                                                    ? <><span className={styles.loadDot}/><span className={styles.loadDot}/><span className={styles.loadDot}/><span style={{ marginLeft: 8 }}>{loadMsg}</span></>
                                                    : <>{isReg ? 'Create account' : 'Sign in'} <span className={styles.ctaArrow}><IcoArrow /></span></>
                                                }
                                            </button>

                                            <div className={styles.divider}>
                                                <div className={styles.divLine} />
                                                <span className={styles.divLabel}>or</span>
                                                <div className={styles.divLine} />
                                            </div>

                                            <button type="button" className={styles.googleBtn} onClick={() => signIn('google', { callbackUrl: '/dashboard' })}>
                                                <LogoGoogle /> Continue with Google
                                            </button>
                                        </form>
                                    )}

                                    <p className={styles.terms}>
                                        By creating an account, you agree to our{' '}
                                        <Link href="/terms" className={styles.termsLink}>Terms of Service</Link>
                                        <br />and{' '}
                                        <Link href="/privacy" className={styles.termsLink}>Privacy Policy</Link>.
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SUCCESS OVERLAY — covers entire viewport ── */}
            {showSuccess && (
                <div className={styles.successOverlay}>
                    <div className={styles.successContent}>
                        <div className={styles.successCircle}>
                            <IcoCheck />
                        </div>
                        <h2 className={styles.successTitle}>All set!</h2>
                        {/* key forces re-animation on each step change */}
                        <p key={successStep} className={styles.successStepText}>
                            {SUCCESS_STEPS[successStep]}
                        </p>
                        <div className={styles.progressWrap}>
                            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#040508' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
