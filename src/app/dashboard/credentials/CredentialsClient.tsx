"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
    Brain, 
    Send, 
    MessageSquare, 
    MessageCircle, 
    CreditCard, 
    Mail, 
    Table, 
    Cpu, 
    Phone, 
    CheckCircle2, 
    AlertCircle, 
    Plus, 
    Search, 
    Loader2, 
    Trash2, 
    Play, 
    ExternalLink, 
    Lock, 
    X,
    Shield
} from "lucide-react";
import styles from "./credentials.module.css";

const GithubIcon = ({ size = 22 }: { size?: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
);

// Interface for DB records
interface CredentialRecord {
    id: string;
    provider: string;
    status: string;
    n8n_credential_id: string;
    created_at: string;
    updated_at: string;
}

// Full specifications of the 10 services to connect
interface ServiceDef {
    id: string;
    name: string;
    category: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    fields: Array<{
        key: string;
        label: string;
        type: string;
        placeholder: string;
        hint?: string;
    }>;
    isOAuth?: boolean;
}

export default function CredentialsClient({ requiredServices = [] }: { requiredServices?: string[] }) {
    const [records, setRecords] = useState<CredentialRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Modal states
    const [activeService, setActiveService] = useState<ServiceDef | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [discordType, setDiscordType] = useState<"bot" | "webhook">("bot"); // discord specific
    const [modalError, setModalError] = useState<string | null>(null);
    
    // Action loading states
    const [isConnecting, setIsConnecting] = useState(false);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
    const [pendingOAuthProvider, setPendingOAuthProvider] = useState<string | null>(null);

    // List of definitions
    const services = useMemo<ServiceDef[]>(() => [
        {
            id: "openai",
            name: "OpenAI",
            category: "Artificial Intelligence",
            description: "Access GPT-4o, GPT-4, and embeddings for advanced agentic workflow tasks.",
            icon: <Brain size={22} />,
            color: "#10B981", // Emerald Green
            fields: [
                { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-proj-...", hint: "Generate key in your OpenAI developer dashboard." }
            ]
        },
        {
            id: "telegram",
            name: "Telegram Bot",
            category: "Messaging",
            description: "Trigger workflows from chat messages or send status reports to channels.",
            icon: <Send size={22} />,
            color: "#0088cc", // Telegram Blue
            fields: [
                { key: "botToken", label: "Bot Access Token", type: "password", placeholder: "123456789:ABCdefGhI...", hint: "Obtain this from @BotFather on Telegram." }
            ]
        },
        {
            id: "discord",
            name: "Discord",
            category: "Messaging",
            description: "Connect Discord webhooks or bot tokens to synchronize operational chatrooms.",
            icon: <MessageSquare size={22} />,
            color: "#5865F2", // Discord Purple
            fields: [] // Custom rendered depending on type tab
        },
        {
            id: "slack",
            name: "Slack",
            category: "Messaging",
            description: "Post messages, receive files, and run commands on your corporate Slack workspace.",
            icon: <MessageCircle size={22} />,
            color: "#4A154B", // Slack Eggplant
            fields: [
                { key: "botToken", label: "Bot User OAuth Token", type: "password", placeholder: "xoxb-...", hint: "Requires slack workspace bot token permissions." }
            ]
        },
        {
            id: "stripe",
            name: "Stripe",
            category: "Payments",
            description: "Automate processing of invoices, customers, payments, and subscriptions.",
            icon: <CreditCard size={22} />,
            color: "#635BFF", // Stripe Purple
            fields: [
                { key: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_live_...", hint: "Use restricted keys with scoped write capabilities for security." }
            ]
        },
        {
            id: "gmail",
            name: "Gmail",
            category: "Email",
            description: "Automate receiving, scanning, drafting, and dispatching workspace emails.",
            icon: <Mail size={22} />,
            color: "#EA4335", // Google Red
            isOAuth: true,
            fields: []
        },
        {
            id: "google-sheets",
            name: "Google Sheets",
            category: "Productivity",
            description: "Extract data, append logs, and read target values from custom spreadsheet files.",
            icon: <Table size={22} />,
            color: "#0F9D58", // Google Sheets Green
            isOAuth: true,
            fields: []
        },
        {
            id: "github",
            name: "GitHub",
            category: "Developer Tools",
            description: "Automate issue tracking, repository management, and deployment triggers.",
            icon: <GithubIcon size={22} />,
            color: "#24292F", // GitHub Black/Grey
            fields: [
                { key: "accessToken", label: "Personal Access Token (PAT)", type: "password", placeholder: "ghp_...", hint: "Requires repo and workflow scopes." }
            ]
        },
        {
            id: "openrouter",
            name: "OpenRouter",
            category: "Artificial Intelligence",
            description: "Access dozens of open-source LLMs (Claude 3, Llama 3, etc.) through unified endpoints.",
            icon: <Cpu size={22} />,
            color: "#7C3AED", // Violet
            fields: [
                { key: "apiKey", label: "API Key", type: "password", placeholder: "sk-or-v1-...", hint: "Obtain this from openrouter.ai settings." }
            ]
        },
        {
            id: "twilio",
            name: "Twilio",
            category: "Telecom",
            description: "Send/receive SMS, configure interactive voice calls, and trigger alerts.",
            icon: <Phone size={22} />,
            color: "#F22F46", // Twilio Red
            fields: [
                { key: "accountSid", label: "Account SID", type: "text", placeholder: "AC...", hint: "Found in console.twilio.com dashboard." },
                { key: "authToken", label: "Auth Token", type: "password", placeholder: "auth_token_value", hint: "Twilio project secret token." }
            ]
        }
    ], []);

    // Fetch credentials list
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
                        alert(`Connection failed: ${responseData.error}`);
                        return;
                    }

                    // Refresh list
                    fetchCredentials();
                } catch (err: any) {
                    alert(`Error connecting service: ${err.message}`);
                }
            }
        };

        window.addEventListener("message", handleOAuthMessage);
        return () => window.removeEventListener("message", handleOAuthMessage);
    }, [pendingOAuthProvider]);

    // Connect trigger
    const handleConnectClick = (service: ServiceDef) => {
        if (service.isOAuth) {
            setPendingOAuthProvider(service.id);
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
                alert("Popup blocker detected. Please allow popups for this page to authenticate.");
            }
        } else {
            setActiveService(service);
            setFormData({});
            setModalError(null);
        }
    };

    // Modal Form Connect
    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeService) return;

        setIsConnecting(true);
        setModalError(null);

        // Build payload
        let payloadData = { ...formData };
        if (activeService.id === "discord") {
            if (discordType === "webhook") {
                payloadData = { webhookUrl: formData.webhookUrl };
            } else {
                payloadData = { botToken: formData.botToken };
            }
        }

        try {
            const res = await fetch("/api/credentials/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider: activeService.id,
                    data: payloadData
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to connect credentials");
            }

            // Success, close modal and refresh
            setActiveService(null);
            fetchCredentials();
        } catch (err: any) {
            setModalError(err.message || "An unexpected error occurred");
        } finally {
            setIsConnecting(false);
        }
    };

    // Test connection
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
                alert(`Success! Connection to ${provider} is healthy.`);
            } else {
                alert(`Connection Error: ${data.error || 'Validation failed'}`);
            }
            fetchCredentials();
        } catch (err: any) {
            alert(`Connectivity Test Failed: ${err.message}`);
        } finally {
            setTestingId(null);
        }
    };

    // Disconnect
    const handleDisconnect = async (provider: string) => {
        if (!confirm(`Are you sure you want to disconnect ${provider}? This will delete the key securely.`)) {
            return;
        }
        setDisconnectingId(provider);
        try {
            const res = await fetch("/api/credentials/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider })
            });
            if (res.ok) {
                // Remove from list or refresh
                fetchCredentials();
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to disconnect'}`);
            }
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setDisconnectingId(null);
        }
    };

    // Helper to match provider data
    const getRecord = (providerId: string) => {
        // google sheets matchesgooglesheets or google-sheets
        const match = providerId === "google-sheets" ? "google-sheets" : providerId;
        return records.find(r => r.provider.toLowerCase() === match.toLowerCase());
    };

    // Filters
    const filteredServices = useMemo(() => {
        const query = search.toLowerCase().trim();
        
        // Filter by relevance (either required by user's workflows OR already connected)
        const relevantServices = services.filter(s => {
            const isRequired = requiredServices.some(req => {
                const normalizedReq = req.toLowerCase().replace(/[^a-z0-9]+/g, "");
                const normalizedServiceId = s.id.toLowerCase().replace(/[^a-z0-9]+/g, "");
                return normalizedReq === normalizedServiceId || normalizedReq.includes(normalizedServiceId) || normalizedServiceId.includes(normalizedReq);
            });
            const isConnected = !!getRecord(s.id);
            return isRequired || isConnected;
        });

        if (!query) return relevantServices;
        return relevantServices.filter(s => 
            s.name.toLowerCase().includes(query) || 
            s.category.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query)
        );
    }, [search, services, requiredServices, records]);

    const stats = useMemo(() => {
        const relevant = services.filter(s => {
            const isRequired = requiredServices.some(req => {
                const normalizedReq = req.toLowerCase().replace(/[^a-z0-9]+/g, "");
                const normalizedServiceId = s.id.toLowerCase().replace(/[^a-z0-9]+/g, "");
                return normalizedReq === normalizedServiceId || normalizedReq.includes(normalizedServiceId) || normalizedServiceId.includes(normalizedReq);
            });
            const isConnected = !!getRecord(s.id);
            return isRequired || isConnected;
        });

        const total = relevant.length;
        const connected = relevant.filter(s => getRecord(s.id)?.status === "Connected").length;
        const errors = relevant.filter(s => getRecord(s.id)?.status === "Error").length;
        const missing = total - connected - errors;
        return { total, connected, errors, missing };
    }, [records, services, requiredServices]);

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Credentials Vault</h1>
                <p className={styles.headerSubtitle}>
                    Manage external API keys, tokens, and OAuth services connected to your sovereign n8n cluster.
                </p>
            </div>

            {/* Health summary strip */}
            <div className={styles.healthStrip}>
                <div className={styles.healthCard}>
                    <div className={styles.healthIcon} style={{ background: "#ECFDF5" }}>
                        <CheckCircle2 color="#10B981" size={20} />
                    </div>
                    <div className={styles.healthInfo}>
                        <div className={styles.healthCount}>{stats.connected}</div>
                        <div className={styles.healthLabel}>Connected</div>
                    </div>
                </div>
                <div className={styles.healthCard}>
                    <div className={styles.healthIcon} style={{ background: "#FEF2F2" }}>
                        <AlertCircle color="#DC2626" size={20} />
                    </div>
                    <div className={styles.healthInfo}>
                        <div className={styles.healthCount}>{stats.errors}</div>
                        <div className={styles.healthLabel}>Alerts / Errors</div>
                    </div>
                </div>
                <div className={styles.healthCard}>
                    <div className={styles.healthIcon} style={{ background: "#F1F5F9" }}>
                        <Lock color="#64748B" size={18} />
                    </div>
                    <div className={styles.healthInfo}>
                        <div className={styles.healthCount}>{stats.missing}</div>
                        <div className={styles.healthLabel}>Unconfigured</div>
                    </div>
                </div>
                <div className={styles.healthCard}>
                    <div className={styles.healthIcon} style={{ background: "#EEF2FF" }}>
                        <Shield color="#4F46E5" size={18} />
                    </div>
                    <div className={styles.healthInfo}>
                        <div className={styles.healthCount}>{stats.total}</div>
                        <div className={styles.healthLabel}>Integrations</div>
                    </div>
                </div>
            </div>

            <div className={styles.mainLayout}>
                {/* Left side: Search and cards grid */}
                <div className={styles.leftColumn}>
                    <div className={styles.searchBar}>
                        <div className={styles.searchGroup}>
                            <Search size={18} className={styles.searchIcon} />
                            <input 
                                className={styles.searchInput}
                                placeholder="Search credentials..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
                            <Loader2 size={32} className={styles.spinner} color="#64748B" />
                        </div>
                    ) : (
                        <div className={styles.cardsGrid}>
                            {filteredServices.map(service => {
                                const record = getRecord(service.id);
                                return (
                                    <div key={service.id} className={styles.card}>
                                        <div className={styles.cardHeader}>
                                            <div className={styles.cardBrand}>
                                                <div 
                                                    className={styles.cardIcon} 
                                                    style={{ background: service.color }}
                                                >
                                                    {service.icon}
                                                </div>
                                                <div className={styles.cardMeta}>
                                                    <h3 className={styles.cardTitle}>{service.name}</h3>
                                                    <span className={styles.cardCategory}>{service.category}</span>
                                                </div>
                                            </div>

                                            {/* Status tag */}
                                            {record ? (
                                                record.status === "Connected" ? (
                                                    <span className={`${styles.badge} ${styles.badgeConnected}`}>
                                                        Connected
                                                    </span>
                                                ) : (
                                                    <span className={`${styles.badge} ${styles.badgeError}`}>
                                                        Error
                                                    </span>
                                                )
                                            ) : (
                                                <span className={`${styles.badge} ${styles.badgeMissing}`}>
                                                    Unset
                                                </span>
                                            )}
                                        </div>

                                        <div className={styles.cardBody}>
                                            <p className={styles.cardDescription}>{service.description}</p>
                                        </div>

                                        <div className={styles.cardActions}>
                                            {record ? (
                                                <>
                                                    <button 
                                                        className={`${styles.btn} ${styles.btnSecondary}`}
                                                        onClick={() => handleTestConnection(service.id)}
                                                        disabled={testingId === service.id}
                                                    >
                                                        {testingId === service.id ? (
                                                            <Loader2 size={12} className={styles.spinner} />
                                                        ) : (
                                                            <Play size={12} />
                                                        )}
                                                        Test
                                                    </button>
                                                    <button 
                                                        className={`${styles.btn} ${styles.btnDanger} ${styles.btnFull}`}
                                                        onClick={() => handleDisconnect(service.id)}
                                                        disabled={disconnectingId === service.id}
                                                    >
                                                        {disconnectingId === service.id ? (
                                                            <Loader2 size={12} className={styles.spinner} />
                                                        ) : (
                                                            <Trash2 size={12} />
                                                        )}
                                                        Disconnect
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                                                    onClick={() => handleConnectClick(service)}
                                                >
                                                    <Plus size={14} />
                                                    Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right side: Security explanation panels */}
                <div className={styles.rightColumn}>
                    <div className={styles.panel}>
                        <div className={styles.panelHeader}>
                            <Lock size={16} color="#10B981" />
                            <span className={styles.panelTitle}>AES-256 Encryption</span>
                        </div>
                        <p className={styles.panelText}>
                            Your keys are automatically encrypted at-rest using military-grade AES-256-GCM. Decryption only occurs transiently during workflow triggers.
                        </p>
                        <a href="#" className={styles.panelLink}>
                            Read security architecture <ExternalLink size={12} />
                        </a>
                    </div>

                    <div className={styles.panel} style={{ background: "#F8FAFC" }}>
                        <div className={styles.panelHeader}>
                            <Cpu size={16} color="#3B82F6" />
                            <span className={styles.panelTitle}>Sovereign Sync</span>
                        </div>
                        <p className={styles.panelText}>
                            Credentials configured here are synchronized immediately to your dedicated cluster node. They are isolated from other organizations.
                        </p>
                        <a href="#" className={`${styles.panelLink} ${styles.panelLinkBlue}`}>
                            Cluster status logs <ExternalLink size={12} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Modal for connecting service */}
            {activeService && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <div className={styles.modalTitleWrapper}>
                                <h2 className={styles.modalTitle}>Connect {activeService.name}</h2>
                                <p className={styles.modalSubtitle}>Sync credentials to the sovereign execution environment.</p>
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

                            {/* Discord specific UI */}
                            {activeService.id === "discord" ? (
                                <>
                                    <div className={styles.typeSelector}>
                                        <button 
                                            type="button"
                                            className={`${styles.typeTab} ${discordType === "bot" ? styles.typeTabActive : ""}`}
                                            onClick={() => setDiscordType("bot")}
                                        >
                                            Discord Bot
                                        </button>
                                        <button 
                                            type="button"
                                            className={`${styles.typeTab} ${discordType === "webhook" ? styles.typeTabActive : ""}`}
                                            onClick={() => setDiscordType("webhook")}
                                        >
                                            Webhook URL
                                        </button>
                                    </div>

                                    {discordType === "bot" ? (
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Bot Token</label>
                                            <input 
                                                className={styles.formInput}
                                                type="password"
                                                required
                                                placeholder="MTk4YzY..."
                                                value={formData.botToken || ""}
                                                onChange={(e) => setFormData({ botToken: e.target.value })}
                                            />
                                            <span className={styles.formHint}>Generate this inside the Discord Developer Console.</span>
                                        </div>
                                    ) : (
                                        <div className={styles.formGroup}>
                                            <label className={styles.formLabel}>Webhook URL</label>
                                            <input 
                                                className={styles.formInput}
                                                type="text"
                                                required
                                                placeholder="https://discord.com/api/webhooks/..."
                                                value={formData.webhookUrl || ""}
                                                onChange={(e) => setFormData({ webhookUrl: e.target.value })}
                                            />
                                            <span className={styles.formHint}>Created in Server Settings - Integrations - Webhooks.</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                /* Standard fields mapping */
                                activeService.fields.map(field => (
                                    <div key={field.key} className={styles.formGroup}>
                                        <label className={styles.formLabel}>{field.label}</label>
                                        <input 
                                            className={styles.formInput}
                                            type={field.type}
                                            required
                                            placeholder={field.placeholder}
                                            value={formData[field.key] || ""}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                [field.key]: e.target.value
                                            })}
                                        />
                                        {field.hint && <span className={styles.formHint}>{field.hint}</span>}
                                    </div>
                                ))
                            )}

                            <div className={styles.modalFooter}>
                                <button 
                                    type="button"
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => setActiveService(null)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className={`${styles.btn} ${styles.btnPrimary}`}
                                    disabled={isConnecting}
                                >
                                    {isConnecting && <Loader2 size={12} className={styles.spinner} />}
                                    Sync Credentials
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
