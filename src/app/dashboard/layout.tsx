"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import AiChat from "../components/AiChat";

type NotificationItem = {
    id?: string | number;
    title?: string;
    message?: string;
    content?: string;
    createdAt?: string;
};

// Institutional Layout Definition

type UserData = { name: string; role: string; email: string };

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [showNotifs, setShowNotifs] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [user, setUser] = useState<UserData>({ name: "Prokopecs", role: "Strategic Admin", email: "nikolass@blonk.ai" });
    const [isLoadingHeaderData, setIsLoadingHeaderData] = useState(true);

    const notifsAnchorRef = useRef<HTMLDivElement>(null);
    const userMenuAnchorRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.length;

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const [userRes, notifsRes] = await Promise.all([
                    fetch("/api/settings"),
                    fetch("/api/notifications"),
                ]);

                const userData = await userRes.json();
                if (userData && !userData.error) {
                    setUser({
                        name: userData.name || "Operator",
                        role: userData.role || "MEMBER",
                        email: userData.email || "user@blonk.ai",
                    });
                }

                // Usage tracking removed per user request

                const notifs = await notifsRes.json();
                if (Array.isArray(notifs)) setNotifications(notifs);
            } catch (error) {
                console.error("Error fetching layout data:", error);
            } finally {
                if (isMounted) setIsLoadingHeaderData(false);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    const onShellMouseDownCapture = (e: React.MouseEvent) => {
        if (!showNotifs && !showUserMenu) return;
        const target = e.target as Node | null;
        if (!target) return;

        if (showNotifs && notifsAnchorRef.current && !notifsAnchorRef.current.contains(target)) {
            setShowNotifs(false);
        }
        if (showUserMenu && userMenuAnchorRef.current && !userMenuAnchorRef.current.contains(target)) {
            setShowUserMenu(false);
        }
    };

    const onShellKeyDownCapture = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            setShowNotifs(false);
            setShowUserMenu(false);
        }
    };

    const clearNotifications = async () => {
        try {
            await fetch("/api/notifications", { method: "DELETE" });
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    };

    const allNavItems = [
        { name: "Overview", href: "/dashboard", roles: ['OWNER', 'ADMIN', 'OPERATOR', 'VIEWER', 'MEMBER'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg> },
        { name: "Live Overview", href: "/dashboard/office", roles: ['OWNER', 'ADMIN', 'OPERATOR', 'VIEWER', 'MEMBER'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg> },
        { name: "Team", href: "/dashboard/team", roles: ['OWNER', 'ADMIN', 'OPERATOR', 'VIEWER', 'MEMBER'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
        { name: "Marketplace", href: "/dashboard/workflows", roles: ['OWNER', 'ADMIN', 'OPERATOR'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
        { name: "Reports", href: "/dashboard/reports", roles: ['OWNER', 'ADMIN'], icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg> },
    ];

    const navItems = allNavItems.filter(item => item.roles.includes(user.role || 'MEMBER'));

    return (
        <div className={styles.appShell} onMouseDownCapture={onShellMouseDownCapture} onKeyDownCapture={onShellKeyDownCapture}>
            <div className={styles.noise} />
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoSquare}></span>BLONK
                    </Link>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>Menu</span>
                        <ul>
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}>
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>App</span>
                        <ul>
                            <li><Link href="/dashboard/settings" className={styles.navLink}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M12.22 2h-4.44l-.74 3.3a8.1 8.1 0 0 0-1.88.94L3.3 7.85l-2.22 3.84 2.15 1.7a8.2 8.2 0 0 0 0 2.22l-2.15 1.7 2.22 3.84 3.3-1.39a8.1 8.1 0 0 0 1.88.94l.74 3.3h4.44l.74-3.3a8.1 8.1 0 0 0 1.88-.94l3.3 1.39 2.22-3.84-2.15-1.7a8.2 8.2 0 0 0 0-2.22l2.15-1.7-2.22-3.84-3.3 1.39a8.1 8.1 0 0 0-1.88-.94L12.22 2z" /></svg>Settings</Link></li>
                        </ul>
                    </div>
                </nav>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topbar}>
                    <div className={styles.topbarContext}>
                        <h1 className={styles.pageTitle}>
                            {navItems.find(item => item.href === pathname)?.name || 
                             (pathname === '/dashboard/settings' ? 'Settings' : 'Dashboard')}
                        </h1>
                    </div>
                    <div className={styles.topbarActions}>
                        {pathname === '/dashboard/team' && (user.role === 'OWNER' || user.role === 'ADMIN') && (
                            <button 
                                className={styles.createWorkflowBtn} 
                                onClick={() => {
                                    // This event will be caught by the Team page modal
                                    window.dispatchEvent(new CustomEvent('OPEN_INVITE_MODAL'));
                                }}
                                style={{ background: '#34D186', color: '#0A0A0A' }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="17" y1="11" x2="23" y2="11"/></svg>
                                Invite Member
                            </button>
                        )}
                        {pathname === '/dashboard' && (
                             <Link href="/dashboard/workflows?create=true" className={styles.createWorkflowBtn}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                Create Workflow
                             </Link>
                        )}
                        <div ref={notifsAnchorRef} className={styles.dropdownAnchor}>
                            <button
                                className={styles.iconBtn}
                                onClick={() => {
                                    setShowNotifs(!showNotifs);
                                    setShowUserMenu(false);
                                }}
                                aria-label="Notifications"
                                aria-expanded={showNotifs}
                                type="button"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                            </button>

                            {showNotifs && (
                                <div className={styles.dropdown} role="menu" aria-label="Notifications">
                                    <div className={styles.dropdownTitle}>Notifications</div>

                                    {isLoadingHeaderData ? (
                                        <div className={styles.dropdownEmpty}>Loading...</div>
                                    ) : notifications.length === 0 ? (
                                        <div className={styles.dropdownEmpty}>No new alerts</div>
                                    ) : (
                                        <div className={styles.dropdownList}>
                                            {notifications.slice(0, 6).map((n, idx) => {
                                                const title = n.title ?? "BLONK Alert";
                                                const body = n.message ?? n.content ?? "";
                                                return (
                                                    <div key={n.id ?? idx} className={styles.notificationItem}>
                                                        <div className={styles.dropdownItemTitle}>{title}</div>
                                                        {body && <div className={styles.dropdownItemBody}>{body}</div>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className={styles.dropdownFooter}>
                                        <button
                                            type="button"
                                            className={styles.dropdownClearBtn}
                                            onClick={clearNotifications}
                                            disabled={notifications.length === 0}
                                        >
                                            Clear all ({unreadCount})
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div ref={userMenuAnchorRef} className={styles.dropdownAnchor}>
                            <button
                                className={styles.userProfile}
                                type="button"
                                onClick={() => {
                                    setShowUserMenu(!showUserMenu);
                                    setShowNotifs(false);
                                }}
                                aria-label="User menu"
                                aria-expanded={showUserMenu}
                            >
                            <div className={styles.userData}>
                                <strong>{user.name}</strong>
                                <span>{user.role}</span>
                            </div>
                            <div className={styles.avatar}>{user.name.charAt(0)}</div>
                            </button>

                            {showUserMenu && (
                                <div className={styles.userDropdown} role="menu" aria-label="User menu">
                                    <div className={styles.userDropdownProfile}>
                                        <div className={styles.userDropdownName}>{user.name}</div>
                                        <div className={styles.userDropdownRole}>{user.role}</div>
                                        <div className={styles.userDropdownEmail}>{user.email}</div>
                                    </div>
                                    <Link
                                        href="/dashboard/settings"
                                        className={styles.userDropdownLink}
                                        role="menuitem"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                        </svg>
                                        Settings
                                    </Link>
                                    <Link
                                        href="/dashboard/reports"
                                        className={styles.userDropdownLink}
                                        role="menuitem"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                        Reports
                                    </Link>
                                    <div className={styles.userDropdownDivider}></div>
                                    <button
                                        className={`${styles.userDropdownLink} ${styles.logoutBtn}`}
                                        role="menuitem"
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        Log out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
            <AiChat />
        </div>
    );
}
