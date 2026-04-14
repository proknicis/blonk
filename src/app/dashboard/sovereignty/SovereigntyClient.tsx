"use client";

import React, { useState } from "react";
import { Shield, Key, Zap, ToggleLeft, ToggleRight, Plus, Eye, EyeOff, Trash2, AlertTriangle } from "lucide-react";
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
}

export default function SovereigntyClient({ initialResidency, initialKillSwitch, initialKeys }: SovereigntyClientProps) {
    const [residency, setResidency] = useState<"eu-cloud" | "local">(initialResidency);
    const [killSwitchArmed, setKillSwitchArmed] = useState(initialKillSwitch);
    const [killConfirm, setKillConfirm] = useState(false);
    const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
    
    const [revealId, setRevealId] = useState<string | null>(null);
    const [addingKey, setAddingKey] = useState(false);
    
    // new key form
    const [newLabel, setNewLabel] = useState("");
    const [newKey, setNewKey] = useState("");
    const [newService, setNewService] = useState("");

    const handleResidencyChange = async (val: "eu-cloud" | "local") => {
        setResidency(val);
        await updateSetting("residency", val);
    };

    const handleKillSwitch = async () => {
        if (!killConfirm) { setKillConfirm(true); return; }
        setKillSwitchArmed(true);
        setKillConfirm(false);
        await updateSetting("kill_switch_armed", "true");
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
        
        // Optimistic UI
        setKeys(prev => [...prev, newEntry]);
        setNewLabel(""); setNewKey(""); setNewService(""); setAddingKey(false);
        
        // Persist to DB
        await addApiKey(newEntry);
    };

    const handleDeleteKey = async (id: string) => {
        setKeys(prev => prev.filter(x => x.id !== id));
        await removeApiKey(id);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
                <div style={{ fontSize: "0.7rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--accent)", marginBottom: 6 }}>Governance & Control</div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 950, letterSpacing: "-0.03em", margin: 0 }}>Sovereignty Settings</h2>
                <p style={{ fontSize: "0.88rem", color: "var(--muted-foreground)", marginTop: 6 }}>
                    You set the rules. Control where your data lives, what integrations are active, and how to respond in an emergency.
                </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Data Residency */}
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, padding: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(52,209,134,0.1)", border: "1px solid rgba(52,209,134,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
                            <Shield size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em" }}>Data Residency</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Where your data is processed</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {[
                            { id: "eu-cloud", label: "EU Sovereign Cloud", sub: "Frankfurt, Germany · ISO 27001 certified" },
                            { id: "local", label: "Local Node Only", sub: "Process on-premise, no external transfer" },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => handleResidencyChange(opt.id as any)}
                                style={{
                                    display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                                    background: residency === opt.id ? "var(--foreground)" : "var(--muted)",
                                    color: residency === opt.id ? "var(--background)" : "var(--foreground)",
                                    border: `1px solid ${residency === opt.id ? "var(--foreground)" : "var(--border)"}`,
                                    borderRadius: 14, cursor: "pointer", textAlign: "left", transition: "all 0.2s"
                                }}
                            >
                                <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${residency === opt.id ? "var(--background)" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {residency === opt.id && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--background)" }} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, fontSize: "0.88rem" }}>{opt.label}</div>
                                    <div style={{ fontSize: "0.73rem", opacity: 0.6, marginTop: 2 }}>{opt.sub}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Kill Switch */}
                <div style={{ background: "var(--card)", border: `1px solid ${killSwitchArmed ? "#ef4444" : "var(--border)"}`, borderRadius: 24, padding: 32, transition: "border-color 0.3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: killSwitchArmed ? "rgba(239,68,68,0.12)" : "rgba(239,68,68,0.08)", border: `1px solid ${killSwitchArmed ? "rgba(239,68,68,0.4)" : "rgba(239,68,68,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                            <Zap size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 900, fontSize: "1rem", letterSpacing: "-0.02em" }}>Emergency Kill Switch</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Halt all active processes instantly</div>
                        </div>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: 20 }}>
                        Immediately terminates all running automations across your entire firm. Use in case of a data incident or emergency.
                    </p>
                    {killSwitchArmed ? (
                        <div style={{ padding: "14px 18px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, fontSize: "0.85rem", fontWeight: 800, color: "#ef4444", display: "flex", alignItems: "center", gap: 8 }}>
                            <AlertTriangle size={16} /> All processes halted. Re-activate from Mission Control.
                        </div>
                    ) : (
                        <button
                            onClick={handleKillSwitch}
                            style={{ width: "100%", padding: "14px", background: killConfirm ? "#ef4444" : "transparent", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 14, fontWeight: 900, fontSize: "0.88rem", cursor: "pointer", transition: "all 0.2s" }}
                        >
                            {killConfirm ? "⚠ Confirm — Stop All Processes" : "Activate Kill Switch"}
                        </button>
                    )}
                </div>
            </div>

            {/* API Key Management */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 24, overflow: "hidden" }}>
                <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Key size={18} style={{ color: "var(--muted-foreground)" }} />
                        <div>
                            <div style={{ fontWeight: 900, fontSize: "1rem" }}>API Key Vault</div>
                            <div style={{ fontSize: "0.78rem", color: "var(--muted-foreground)" }}>Connect your external service credentials securely</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setAddingKey(true)}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "var(--foreground)", color: "var(--background)", border: "none", borderRadius: 10, fontWeight: 800, fontSize: "0.82rem", cursor: "pointer" }}
                    >
                        <Plus size={14} /> Add Key
                    </button>
                </div>

                {addingKey && (
                    <div style={{ padding: "20px 28px", borderBottom: "1px solid var(--border)", background: "var(--muted)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                        {[
                            { value: newLabel, set: setNewLabel, placeholder: "Label (e.g. OpenAI GPT-4)", width: 200 },
                            { value: newService, set: setNewService, placeholder: "Service (e.g. OpenAI)", width: 160 },
                            { value: newKey, set: setNewKey, placeholder: "Paste API key...", width: 280 },
                        ].map((f, i) => (
                            <input key={i} type={i === 2 ? "password" : "text"} placeholder={f.placeholder} value={f.value}
                                onChange={e => f.set(e.target.value)}
                                style={{ width: f.width, height: 38, padding: "0 14px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, fontSize: "0.85rem", fontWeight: 600, color: "var(--foreground)", outline: "none" }}
                            />
                        ))}
                        <button onClick={handleAddKey} style={{ height: 38, padding: "0 18px", background: "var(--accent)", color: "#111", border: "none", borderRadius: 10, fontWeight: 900, fontSize: "0.82rem", cursor: "pointer" }}>Save</button>
                        <button onClick={() => setAddingKey(false)} style={{ height: 38, padding: "0 18px", background: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)", borderRadius: 10, fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>Cancel</button>
                    </div>
                )}

                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)" }}>
                            {["Service", "Label", "Key", "Added", ""].map(h => (
                                <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--muted-foreground)" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {keys.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                                    No API Keys stored. Your node is isolated.
                                </td>
                            </tr>
                        ) : keys.map((k, i) => (
                            <tr key={k.id} style={{ borderBottom: i < keys.length - 1 ? "1px solid var(--border)" : "none" }}>
                                <td style={{ padding: "14px 20px" }}>
                                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--accent)", background: "rgba(52,209,134,0.08)", padding: "3px 10px", borderRadius: 100 }}>{k.service}</span>
                                </td>
                                <td style={{ padding: "14px 20px", fontWeight: 800, fontSize: "0.88rem" }}>{k.label}</td>
                                <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: "0.82rem", color: "var(--muted-foreground)" }}>
                                    {revealId === k.id ? k.key : "••••••••••••••••••••••"}
                                </td>
                                <td style={{ padding: "14px 20px", fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{k.added}</td>
                                <td style={{ padding: "14px 20px" }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        <button onClick={() => setRevealId(revealId === k.id ? null : k.id)} style={{ padding: "6px 10px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: 8, cursor: "pointer", color: "var(--muted-foreground)", display: "flex", alignItems: "center" }}>
                                            {revealId === k.id ? <EyeOff size={13} /> : <Eye size={13} />}
                                        </button>
                                        <button onClick={() => handleDeleteKey(k.id)} style={{ padding: "6px 10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 8, cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center" }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
