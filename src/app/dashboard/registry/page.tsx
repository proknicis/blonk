"use client";

import styles from "./registry.module.css";
import React, { useState, useEffect } from "react";
import { 
    Search, Filter, ShieldCheck, Zap, DownloadCloud, Server, 
    ArrowUpRight, Plus, Cpu, Activity, LayoutGrid, CheckCircle
} from "lucide-react";

const officialAgents = [
    {
        id: "a1",
        name: "Stripe Ledger Sync",
        desc: "Automated reconciliation of incoming payments with primary internal ledgers.",
        version: "v2.1.0",
        protocol: "REST API",
        security: "Grade A",
        color: "#6366F1",
        verified: true,
        installs: "14.2k"
    },
    {
        id: "a2",
        name: "Okta Policy Engine",
        desc: "Continuous synchronization of user access policies across all internal nodes.",
        version: "v1.8.4",
        protocol: "SAML 2.0",
        security: "Grade A+",
        color: "#3B82F6",
        verified: true,
        installs: "8.9k"
    },
    {
        id: "a3",
        name: "AWS Resource Watch",
        desc: "Real-time telemetry and state monitoring for cloud infrastructure units.",
        version: "v3.0.1",
        protocol: "gRPC",
        security: "Grade A",
        color: "#F59E0B",
        verified: true,
        installs: "22.1k"
    },
    {
        id: "a4",
        name: "Slack Comms Hub",
        desc: "Bidirectional incident routing and operational alert broadcasting.",
        version: "v1.2.0",
        protocol: "Webhooks",
        security: "Grade B+",
        color: "#EC4899",
        verified: true,
        installs: "35.4k"
    },
    {
        id: "a5",
        name: "Snowflake Data Sync",
        desc: "Batch processing and warehousing pipeline for operational telemetry.",
        version: "v4.1.2",
        protocol: "JDBC",
        security: "Grade A+",
        color: "#06B6D4",
        verified: true,
        installs: "6.7k"
    },
    {
        id: "a6",
        name: "Datadog Diagnostics",
        desc: "Advanced trace analysis and fleet-wide metric aggregation.",
        version: "v2.5.0",
        protocol: "Agent",
        security: "Grade A",
        color: "#8B5CF6",
        verified: true,
        installs: "11.3k"
    }
];

export default function RegistryPage() {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState("Official Agents");

    const tabs = ["Official Agents", "Community Connectors", "Custom Provisioning"];

    return (
        <div className={styles.registryContainer}>
            {/* HEADER */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.title}>Marketplace Management</h1>
                    <p className={styles.subtitle}>
                        Discover, provision, and deploy institutional-grade operational units.
                    </p>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.provisionBtn}>
                        <Plus size={16} /> New Custom Unit
                    </button>
                </div>
            </div>

            {/* CONTROLS */}
            <div className={styles.controlsRow}>
                <div className={styles.tabs}>
                    {tabs.map(tab => (
                        <button 
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className={styles.searchFilter}>
                    <div className={styles.searchBox}>
                        <Search size={16} color="#64748B" />
                        <input 
                            type="text" 
                            placeholder="Search modules..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className={styles.filterBtn}>
                        <Filter size={16} />
                        Filter by Protocol
                    </button>
                </div>
            </div>

            {/* STATS STRIP */}
            <div className={styles.statsStrip}>
                <div className={styles.statBox}>
                    <ShieldCheck className={styles.statIcon} color="#10B981" />
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Verified Nodes</span>
                        <span className={styles.statValue}>142 Available</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <Activity className={styles.statIcon} color="#3B82F6" />
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>Global Installs</span>
                        <span className={styles.statValue}>1.2M+ Active</span>
                    </div>
                </div>
                <div className={styles.statBox}>
                    <Server className={styles.statIcon} color="#8B5CF6" />
                    <div className={styles.statInfo}>
                        <span className={styles.statLabel}>System Health</span>
                        <span className={styles.statValue}>All Systems Nominal</span>
                    </div>
                </div>
            </div>

            {/* GRID */}
            <div className={styles.agentGrid}>
                {officialAgents.filter(a => a.name.toLowerCase().includes(search.toLowerCase())).map(agent => (
                    <div key={agent.id} className={styles.agentCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.agentIcon} style={{ backgroundColor: `${agent.color}15`, color: agent.color }}>
                                <Cpu size={24} />
                            </div>
                            {agent.verified && (
                                <div className={styles.verifiedBadge}>
                                    <CheckCircle size={12} />
                                    Verified Node
                                </div>
                            )}
                        </div>

                        <div className={styles.cardBody}>
                            <h3 className={styles.agentName}>{agent.name}</h3>
                            <p className={styles.agentDesc}>{agent.desc}</p>
                        </div>

                        <div className={styles.specsGrid}>
                            <div className={styles.specItem}>
                                <span className={styles.specLabel}>Version</span>
                                <span className={styles.specValue}>{agent.version}</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.specLabel}>Protocol</span>
                                <span className={styles.specValue}>{agent.protocol}</span>
                            </div>
                            <div className={styles.specItem}>
                                <span className={styles.specLabel}>Security</span>
                                <span className={styles.specValue} style={{ color: agent.security.includes('A') ? '#10B981' : '#F59E0B' }}>
                                    {agent.security}
                                </span>
                            </div>
                        </div>

                        <div className={styles.cardActions}>
                            <button className={styles.btnProvision}>
                                <DownloadCloud size={16} /> Provision Node
                            </button>
                            <button className={styles.btnSpecs}>
                                View Specs
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
