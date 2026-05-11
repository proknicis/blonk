"use client";

import React, { useState } from "react";
import { Shield, Key, Zap, Users, Lock, ScanLine, Plus, Eye, EyeOff, Trash2, AlertTriangle, ShieldCheck, ChevronRight, CheckCircle2, Clock, Bell, Info, Activity, Globe, Settings } from "lucide-react";
import { updateSetting, addApiKey, removeApiKey } from "./actions";

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
        <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: "1.7rem", fontWeight: 950, letterSpacing: "-0.04em", margin: "0 0 6px 0", color: "#0F172A" }}>Security & Controls</h1>
                <p style={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 600, margin: 0 }}>
                    Manage access, protect your data, and control system behavior.
                </p>
            </div>

            {/* Metrics Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
                <MetricCard icon={<ShieldCheck size={20} color="#10B981" />} iconBg="#ECFDF5" title="Security Score" value={`${metrics.securityScore}%`} sub="Excellent" subColor="#10B981" />
                <MetricCard icon={<Users size={20} color="#3B82F6" />} iconBg="#EFF6FF" title="Active Users" value={metrics.activeUsers} sub="+2 this month" subColor="#10B981" />
                <MetricCard icon={<Lock size={20} color="#8B5CF6" />} iconBg="#F5F3FF" title="Roles" value={metrics.roles} sub="Manage access" />
                <MetricCard icon={<Key size={20} color="#F59E0B" />} iconBg="#FFFBEB" title="API Keys" value={keys.length} sub="Active" />
                <MetricCard icon={<Shield size={20} color="#10B981" />} iconBg="#ECFDF5" title="MFA" value="Enforced" sub="All users" subColor="#10B981" />
                <MetricCard icon={<ScanLine size={20} color="#8B5CF6" />} iconBg="#F5F3FF" title="Last Security Scan" value="2 days ago" sub="No issues found" subColor="#10B981" />
            </div>

            {/* Main Grid Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                
                {/* COLUMN 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Access Control */}
                    <SectionCard title="Access Control" desc="Manage users, roles and permissions." action="Manage Access">
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>ROLE</th>
                                    <th style={thStyle}>USERS</th>
                                    <th style={thStyle}>DESCRIPTION</th>
                                    <th style={{...thStyle, textAlign: 'right'}}>PERMISSIONS</th>
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
                                        <td style={tdStyle}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><div style={{width: 8, height: 8, borderRadius: '50%', background: row.c}}/>{row.r}</div></td>
                                        <td style={tdStyle}>{row.u}</td>
                                        <td style={tdStyle}>{row.d}</td>
                                        <td style={{...tdStyle, textAlign: 'right', color: row.c}}>{row.p}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <FooterLink text="View all roles" />
                    </SectionCard>

                    {/* Data & Encryption */}
                    <SectionCard title="Data & Encryption" desc="Protect and manage your data securely.">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                            <SettingsRow icon={<Shield size={16}/>} title="Encryption at Rest" desc="All data is encrypted" status="Enabled" statusColor="#10B981" />
                            <SettingsRow icon={<Lock size={16}/>} title="Encryption in Transit" desc="TLS 1.2+ for all connections" status="Enabled" statusColor="#10B981" />
                            <SettingsRow icon={<Globe size={16}/>} title="Data Residency" desc={residency === 'eu-cloud' ? "EU Sovereign Cloud (Frankfurt)" : "Local Node"} status={residency === 'eu-cloud' ? "EU" : "LOCAL"} />
                            <SettingsRow icon={<Clock size={16}/>} title="Backup & Retention" desc="Daily backups, 365 days retention" status="365 days" />
                        </div>
                        <FooterLink text="Manage data settings" />
                    </SectionCard>
                </div>

                {/* COLUMN 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* Authentication & Login */}
                    <SectionCard title="Authentication & Login" desc="Control how users sign in." action="Configure">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                            <SettingsRow icon={<ShieldCheck size={16} color="#10B981"/>} title="Multi-Factor Authentication (MFA)" desc="Required for all users" status="Enforced" statusColor="#10B981" />
                            <SettingsRow icon={<Lock size={16}/>} title="Password Policy" desc="Minimum 12 characters, strong passwords" status="Active" statusColor="#10B981" />
                            <SettingsRow icon={<Clock size={16}/>} title="Session Timeout" desc="30 minutes of inactivity" status="30m" />
                            <SettingsRow icon={<Bell size={16}/>} title="Login Notifications" desc="Email on new device login" status="Active" statusColor="#10B981" />
                        </div>
                        <FooterLink text="View login activity" />
                    </SectionCard>

                    {/* System & Workflow Controls */}
                    <SectionCard title="System & Workflow Controls" desc="Configure system behavior and limits.">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                            <SettingsRow icon={<Activity size={16}/>} title="Workflow Execution Limits" desc="Max 100 concurrent runs" status="100" showArrow />
                            <SettingsRow icon={<Clock size={16}/>} title="Loop Timeouts" desc="Max 30 minutes per execution" status="30m" showArrow />
                            <SettingsRow icon={<AlertTriangle size={16}/>} title="Error Notifications" desc="Email alerts on failures" status="Enabled" statusColor="#10B981" showArrow />
                            <SettingsRow icon={<Settings size={16}/>} title="Maintenance Mode" desc="System is operational" status="Disabled" showArrow />
                        </div>
                        <FooterLink text="View all system settings" />
                    </SectionCard>
                </div>

                {/* COLUMN 3 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {/* API Key Management */}
                    <SectionCard title="API Key Management" desc="Manage API keys for integrations." action={<><Plus size={14}/> Add Key</>}>
                        {addingKey && (
                            <div style={{ background: "#F8FAFC", padding: 12, borderRadius: 12, marginBottom: 16, border: "1px solid #E2E8F0" }}>
                                <input placeholder="Label" value={newLabel} onChange={e=>setNewLabel(e.target.value)} style={inputStyle} />
                                <input placeholder="Service" value={newService} onChange={e=>setNewService(e.target.value)} style={{...inputStyle, marginTop: 8}} />
                                <input placeholder="Key" type="password" value={newKey} onChange={e=>setNewKey(e.target.value)} style={{...inputStyle, marginTop: 8}} />
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button onClick={handleAddKey} style={{ flex: 1, padding: "6px", background: "#0F172A", color: "#fff", borderRadius: 8, fontSize: "0.8rem", fontWeight: 800 }}>Save</button>
                                    <button onClick={()=>setAddingKey(false)} style={{ flex: 1, padding: "6px", background: "transparent", color: "#64748B", borderRadius: 8, fontSize: "0.8rem", fontWeight: 800, border: "1px solid #CBD5E1" }}>Cancel</button>
                                </div>
                            </div>
                        )}
                        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>NAME</th>
                                    <th style={thStyle}>KEY</th>
                                    <th style={thStyle}>LAST USED</th>
                                    <th style={{...thStyle, textAlign: 'right'}}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {keys.map((k, i) => (
                                    <tr key={k.id}>
                                        <td style={tdStyle}>{k.label}</td>
                                        <td style={{...tdStyle, fontFamily: 'monospace'}}>{revealId===k.id ? k.key : "••••••8F2a"}</td>
                                        <td style={tdStyle}>{i===0 ? '2h ago' : '1d ago'}</td>
                                        <td style={{...tdStyle, textAlign: 'right', color: '#10B981'}}>Active</td>
                                    </tr>
                                ))}
                                {keys.length === 0 && (
                                    <tr><td colSpan={4} style={{...tdStyle, textAlign: 'center', color: '#94A3B8'}}>No API Keys</td></tr>
                                )}
                            </tbody>
                        </table>
                        <FooterLink text="View all API keys" />
                    </SectionCard>

                    {/* IP Allowlist */}
                    <SectionCard title="IP Allowlist" desc="Restrict access to trusted IP addresses." action="Configure">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                            <SettingsRow icon={<CheckCircle2 size={16} color="#10B981"/>} title="Allowlist Enabled" desc="Only allowlisted IPs can access the system." status={metrics.allowedIpsCount.toString()} statusSub="IPs allowed" />
                        </div>
                        <FooterLink text="View allowlist" />
                    </SectionCard>

                    {/* Audit & Monitoring */}
                    <SectionCard title="Audit & Monitoring" desc="Monitor activity and detect threats.">
                        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 12 }}>
                            <SettingsRow icon={<ShieldCheck size={16}/>} title="Audit Logging" desc="All actions are logged" status="Enabled" statusColor="#10B981" />
                            <SettingsRow icon={<ScanLine size={16}/>} title="Anomaly Detection" desc="AI-powered threat detection" status="Active" statusColor="#10B981" />
                            <SettingsRow icon={<AlertTriangle size={16}/>} title="Failed Login Attempts" desc="No suspicious activity" status="Clear" statusColor="#10B981" />
                        </div>
                        <FooterLink text="View audit logs" />
                    </SectionCard>
                </div>
                
                {/* Full Width Footer Section */}
                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
                    <div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 900, margin: "0 0 4px 0", color: "#0F172A" }}>Security Alerts & Recommendations</h3>
                        <p style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 600, margin: 0 }}>Stay informed about security risks and improvements.</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                        <AlertCard icon={<ShieldCheck size={18} color="#10B981"/>} title="All Systems Secure" desc="No active threats or vulnerabilities." />
                        <AlertCard icon={<AlertTriangle size={18} color="#F59E0B"/>} title="2 Recommendations" desc="Review recommended security actions." />
                        <AlertCard icon={<Info size={18} color="#8B5CF6"/>} title="Security Updates" desc="Last updated 2 days ago" />
                    </div>
                    <div style={{ textAlign: "right", marginTop: 4 }}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0F172A", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>View all alerts <ChevronRight size={14} /></span>
                    </div>
                </div>

            </div>
        </div>
    );
}

// --- Reusable Components ---

function MetricCard({ icon, iconBg, title, value, sub, subColor }: any) {
    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 950, color: "#0F172A" }}>{value}</div>
            </div>
            {sub && <div style={{ fontSize: "0.75rem", fontWeight: 800, color: subColor || "#94A3B8" }}>{sub}</div>}
        </div>
    )
}

function SectionCard({ title, desc, action, children }: any) {
    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 900, margin: "0 0 4px 0", color: "#0F172A" }}>{title}</h3>
                    <p style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600, margin: 0 }}>{desc}</p>
                </div>
                {action && (
                    <button style={{ background: "transparent", border: "none", fontSize: "0.75rem", fontWeight: 800, color: "#0F172A", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ color: "#94A3B8" }}>{icon}</div>
                <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0F172A" }}>{title}</div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#64748B" }}>{desc}</div>
                </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 800, color: statusColor || "#64748B" }}>{status}</div>
                    {statusSub && <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#94A3B8" }}>{statusSub}</div>}
                </div>
                {showArrow && <ChevronRight size={14} color="#CBD5E1" />}
            </div>
        </div>
    )
}

function FooterLink({ text }: { text: string }) {
    return (
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#0F172A" }}>{text}</span>
            <ChevronRight size={14} color="#94A3B8" />
        </div>
    )
}

function AlertCard({ icon, title, desc }: any) {
    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: "0.85rem", fontWeight: 900, color: "#0F172A" }}>{title}</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#64748B" }}>{desc}</div>
            </div>
        </div>
    )
}

// --- Inline Styles ---
const thStyle = { fontSize: "0.65rem", fontWeight: 900, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "8px 0", borderBottom: "1px solid #F1F5F9", textAlign: "left" as const };
const tdStyle = { fontSize: "0.8rem", fontWeight: 700, color: "#475569", padding: "10px 0", borderBottom: "1px solid #F1F5F9" };
const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #CBD5E1", borderRadius: 8, fontSize: "0.8rem", outline: "none", boxSizing: "border-box" as const };
