"use client";

import React, { useState, useMemo } from "react";
import { Check, Copy, Globe, RefreshCw } from "lucide-react";
import styles from "./webhooks.module.css";

interface WebhookItem {
    id: string;
    name: string;
    url: string;
    workflow: string;
    rate: string;
    status: string;
}

const DEFAULT_WEBHOOKS: WebhookItem[] = [
    { id: "wh-1", name: "Client Intake Live Connection Trigger", url: "https://api.blonk.sovereign/connection/v1/client-intake", workflow: "Client Onboarding Setup", rate: "24 req/day", status: "Active" },
    { id: "wh-2", name: "Stripe Invoice Live Connection Receiver", url: "https://api.blonk.sovereign/connection/v1/stripe-invoice", workflow: "Invoice Processing Loop", rate: "8 req/day", status: "Active" },
    { id: "wh-3", name: "Slack Interactive Action Endpoint", url: "https://api.blonk.sovereign/connection/v1/slack-actions", workflow: "Slack Triage Bot", rate: "125 req/day", status: "Active" }
];

export default function WebhooksClient({ initialWorkflows }: { initialWorkflows: any[] }) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const webhooksList: WebhookItem[] = useMemo(() => {
        const list = [...DEFAULT_WEBHOOKS];
        initialWorkflows.forEach(w => {
            if (!list.some(item => item.workflow.toLowerCase() === w.name.toLowerCase())) {
                list.push({
                    id: w.id,
                    name: `${w.name} Live Connection`,
                    url: w.n8nWebhookUrl ? w.n8nWebhookUrl.replace(/n8n\.blonk\.sovereign\/webhook/gi, "api.blonk.sovereign/connection") : "https://api.blonk.sovereign/connection/v1/custom",
                    workflow: w.name,
                    rate: "0 req/day",
                    status: w.status === "Active" ? "Active" : "Inactive"
                });
            }
        });
        return list;
    }, [initialWorkflows]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <main className={styles.container} aria-label="Live Connections and API Endpoints Console">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Live Connections</h1>
                    <p className={styles.subtitle}>Expose secure endpoint listener routes to integrate external live connections with local automation queues.</p>
                </div>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.ledgerTable}>
                    <thead>
                        <tr>
                            <th>Endpoint Name</th>
                            <th>Connection URL</th>
                            <th>Linked Automation</th>
                            <th>Call Volume</th>
                            <th style={{ textAlign: "right" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {webhooksList.map(wh => {
                            const isCopied = copiedId === wh.id;
                            
                            return (
                                <tr key={wh.id}>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <Globe size={16} color="#64748B" />
                                            <span style={{ fontWeight: 800, color: "#020617", fontSize: "0.85rem" }}>{wh.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <code className={styles.codeBox} title={wh.url}>
                                                {wh.url}
                                            </code>
                                            <button 
                                                className={styles.copyBtn}
                                                onClick={() => handleCopy(wh.url, wh.id)}
                                                aria-label={`Copy Connection URL for ${wh.name}`}
                                            >
                                                {isCopied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: "#475569", fontSize: "0.8rem" }}>{wh.workflow}</td>
                                    <td style={{ fontSize: "0.78rem", color: "#64748B" }}>{wh.rate}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <span className={`${styles.statusLabel} ${styles.statusSuccess}`}>
                                            {wh.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
