"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import AiChat from "../components/AiChat";
import { Search, Bell, Menu, User, Settings, LogOut, FileText, LayoutGrid, Zap, Users, Monitor, ExternalLink } from "lucide-react";

type NotificationItem = {
    id?: string | number;
    title?: string;
    message?: string;
    content?: string;
    createdAt?: string;
};

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
                const notifs = await notifsRes.json();
                if (Array.isArray(notifs)) setNotifications(notifs);
            } catch (error) {
                console.error("Error fetching layout data:", error);
            } finally {
                if (isMounted) setIsLoadingHeaderData(false);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    const onShellMouseDownCapture = (e: React.MouseEvent) => {
        if (!showNotifs && !showUserMenu) return;
        const target = e.target as Node | null;
        if (!target) return;
        if (showNotifs && notifsAnchorRef.current && !notifsAnchorRef.current.contains(target)) setShowNotifs(false);
        if (showUserMenu && userMenuAnchorRef.current && !userMenuAnchorRef.current.contains(target)) setShowUserMenu(false);
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
        if (path === '/dashboard') return 'Fleet Overview';
        if (path === '/dashboard/office') return 'Mission Control';
        if (path === '/dashboard/team') return 'Strategic Personnel';
        if (path === '/dashboard/workflows') return 'Marketplace';
        if (path === '/dashboard/reports') return 'Intelligence Reports';
        if (path === '/dashboard/settings') return 'System Control';
        if (path === '/dashboard/help') return 'Support Hub';
        return 'Command Console';
    };

    return (
        <div className={styles.appShell} onMouseDownCapture={onShellMouseDownCapture} style={{ backgroundColor: '#FAFAFA', color: '#111' }}>
            <div className={styles.noise} />
            
            {/* SIDEBAR: Sovereign Institutional */}
            <aside className={styles.sidebar} style={{ backgroundColor: '#FFFFFF', color: '#111', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                <div className={styles.sidebarBrand}>
                    <Link href="/dashboard" className={styles.logo} style={{ color: '#111' }}>
                        <div className={styles.logo_dot} />
                        BLONK
                    </Link>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>Menu</span>
                        <ul>
                            <li>
                                <Link href="/dashboard" className={`${styles.navLink} ${pathname === '/dashboard' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/dashboard' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                                    <LayoutGrid size={20} /> Overview
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/office" className={`${styles.navLink} ${pathname === '/dashboard/office' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/dashboard/office' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                                    <Monitor size={20} /> Mission Control
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/team" className={`${styles.navLink} ${pathname === '/dashboard/team' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/dashboard/team' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                                    <Users size={20} /> Team
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/workflows" className={`${styles.navLink} ${pathname === '/dashboard/workflows' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/dashboard/workflows' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                                    <Zap size={20} /> Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/dashboard/reports" className={`${styles.navLink} ${pathname === '/dashboard/reports' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/dashboard/reports' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                                    <FileText size={20} /> Reports
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>App</span>
                        <ul>
                            <li>
                                <Link href="/dashboard/settings" className={`${styles.navLink} ${pathname === '/dashboard/settings' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/dashboard/settings' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                                    <Settings size={20} /> Settings
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className={styles.usageSection}>
                    <div className={styles.usageCard} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                        <div className={styles.usagePlanTop}>
                            <span className={styles.planBadge} style={{ background: '#111', color: '#34D186' }}>Institutional</span>
                            <div className={styles.tierDots}>
                                <div className={styles.tierDot} />
                                <div className={styles.tierDot} />
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <div className={styles.statLabel}>Monthly Throughput</div>
                            <div className={styles.statValue} style={{ color: '#111' }}>1,240 / 5,000 OPS</div>
                        </div>
                        <div style={{ height: '4px', background: '#E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: '25%', background: '#34D186' }} />
                        </div>
                    </div>
                </div>
            </aside>

            <main className={styles.mainContent} style={{ backgroundColor: '#FAFAFA' }}>
                {/* TOPBAR: Identity & Orchestration */}
                <header className={styles.topbar} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className={styles.topbarInner}>
                        <div className={styles.topbarContext}>
                            <h1 className={styles.pageTitle} style={{ color: '#111' }}>{getModuleTitle(pathname)}</h1>
                        </div>

                        <div className={styles.searchWrapper}>
                             <Search className={styles.searchIcon} size={18} style={{ color: 'rgba(0,0,0,0.2)' }} />
                             <input 
                                type="text" 
                                placeholder="Search systems, loops, or co-pilots..." 
                                className={styles.searchInput}
                                style={{ background: 'rgba(0,0,0,0.02)', color: '#111', border: '1px solid rgba(0,0,0,0.05)' }}
                             />
                        </div>

                        <div className={styles.topbarActions}>
                            {pathname === '/dashboard/team' && (user.role === 'OWNER' || user.role === 'ADMIN') && (
                                <button 
                                    className={styles.createWorkflowBtn} 
                                    onClick={() => window.dispatchEvent(new CustomEvent('OPEN_INVITE_MODAL'))}
                                    style={{ background: '#34D186', color: '#111' }}
                                >
                                    <Users size={16} /> Invite Member
                                </button>
                            )}
                            
                            {pathname === '/dashboard' && (
                                 <Link href="/dashboard/workflows?create=true" className={styles.createWorkflowBtn}>
                                    <Zap size={16} /> Generate Loop
                                 </Link>
                            )}

                            <div ref={notifsAnchorRef} className={styles.dropdownAnchor}>
                                <button className={styles.iconBtn} onClick={() => setShowNotifs(!showNotifs)} style={{ background: 'rgba(0,0,0,0.02)', color: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Bell size={20} />
                                    {unreadCount > 0 && <span style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', background: '#34D186', borderRadius: '50%', border: '2px solid #FFFFFF' }} />}
                                </button>
                                {showNotifs && (
                                    <div className={styles.dropdown}>
                                        <div className={styles.dropdownTitle}>Notifications</div>
                                        {notifications.length === 0 ? <div style={{padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#64748B'}}>No new alerts</div> : (
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

                            <div ref={userMenuAnchorRef} className={styles.dropdownAnchor}>
                                <button className={styles.userProfile} onClick={() => setShowUserMenu(!showUserMenu)} style={{ borderLeft: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div className={styles.userData}>
                                        <strong style={{ color: '#111' }}>{user.name}</strong>
                                        <span style={{ color: 'rgba(0,0,0,0.3)' }}>{user.role}</span>
                                    </div>
                                    <div className={styles.avatar} style={{ background: '#111', color: '#FFF' }}>{user.name.charAt(0)}</div>
                                </button>
                                {showUserMenu && (
                                    <div className={styles.userDropdown}>
                                        <div className={styles.userDropdownProfile}>
                                            <div className={styles.userDropdownName}>{user.name}</div>
                                            <div className={styles.userDropdownRole}>{user.role}</div>
                                            <div className={styles.userDropdownEmail}>{user.email}</div>
                                        </div>
                                        <Link href="/dashboard/settings" className={styles.userDropdownLink} onClick={() => setShowUserMenu(false)}>
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
                    {children}
                </div>
            </main>
            <AiChat />
        </div>
    );
}
