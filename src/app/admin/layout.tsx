"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { 
    Users, 
    Zap, 
    Shield, 
    Monitor 
} from "lucide-react";
import adminStyles from "./admin.module.css";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const getModuleTitle = (path: string) => {
        if (path === '/admin') return 'Fleet Provisioning';
        if (path === '/admin/users') return 'User Directory';
        if (path === '/admin/marketplace') return 'Marketplace Management';
        return 'Operations Control Panel';
    };

    return (
        <div className={adminStyles.adminShell}>
            <aside className={adminStyles.sidebar}>
                <div className={adminStyles.logoSection}>
                    <Link href="/admin" className={adminStyles.logo}>
                        BLONK <span style={{ color: 'var(--accent)', fontSize: '0.75rem', verticalAlign: 'top', marginLeft: '4px', fontWeight: 950 }}>ADMIN</span>
                    </Link>
                </div>

                <nav className={adminStyles.nav}>
                    <Link href="/admin" className={`${adminStyles.navLink} ${pathname === '/admin' ? adminStyles.navLinkActive : ''}`}>
                        <Shield size={18} /> <span>Provisioning</span>
                    </Link>
                    <Link href="/admin/users" className={`${adminStyles.navLink} ${pathname === '/admin/users' ? adminStyles.navLinkActive : ''}`}>
                        <Users size={18} /> <span>Operators</span>
                    </Link>
                    <Link href="/admin/marketplace" className={`${adminStyles.navLink} ${pathname === '/admin/marketplace' ? adminStyles.navLinkActive : ''}`}>
                        <Zap size={18} /> <span>Registry</span>
                    </Link>
                    <Link href="/dashboard" className={adminStyles.navLink} style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                        <Monitor size={18} /> <span>Exit Control</span>
                    </Link>
                </nav>
            </aside>

            <main className={adminStyles.mainContent}>
                <header className={adminStyles.adminHeader}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--foreground)', letterSpacing: '-0.02em' }}>{getModuleTitle(pathname)}</h2>
                    <div className={adminStyles.hubMetrics}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)' }} />
                        <span className={adminStyles.hubLabel}>NODE CLUSTER: GLOBAL_ALPHA</span>
                    </div>
                </header>
                <div className={adminStyles.contentArea}>
                    {children}
                </div>
            </main>
        </div>
    );
}
