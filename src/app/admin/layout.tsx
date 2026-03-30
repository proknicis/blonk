"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "../dashboard/dashboard.module.css";
import React, { useState, useEffect } from "react";
import AiChat from "../components/AiChat";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuth, setIsAuth] = useState(false);
    const [user, setUser] = useState({ name: "Admin", role: "Super Admin", initials: "A" });

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token && pathname !== "/admin/login") {
            router.push("/admin/login");
        } else if (token) {
            setIsAuth(true);
        }
    }, [pathname, router]);

    const handleLogout = () => {
        localStorage.removeItem("admin_token");
        router.push("/admin/login");
    };

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (!isAuth) {
        return <div style={{ height: "100vh", background: "#F8F9FA" }} />;
    }

    const navItems = [
        { name: "Workflow Config", href: "/admin", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> },
        { name: "Marketplace Management", href: "/admin/marketplace", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> },
        { name: "User Management", href: "/admin/users", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
        { name: "App Dashboard", href: "/dashboard", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    ];

    return (
        <>
        <div className={styles.appShell}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarBrand}>
                    <Link href="/admin" className={styles.logo}>
                        BLONK<span style={{ color: '#34D186' }}> ADMIN</span>
                    </Link>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navGroup}>
                        <span className={styles.navGroupLabel}>System Control</span>
                        <ul>
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className={`${styles.navLink} ${pathname === item.href ? styles.navLinkActive : ''}`}
                                    >
                                        {item.icon}
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>

                <div className={styles.navGroup} style={{ marginTop: 'auto' }}>
                    <button onClick={handleLogout} className={styles.navLink} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF5252" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span style={{ color: '#FF5252' }}>Logout</span>
                    </button>
                </div>
            </aside>

            <main className={styles.mainContent}>
                <header className={styles.topbar}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIcon}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <input type="text" placeholder="Search system records..." className={styles.searchInput} />
                    </div>

                    <div className={styles.topbarActions}>
                        <div className={styles.userProfile}>
                            <div className={styles.userData}>
                                <strong>{user.name}</strong>
                                <span>{user.role}</span>
                            </div>
                            <div className={styles.avatar} style={{ background: '#34D186' }}>
                                {user.initials}
                            </div>
                        </div>
                    </div>
                </header>
                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
        <AiChat />
        </>
    );
}
