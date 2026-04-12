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
        return 'Operations Control Panel';
    };

    return (
        <div className={styles.adminShell} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* SIDEBAR: Admin Controls */}
            <aside className={styles.sidebar} style={{ background: 'var(--card)', borderRight: '1px solid var(--border)' }}>
                <div className={styles.logoSection}>
                    <Link href="/admin" className={styles.logo} style={{ color: 'var(--foreground)' }}>
                        BLONK <span style={{ color: 'var(--accent)', fontSize: '0.75rem', verticalAlign: 'top', marginLeft: '4px', fontWeight: 950 }}>ADMIN</span>
                    </Link>
                </div>

                <nav className={styles.nav}>
                    <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/admin' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        <Shield size={18} /> <span>Provisioning</span>
                    </Link>
                    <Link href="/admin/users" className={`${styles.navLink} ${pathname === '/admin/users' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/admin/users' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        <Users size={18} /> <span>Operators</span>
                    </Link>
                    <Link href="/admin/marketplace" className={`${styles.navLink} ${pathname === '/admin/marketplace' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/admin/marketplace' ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        <Zap size={18} /> <span>Registry</span>
                    </Link>
                    <Link href="/dashboard" className={styles.navLink} style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '24px', color: 'var(--muted-foreground)' }}>
                        <Monitor size={18} /> <span>Exit Control</span>
                    </Link>
                </nav>
            </aside>

            {/* MAIN ADMIN AREA */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <header style={{ height: '80px', background: 'var(--card)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 48px', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>{getModuleTitle(pathname)}</h2>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--muted)', padding: '6px 16px', borderRadius: '100px', border: '1px solid var(--border)' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--foreground)', letterSpacing: '0.05em' }}>NODE CLUSTER: GLOBAL_ALPHA</span>
                        </div>
                    </div>
                </header>
                <div style={{ flex: 1, overflowY: 'auto', padding: '48px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
