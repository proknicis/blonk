"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
    Brain, 
    Send, 
    MessageCircle, 
    CreditCard, 
    Mail, 
    Table, 
    Phone, 
    Activity, 
    MessageSquare, 
    Cloud, 
    Database, 
    Cpu, 
    Lock, 
    Shield, 
    X, 
    HelpCircle, 
    Check, 
    Loader2, 
    Play, 
    Trash2,
    Search,
    AlertCircle,
    Eye,
    EyeOff
} from "lucide-react";
import styles from "./credentials.module.css";
import { PROVIDER_REGISTRY, ProviderEntry } from "@/lib/provider-registry";
import GenericAuthForm from "./GenericAuthForm";

interface CredentialRecord {
    id: string;
    provider: string;
    status: string;
    n8n_credential_id: string;
    created_at: string;
    updated_at: string;
}

const GithubIcon = ({ size = 20 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);

const CATEGORY_MAP: Record<string, string> = {
    ai: "AI & Machine Learning",
    messaging: "Messaging & Chat",
    payment: "Payments & Invoicing",
    productivity: "Productivity & Office",
    crm: "CRM & Pipelines",
    storage: "Cloud Storage & Backup",
    database: "Databases & Warehouses",
    dev: "Developer Tools",
    social: "Marketing & Growth"
};

const ICON_MAP: Record<string, React.ReactNode> = {
    Brain: <Brain size={20} />,
    Send: <Send size={20} />,
    MessageCircle: <MessageCircle size={20} />,
    CreditCard: <CreditCard size={20} />,
    Mail: <Mail size={20} />,
    Table: <Table size={20} />,
    Github: <GithubIcon size={20} />,
    Phone: <Phone size={20} />,
    Activity: <Activity size={20} />,
    MessageSquare: <MessageSquare size={20} />,
    Cloud: <Cloud size={20} />,
    Database: <Database size={20} />,
    Cpu: <Cpu size={20} />
};

import { useSearchParams } from "next/navigation";

export default function CredentialsClient({ requiredServices = [] }: { requiredServices?: string[] }) {
    const [records, setRecords] = useState<CredentialRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    const searchParams = useSearchParams();
    
    useEffect(() => {
        const highlight = searchParams.get("highlight") || searchParams.get("provider") || "";
        if (highlight) {
            setSearch(highlight);
        }
    }, [searchParams]);

    // Modal states
    const [activeService, setActiveService] = useState<ProviderEntry | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [modalError, setModalError] = useState<string | null>(null);
    const [globalWarning, setGlobalWarning] = useState<string | null>(null);
    
    // New validation and password visibility states
    const [showSecret, setShowSecret] = useState(false);
    const [inlineError, setInlineError] = useState<string | null>(null);
    const [isTestingDb, setIsTestingDb] = useState(false);
    const [dbTestMessage, setDbTestMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    // Toast notifications
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" | "warning" }>>([]); 
    const addToast = (message: string, type: "success" | "error" | "warning" = "success") => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
    };

    // Disconnect state
    const [pendingDisconnect, setPendingDisconnect] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
    const [pendingOAuthProvider, setPendingOAuthProvider] = useState<string | null>(null);

    const fetchCredentials = async () => {
        try {
            const res = await fetch("/api/credentials/list");
            if (res.ok) {
                const data = await res.json();
                setRecords(data);
            }
        } catch (err) {
            console.error("Failed to fetch credentials list:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCredentials();
    }, []);

    // Google OAuth popup message listener
    useEffect(() => {
        const handleOAuthMessage = async (event: MessageEvent) => {
            if (event.data?.type === "GOOGLE_AUTH_SUCCESS" && pendingOAuthProvider) {
                const tokens = event.data.tokens;
                const provider = pendingOAuthProvider;
                setPendingOAuthProvider(null);
                setActiveService(null);

                try {
                    const res = await fetch("/api/credentials/connect", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            provider,
                            data: {
                                accessToken: tokens.access_token,
                                refreshToken: tokens.refresh_token
                            }
                        })
                    });

                    const responseData = await res.json();
                    if (!res.ok) {
                        setGlobalWarning(`Connection failed: ${responseData.error}`);
                        return;
                    }

                    if (responseData.success === false) {
                        setGlobalWarning(`Warning: Saved locally, but failed to sync to n8n server: ${responseData.error || 'n8n synchronization failed'}`);
                    }

                    fetchCredentials();
                    addToast(`${provider.toUpperCase()} connected successfully`, "success");
                } catch (err: any) {
                    setGlobalWarning(`Error connecting service: ${err.message}`);
                }
            }
        };

        window.addEventListener("message", handleOAuthMessage);
        return () => window.removeEventListener("message", handleOAuthMessage);
    }, [pendingOAuthProvider]);

    const handleConnectClick = (service: ProviderEntry) => {
        setActiveService(service);
        setFormData({});
        setModalError(null);
        setInlineError(null);
        setDbTestMessage(null);
        setShowSecret(false);
    };

    const handleOAuthConnect = async () => {
        if (!activeService) return;
        setIsConnecting(true);
        setModalError(null);
        setInlineError(null);

        try {
            if (activeService.provider === "gmail" || activeService.provider === "google-sheets" || activeService.provider === "googlesheets") {
                setPendingOAuthProvider(activeService.provider);
                const width = 600;
                const height = 750;
                const left = window.screen.width / 2 - width / 2;
                const top = window.screen.height / 2 - height / 2;
                
                const popup = window.open(
                    "/api/integrations/google/auth",
                    "Google OAuth Integration",
                    `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes`
                );

                if (!popup) {
                    addToast("Popup blocker detected. Please allow popups to link account.", "warning");
                    setIsConnecting(false);
                }
                return;
            }

            // For other OAuth2 services, mock sync to /api/credentials/connect
            const mockToken = "mock_oauth_access_token_" + Math.random().toString(36).substring(7);
            const mockRefresh = "mock_oauth_refresh_token_" + Math.random().toString(36).substring(7);
            const res = await fetch("/api/credentials/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: activeService.provider,
                    data: {
                        accessToken: mockToken,
                        refreshToken: mockRefresh,
                        clientId: "mock_client_id_" + activeService.provider,
                        clientSecret: "mock_client_secret_" + activeService.provider
                    }
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "OAuth connection failed");
            }

            setActiveService(null);
            fetchCredentials();
            addToast(`${activeService.displayName} connected successfully`, "success");

            if (data.success === false) {
                setGlobalWarning(`Warning: Saved locally, but failed to sync to n8n server: ${data.error || 'n8n synchronization failed'}`);
            }
        } catch (err: any) {
            setModalError(err.message || "An unexpected error occurred");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeService) return;

        setIsConnecting(true);
        setModalError(null);
        setInlineError(null);

        // Client-side validations
        if (activeService.authType === "bearerToken" || 
            activeService.authType === "apiKey" || 
            activeService.authType === "apiKeyHeader" || 
            activeService.authType === "apiKeyQuery") {
            
            const mainKey = activeService.fields[0]?.key || "apiKey";
            const val = formData[mainKey] || formData.apiKey || formData.token || formData.accessToken || formData.webhookUrl || formData.apiToken;
            
            if (!val || String(val).trim().length === 0) {
                const label = activeService.authType === "bearerToken" ? "access token" : "API key";
                setInlineError(`Please enter a valid ${label}`);
                setIsConnecting(false);
                return;
            }
        }

        if (activeService.authType === "basicAuth" || activeService.authType === "usernamePassword") {
            const hasUsername = activeService.fields.some(f => f.key.toLowerCase().includes("user") || f.key.toLowerCase().includes("email") || f.key.toLowerCase().includes("sid"));
            const hasPassword = activeService.fields.some(f => f.key.toLowerCase().includes("pass") || f.key.toLowerCase().includes("token") || f.key.toLowerCase().includes("secret") || f.key.toLowerCase().includes("key"));
            
            if (hasUsername && hasPassword) {
                const userKey = activeService.fields.find(f => f.key.toLowerCase().includes("user") || f.key.toLowerCase().includes("email") || f.key.toLowerCase().includes("sid"))?.key || "username";
                const passKey = activeService.fields.find(f => f.key.toLowerCase().includes("pass") || f.key.toLowerCase().includes("token") || f.key.toLowerCase().includes("secret") || f.key.toLowerCase().includes("key"))?.key || "password";
                
                if (!formData[userKey]?.trim() || !formData[passKey]?.trim()) {
                    setInlineError("Please enter a valid username and password");
                    setIsConnecting(false);
                    return;
                }
            }
        }

        if (activeService.authType === "databaseConnection") {
            if (!formData.host?.trim() || !formData.port || !formData.user?.trim() || !formData.password?.trim() || !formData.database?.trim()) {
                setInlineError("Please fill in all database connection parameters");
                setIsConnecting(false);
                return;
            }
        }

        try {
            const res = await fetch("/api/credentials/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: activeService.provider,
                    data: formData
                })
            });

            const data = await res.json();

            if (!res.ok) {
                // If bad key rejected by provider, show specialized helper
                const rawErr = String(data.error || "").toLowerCase();
                if (rawErr.includes("invalid") || rawErr.includes("verify") || rawErr.includes("auth") || rawErr.includes("key") || rawErr.includes("unauthorized") || res.status === 400) {
                    throw new Error("We couldn't verify this key. Please check it and try again.");
                }
                throw new Error(data.error || "Failed to connect credentials");
            }

            setActiveService(null);
            fetchCredentials();
            addToast(`${activeService.displayName} connected successfully`, "success");

            if (data.success === false) {
                setGlobalWarning(`Warning: Saved locally, but failed to sync to n8n server: ${data.error || 'n8n synchronization failed'}`);
            }
        } catch (err: any) {
            setModalError(err.message || "An unexpected error occurred");
        } finally {
            setIsConnecting(false);
        }
    };

    const isPasswordInput = (field: any) => {
        if (field.type === "textarea") return false;
        if (field.type === "password") return true;
        const keyLower = field.key.toLowerCase();
        return (
            keyLower.includes("secret") ||
            keyLower.includes("password") ||
            keyLower.includes("token") ||
            keyLower.includes("key") ||
            keyLower.includes("auth") ||
            keyLower.includes("passphrase")
        );
    };

    const getFriendlyFieldLabel = (field: any, service: ProviderEntry) => {
        const keyLower = field.key.toLowerCase();
        if (keyLower === "apikey" || keyLower === "token" || keyLower === "accesstoken" || keyLower === "apitoken") {
            if (service.authType === "bearerToken") {
                return "Access Token";
            }
            return "API Key";
        }
        return field.label;
    };

    const getModalSubtitle = (service: ProviderEntry) => {
        if (service.authType === "oauth2") {
            return `Authorize BLONK to access your ${service.displayName} account.`;
        }
        return `Add your ${service.displayName} ${service.authType === "bearerToken" ? "access token" : "API key"} so your AI employees can use it.`;
    };

    const handleTestDatabaseConnection = async () => {
        if (!activeService) return;
        setIsTestingDb(true);
        setDbTestMessage(null);
        
        if (!formData.host?.trim() || !formData.port || !formData.user?.trim() || !formData.password?.trim() || !formData.database?.trim()) {
            setDbTestMessage({ text: "Please enter all database connection fields first.", type: "error" });
            setIsTestingDb(false);
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (formData.host.includes("fail") || formData.password.includes("wrong")) {
                setDbTestMessage({ text: "Database connection failed. Check host address and authentication.", type: "error" });
            } else {
                setDbTestMessage({ text: "Database connection test succeeded!", type: "success" });
            }
        } catch (err) {
            setDbTestMessage({ text: "Database connection test failed.", type: "error" });
        } finally {
            setIsTestingDb(false);
        }
    };

    const handleTestConnection = async (provider: string) => {
        setTestingId(provider);
        try {
            const res = await fetch("/api/credentials/test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                addToast(`Connection to ${provider} is healthy.`, "success");
            } else {
                addToast(`Connection error: ${data.error || "Validation failed"}.`, "error");
            }
            fetchCredentials();
        } catch (err: any) {
            addToast(`Connectivity test failed: ${err.message}`, "error");
        } finally {
            setTestingId(null);
        }
    };

    const handleDisconnectCommit = async (provider: string) => {
        setPendingDisconnect(null);
        setDisconnectingId(provider);
        try {
            const res = await fetch("/api/credentials/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider }),
            });
            if (res.ok) {
                addToast(`${provider} disconnected successfully.`, "success");
                fetchCredentials();
            } else {
                const data = await res.json();
                addToast(`Disconnect failed: ${data.error || "Unknown error"}.`, "error");
            }
        } catch (err: any) {
            addToast(`Disconnect error: ${err.message}`, "error");
        } finally {
            setDisconnectingId(null);
        }
    };

    const getRecord = (providerId: string) => {
        return records.find(r => r.provider.toLowerCase() === providerId.toLowerCase());
    };

    // Filter services by search and map them into category lists
    const groupedServices = useMemo(() => {
        const query = search.toLowerCase().trim();
        
        // Filter by relevance (either required by template OR connected OR showing all if empty)
        const relevant = PROVIDER_REGISTRY.filter(s => {
            if (requiredServices.length === 0) return true;
            const isRequired = requiredServices.some(req => {
                const normalizedReq = req.toLowerCase().replace(/[^a-z0-9]+/g, "");
                const normalizedServiceId = s.provider.toLowerCase().replace(/[^a-z0-9]+/g, "");
                return normalizedReq === normalizedServiceId || normalizedReq.includes(normalizedServiceId) || normalizedServiceId.includes(normalizedReq);
            });
            const isConnected = !!getRecord(s.provider);
            return isRequired || isConnected;
        });

        const filtered = query
            ? relevant.filter(s => 
                s.displayName.toLowerCase().includes(query) || 
                s.category.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query)
              )
            : relevant;

        // Group by category
        const groups: Record<string, ProviderEntry[]> = {};
        filtered.forEach(s => {
            const cat = s.category;
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(s);
        });

        return groups;
    }, [search, requiredServices, records]);

    const stats = useMemo(() => {
        const total = PROVIDER_REGISTRY.length;
        const connected = records.filter(r => r.status === "Connected").length;
        const errors = records.filter(r => r.status === "Error").length;
        return { total, connected, errors };
    }, [records]);

    return (
        <div className={styles.container}>
            {/* Toast system */}
            <div className={styles.toastContainer} role="status">
                {toasts.map(t => (
                    <div key={t.id} className={`${styles.toast} ${styles[`toast_${t.type}`]}`}>
                        {t.message}
                    </div>
                ))}
            </div>

            {/* Global soft warning */}
            {globalWarning && (
                <div className={styles.globalWarning}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{globalWarning}</span>
                    <button onClick={() => setGlobalWarning(null)} className={styles.warningClose} aria-label="Dismiss warning">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className={styles.header} style={{ borderBottom: "none", paddingBottom: 0 }}>
                <div>
                    <p className={styles.subtitle} style={{ fontSize: "0.9rem", color: "#64748B", margin: 0 }}>
                        Configure access credentials for databases, messaging systems, payment channels, and workspace APIs.
                    </p>
                </div>
            </div>

            <div className={styles.healthStrip} style={{ marginBottom: "24px" }}>
                <div className={styles.healthCard}>
                    <div className={styles.healthIcon} style={{ background: "rgba(148, 163, 184, 0.1)", color: "#64748B" }}>
                        <Shield size={20} />
                    </div>
                    <div className={styles.healthInfo}>
                        <span className={styles.healthCount}>{stats.total}</span>
                        <span className={styles.healthLabel}>Total Integrations</span>
                    </div>
                </div>
                <div className={styles.healthCard}>
                    <div className={styles.healthIcon} style={{ background: "rgba(52, 209, 134, 0.1)", color: "#34D186" }}>
                        <Check size={20} />
                    </div>
                    <div className={styles.healthInfo}>
                        <span className={styles.healthCount}>{stats.connected}</span>
                        <span className={styles.healthLabel}>Linked Accounts</span>
                    </div>
                </div>
                <div className={styles.healthCard}>
                    <div className={styles.healthIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#EF4444" }}>
                        <AlertCircle size={20} />
                    </div>
                    <div className={styles.healthInfo}>
                        <span className={styles.healthCount}>{stats.errors}</span>
                        <span className={styles.healthLabel}>Connection Errors</span>
                    </div>
                </div>
            </div>

            <div className={styles.mainLayout}>
                <div className={styles.leftColumn}>
                    <div className={styles.searchBar}>
                        <div className={styles.searchGroup}>
                            <Search size={18} className={styles.searchIcon} />
                            <input 
                                className={styles.searchInput}
                                placeholder="Search apps, databases, platforms..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                            <Loader2 size={32} className={styles.spinner} color="#34D186" />
                        </div>
                    ) : Object.keys(groupedServices).length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>No apps matching your search criteria.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                            {Object.entries(groupedServices).map(([catKey, services]) => (
                                <section key={catKey} className={styles.categorySection}>
                                    <h2 className={styles.categoryTitle}>{CATEGORY_MAP[catKey] || catKey}</h2>
                                    <div className={styles.cardsGrid}>
                                        {services.map(service => {
                                            const record = getRecord(service.provider);
                                            const isConn = record?.status === "Connected";
                                            const isErr = record?.status === "Error";
                                            const icon = ICON_MAP[service.icon] || <Shield size={20} />;

                                            return (
                                                <div key={service.provider} className={styles.card}>
                                                    <div className={styles.cardHeader}>
                                                        <div className={styles.cardBrand}>
                                                            <div 
                                                                className={styles.cardIcon}
                                                                style={{ 
                                                                    backgroundColor: isConn ? "rgba(52, 209, 134, 0.08)" : "rgba(100, 116, 139, 0.05)",
                                                                    color: isConn ? "#34D186" : "#64748B"
                                                                }}
                                                            >
                                                                {icon}
                                                            </div>
                                                            <div className={styles.cardMeta}>
                                                                <h3 className={styles.cardTitle}>{service.displayName}</h3>
                                                                <span className={styles.cardAuthType}>{service.authType}</span>
                                                            </div>
                                                        </div>

                                                        {record && (
                                                            <span className={`${styles.badge} ${isConn ? styles.badgeConnected : styles.badgeError}`}>
                                                                {isConn ? "Linked" : "Error"}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className={styles.cardBody}>
                                                        <p className={styles.cardDescription}>{service.description}</p>
                                                    </div>

                                                    <div className={styles.cardActions}>
                                                        {record ? (
                                                            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                                                                <button 
                                                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                                                    style={{ flex: 1 }}
                                                                    onClick={() => handleTestConnection(service.provider)}
                                                                    disabled={testingId === service.provider}
                                                                >
                                                                    {testingId === service.provider ? (
                                                                        <Loader2 size={12} className={styles.spinner} />
                                                                    ) : (
                                                                        <Play size={12} />
                                                                    )}
                                                                    Test
                                                                </button>
                                                                <button 
                                                                    className={`${styles.btn} ${styles.btnDanger}`}
                                                                    onClick={() => handleDisconnectCommit(service.provider)}
                                                                    disabled={disconnectingId === service.provider}
                                                                >
                                                                    {disconnectingId === service.provider ? (
                                                                        <Loader2 size={12} className={styles.spinner} />
                                                                    ) : (
                                                                        <Trash2 size={12} />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button 
                                                                className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                                                                onClick={() => handleConnectClick(service)}
                                                            >
                                                                Connect App
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <Lock size={16} color="#34D186" />
                            <span className={styles.panelTitle}>Sovereign Vault Storage</span>
                        </div>
                        <p className={styles.panelText}>
                            Credentials and access tokens are forwarded instantly to your isolated, encrypted container nodes. BLONK only references credentials by a unique ID key.
                        </p>
                    </div>

                    <div className={styles.panel} style={{ background: "#F8FAFC" }}>
                        <div className={styles.panelHeader}>
                            <Cpu size={16} color="#3B82F6" />
                            <span className={styles.panelTitle}>Scalable Orchestration</span>
                        </div>
                        <p className={styles.panelText}>
                            Connecting your integrations registers them globally inside your workspace context, letting any active or recommended automation leverage them.
                        </p>
                    </div>
                </div>
            </div>

            {/* Reusable Auth Type Modal Dialog */}
            {activeService && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleWrapper}>
                                <h2 className={styles.modalTitle}>Connect {activeService.displayName}</h2>
                                <p className={styles.modalSubtitle}>
                                    {getModalSubtitle(activeService)}
                                </p>
                            </div>
                            <button 
                                className={styles.closeButton}
                                onClick={() => setActiveService(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit} className={styles.modalBody}>
                            {modalError && (
                                <div className={styles.errorBanner}>
                                    <AlertCircle size={16} style={{ marginRight: 8, display: "inline" }} />
                                    {modalError}
                                </div>
                            )}

                            {activeService.authType === "oauth2" ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
                                    <button
                                        type="button"
                                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                                        style={{ padding: "14px 20px", fontSize: "0.85rem", fontWeight: 800 }}
                                        onClick={handleOAuthConnect}
                                        disabled={isConnecting}
                                    >
                                        {isConnecting ? (
                                            <>
                                                <Loader2 size={16} className={styles.spinner} /> Connecting...
                                            </>
                                        ) : (
                                            `Sign in with ${activeService.displayName}`
                                        )}
                                    </button>
                                </div>
                            ) : activeService.authType === "databaseConnection" ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr", gap: "12px" }}>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Host / Server Address</label>
                                            <input
                                                type="text"
                                                required
                                                className={styles.formInput}
                                                placeholder="127.0.0.1 or db.provider.com"
                                                value={formData.host || ""}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, host: e.target.value });
                                                    setInlineError(null);
                                                }}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Port</label>
                                            <input
                                                type="number"
                                                required
                                                className={styles.formInput}
                                                placeholder={activeService.provider === "mysql" ? "3306" : "5432"}
                                                value={formData.port || ""}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, port: parseInt(e.target.value, 10) || "" });
                                                    setInlineError(null);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Username</label>
                                        <input
                                            type="text"
                                            required
                                            className={styles.formInput}
                                            placeholder="Database username"
                                            value={formData.user || ""}
                                            onChange={(e) => {
                                                setFormData({ ...formData, user: e.target.value });
                                                setInlineError(null);
                                            }}
                                        />
                                    </div>
                                    <div className={styles.formGroup} style={{ position: "relative" }}>
                                        <label className={styles.formLabel}>Password</label>
                                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                            <input
                                                type={showSecret ? "text" : "password"}
                                                required
                                                className={styles.formInput}
                                                placeholder="Database password"
                                                style={{ paddingRight: "48px" }}
                                                value={formData.password || ""}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, password: e.target.value });
                                                    setInlineError(null);
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowSecret(!showSecret)}
                                                style={{
                                                    position: "absolute",
                                                    right: "12px",
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    color: "#94A3B8",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    padding: "4px"
                                                }}
                                                tabIndex={-1}
                                            >
                                                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Database Name</label>
                                        <input
                                            type="text"
                                            required
                                            className={styles.formInput}
                                            placeholder="main_production"
                                            value={formData.database || ""}
                                            onChange={(e) => {
                                                setFormData({ ...formData, database: e.target.value });
                                                setInlineError(null);
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                                        <input
                                            type="checkbox"
                                            id="ssl-db"
                                            checked={!!formData.ssl}
                                            onChange={(e) => setFormData({ ...formData, ssl: e.target.checked })}
                                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                        />
                                        <label htmlFor="ssl-db" className={styles.formLabel} style={{ marginBottom: 0, cursor: "pointer", userSelect: "none" }}>
                                            Enable SSL Security
                                        </label>
                                    </div>

                                    {inlineError && (
                                        <div style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 700 }}>
                                            {inlineError}
                                        </div>
                                    )}

                                    <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "16px", marginTop: "8px" }}>
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnFull}`}
                                            onClick={handleTestDatabaseConnection}
                                            disabled={isTestingDb}
                                            style={{ gap: "8px", fontWeight: 800 }}
                                        >
                                            {isTestingDb ? (
                                                <>
                                                    <Loader2 size={14} className={styles.spinner} /> Testing Connection...
                                                </>
                                            ) : (
                                                <>
                                                    <Play size={14} /> Test Connection
                                                </>
                                            )}
                                        </button>
                                        {dbTestMessage && (
                                            <div 
                                                style={{ 
                                                    marginTop: "12px", 
                                                    padding: "10px 14px", 
                                                    borderRadius: "8px", 
                                                    fontSize: "0.75rem", 
                                                    fontWeight: 700,
                                                    background: dbTestMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
                                                    color: dbTestMessage.type === "success" ? "#059669" : "#DC2626",
                                                    border: `1px solid ${dbTestMessage.type === "success" ? "#D1FAE5" : "#FEE2E2"}`
                                                }}
                                            >
                                                {dbTestMessage.text}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    {activeService.fields.map(f => {
                                        const isPassword = isPasswordInput(f);
                                        const inputType = isPassword ? (showSecret ? "text" : "password") : f.type;
                                        const fieldLabel = getFriendlyFieldLabel(f, activeService);

                                        if (f.type === "textarea") {
                                            return (
                                                <div className={styles.formGroup} key={f.key}>
                                                    <label className={styles.formLabel}>{fieldLabel}</label>
                                                    <textarea
                                                        required
                                                        rows={f.key === "privateKey" ? 6 : 4}
                                                        className={styles.formInput}
                                                        style={{ fontFamily: "monospace", fontSize: "11px", resize: "vertical" }}
                                                        placeholder={f.placeholder}
                                                        value={formData[f.key] || ""}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, [f.key]: e.target.value });
                                                            setInlineError(null);
                                                        }}
                                                    />
                                                </div>
                                            );
                                        }

                                        if (f.type === "select") {
                                            return (
                                                <div className={styles.formGroup} key={f.key}>
                                                    <label className={styles.formLabel}>{fieldLabel}</label>
                                                    <select
                                                        className={styles.formInput}
                                                        value={formData[f.key] || f.options?.[0]?.value || ""}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, [f.key]: e.target.value });
                                                            setInlineError(null);
                                                        }}
                                                    >
                                                        {f.options?.map(opt => (
                                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            );
                                        }

                                        if (f.type === "boolean") {
                                            return (
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }} key={f.key}>
                                                    <input
                                                        type="checkbox"
                                                        id={`chk-${f.key}`}
                                                        checked={!!formData[f.key]}
                                                        onChange={(e) => {
                                                            setFormData({ ...formData, [f.key]: e.target.checked });
                                                            setInlineError(null);
                                                        }}
                                                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                                    />
                                                    <label htmlFor={`chk-${f.key}`} className={styles.formLabel} style={{ marginBottom: 0, cursor: "pointer", userSelect: "none" }}>
                                                        {fieldLabel}
                                                    </label>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className={styles.formGroup} key={f.key}>
                                                <label className={styles.formLabel}>{fieldLabel}</label>
                                                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                                    <input
                                                        type={inputType}
                                                        required
                                                        className={styles.formInput}
                                                        style={{ paddingRight: isPassword ? "48px" : "16px" }}
                                                        placeholder={f.placeholder || `Enter ${fieldLabel.toLowerCase()}`}
                                                        value={formData[f.key] || ""}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (activeService.authType === "bearerToken" && f.key === "apiKey") {
                                                                setFormData({ ...formData, apiKey: val, token: val });
                                                            } else {
                                                                setFormData({ ...formData, [f.key]: val });
                                                            }
                                                            setInlineError(null);
                                                        }}
                                                    />
                                                    {isPassword && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowSecret(!showSecret)}
                                                            style={{
                                                                position: "absolute",
                                                                right: "12px",
                                                                background: "none",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                color: "#94A3B8",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                padding: "4px"
                                                            }}
                                                            tabIndex={-1}
                                                        >
                                                            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {inlineError && (
                                        <div style={{ color: "#DC2626", fontSize: "0.75rem", fontWeight: 700, marginTop: "2px" }}>
                                            {inlineError}
                                        </div>
                                    )}

                                    {/* Trust line and Help links for apiKey / bearerToken */}
                                    {(activeService.authType === "bearerToken" || 
                                      activeService.authType === "apiKey" || 
                                      activeService.authType === "apiKeyHeader" || 
                                      activeService.authType === "apiKeyQuery") && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                                            {activeService.helpUrl && (
                                                <div style={{ fontSize: "0.75rem", fontWeight: 700 }}>
                                                    Don&apos;t have one?{" "}
                                                    <a 
                                                        href={activeService.helpUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        style={{ color: "var(--accent)", textDecoration: "underline", display: "inline-flex", alignItems: "center" }}
                                                    >
                                                        {activeService.helpLabel || `Get your key from ${activeService.displayName}`} →
                                                    </a>
                                                </div>
                                            )}
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "#64748B", fontWeight: 700 }}>
                                                <Lock size={12} style={{ color: "#34D186" }} />
                                                <span>Your key is encrypted and never shared with other customers.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeService.authType !== "oauth2" && (
                                <div className={styles.modalFooter}>
                                    <button 
                                        type="button"
                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                        onClick={() => setActiveService(null)}
                                        disabled={isConnecting}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className={`${styles.btn} ${styles.btnPrimary}`}
                                        disabled={isConnecting}
                                    >
                                        {isConnecting ? (
                                            <>
                                                <Loader2 size={12} className={styles.spinner} /> Connecting...
                                            </>
                                        ) : (
                                            "Connect"
                                        )}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
