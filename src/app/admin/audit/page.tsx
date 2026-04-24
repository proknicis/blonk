"use client";

import React, { useState, useEffect } from "react";
import { 
    ShieldCheck, 
    Search, 
    Filter, 
    Download, 
    FileText, 
    Activity, 
    AlertTriangle, 
    Lock, 
    Eye,
    Calendar,
    ChevronDown,
    RefreshCcw,
    Database,
    Fingerprint
} from "lucide-react";
import styles from "../marketplace/marketplace.module.css";
import adminStyles from "../admin.module.css";
import { Skeleton } from "../../components/Skeleton";

interface AuditLog {
    id: string;
    action: string;
    category: string;
    actor: string;
    target: string;
    status: "Success" | "Failure" | "Warning";
    timestamp: string;
    details: string;
}

export default function AuditVaultPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setIsLoading(true);
        // Simulated institutional audit trail
        setTimeout(() => {
            setLogs([
                { id: "AUD-8821", action: "Node Provisioning", category: "System", actor: "Admin Control", target: "Stripe-Sync-01", status: "Success", timestamp: new Date().toISOString(), details: "Cluster handshake completed successfully." },
                { id: "AUD-8822", action: "Workflow Update", category: "Marketplace", actor: "Product Team", target: "Invoice Automator", status: "Success", timestamp: new Date(Date.now() - 3600000).toISOString(), details: "JSON protocol version updated to 4.2.1." },
                { id: "AUD-8823", action: "Unauthorized Access Attempt", category: "Security", actor: "192.168.1.45", target: "Vault API", status: "Failure", timestamp: new Date(Date.now() - 7200000).toISOString(), details: "Multiple invalid API key attempts detected." },
                { id: "AUD-8824", action: "Billing Calibration", category: "Finance", actor: "System Task", target: "User ID 229", status: "Success", timestamp: new Date(Date.now() - 86400000).toISOString(), details: "Monthly institutional license renewed." },
                { id: "AUD-8825", action: "Database Optimization", category: "Infrastructure", actor: "System Cron", target: "PG Vector Store", status: "Warning", timestamp: new Date(Date.now() - 172800000).toISOString(), details: "Index fragmentation detected above 15% threshold." },
            ]);
            setIsLoading(false);
        }, 1000);
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             log.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "All" || log.category === activeFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* AUDIT HEADER */}
            <div className={adminStyles.integrityPanel} style={{ background: 'var(--foreground)', border: 'none', padding: '40px 48px', borderRadius: '32px' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--background)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Lock size={32} color="var(--foreground)" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <div style={{ padding: '4px 10px', background: '#10B981', color: 'var(--background)', borderRadius: '6px', fontSize: '0.6rem', fontWeight: 950, letterSpacing: '0.15em' }}>COMPLIANCE SECURED</div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}>IMMUTABLE LEDGER</span>
                        </div>
                        <h2 style={{ color: 'var(--background)', fontSize: '2.25rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0 }}>Audit Vault</h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem', fontWeight: 750, margin: '8px 0 0' }}>Comprehensive telemetry of all institutional operations and security events.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <button className={adminStyles.primaryBtn} style={{ background: 'var(--background)', color: 'var(--foreground)', border: 'none', padding: '0 24px', height: '48px', width: 'auto' }}>
                        <Download size={16} style={{ marginRight: '8px' }} /> Export Reports
                    </button>
                </div>
            </div>

            {/* METRICS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '12px' }}>Total Events</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 950 }}>{isLoading ? '...' : '142,881'}</div>
                </div>
                <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '12px' }}>Security Alerts</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 950, color: '#EF4444' }}>{isLoading ? '...' : '12'}</div>
                </div>
                <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '12px' }}>Compliance Score</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 950, color: '#10B981' }}>{isLoading ? '...' : '99.8%'}</div>
                </div>
                <div style={{ background: 'var(--background)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border)' }}>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', marginBottom: '12px' }}>Data Integrity</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 950, color: 'var(--accent)' }}>{isLoading ? '...' : 'Verified'}</div>
                </div>
            </div>

            {/* REGISTRY SECTION */}
            <div className={adminStyles.registryCard} style={{ borderRadius: '32px', border: '1px solid var(--border)' }}>
                <div className={adminStyles.registryHeader} style={{ padding: '32px 40px' }}>
                    <div>
                        <h3 className={adminStyles.registryTitle}>Compliance Ledger</h3>
                        <p className={adminStyles.registrySubtitle}>Real-time streaming of all system-critical operations.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div className={adminStyles.filterBar}>
                            {["All", "System", "Security", "Finance", "Infrastructure"].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`${adminStyles.filterBtn} ${activeFilter === f ? adminStyles.filterBtnActive : ''}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                        <div className={adminStyles.searchContainer}>
                            <Search className={adminStyles.searchIcon} size={18} />
                            <input 
                                type="text" 
                                placeholder="Search the vault..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={adminStyles.searchField}
                            />
                        </div>
                    </div>
                </div>

                <div className={adminStyles.tableWrapper} style={{ padding: '0 40px 40px' }}>
                    <table className={adminStyles.registryTable}>
                        <thead>
                            <tr>
                                <th className={adminStyles.registryTH}>EVENT ID</th>
                                <th className={adminStyles.registryTH}>ACTION</th>
                                <th className={adminStyles.registryTH}>ACTOR</th>
                                <th className={adminStyles.registryTH}>STATUS</th>
                                <th className={adminStyles.registryTH}>TIMESTAMP</th>
                                <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>DETAILS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i}>
                                        <td colSpan={6} style={{ padding: '12px 0' }}><Skeleton width="100%" height="48px" borderRadius="12px" /></td>
                                    </tr>
                                ))
                            ) : filteredLogs.map(log => (
                                <tr key={log.id} className={adminStyles.registryRow} style={{ height: '72px' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Fingerprint size={14} color="var(--muted-foreground)" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)' }}>{log.id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 950, color: 'var(--foreground)' }}>{log.action}</div>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 750, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>{log.category}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', background: 'var(--muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 950 }}>{log.actor.charAt(0)}</div>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>{log.actor}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.65rem', 
                                            fontWeight: 950, 
                                            width: 'fit-content',
                                            background: log.status === 'Success' ? '#10B98115' : (log.status === 'Warning' ? '#F59E0B15' : '#EF444415'),
                                            color: log.status === 'Success' ? '#10B981' : (log.status === 'Warning' ? '#F59E0B' : '#EF4444'),
                                            border: `1px solid ${log.status === 'Success' ? '#10B98120' : (log.status === 'Warning' ? '#F59E0B20' : '#EF444420')}`
                                        }}>
                                            {log.status.toUpperCase()}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted-foreground)' }}>
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 750, color: 'var(--muted-foreground)', opacity: 0.6 }}>
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className={adminStyles.actionIconBtn} title={log.details}>
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
