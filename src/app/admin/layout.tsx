"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../dashboard/dashboard.module.css";
import React, { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import AiChat from "../components/AiChat";
import { 
    Search, 
    Bell, 
    LogOut, 
    Settings, 
    Users, 
    Zap, 
    Shield, 
    Grid2X2, 
    Monitor, 
    Database,
    ShieldAlert,
    BarChart3
} from "lucide-react";

type UserData = { name: string; role: string; email: string };

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [user, setUser] = useState<UserData>({ 
        name: "Admin Operator", 
        role: "SUPER ADMIN", 
        email: "admin@blonk.ai" 
    });
    
    const userMenuAnchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch admin specific settings if needed
    }, []);

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const onShellMouseDownCapture = (e: React.MouseEvent) => {
        if (!showUserMenu) return;
        const target = e.target as Node | null;
        if (!target) return;
        if (showUserMenu && userMenuAnchorRef.current && !userMenuAnchorRef.current.contains(target)) setShowUserMenu(false);
    };

    const getModuleTitle = (path: string) => {
        if (path === '/admin') return 'Fleet Provisioning';
        if (path === '/admin/analytics') return 'Analytics Overview';
        if (path === '/admin/marketplace') return 'Marketplace Management';
        if (path === '/admin/users') return 'User Directory';
        return 'System Control';
    };

    return (
        <div className={styles.appShell} onMouseDownCapture={onShellMouseDownCapture}>
            <div className={styles.noise} />
            
            {/* SOVEREIGN ADMIN SIDEBAR */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <Link href="/admin" className={styles.logo}>
                        <span className={styles.logoSquare}></span>BLONK<span style={{ color: '#34D186', marginLeft: '4px' }}>ADMN</span>
                    </Link>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>Operations</span>
                        <ul>
                            <li>
                                <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.navLinkActive : ''}`}>
                                    <Database size={20} /> Loop Config
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/analytics" className={`${styles.navLink} ${pathname === '/admin/analytics' ? styles.navLinkActive : ''}`}>
                                    <BarChart3 size={20} /> Analytics
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/marketplace" className={`${styles.navLink} ${pathname === '/admin/marketplace' ? styles.navLinkActive : ''}`}>
                                    <Zap size={20} /> Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/users" className={`${styles.navLink} ${pathname === '/admin/users' ? styles.navLinkActive : ''}`}>
                                    <Users size={20} /> User Registry
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>System</span>
                        <ul>
                            <li>
                                <Link href="/dashboard" className={styles.navLink}>
                                    <Grid2X2 size={20} /> App Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className={styles.usageSection}>
                     <div className={styles.usageCard} style={{ borderColor: '#34D186', background: '#F0FAF5' }}>
                         <div className={styles.usagePlanTop}>
                             <span className={styles.planBadge} style={{ background: '#34D186', color: '#111' }}>SYSTEM ACTIVE</span>
                             <div className={styles.tierDots}><span className={styles.tierDot}/><span className={styles.tierDot}/><span className={styles.tierDot}/></div>
                         </div>
                         <div className={styles.statLabel} style={{ color: '#059669' }}>Root Privilege</div>
                         <div className={styles.statValue}>Sovereign Access</div>
                     </div>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topbar}>
                    <div className={styles.topbarInner}>
                        <div className={styles.topbarContext}>
                            <h1 className={styles.pageTitle}>{getModuleTitle(pathname)}</h1>
                        </div>

                        <div className={styles.searchWrapper}>
                             <Search className={styles.searchIcon} size={18} />
                             <input type="text" placeholder="Search system records..." className={styles.searchInput} />
                        </div>

                        <div className={styles.topbarActions}>
                            <button className={styles.iconBtn}>
                                <Bell size={20} />
                            </button>

                            <div ref={userMenuAnchorRef} className={styles.dropdownAnchor}>
                                <button className={styles.userProfile} onClick={() => setShowUserMenu(!showUserMenu)}>
                                    <div className={styles.userData}>
                                        <strong>{user.name}</strong>
                                        <span>{user.role}</span>
                                    </div>
                                    <div className={styles.avatar} style={{ background: '#34D186' }}>{user.name.charAt(0)}</div>
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

