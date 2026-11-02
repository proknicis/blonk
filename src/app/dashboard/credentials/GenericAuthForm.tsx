"use client";

import React from "react";
import styles from "./credentials.module.css";

export interface GenericAuthFormProps {
    authType: string;
    formData: Record<string, any>;
    onChange: (newData: Record<string, any>) => void;
}

export default function GenericAuthForm({ authType, formData, onChange }: GenericAuthFormProps) {
    const handleFieldChange = (key: string, value: any) => {
        onChange({
            ...formData,
            [key]: value,
        });
    };

    switch (authType) {
        case "oauth2":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Client ID</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            placeholder="Enter OAuth Client ID"
                            value={formData.clientId || ""}
                            onChange={(e) => handleFieldChange("clientId", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Client Secret</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            placeholder="Enter Client Secret"
                            value={formData.clientSecret || ""}
                            onChange={(e) => handleFieldChange("clientSecret", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Authorization URL</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="https://provider.com/oauth/authorize (Optional)"
                            value={formData.authUrl || ""}
                            onChange={(e) => handleFieldChange("authUrl", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Access Token URL</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="https://provider.com/oauth/token (Optional)"
                            value={formData.accessTokenUrl || ""}
                            onChange={(e) => handleFieldChange("accessTokenUrl", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Scopes</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="read, write (separated by space/comma)"
                            value={formData.scopes || ""}
                            onChange={(e) => handleFieldChange("scopes", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Redirect URI</label>
                        <input
                            type="text"
                            disabled
                            className={styles.formInput}
                            style={{ background: "#F1F5F9", cursor: "not-allowed" }}
                            value={typeof window !== "undefined" ? `${window.location.origin}/api/integrations/oauth/callback` : ""}
                        />
                        <span className={styles.formHint}>Configure this redirect URI in your provider console.</span>
                    </div>
                </div>
            );

        case "oauth1":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Consumer Key</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            value={formData.consumerKey || ""}
                            onChange={(e) => handleFieldChange("consumerKey", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Consumer Secret</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            value={formData.consumerSecret || ""}
                            onChange={(e) => handleFieldChange("consumerSecret", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>OAuth Token</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            value={formData.oauthToken || ""}
                            onChange={(e) => handleFieldChange("oauthToken", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>OAuth Token Secret</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            value={formData.oauthTokenSecret || ""}
                            onChange={(e) => handleFieldChange("oauthTokenSecret", e.target.value)}
                        />
                    </div>
                </div>
            );

        case "apiKeyHeader":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>API Key</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            placeholder="Enter API Secret Key"
                            value={formData.apiKey || ""}
                            onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Header Name</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            placeholder="Authorization (or X-API-KEY)"
                            value={formData.headerName || "Authorization"}
                            onChange={(e) => handleFieldChange("headerName", e.target.value)}
                        />
                    </div>
                </div>
            );

        case "apiKeyQuery":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>API Key</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            value={formData.apiKey || ""}
                            onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Query Parameter Name</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            placeholder="api_key (or token)"
                            value={formData.queryParamName || ""}
                            onChange={(e) => handleFieldChange("queryParamName", e.target.value)}
                        />
                    </div>
                </div>
            );

        case "bearerToken":
            return (
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Bearer Token / API Access Key</label>
                    <input
                        type="password"
                        required
                        className={styles.formInput}
                        placeholder="Enter bearer token or API key"
                        value={formData.token || formData.apiKey || ""}
                        onChange={(e) => {
                            handleFieldChange("token", e.target.value);
                            handleFieldChange("apiKey", e.target.value); // support both aliases
                        }}
                    />
                </div>
            );

        case "basicAuth":
        case "usernamePassword":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Username</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            value={formData.username || ""}
                            onChange={(e) => handleFieldChange("username", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Password / Key Secret</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            value={formData.password || ""}
                            onChange={(e) => handleFieldChange("password", e.target.value)}
                        />
                    </div>
                </div>
            );

        case "databaseConnection":
            return (
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
                                onChange={(e) => handleFieldChange("host", e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Port</label>
                            <input
                                type="number"
                                required
                                className={styles.formInput}
                                placeholder="5432"
                                value={formData.port || ""}
                                onChange={(e) => handleFieldChange("port", parseInt(e.target.value, 10))}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>User</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            value={formData.user || ""}
                            onChange={(e) => handleFieldChange("user", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Password</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            value={formData.password || ""}
                            onChange={(e) => handleFieldChange("password", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Database Name</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            value={formData.database || ""}
                            onChange={(e) => handleFieldChange("database", e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <input
                            type="checkbox"
                            id="ssl-db"
                            checked={!!formData.ssl}
                            onChange={(e) => handleFieldChange("ssl", e.target.checked)}
                        />
                        <label htmlFor="ssl-db" className={styles.formLabel} style={{ marginBottom: 0, cursor: "pointer" }}>Enable SSL Security</label>
                    </div>
                </div>
            );

        case "smtpImap":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Connection Protocol Type</label>
                        <select
                            className={styles.formInput}
                            value={formData.protocol || "smtp"}
                            onChange={(e) => handleFieldChange("protocol", e.target.value)}
                        >
                            <option value="smtp">SMTP (Outbound relay)</option>
                            <option value="imap">IMAP (Inbound syncing)</option>
                        </select>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr", gap: "12px" }}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Server Host Address</label>
                            <input
                                type="text"
                                required
                                className={styles.formInput}
                                placeholder="mail.mycompany.com"
                                value={formData.host || ""}
                                onChange={(e) => handleFieldChange("host", e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Port</label>
                            <input
                                type="number"
                                required
                                className={styles.formInput}
                                placeholder="587"
                                value={formData.port || ""}
                                onChange={(e) => handleFieldChange("port", parseInt(e.target.value, 10))}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>User / Email Address</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            placeholder="user@domain.com"
                            value={formData.user || ""}
                            onChange={(e) => handleFieldChange("user", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Password</label>
                        <input
                            type="password"
                            required
                            className={styles.formInput}
                            value={formData.password || ""}
                            onChange={(e) => handleFieldChange("password", e.target.value)}
                        />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <input
                            type="checkbox"
                            id="ssl-smtp"
                            checked={!!formData.ssl}
                            onChange={(e) => handleFieldChange("ssl", e.target.checked)}
                        />
                        <label htmlFor="ssl-smtp" className={styles.formLabel} style={{ marginBottom: 0, cursor: "pointer" }}>Use SSL/TLS Security</label>
                    </div>
                </div>
            );

        case "sshKey":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr", gap: "12px" }}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Server Host Address</label>
                            <input
                                type="text"
                                required
                                className={styles.formInput}
                                placeholder="server.company.com"
                                value={formData.host || ""}
                                onChange={(e) => handleFieldChange("host", e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Port</label>
                            <input
                                type="number"
                                required
                                className={styles.formInput}
                                placeholder="22"
                                value={formData.port || 22}
                                onChange={(e) => handleFieldChange("port", parseInt(e.target.value, 10))}
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Username</label>
                        <input
                            type="text"
                            required
                            className={styles.formInput}
                            placeholder="root"
                            value={formData.username || ""}
                            onChange={(e) => handleFieldChange("username", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Private Key (PEM Format)</label>
                        <textarea
                            required
                            rows={6}
                            className={styles.formInput}
                            style={{ fontFamily: "monospace", fontSize: "11px", resize: "vertical" }}
                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;...&#10;-----END OPENSSH PRIVATE KEY-----"
                            value={formData.privateKey || ""}
                            onChange={(e) => handleFieldChange("privateKey", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Passphrase (Optional)</label>
                        <input
                            type="password"
                            className={styles.formInput}
                            placeholder="Secret passphrase if key is encrypted"
                            value={formData.passphrase || ""}
                            onChange={(e) => handleFieldChange("passphrase", e.target.value)}
                        />
                    </div>
                </div>
            );

        case "certificate":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Private Key (PEM)</label>
                        <textarea
                            required
                            rows={4}
                            className={styles.formInput}
                            style={{ fontFamily: "monospace", fontSize: "11px", resize: "vertical" }}
                            value={formData.privateKey || ""}
                            onChange={(e) => handleFieldChange("privateKey", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Certificate (PEM)</label>
                        <textarea
                            required
                            rows={4}
                            className={styles.formInput}
                            style={{ fontFamily: "monospace", fontSize: "11px", resize: "vertical" }}
                            value={formData.certificate || ""}
                            onChange={(e) => handleFieldChange("certificate", e.target.value)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Key Passphrase (Optional)</label>
                        <input
                            type="password"
                            className={styles.formInput}
                            value={formData.passphrase || ""}
                            onChange={(e) => handleFieldChange("passphrase", e.target.value)}
                        />
                    </div>
                </div>
            );

        case "cloudProvider":
            return (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Cloud Provider Variant</label>
                        <select
                            className={styles.formInput}
                            value={formData.providerType || "aws"}
                            onChange={(e) => {
                                handleFieldChange("providerType", e.target.value);
                                onChange({ providerType: e.target.value }); // Reset other fields on type switch
                            }}
                        >
                            <option value="aws">Amazon Web Services (AWS)</option>
                            <option value="gcp">Google Cloud Platform (GCP)</option>
                            <option value="azure">Microsoft Azure</option>
                        </select>
                    </div>

                    {formData.providerType === "gcp" ? (
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Service Account Key JSON</label>
                            <textarea
                                required
                                rows={6}
                                className={styles.formInput}
                                style={{ fontFamily: "monospace", fontSize: "11px", resize: "vertical" }}
                                placeholder="{&#10;  &quot;type&quot;: &quot;service_account&quot;,&#10;  ...&#10;}"
                                value={formData.privateKey || ""}
                                onChange={(e) => handleFieldChange("privateKey", e.target.value)}
                            />
                        </div>
                    ) : formData.providerType === "azure" ? (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Azure Storage Account Name</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.formInput}
                                    placeholder="mystorageaccount"
                                    value={formData.accountName || ""}
                                    onChange={(e) => handleFieldChange("accountName", e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Account Key</label>
                                <input
                                    type="password"
                                    required
                                    className={styles.formInput}
                                    value={formData.accountKey || ""}
                                    onChange={(e) => handleFieldChange("accountKey", e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>AWS Access Key ID</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.formInput}
                                    placeholder="AKIA..."
                                    value={formData.awsAccessKeyId || ""}
                                    onChange={(e) => handleFieldChange("awsAccessKeyId", e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>AWS Secret Access Key</label>
                                <input
                                    type="password"
                                    required
                                    className={styles.formInput}
                                    value={formData.awsSecretAccessKey || ""}
                                    onChange={(e) => handleFieldChange("awsSecretAccessKey", e.target.value)}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel}>Region</label>
                                <input
                                    type="text"
                                    className={styles.formInput}
                                    placeholder="us-east-1"
                                    value={formData.region || ""}
                                    onChange={(e) => handleFieldChange("region", e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </div>
            );

        default:
            return (
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Secret Access Value</label>
                    <input
                        type="password"
                        required
                        className={styles.formInput}
                        placeholder="Enter credentials secret key"
                        value={formData.apiKey || ""}
                        onChange={(e) => handleFieldChange("apiKey", e.target.value)}
                    />
                </div>
            );
    }
}
