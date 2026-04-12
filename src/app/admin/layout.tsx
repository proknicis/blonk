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
        <div className={styles.adminShell} style={{ backgroundColor: '#FAFAFA', color: '#111' }}>
            {/* SIDEBAR: Admin Controls */}
            <aside className={styles.sidebar} style={{ backgroundColor: '#FFFFFF', color: '#111', borderRight: '1px solid rgba(0,0,0,0.05)' }}>
                <div className={styles.logoSection}>
                    <Link href="/admin" className={styles.logo} style={{ color: '#111' }}>
                        BLONK <span style={{ color: '#34D186', fontSize: '0.8rem', verticalAlign: 'top', marginLeft: '4px' }}>ADMIN</span>
                    </Link>
                </div>

                <nav className={styles.nav}>
                    <Link href="/admin" className={`${styles.navLink} ${pathname === '/admin' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/admin' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                        <Shield size={18} /> Fleet Provisioning
                    </Link>
                    <Link href="/admin/users" className={`${styles.navLink} ${pathname === '/admin/users' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/admin/users' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                        <Users size={18} /> User Management
                    </Link>
                    <Link href="/admin/marketplace" className={`${styles.navLink} ${pathname === '/admin/marketplace' ? styles.navLinkActive : ''}`} style={{ color: pathname === '/admin/marketplace' ? '#111' : 'rgba(0,0,0,0.4)' }}>
                        <Zap size={18} /> Node Registry
                    </Link>
                    <Link href="/dashboard" className={styles.navLink} style={{ marginTop: 'auto', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px', color: 'rgba(0,0,0,0.4)' }}>
                        <Monitor size={18} /> Exit Admin
                    </Link>
                </nav>
            </aside>

            {/* MAIN ADMIN AREA */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#FAFAFA' }}>
                <header style={{ height: '80px', background: '#FFFFFF', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#111', letterSpacing: '-0.02em' }}>Operations Control Panel</h2>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34D186', boxShadow: '0 0 10px #34D186' }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: '#111' }}>REGIONAL CLUSTER: US-EAST-1</span>
                        </div>
                    </div>
                </header>
                <div style={{ flex: 1, overflowY: 'auto', padding: '40px' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}

