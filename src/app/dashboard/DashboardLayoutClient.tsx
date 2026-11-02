"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import styles from "./dashboard.module.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import AiChat from "../components/AiChat";
import CommandPalette from "../components/CommandPalette";
import Logo from "../../components/Logo";
import { Search, Bell, Menu, Settings, LogOut, FileText, LayoutGrid, Zap, Users, Activity, ShieldCheck, Sparkles, CreditCard, Brain, Cpu, ListTodo, ShoppingBag, BarChart2, Globe } from "lucide-react";

type NotificationItem = {
    id?: string | number;
    title?: string;
    message?: string;
    content?: string;
    createdAt?: string;
};

type UserData = { name: string; role: string; email: string; firmName?: string };

export default function DashboardLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [showNotifs, setShowNotifs] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [user, setUser] = useState<UserData>({ name: "Operator", role: "MEMBER", email: "" });
    const [isLoadingHeaderData, setIsLoadingHeaderData] = useState(true);

    const notifsAnchorRef = useRef<HTMLDivElement>(null);
    const userMenuAnchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handlePulse = (e: any) => {
            const { selector } = e.detail;
            const el = document.querySelector(selector);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.classList.add('pulse-interactive');
                setTimeout(() => {
                    el.classList.remove('pulse-interactive');
                }, 5000);
            }
        };

        window.addEventListener('PULSE_ELEMENT' as any, handlePulse);
        return () => window.removeEventListener('PULSE_ELEMENT' as any, handlePulse);
    }, []);

    const unreadCount = useMemo(() => notifications.length, [notifications]);

    useEffect(() => {
        let isMounted = true;
        if (status !== "authenticated") return; // Bypass sync if unauthorized

        (async () => {
            try {
                const [userRes, notifsRes] = await Promise.all([
                    fetch("/api/settings"),
                    fetch("/api/notifications"),
                ]);
                const userData = await userRes.json();
                if (userData && !userData.error) {
                    const displayName = (userData.name === 'Institutional Operator' || !userData.name) 
                        ? (userData.firmName || userData.name || "Operator") 
                        : userData.name;
                        
                    setUser({
                        name: displayName,
                        role: userData.role || "MEMBER",
                        email: userData.email || "",
                        firmName: userData.firmName
                    });
                }
                const notifs = await notifsRes.json();
                if (Array.isArray(notifs)) setNotifications(notifs);
            } catch (error) {
                console.error("Error fetching layout data:", error);
            } finally {
                if (isMounted) setIsLoadingHeaderData(false);
            }
        })();
        return () => { isMounted = false; };
    }, [status]);

    const [showQuickActions, setShowQuickActions] = useState(false);
    const quickActionsAnchorRef = useRef<HTMLDivElement>(null);

    const onShellMouseDownCapture = (e: React.MouseEvent) => {
        if (!showNotifs && !showUserMenu && !showQuickActions) return;
        const target = e.target as Node | null;
        if (!target) return;
        if (showNotifs && notifsAnchorRef.current && !notifsAnchorRef.current.contains(target)) setShowNotifs(false);
        if (showUserMenu && userMenuAnchorRef.current && !userMenuAnchorRef.current.contains(target)) setShowUserMenu(false);
        if (showQuickActions && quickActionsAnchorRef.current && !quickActionsAnchorRef.current.contains(target)) setShowQuickActions(false);
    };

    const clearNotifications = async () => {
        try {
            await fetch("/api/notifications", { method: "DELETE" });
            setNotifications([]);
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    };
    const getModuleTitle = (path: string) => {
        if (path === '/dashboard')                    return 'Overview';
        if (path === '/dashboard/automations')          return 'AI Workforce';
        if (path === '/dashboard/ai-agents')            return 'AI Employees';
        if (path === '/dashboard/tasks')               return 'Employee Activity';
        if (path === '/dashboard/company-brain')      return 'Company Brain';
        if (path === '/dashboard/integrations')       return 'Integrations';
        if (path === '/dashboard/marketplace')        return 'Marketplace';
        if (path === '/dashboard/health')             return 'Workspace Health';
        if (path === '/dashboard/analytics')          return 'Analytics';
        if (path === '/dashboard/notifications')      return 'Notifications';
        if (path === '/dashboard/billing')            return 'Billing';
        if (path === '/dashboard/settings')           return 'Settings';
        return 'Operations Center';
    };    return (
        <div className={`${styles.appShell} ${showMobileMenu ? styles.mobileMenuOpen : ""}`} onMouseDownCapture={onShellMouseDownCapture}>
            <div className={styles.noise} />
            
            {/* MOBILE OVERLAY */}
            {showMobileMenu && <div className={styles.mobileOverlay} onClick={() => setShowMobileMenu(false)} />}

            {/* SIDEBAR */}
            <aside className={`${styles.sidebar} ${showMobileMenu ? styles.sidebarOpen : ""}`}>
                <div className={styles.sidebarBrand}>
                    <Link href="/dashboard" className={styles.logo} onClick={() => setShowMobileMenu(false)} style={{ display: "inline-flex", alignItems: "center" }}>
                        <Logo height={26} />
                    </Link>
                </div>

                <nav className={styles.sidebarNav}>
                    {/* OVERVIEW */}
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>OVERVIEW</span>
                        <ul>
                            <li>
                                <Link href="/dashboard" className={`${styles.navLink} ${pathname === '/dashboard' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <LayoutGrid size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Overview</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* OPERATIONS */}
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>OPERATIONS</span>
                        <ul>
                            <li>
                                <Link href="/dashboard/automations" className={`${styles.navLink} ${pathname === '/dashboard/automations' || pathname.startsWith('/dashboard/incidents') ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {(pathname === '/dashboard/automations' || pathname.startsWith('/dashboard/incidents')) && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Zap size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>AI Workforce</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/ai-agents" className={`${styles.navLink} ${pathname === '/dashboard/ai-agents' || pathname === '/dashboard/operators' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {(pathname === '/dashboard/ai-agents' || pathname === '/dashboard/operators') && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Cpu size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>AI Employees</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/tasks" className={`${styles.navLink} ${pathname === '/dashboard/tasks' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/tasks' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <ListTodo size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Employee Activity</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* KNOWLEDGE */}
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>KNOWLEDGE</span>
                        <ul>
                            <li>
                                <Link href="/dashboard/company-brain" className={`${styles.navLink} ${pathname === '/dashboard/company-brain' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/company-brain' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Brain size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Company Brain</span>
                                    <span style={{
                                        fontSize: "0.68rem",
                                        fontWeight: 800,
                                        background: "rgba(52, 209, 134, 0.12)",
                                        color: "var(--accent)",
                                        padding: "2px 8px",
                                        borderRadius: "100px",
                                        marginLeft: "auto",
                                        position: "relative",
                                        zIndex: 1
                                    }}>Ready</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/integrations" className={`${styles.navLink} ${pathname === '/dashboard/integrations' || pathname === '/dashboard/credentials' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {(pathname === '/dashboard/integrations' || pathname === '/dashboard/credentials') && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <ShieldCheck size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Integrations</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* DISCOVER */}
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>DISCOVER</span>
                        <ul>
                            <li>
                                <Link href="/dashboard/marketplace" className={`${styles.navLink} ${pathname === '/dashboard/marketplace' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/marketplace' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <ShoppingBag size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Marketplace</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* INSIGHTS */}
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>INSIGHTS</span>
                        <ul>
                            <li>
                                <Link href="/dashboard/health" className={`${styles.navLink} ${pathname === '/dashboard/health' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/health' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <ShieldCheck size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Workspace Health</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/analytics" className={`${styles.navLink} ${pathname === '/dashboard/analytics' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/analytics' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <BarChart2 size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Analytics</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/notifications" className={`${styles.navLink} ${pathname === '/dashboard/notifications' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/notifications' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Bell size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Notifications</span>
                                    {unreadCount > 0 && <span className={styles.navBadge} style={{ position: "relative", zIndex: 1 }}>{unreadCount}</span>}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* WORKSPACE */}
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>WORKSPACE</span>
                        <ul>
                            <li>
                                <Link href="/dashboard/billing" className={`${styles.navLink} ${pathname === '/dashboard/billing' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/billing' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <CreditCard size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Billing</span>
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/settings" className={`${styles.navLink} ${pathname === '/dashboard/settings' ? styles.navLinkActive : ''}`} onClick={() => setShowMobileMenu(false)}>
                                    {pathname === '/dashboard/settings' && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            style={{
                                                position: "absolute",
                                                inset: 0,
                                                background: "rgba(52, 209, 134, 0.08)",
                                                borderLeft: "4px solid var(--accent)",
                                                zIndex: 0,
                                                pointerEvents: "none"
                                            }}
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                    <Settings size={18} style={{ position: "relative", zIndex: 1 }} />
                                    <span style={{ position: "relative", zIndex: 1 }}>Settings</span>
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                {/* Anchored Bottom Workspace Status Panel */}
                <div style={{
                    margin: "12px 16px",
                    padding: "12px 14px",
                    background: "rgba(52, 209, 134, 0.04)",
                    border: "1px solid rgba(52, 209, 134, 0.15)",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#34D186",
                        boxShadow: "0 0 8px #34D186",
                        animation: "pulse 2s infinite"
                    }} />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#111827" }}>Workspace Status</span>
                        <span style={{ fontSize: "0.68rem", color: "#6B7280", fontWeight: 600 }}>All systems operational</span>
                    </div>
                </div>

                {/* Anchored Bottom User/Workspace Panel */}
                <div className={styles.sidebarUserFooter}>
                    <div className={styles.sidebarAvatar}>{user.name.charAt(0)}</div>
                    <div className={styles.sidebarUserMeta}>
                        <div className={styles.sidebarUserName}>{user.name}</div>
                        <div className={styles.sidebarUserRole}>{user.role}</div>
                    </div>
                </div>
            </aside>

            <main className={styles.mainContent}>
                {/* TOPBAR: Identity & Orchestration */}
                <header className={styles.topbar}>
                    <div className={styles.topbarInner}>
                        <div className={styles.topbarContext}>
                            <button className={styles.mobileMenuBtn} onClick={() => setShowMobileMenu(true)}>
                                <Menu size={24} />
                            </button>
                            
                            {/* Minimal Search Input */}
                            <div className={styles.searchWrapper}>
                                 <Search className={styles.searchIcon} size={18} />
                                 <input
                                    type="text"
                                    placeholder="Search..."
                                    className={styles.searchInput}
                                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                                    readOnly
                                    style={{ cursor: "pointer" }}
                                 />
                                 <span className={styles.searchBadge}>⌘K</span>
                            </div>
                        </div>

                        {/* Center is Empty */}
                        <div style={{ flex: 1 }} />

                        {/* Right Section */}
                        <div className={styles.topbarActions} style={{ gap: "16px", alignItems: "center" }}>
                            {/* Quick Actions Dropdown */}
                            <div ref={quickActionsAnchorRef} className={styles.dropdownAnchor}>
                                <button 
                                    className={styles.iconBtn} 
                                    onClick={() => setShowQuickActions(!showQuickActions)}
                                    style={{
                                        width: "36px",
                                        height: "36px",
                                        borderRadius: "10px",
                                        background: "#111827",
                                        color: "#FFFFFF",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "900",
                                        fontSize: "1.1rem",
                                        border: "none",
                                        cursor: "pointer"
                                    }}
                                >
                                    +
                                </button>
                                {showQuickActions && (
                                    <div className={styles.dropdown} style={{ right: 0, minWidth: "220px" }}>
                                        <div className={styles.dropdownTitle}>Quick Actions</div>
                                        <div className={styles.dropdownList}>
                                            <Link href="/dashboard/marketplace" className={styles.notificationItem} style={{ textDecoration: "none", display: "block" }} onClick={() => setShowQuickActions(false)}>
                                                <div className={styles.dropdownItemTitle}>+ Install Automation</div>
                                                <div className={styles.dropdownItemBody}>Browse templates</div>
                                            </Link>
                                            <Link href="/dashboard/integrations" className={styles.notificationItem} style={{ textDecoration: "none", display: "block" }} onClick={() => setShowQuickActions(false)}>
                                                <div className={styles.dropdownItemTitle}>+ Connect App</div>
                                                <div className={styles.dropdownItemBody}>Link Google, Stripe</div>
                                            </Link>
                                            <Link href="/dashboard/company-brain" className={styles.notificationItem} style={{ textDecoration: "none", display: "block" }} onClick={() => setShowQuickActions(false)}>
                                                <div className={styles.dropdownItemTitle}>+ Upload Knowledge</div>
                                                <div className={styles.dropdownItemBody}>Add pricing, SOPs</div>
                                            </Link>
                                            <Link href="/dashboard/operators" className={styles.notificationItem} style={{ textDecoration: "none", display: "block" }} onClick={() => setShowQuickActions(false)}>
                                                <div className={styles.dropdownItemTitle}>+ Invite Team</div>
                                                <div className={styles.dropdownItemBody}>Add members</div>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Notifications bell */}
                            <div ref={notifsAnchorRef} className={styles.dropdownAnchor}>
                                <button className={styles.iconBtn} onClick={() => setShowNotifs(!showNotifs)}>
                                    <Bell size={20} />
                                    {unreadCount > 0 && <span className={styles.notifBadge} />}
                                </button>
                                {showNotifs && (
                                    <div className={styles.dropdown}>
                                        <div className={styles.dropdownTitle}>Notifications</div>
                                        {notifications.length === 0 ? <div className={styles.emptyNotifs}>No new alerts</div> : (
                                            <div className={styles.dropdownList}>
                                                {notifications.slice(0, 5).map((n, i) => (
                                                    <div key={i} className={styles.notificationItem}>
                                                        <div className={styles.dropdownItemTitle}>{n.title || 'System Alert'}</div>
                                                        <div className={styles.dropdownItemBody}>{n.message || n.content}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className={styles.dropdownFooter}><button className={styles.dropdownClearBtn} onClick={clearNotifications}>Clear Notifications</button></div>
                                    </div>
                                )}
                            </div>

                            {/* AI Assistant Quick Chat Trigger */}
                            <button 
                                className={styles.aiAgentBtn} 
                                onClick={() => window.dispatchEvent(new CustomEvent('OPEN_AI_CHAT'))}
                            >
                                <div className={styles.aiAgentDot} />
                                <Cpu size={14} />
                                <span>Ask AI</span>
                            </button>

                            {/* Workspace Switcher */}
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#FFFFFF",
                                border: "1px solid #E5E7EB",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                fontSize: "0.78rem",
                                fontWeight: 700,
                                color: "#374151"
                            }}>
                                <Globe size={14} style={{ color: "#9CA3AF" }} />
                                <span>{user.firmName || "Workspace"}</span>
                            </div>

                            {/* Profile Dropdown */}
                            <div ref={userMenuAnchorRef} className={styles.dropdownAnchor}>
                                <button className={styles.userProfile} onClick={() => setShowUserMenu(!showUserMenu)}>
                                    <div className={styles.avatar}>{user.name.charAt(0)}</div>
                                </button>
                                {showUserMenu && (
                                    <div className={styles.userDropdown}>
                                        <div className={styles.userDropdownProfile}>
                                            <div className={styles.userDropdownName}>{user.name}</div>
                                            <div className={styles.userDropdownRole}>{user.role}</div>
                                            <div className={styles.userDropdownEmail}>{user.email}</div>
                                        </div>
                                        <Link href="/dashboard/settings" className={styles.userDropdownLink} onClick={() => { setShowUserMenu(false); setShowMobileMenu(false); }}>
                                            <Settings size={18} /> Settings
                                        </Link>
                                        <div className={styles.userDropdownDivider} />
                                        <button className={`${styles.userDropdownLink} ${styles.logoutBtn}`} onClick={() => signOut({ callbackUrl: '/' })}>
                                            <LogOut size={18} /> Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className={styles.pageContent}>
                    <motion.div
                        key={pathname}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>
            <AiChat />
            <CommandPalette />
        </div>
    );
}
