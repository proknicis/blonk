"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, ShieldCheck, Key, Check, Plus, AlertCircle } from "lucide-react";
import styles from "../activation.module.css";

interface CredentialStatus {
    provider: string;
    status: string;
}

export default function ConnectClient() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [credentials, setCredentials] = useState<CredentialStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const [activeConnector, setActiveConnector] = useState<string | null>(null);
    const [apiKeyInput, setApiKeyInput] = useState("");
    const [modalError, setModalError] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);

    const fetchState = async () => {
        try {
            const res = await fetch("/api/activation");
            if (res.ok) {
                const data = await res.json();
                setProfile(data.user);
                setCredentials(data.credentials || []);
            }
        } catch (err) {
            console.error("Failed to load state details:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchState();
    }, []);

    const metadata = useMemo(() => {
        return profile?.activationState || {};
    }, [profile]);

    const requiredSystems = useMemo(() => {
        return metadata.requiredSystems || [];
    }, [metadata]);

    const selectedName = useMemo(() => {
        return metadata.selectedWorkflowName || "Autonomous Workflow Loop";
    }, [metadata]);

    const handleConnectClick = (provider: string) => {
        setActiveConnector(provider);
        setApiKeyInput("");
        setModalError(null);
    };

    const handleConnectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKeyInput.trim()) {
            setModalError("Access token is required.");
            return;
        }

        setIsConnecting(true);
        setModalError(null);

        try {
            const res = await fetch("/api/credentials/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: activeConnector,
                    data: {
                        apiKey: apiKeyInput.trim()
                    }
                })
            });

            const data = await res.json();
            if (res.ok) {
                await fetchState();
                setActiveConnector(null);
            } else {
                setModalError(data.error || "Verification failed. Check token formatting.");
            }
        } catch (err: any) {
            setModalError(err.message || "Network error linking credentials.");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleContinue = async () => {
        setUpdating(true);
        try {
            const res = await fetch("/api/activation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "READY_FOR_DEPLOY"
                })
            });
            if (res.ok) {
                router.push("/activation/review");
            }
        } catch (err) {
            console.error("Failed to proceed:", err);
        } finally {
            setUpdating(false);
        }
    };

    const connectStatusMap = useMemo(() => {
        const map: Record<string, string> = {};
        credentials.forEach(c => {
            map[c.provider.toLowerCase()] = c.status;
        });
        return map;
    }, [credentials]);

    const allConnected = useMemo(() => {
        if (requiredSystems.length === 0) return true;
        return requiredSystems.every((sys: string) => {
            return connectStatusMap[sys.toLowerCase()] === "Connected";
        });
    }, [requiredSystems, connectStatusMap]);

    if (loading || !profile) {
        return (
            <div className={styles.loadingInner}>
                <p>Decoding system settings...</p>
            </div>
        );
    }

    return (
        <main className={styles.container} aria-label="Connect integrations required for your blueprint">
            <div className={styles.stepper}>
                <span className={styles.step}>1. Analysis</span>
                <span className={styles.step}>2. Blueprints</span>
                <span className={`${styles.step} ${styles.stepActive}`}>3. Connections</span>
                <span className={styles.step}>4. Readiness</span>
                <span className={styles.step}>5. Launch</span>
            </div>

            <header className={styles.header}>
                <h1 className={styles.title}>Secure Connections</h1>
                <p className={styles.subtitle}>
                    Link the tools needed for <strong>{selectedName}</strong>. BLONK encrypts and isolates these credentials.
                </p>
            </header>

            <div className={styles.grid}>
                <section className={styles.panel} aria-labelledby="connectors-title">
                    <div className={styles.panelHeader}>
                        <Key size={16} color="#10B981" />
                        <h2 id="connectors-title" className={styles.panelTitle}>Required Integrations</h2>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {requiredSystems.length === 0 ? (
                            <p style={{ fontSize: "0.82rem", color: "#64748B" }}>No direct integrations required for this template.</p>
                        ) : (
                            requiredSystems.map((sys: string) => {
                                const status = connectStatusMap[sys.toLowerCase()] || "Disconnected";
                                const isConnected = status === "Connected";
                                return (
                                    <div
                                        key={sys}
                                        style={{
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            padding: "16px", background: "#F8FAFC", border: "1px solid #E2E8F0",
                                            borderRadius: "12px"
                                        }}
                                    >
                                        <div>
                                            <strong style={{ fontSize: "0.85rem", color: "#0F172A" }}>{sys} Connection</strong>
                                            <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: "2px" }}>
                                                {isConnected ? "Securely connected via AES-256." : "Link credential to qualify triggers."}
                                            </p>
                                        </div>

                                        {isConnected ? (
                                            <span style={{
                                                display: "inline-flex", alignItems: "center", gap: "4px",
                                                background: "#ECFDF5", color: "#047857", fontSize: "0.68rem",
                                                fontWeight: 800, padding: "4px 8px", borderRadius: "6px"
                                            }}>
                                                <Check size={12} /> Connected
                                            </span>
                                        ) : (
                                            <button
                                                className={styles.btnSecondary}
                                                style={{ height: "32px", fontSize: "0.7rem", padding: "0 10px" }}
                                                onClick={() => handleConnectClick(sys)}
                                                aria-label={`Link credential credentials for ${sys}`}
                                            >
                                                <Plus size={12} /> Connect
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>

                <section className={styles.panel} aria-labelledby="security-title">
                    <div className={styles.panelHeader}>
                        <ShieldCheck size={16} color="#10B981" />
                        <h2 id="security-title" className={styles.panelTitle}>Isolations &amp; Sovereignty</h2>
                    </div>
                    <div className={styles.summaryBox}>
                        <p style={{ fontSize: "0.82rem", color: "#475569", lineHeight: 1.5 }}>
                            All API credentials are encrypted with AES-256-GCM. They are stored inside your private container and only decrypted during workflow triggers. No third-party system reads these values.
                        </p>
                        <div style={{
                            display: "flex", gap: "10px", alignItems: "flex-start",
                            background: "#FFFBEB", border: "1px solid #FDE68A",
                            borderRadius: "10px", padding: "12px", fontSize: "0.78rem", color: "#92400E"
                        }}>
                            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
                            <span>
                                Make sure to configure direct read/write scopes as required by your matched workflow template.
                            </span>
                        </div>
                    </div>
                </section>
            </div>

            {activeConnector && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(15, 23, 42, 0.3)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }} role="presentation">
                    <div
                        style={{
                            background: "#FFFFFF", padding: "28px", borderRadius: "16px",
                            border: "1px solid #E2E8F0", width: "400px", maxWidth: "90%",
                            display: "flex", flexDirection: "column", gap: "16px"
                        }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={`Link ${activeConnector} credential credentials`}
                    >
                        <h3 style={{ fontSize: "1rem", fontWeight: 900, color: "#0F172A", textTransform: "uppercase" }}>
                            Link {activeConnector}
                        </h3>

                        <form onSubmit={handleConnectSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <label style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>
                                Secure Access Key / Token
                            </label>
                            <input
                                type="password"
                                value={apiKeyInput}
                                onChange={(e) => setApiKeyInput(e.target.value)}
                                placeholder={`Enter ${activeConnector} key`}
                                style={{
                                    height: "38px", padding: "0 12px", border: "1px solid #E2E8F0",
                                    borderRadius: "6px", fontSize: "0.85rem", width: "100%"
                                }}
                                required
                            />

                            {modalError && (
                                <p style={{ fontSize: "0.72rem", color: "#EF4444", fontWeight: 700 }}>
                                    {modalError}
                                </p>
                            )}

                            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                                <button
                                    type="button"
                                    className={styles.btnSecondary}
                                    style={{ height: "36px", fontSize: "0.75rem" }}
                                    onClick={() => setActiveConnector(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.btnPrimary}
                                    style={{ height: "36px", fontSize: "0.75rem" }}
                                    disabled={isConnecting}
                                >
                                    {isConnecting ? "Linking..." : "Verify & Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <footer className={styles.ctaRow}>
                <button
                    className={styles.btnSecondary}
                    onClick={() => router.push("/activation/recommendations")}
                    aria-label="Back to blueprint comparison screen"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <button
                    className={styles.btnPrimary}
                    onClick={handleContinue}
                    disabled={!allConnected || updating}
                    aria-label="Proceed to readiness review"
                >
                    {updating ? "Checking..." : "Verify Readiness"} <ArrowRight size={16} />
                </button>
            </footer>
        </main>
    );
}
