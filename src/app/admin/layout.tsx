"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { 
    LayoutGrid, Layers, Shield, Activity, Map, Network, Settings, Server,
    Bell, Search, LogOut, X, Info, CheckCircle, AlertTriangle, ChevronRight, AlertCircle,
    Brain, Users
} from "lucide-react";
import adminStyles from "./admin.module.css";

interface SidebarLink {
    name: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SidebarCategory {
    category: string;
    links: SidebarLink[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const userMenuAnchorRef = useRef<HTMLDivElement>(null);
    const notifsAnchorRef = useRef<HTMLDivElement>(null);
    const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' | 'warning' }[]>([]);

    useEffect(() => {
        const handleShowToast = (e: Event) => {
            const customEvent = e as CustomEvent<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>;
            const { message, type } = customEvent.detail;
            const id = Math.random().toString(36).slice(2, 9);
            
            setToasts(prev => [...prev, { id, message, type }]);

            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 4500);
        };

        window.addEventListener('show-toast', handleShowToast);
        
        (window as any).showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
        };

        return () => {
            window.removeEventListener('show-toast', handleShowToast);
        };
    }, []);

    // Validate admin_token on every admin route (except /admin/login itself)
    useEffect(() => {
        if (pathname === "/admin/login") {
            setIsAuthChecked(true);
            return;
        }

        if (isAuthChecked) return;

        (async () => {
            try {
                const res = await fetch("/api/admin/session");
                if (!res.ok) {
                    router.replace("/admin/login");
                    return;
                }
                const data = await res.json();
                if (data.user) {
                    setUser({
                        name: data.user.name || data.user.email?.split('@')[0] || "Admin",
                        role: data.user.role || "SuperAdmin",
                        email: data.user.email || "",
                    });
                } else {
                    router.replace("/admin/login");
                    return;
                }
                setIsAuthChecked(true);
            } catch {
                router.replace("/admin/login");
            }
        })();
    }, [pathname, router, isAuthChecked]);

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "GET" });
        router.replace("/admin/login");
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (userMenuAnchorRef.current && !userMenuAnchorRef.current.contains(target)) setShowUserMenu(false);
        if (notifsAnchorRef.current && !notifsAnchorRef.current.contains(target)) setShowNotifs(false);
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    if (!isAuthChecked) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                    Authenticating Admin Session...
                </div>
            </div>
        );
    }

    const navigationStructure: SidebarCategory[] = [
        {
            category: "Main",
            links: [
                { name: "Overview", href: "/admin", icon: LayoutGrid },
                { name: "Customers", href: "/admin/workspaces", icon: Layers },
                { name: "Deployments", href: "/admin/deployments", icon: Server },
                { name: "Analytics", href: "/admin/analytics", icon: Activity },
            ]
        },
        {
            category: "Configuration",
            links: [
                { name: "Automation Library", href: "/admin/brain", icon: Layers },
                { name: "AI Employee Templates", href: "/admin/ai-employees", icon: Users },
                { name: "Automation Catalog", href: "/admin/blueprints", icon: Map },
                { name: "Integrations", href: "/admin/integrations", icon: Network },
            ]
        },
        {
            category: "System",
            links: [
                { name: "Servers", href: "/admin/servers", icon: Server },
                { name: "Settings", href: "/admin/settings", icon: Settings },
            ]
        }
    ];

    // Determine current page context metadata for header and breadcrumbs
    let activeLinkName = "Overview";
    let activeCategoryName = "Main";
    
    for (const cat of navigationStructure) {
        const matchingLink = cat.links.find(l => {
            if (l.href === "/admin") {
                return pathname === "/admin";
            }
            return pathname.startsWith(l.href);
        });
        if (matchingLink) {
            activeLinkName = matchingLink.name;
            activeCategoryName = cat.category;
            break;
        }
    }

    return (
        <div className={adminStyles.adminShell}>
            {/* Sidebar */}
            <aside className={adminStyles.sidebar}>
                <div className={adminStyles.logoSection}>
                    <Link href="/admin" className={adminStyles.logo}>
                        <div style={{ width: "12px", height: "12px", background: "var(--accent)", borderRadius: "2px", marginRight: "10px" }} />
                        BLONK <span style={{ color: "var(--accent)", fontSize: "0.75rem", verticalAlign: "top", marginLeft: "6px", fontWeight: 950 }}>ADMIN</span>
                    </Link>
                </div>

                <nav className={adminStyles.nav} style={{ overflowY: "auto", paddingRight: "4px" }}>
                    {navigationStructure.map((group, idx) => (
                        <div key={idx} className={group.category === "System" ? "" : adminStyles.navGroup} style={{ marginBottom: group.category === "System" ? "0" : "28px" }}>
                            <span className={adminStyles.navGroupLabel} style={{ marginBottom: "12px" }}>{group.category}</span>
                            <ul>
                                {group.links.map((link, lIdx) => {
                                    const Icon = link.icon;
                                    const isActive = link.href === "/admin" 
                                        ? pathname === "/admin" 
                                        : pathname.startsWith(link.href);
                                    return (
                                        <li key={lIdx}>
                                            <Link 
                                                href={link.href} 
                                                className={`${adminStyles.navLink} ${isActive ? adminStyles.navLinkActive : ""}`}
                                                style={{ padding: "10px 14px", fontSize: "0.85rem", gap: "10px" }}
                                            >
                                                <Icon size={16} />
                                                <span>{link.name}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className={adminStyles.usageSection} style={{ marginTop: "auto", paddingTop: "16px" }}>
                    <div className={adminStyles.usageCard} style={{ padding: "16px" }}>
                        <div className={adminStyles.usagePlanTop} style={{ marginBottom: "12px" }}>
                            <span className={adminStyles.planBadge}>SuperAdmin</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                <span style={{ fontSize: '0.6rem', fontWeight: 950, color: '#10B981' }}>NOMINAL</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted-foreground)' }}>
                            System Mode: Operating Center
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content Area Container */}
            <main className={adminStyles.mainContent}>
                {/* Header */}
                <header className={adminStyles.adminHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <h2 style={{ fontSize: "1.15rem", fontWeight: 950, color: "var(--foreground)", letterSpacing: "-0.02em", margin: 0, textTransform: "uppercase" }}>
                            {activeLinkName}
                        </h2>
                    </div>

                    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                        <div style={{ position: "relative" }}>
                            <Search style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} size={16} />
                            <input
                                type="text"
                                placeholder="Search operations indexes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: "260px", height: "40px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "12px", padding: "0 16px 0 44px", fontSize: "0.85rem", fontWeight: 700, color: "var(--foreground)", outline: "none" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <div ref={notifsAnchorRef} style={{ position: "relative" }}>
                                <button type="button" className={adminStyles.refreshBtn} onClick={() => setShowNotifs(!showNotifs)} style={{ width: "40px", height: "40px", borderRadius: "12px" }}>
                                    <Bell size={18} />
                                </button>
                                {showNotifs && (
                                    <div style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "300px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "var(--shadow-premium)", padding: "12px", zIndex: 1000 }}>
                                        <div style={{ padding: "12px", borderBottom: "1px solid var(--border)", marginBottom: "8px", fontSize: "0.75rem", fontWeight: 950, textTransform: "uppercase", color: "var(--muted-foreground)" }}>System Alerts</div>
                                        <div style={{ padding: "16px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.8rem" }}>All operations are running normally. No warnings triggered.</div>
                                    </div>
                                )}
                            </div>

                            <div ref={userMenuAnchorRef} style={{ position: "relative" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--muted)", padding: "4px 4px 4px 12px", borderRadius: "12px", border: "1px solid var(--border)", cursor: "pointer" }}
                                >
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.8rem", fontWeight: 950, color: "var(--foreground)" }}>{user?.name ?? "—"}</div>
                                    </div>
                                    <div style={{ width: "30px", height: "30px", background: "var(--foreground)", color: "var(--background)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950, fontSize: "0.8rem" }}>
                                        {user?.name?.charAt(0) ?? "?"}
                                    </div>
                                </button>

                                {showUserMenu && (
                                    <div style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "240px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "20px", boxShadow: "var(--shadow-premium)", padding: "10px", zIndex: 1000 }}>
                                        <div style={{ padding: "12px", borderBottom: "1px solid var(--border)", marginBottom: "8px" }}>
                                            <div style={{ fontWeight: 950, color: "var(--foreground)", fontSize: "0.85rem" }}>{user?.name ?? "—"}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{user?.email ?? "—"}</div>
                                        </div>
                                        <button
                                            type="button"
                                            className={adminStyles.navLink}
                                            style={{ width: "100%", border: "none", background: "none", justifyContent: "flex-start", color: "var(--destructive)", cursor: "pointer", padding: "10px 12px", fontSize: "0.8rem" }}
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={16} /> Logout Session
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Sub-header Context / Breadcrumbs */}
                <div style={{ padding: "16px 48px 0", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.7rem", fontWeight: 900, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    <span>Admin</span>
                    <ChevronRight size={10} style={{ opacity: 0.5 }} />
                    <span>{activeCategoryName}</span>
                    <ChevronRight size={10} style={{ opacity: 0.5 }} />
                    <span style={{ color: "var(--foreground)" }}>{activeLinkName}</span>
                </div>

                {/* Page Content area */}
                <div className={adminStyles.contentArea}>
                    {children}
                </div>
            </main>

            {/* Stacked Toast Notification Center */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                {toasts.map(toast => {
                    let icon = <Info size={18} />;
                    let border = '1px solid #E2E8F0';
                    let bg = 'rgba(255, 255, 255, 0.9)';
                    let text = '#0F172A';
                    let accentColor = '#64748B';

                    if (toast.type === 'success') {
                        icon = <CheckCircle size={18} color="#10B981" />;
                        border = '1px solid rgba(16, 185, 129, 0.2)';
                        bg = 'rgba(255, 255, 255, 0.95)';
                        accentColor = '#10B981';
                    } else if (toast.type === 'error') {
                        icon = <AlertCircle size={18} color="#EF4444" />;
                        border = '1px solid rgba(239, 68, 68, 0.2)';
                        bg = 'rgba(255, 255, 255, 0.95)';
                        accentColor = '#EF4444';
                    } else if (toast.type === 'warning') {
                        icon = <AlertTriangle size={18} color="#F59E0B" />;
                        border = '1px solid rgba(245, 158, 11, 0.2)';
                        bg = 'rgba(255, 255, 255, 0.95)';
                        accentColor = '#F59E0B';
                    }

                    return (
                        <div 
                            key={toast.id}
                            style={{
                                pointerEvents: 'auto',
                                minWidth: '340px',
                                maxWidth: '420px',
                                background: bg,
                                backdropFilter: 'blur(12px)',
                                border: border,
                                borderLeft: `4px solid ${accentColor}`,
                                borderRadius: '16px',
                                padding: '16px 20px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                            }}
                        >
                            <style>{`
                                @keyframes slideIn {
                                    from { transform: translateX(100%) translateY(0); opacity: 0; }
                                    to { transform: translateX(0) translateY(0); opacity: 1; }
                                }
                            `}</style>
                            <div style={{ flexShrink: 0 }}>{icon}</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: text, lineHeight: 1.4, flexGrow: 1 }}>
                                {toast.message}
                            </div>
                            <button 
                                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--muted-foreground)', cursor: 'pointer', display: 'flex', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#475569'}
                                onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
