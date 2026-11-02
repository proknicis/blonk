"use client";

import React, { useState } from "react";
import { Bell, CheckSquare, Trash2, X, AlertTriangle, AlertCircle, Info } from "lucide-react";
import styles from "./notifications.module.css";

interface Notification {
    id: string;
    title: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());

    const markAllRead = () => {
        const allIds = notifications.map(n => n.id);
        setReadIds(new Set(allIds));
    };

    const handleClearAll = async () => {
        try {
            const res = await fetch("/api/notifications", { method: "DELETE" });
            if (res.ok) {
                setNotifications([]);
            }
        } catch (e) {
            console.error("Failed to clear notifications:", e);
        }
    };

    const handleDismiss = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getSeverity = (title: string = "", message: string = "") => {
        const text = (title + " " + message).toLowerCase();
        if (text.includes("fail") || text.includes("error") || text.includes("expire") || text.includes("block")) {
            return "high";
        }
        if (text.includes("warning") || text.includes("recommend") || text.includes("check")) {
            return "medium";
        }
        return "low";
    };

    return (
        <main className={styles.container} aria-label="System Notifications Feed">
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>System Alerts</h1>
                    <p className={styles.subtitle}>Active warnings, validation alerts, and workflow deployment milestones.</p>
                </div>
            </header>

            <div className={styles.actionsHeader}>
                {notifications.length > 0 && (
                    <>
                        <button 
                            className={styles.btnSecondary} 
                            onClick={markAllRead}
                            aria-label="Mark all alerts as read"
                        >
                            <CheckSquare size={16} /> Mark All Read
                        </button>
                        <button 
                            className={styles.btnSecondary} 
                            onClick={handleClearAll}
                            style={{ color: "#EF4444", borderColor: "#FEE2E2" }}
                            aria-label="Purge all notifications from system database"
                        >
                            <Trash2 size={16} /> Purge Ledger
                        </button>
                    </>
                )}
            </div>

            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className={styles.emptyState}>
                        <Bell size={48} color="#94A3B8" />
                        <p>No system alerts at this time.</p>
                    </div>
                ) : (
                    notifications.map(notif => {
                        const isRead = readIds.has(notif.id);
                        const severity = getSeverity(notif.title, notif.message);
                        
                        let borderClass = styles.listBorderLow;
                        let badgeClass = styles.badgeLow;
                        let SeverityIcon = Info;
                        let iconColor = "#64748B";

                        if (severity === "high") {
                            borderClass = styles.listBorderHigh;
                            badgeClass = styles.badgeHigh;
                            SeverityIcon = AlertCircle;
                            iconColor = "#EF4444";
                        } else if (severity === "medium") {
                            borderClass = styles.listBorderMedium;
                            badgeClass = styles.badgeMedium;
                            SeverityIcon = AlertTriangle;
                            iconColor = "#F59E0B";
                        }

                        return (
                            <article 
                                key={notif.id}
                                className={`${styles.listItem} ${!isRead ? styles.listUnread : ""} ${borderClass}`}
                                tabIndex={0}
                                aria-label={`${severity} priority notification: ${notif.title}`}
                            >
                                <div style={{ display: "flex", gap: "16px", flexGrow: 1 }}>
                                    <div style={{ marginTop: "4px" }}>
                                        <SeverityIcon size={20} color={iconColor} />
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <div className={styles.itemTitleGroup}>
                                            <div>
                                                <span className={`${styles.badge} ${badgeClass}`}>{severity}</span>
                                                <h3 className={styles.itemTitle} style={{ display: "inline" }}>{notif.title}</h3>
                                            </div>
                                            <span className={styles.itemTime}>{new Date(notif.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className={styles.itemText}>{notif.message}</p>
                                    </div>
                                </div>
                                <button 
                                    className={styles.closeBtn} 
                                    onClick={() => handleDismiss(notif.id)}
                                    aria-label={`Dismiss notification ${notif.title}`}
                                >
                                    <X size={16} />
                                </button>
                            </article>
                        );
                    })
                )}
            </div>
        </main>
    );
}
