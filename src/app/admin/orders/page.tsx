"use client";

import React, { useEffect, useState } from "react";
import { getAdminTabForStatus, ORDER_STATUS } from "@/lib/order-lifecycle";

const TABS = [
    { id: "new", label: "New Orders" },
    { id: "provisioning", label: "Provisioning" },
    { id: "credentials", label: "Waiting Credentials" },
    { id: "setup", label: "Setup" },
    { id: "testing", label: "Testing" },
    { id: "completed", label: "Completed" },
    { id: "failed", label: "Failed" },
] as const;

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [tab, setTab] = useState<string>("setup");
    const [loading, setLoading] = useState(true);

    const load = () => {
        setLoading(true);
        fetch("/api/admin/orders")
            .then((r) => r.json())
            .then((data) => setOrders(Array.isArray(data) ? data : []))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        const t = setInterval(load, 15000);
        return () => clearInterval(t);
    }, []);

    const filtered = orders.filter((o) => getAdminTabForStatus(o.status) === tab);

    const updateStatus = async (orderId: string, status: string, logMessage?: string) => {
        await fetch("/api/admin/orders", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, status, logMessage }),
        });
        load();
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 950, margin: 0 }}>Orders</h1>
                <p style={{ color: "var(--muted-foreground)", fontWeight: 700 }}>Waiting setup & pipeline management</p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setTab(t.id)}
                        style={{
                            padding: "8px 16px",
                            borderRadius: 100,
                            border: "1px solid var(--border)",
                            background: tab === t.id ? "var(--foreground)" : "var(--muted)",
                            color: tab === t.id ? "var(--background)" : "var(--foreground)",
                            fontWeight: 800,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                        }}
                    >
                        {t.label} ({orders.filter((o) => getAdminTabForStatus(o.status) === t.id).length})
                    </button>
                ))}
            </div>

            {loading ? (
                <p>Loading orders…</p>
            ) : filtered.length === 0 ? (
                <p style={{ color: "var(--muted-foreground)" }}>No orders in this tab.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {filtered.map((o) => (
                        <div
                            key={o.id}
                            style={{
                                background: "var(--card)",
                                border: "1px solid var(--border)",
                                borderRadius: 20,
                                padding: 24,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 950, fontSize: "1.1rem" }}>{o.workflowName}</div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--muted-foreground)" }}>
                                        User: {o.userName || o.userEmail} · Order #{o.orderNumber} · {o.status}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: 8, fontSize: "0.8rem", fontWeight: 800 }}>
                                    <span>Server: {o.serverName || "—"} ({o.serverStatus || "pending"})</span>
                                    <span>
                                        Credentials:{" "}
                                        {[ORDER_STATUS.CREDENTIALS_RECEIVED, ORDER_STATUS.ADMIN_SETUP, ORDER_STATUS.TESTING, ORDER_STATUS.COMPLETED].includes(o.status)
                                            ? "Ready"
                                            : o.status === ORDER_STATUS.WAITING_CREDENTIALS
                                              ? "Waiting"
                                              : "—"}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
                                {o.status === ORDER_STATUS.CREDENTIALS_RECEIVED && (
                                    <button type="button" onClick={() => updateStatus(o.id, ORDER_STATUS.ADMIN_SETUP, "Admin started workflow setup")}>
                                        Start setup
                                    </button>
                                )}
                                {o.status === ORDER_STATUS.ADMIN_SETUP && (
                                    <button type="button" onClick={() => updateStatus(o.id, ORDER_STATUS.TESTING)}>
                                        Move to testing
                                    </button>
                                )}
                                {o.status === ORDER_STATUS.TESTING && (
                                    <button type="button" onClick={() => updateStatus(o.id, ORDER_STATUS.COMPLETED)}>
                                        Mark completed
                                    </button>
                                )}
                                {![ORDER_STATUS.COMPLETED, ORDER_STATUS.FAILED].includes(o.status) && (
                                    <button type="button" style={{ color: "#EF4444" }} onClick={() => updateStatus(o.id, ORDER_STATUS.FAILED, "Marked failed by admin")}>
                                        Fail
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
