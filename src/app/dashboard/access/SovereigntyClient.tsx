"use client";

import React, { useState } from "react";
import { Shield, Key, Zap, Users, Lock, ScanLine, Plus, Eye, EyeOff, Trash2, AlertTriangle, ShieldCheck, ChevronRight, CheckCircle2, Clock, Bell, Info, Activity, Globe, Settings } from "lucide-react";
import { updateSetting, addApiKey, removeApiKey } from "./actions";
import styles from "./sovereignty.module.css";

interface ApiKey {
    id: string;
    label: string;
    service: string;
    key: string;
    added: string;
}

interface SovereigntyClientProps {
    initialResidency: "eu-cloud" | "local";
    initialKillSwitch: boolean;
    initialKeys: ApiKey[];
    metrics: {
        securityScore: number;
        activeUsers: number;
        roles: number;
        allowlistEnabled: boolean;
        allowedIpsCount: number;
    }
}

export default function SovereigntyClient({ initialResidency, initialKillSwitch, initialKeys, metrics }: SovereigntyClientProps) {
    const [residency, setResidency] = useState<"eu-cloud" | "local">(initialResidency);
    const [killSwitchArmed, setKillSwitchArmed] = useState(initialKillSwitch);
    const [killConfirm, setKillConfirm] = useState(false);
    const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
    
    const [revealId, setRevealId] = useState<string | null>(null);
    const [addingKey, setAddingKey] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newKey, setNewKey] = useState("");
    const [newService, setNewService] = useState("");

    const handleResidencyChange = async (val: "eu-cloud" | "local") => {
        setResidency(val);
        await updateSetting("residency", val);
    };

    const handleAddKey = async () => {
        if (!newLabel || !newKey) return;
        const newEntry = {
            id: `k${Date.now()}`,
            label: newLabel,
            service: newService || "Custom",
            key: newKey,
            added: new Date().toISOString().split("T")[0]
        };
        setKeys(prev => [...prev, newEntry]);
        setNewLabel(""); setNewKey(""); setNewService(""); setAddingKey(false);
        await addApiKey(newEntry);
    };

    const handleDeleteKey = async (id: string) => {
        setKeys(prev => prev.filter(x => x.id !== id));
        await removeApiKey(id);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.headerTitle}>Security & Controls</h1>
                <p className={styles.headerSubtitle}>
                    Manage access, protect your data, and control system behavior.
                </p>
            </div>

            {/* Metrics Row */}
            <div className={styles.metricsRow}>
                <MetricCard icon={<ShieldCheck size={20} color="#10B981" />} iconBg="#ECFDF5" title="Security Score" value={`${metrics.securityScore}%`} sub="Excellent" subColor="#10B981" />
                <MetricCard icon={<Users size={20} color="#3B82F6" />} iconBg="#EFF6FF" title="Active Users" value={metrics.activeUsers} sub="+2 this month" subColor="#10B981" />
                <MetricCard icon={<Lock size={20} color="#8B5CF6" />} iconBg="#F5F3FF" title="Roles" value={metrics.roles} sub="Manage access" />
                <MetricCard icon={<Key size={20} color="#F59E0B" />} iconBg="#FFFBEB" title="API Keys" value={keys.length} sub="Active" />
                <MetricCard icon={<Shield size={20} color="#10B981" />} iconBg="#ECFDF5" title="MFA" value="Enforced" sub="All users" subColor="#10B981" />
                <MetricCard icon={<ScanLine size={20} color="#8B5CF6" />} iconBg="#F5F3FF" title="Last Security Scan" value="2 days ago" sub="No issues found" subColor="#10B981" />
            </div>

            {/* Main Grid Layout */}
            <div className={styles.mainLayout}>
                
                {/* COLUMN 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Access Control */}
                    <SectionCard title="Access Control" desc="Manage users, roles and permissions." action="Manage Access">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ROLE</th>
                                    <th>USERS</th>
                                    <th>DESCRIPTION</th>
                                    <th style={{ textAlign: 'right' }}>PERMISSIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { r: 'Owner', u: 1, d: 'Full system access', p: 'Full Access', c: '#10B981' },
                                    { r: 'Admin', u: 2, d: 'Manage team & settings', p: 'High', c: '#3B82F6' },
                                    { r: 'Editor', u: 1, d: 'Create & edit workflows', p: 'Medium', c: '#8B5CF6' },
                                    { r: 'Viewer', u: 1, d: 'View workflows and runs', p: 'Read Only', c: '#64748B' },
                                    { r: 'Paused', u: 1, d: 'No access while paused', p: 'None', c: '#94A3B8' }
                                ].map((row, i) => (
                                    <tr key={i}>
                                        <td><div className={styles.roleCell}><div className={styles.roleDot} style={{ background: row.c }}></div>{row.r}</div></td>
                                        <td>{row.u}</td>
                                        <td>{row.d}</td>
                                        <td className={styles.permissionCell} style={{ color: row.c }}>{row.p}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <FooterLink text="View all roles" />
                    </SectionCard>

                    {/* Data & Encryption */}
                    <SectionCard title="Data & Encryption" desc="Protect and manage your data securely.">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <SettingsRow icon={<Shield size={16}/>} title="Encryption at Rest" desc="All data is encrypted" status="Enabled" statusColor="#10B981" />
                            <SettingsRow icon={<Lock size={16}/>} title="Encryption in Transit" desc="TLS 1.2+ for all connections" status="Enabled" statusColor="#10B981" />
                            <SettingsRow icon={<Globe size={16}/>} title="Data Residency" desc={residency === 'eu-cloud' ? "EU Sovereign Cloud (Frankfurt)" : "Local Node"} status={residency === 'eu-cloud' ? "EU" : "LOCAL"} />
                            <SettingsRow icon={<Clock size={16}/>} title="Backup & Retention" desc="Daily backups, 365 days retention" status="365 days" />
                        </div>
                        <FooterLink text="Manage data settings" />
                    </SectionCard>
                </div>

                {/* COLUMN 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Authentication & Login */}
                    <SectionCard title="Authentication & Login" desc="Control how users sign in." action="Configure">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <SettingsRow icon={<ShieldCheck size={16} color="#10B981"/>} title="Multi-Factor Authentication (MFA)" desc="Required for all users" status="Enforced" statusColor="#10B981" />
                            <SettingsRow icon={<Lock size={16}/>} title="Password Policy" desc="Minimum 12 characters, strong passwords" status="Active" statusColor="#10B981" />
                            <SettingsRow icon={<Clock size={16}/>} title="Session Timeout" desc="30 minutes of inactivity" status="30m" />
                            <SettingsRow icon={<Bell size={16}/>} title="Login Notifications" desc="Email on new device login" status="Active" statusColor="#10B981" />
                        </div>
                        <FooterLink text="View login activity" />
                    </SectionCard>

                    {/* System & Workflow Controls */}
                    <SectionCard title="System & Workflow Controls" desc="Configure system behavior and limits.">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <SettingsRow icon={<Activity size={16}/>} title="Workflow Execution Limits" desc="Max 100 concurrent runs" status="100" showArrow />
                            <SettingsRow icon={<Clock size={16}/>} title="Loop Timeouts" desc="Max 30 minutes per execution" status="30m" showArrow />
                            <SettingsRow icon={<AlertTriangle size={16}/>} title="Error Notifications" desc="Email alerts on failures" status="Enabled" statusColor="#10B981" showArrow />
                            <SettingsRow icon={<Settings size={16}/>} title="Maintenance Mode" desc="System is operational" status="Disabled" showArrow />
                        </div>
                        <FooterLink text="View all system settings" />
                    </SectionCard>
                </div>

                {/* COLUMN 3 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* API Key Management */}
                    <SectionCard title="API Key Management" desc="Manage API keys for integrations." action={<><Plus size={14}/> Add Key</>}>
                        {addingKey && (
                            <div className={styles.addKeyForm}>
                                <input placeholder="Label" value={newLabel} onChange={e=>setNewLabel(e.target.value)} className={styles.addKeyInput} />
                                <input placeholder="Service" value={newService} onChange={e=>setNewService(e.target.value)} className={styles.addKeyInput} />
                                <input placeholder="Key" type="password" value={newKey} onChange={e=>setNewKey(e.target.value)} className={styles.addKeyInput} />
                                <div className={styles.addKeyButtons}>
                                    <button onClick={handleAddKey} className={styles.btnPrimary}>Save</button>
                                    <button onClick={()=>setAddingKey(false)} className={styles.btnSecondary}>Cancel</button>
                                </div>
                            </div>
                        )}
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>NAME</th>
                                    <th>KEY</th>
                                    <th>LAST USED</th>
                                    <th style={{ textAlign: 'right' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((k, i) => (
                                    <tr key={k.id}>
                                        <td>{k.label}</td>
                                        <td style={{ fontFamily: 'monospace' }}>{revealId===k.id ? k.key : "••••••8F2a"}</td>
                                        <td>{i===0 ? '2h ago' : '1d ago'}</td>
                                        <td style={{ textAlign: 'right', color: '#10B981' }}>Active</td>
                                    </tr>
                                ))}
                                {keys.length === 0 && (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94A3B8', padding: '20px 0' }}>No API Keys</td></tr>
                                )}
                            </tbody>
                        </table>
                        <FooterLink text="View all API keys" />
                    </SectionCard>

                    {/* IP Allowlist */}
                    <SectionCard title="IP Allowlist" desc="Restrict access to trusted IP addresses." action="Configure">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <SettingsRow icon={<CheckCircle2 size={16} color="#10B981"/>} title="Allowlist Enabled" desc="Only allowlisted IPs can access the system." status={metrics.allowedIpsCount.toString()} statusSub="IPs allowed" />
                        </div>
                        <FooterLink text="View allowlist" />
                    </SectionCard>

                    {/* Audit & Monitoring */}
                    <SectionCard title="Audit & Monitoring" desc="Monitor activity and detect threats.">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <SettingsRow icon={<ShieldCheck size={16}/>} title="Audit Logging" desc="All actions are logged" status="Enabled" statusColor="#10B981" />
                            <SettingsRow icon={<ScanLine size={16}/>} title="Anomaly Detection" desc="AI-powered threat detection" status="Active" statusColor="#10B981" />
                            <SettingsRow icon={<AlertTriangle size={16}/>} title="Failed Login Attempts" desc="No suspicious activity" status="Clear" statusColor="#10B981" />
                        </div>
                        <FooterLink text="View audit logs" />
                    </SectionCard>
                </div>
                
                {/* Full Width Footer Section */}
                <div className={styles.alertsSection}>
                    <div className={styles.alertsHeader}>
                        <h3 className={styles.alertsTitle}>Security Alerts & Recommendations</h3>
                        <p className={styles.alertsSubtitle}>Stay informed about security risks and improvements.</p>
                    </div>
                    <div className={styles.alertsGrid}>
                        <AlertCard icon={<ShieldCheck size={18} color="#10B981"/>} title="All Systems Secure" desc="No active threats or vulnerabilities." />
                        <AlertCard icon={<AlertTriangle size={18} color="#F59E0B"/>} title="2 Recommendations" desc="Review recommended security actions." />
                        <AlertCard icon={<Info size={18} color="#8B5CF6"/>} title="Security Updates" desc="Last updated 2 days ago" />
                    </div>
                    <div className={styles.alertsFooter}>
                        <span className={styles.viewAllAlerts}>View all alerts <ChevronRight size={14} /></span>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- Reusable Components ---

function MetricCard({ icon, iconBg, title, value, sub, subColor }: any) {
    return (
        <div className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ background: iconBg }}>
                {icon}
            </div>
            <div>
                <div className={styles.metricLabel}>{title}</div>
                <div className={styles.metricValue}>{value}</div>
            </div>
            {sub && <div className={`${styles.metricSub} ${subColor ? styles.metricSubGreen : ''}`}>{sub}</div>}
        </div>
    )
}

function SectionCard({ title, desc, action, children }: any) {
    return (
        <div className={styles.sectionCard}>
            <div className={styles.sectionCardHeader}>
                <div>
                    <h3 className={styles.sectionCardTitle}>{title}</h3>
                    <p className={styles.sectionCardDesc}>{desc}</p>
                </div>
                {action && (
                    <button className={styles.sectionCardAction}>
                        {action}
                    </button>
                )}
            </div>
            {children}
        </div>
    )
}

function SettingsRow({ icon, title, desc, status, statusColor, statusSub, showArrow }: any) {
    return (
        <div className={styles.settingsRow}>
            <div className={styles.settingsRowLeft}>
                <div className={styles.settingsRowIcon}>{icon}</div>
                <div className={styles.settingsRowInfo}>
                    <div className={styles.settingsRowTitle}>{title}</div>
                    <div className={styles.settingsRowDesc}>{desc}</div>
                </div>
            </div>
            <div className={styles.settingsRowRight}>
                <div className={styles.settingsRowStatus}>
                    <div className={styles.settingsRowStatusValue} style={{ color: statusColor || '#64748B' }}>{status}</div>
                    {statusSub && <div className={styles.settingsRowStatusSub}>{statusSub}</div>}
                </div>
                {showArrow && <ChevronRight size={14} color="#CBD5E1" />}
            </div>
        </div>
    )
}

function FooterLink({ text }: { text: string }) {
    return (
        <div className={styles.footerLink}>
            <span className={styles.footerLinkText}>{text}</span>
            <ChevronRight size={14} color="#94A3B8" />
        </div>
    )
}

function AlertCard({ icon, title, desc }: any) {
    return (
        <div className={styles.alertCard}>
            <div className={styles.alertCardIcon}>
                {icon}
            </div>
            <div className={styles.alertCardContent}>
                <div className={styles.alertCardTitle}>{title}</div>
                <div className={styles.alertCardDesc}>{desc}</div>
            </div>
        </div>
    )
}
