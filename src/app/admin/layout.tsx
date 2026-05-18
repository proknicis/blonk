"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";
import { Users, Zap, Shield, Search, Bell, LogOut, ExternalLink, MessageSquare, BarChart3, Activity, LayoutGrid, CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import adminStyles from "./admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [n8nData, setN8nData] = useState<{ workflows: any[], activeCount: number, status: 'Connected' | 'Offline' | 'Checking' }>({
        workflows: [],
        activeCount: 0,
        status: 'Checking'
    });
    const userMenuAnchorRef = useRef<HTMLDivElement>(null);
    const notifsAnchorRef = useRef<HTMLDivElement>(null);

    // Toast manager state
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
        
        // Define global helper for easy inline page invocation
        (window as any).showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
        };

        return () => {
            window.removeEventListener('show-toast', handleShowToast);
        };
    }, []);

    const [user, setUser] = useState({
        name: "Admin Operator",
        role: "SUPER ADMIN",
        email: "admin@blonk.ai",
    });

    // Validate admin_token on every admin route (except /admin/login itself)
    useEffect(() => {
        if (pathname === "/admin/login") {
            setIsAuthChecked(true);
            return;
        }

        if (isAuthChecked) return; // Prevent redundant checks and race condition redirect issues during page transitions

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
                        name: data.user.name || "Admin Operator",
                        role: data.user.role || "SUPER ADMIN",
                        email: data.user.email || "admin@blonk.ai",
                    });
                }
                setIsAuthChecked(true);
            } catch {
                // If it's a genuine network failure or redirection
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
        const fetchN8nStatus = async () => {
            try {
                const res = await fetch("/api/n8n/workflows");
                if (!res.ok) throw new Error("Offline");
                const json = await res.json();
                const workflows = json.data || [];
                const active = workflows.filter((w: any) => w.active).length;
                setN8nData({
                    workflows,
                    activeCount: active,
                    status: 'Connected'
                });
            } catch (err) {
                setN8nData(prev => ({ ...prev, status: 'Offline' }));
            }
        };

        fetchN8nStatus();
        const interval = setInterval(fetchN8nStatus, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Login page: render without the admin shell
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Block render until session is confirmed
    if (!isAuthChecked) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--background)" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                    Authenticating...
                </div>
            </div>
        );
    }

    const getModuleTitle = (path: string) => {
        if (path === "/admin") return "FLEET PROVISIONING";
        if (path === "/admin/users") return "USERS";
        if (path === "/admin/fleet") return "FLEET HEALTH MONITORING";
        if (path === "/admin/incidents") return "INCIDENT COMMAND CENTER";
        if (path.startsWith("/admin/marketplace")) return "MARKETPLACE MANAGEMENT";
        if (path.startsWith("/admin/support")) return "SUPPORT INBOX";
        if (path.startsWith("/admin/audit")) return "AUDIT TRAIL";
        return "ADMIN CONTROL PANEL";
    };

    return (
        <div className={adminStyles.adminShell}>
            <aside className={adminStyles.sidebar}>
                <div className={adminStyles.logoSection}>
                    <Link href="/admin" className={adminStyles.logo}>
                        <div style={{ width: "12px", height: "12px", background: "var(--accent)", borderRadius: "2px", marginRight: "10px" }} />
                        BLONK <span style={{ color: "var(--accent)", fontSize: "0.75rem", verticalAlign: "top", marginLeft: "6px", fontWeight: 950 }}>ADMIN</span>
                    </Link>
                </div>

                <nav className={adminStyles.nav}>
                    <div className={adminStyles.navGroup}>
                        <span className={adminStyles.navGroupLabel}>FLEET CONTROL</span>
                        <ul>
                            <li>
                                <Link href="/admin" className={`${adminStyles.navLink} ${pathname === "/admin" ? adminStyles.navLinkActive : ""}`}>
                                    <LayoutGrid size={20} /> Provisioning
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/marketplace" className={`${adminStyles.navLink} ${pathname.startsWith("/admin/marketplace") ? adminStyles.navLinkActive : ""}`}>
                                    <Zap size={20} /> Registry
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/fleet" className={`${adminStyles.navLink} ${pathname === "/admin/fleet" ? adminStyles.navLinkActive : ""}`}>
                                    <Activity size={20} /> Health Monitoring
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={adminStyles.navGroup}>
                        <span className={adminStyles.navGroupLabel}>GOVERNANCE</span>
                        <ul>
                            <li>
                                <Link href="/admin/users" className={`${adminStyles.navLink} ${pathname === "/admin/users" ? adminStyles.navLinkActive : ""}`}>
                                    <Users size={20} /> Operators
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/incidents" className={`${adminStyles.navLink} ${pathname === "/admin/incidents" ? adminStyles.navLinkActive : ""}`}>
                                    <Shield size={20} /> Incident Command
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin/support" className={`${adminStyles.navLink} ${pathname === "/admin/support" ? adminStyles.navLinkActive : ""}`}>
                                    <MessageSquare size={20} /> Support Inbox
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={adminStyles.navGroup}>
                        <span className={adminStyles.navGroupLabel}>SYSTEM</span>
                        <ul>
                            <li>
                                <Link href="/admin/audit" className={`${adminStyles.navLink} ${pathname === "/admin/audit" ? adminStyles.navLinkActive : ""}`}>
                                    <BarChart3 size={20} /> Audit Trail
                                </Link>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); (window as any).showToast("Access & Roles configurations are managed by root admin policy.", "warning"); }} className={adminStyles.navLink}>
                                    <Shield size={20} /> Access & Roles
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); (window as any).showToast("System Settings are locked by governance keys.", "error"); }} className={adminStyles.navLink}>
                                    <MessageSquare size={20} /> Settings
                                </a>
                            </li>
                            <li>
                                <a href="#" onClick={(e) => { e.preventDefault(); (window as any).showToast("System Integrations are nominal and running on manadavana.lv server.", "success"); }} className={adminStyles.navLink}>
                                    <ExternalLink size={20} /> Integrations
                                </a>
                            </li>
                            <li>
                                <Link href="/dashboard" className={adminStyles.navLink}>
                                    <LogOut size={20} /> Exit to Firm
                                </Link>
                            </li>
                        </ul>
                    </div>
                </nav>

                <div className={adminStyles.usageSection}>
                    <div className={adminStyles.usageCard}>
                        <div className={adminStyles.usagePlanTop}>
                            <span className={adminStyles.planBadge}>Root Operator</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 8px', background: '#10B98115', border: '1px solid #10B98125', borderRadius: '100px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                <span style={{ fontSize: '0.6rem', fontWeight: 950, color: '#10B981' }}>HEALTHY</span>
                            </div>
                        </div>
                        <div style={{ marginBottom: "12px" }}>
                            <div className={adminStyles.statLabel}>Global Node Load</div>
                            <div className={adminStyles.statValue}>
                                {n8nData.status === 'Connected'
                                    ? `${Math.round((n8nData.activeCount / (n8nData.workflows.length || 1)) * 100)}% Active`
                                    : '30% Active'}
                            </div>
                        </div>
                        <div className={adminStyles.barContainer}>
                            <div
                                className={adminStyles.barFill}
                                style={{
                                    width: n8nData.status === 'Connected'
                                        ? `${(n8nData.activeCount / (n8nData.workflows.length || 1)) * 100}%`
                                        : '30%',
                                    transition: 'width 0.5s ease-in-out'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </aside>

            <main className={adminStyles.mainContent}>
                <header className={adminStyles.adminHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: 950, color: "var(--foreground)", letterSpacing: "-0.02em", margin: 0 }}>
                            {getModuleTitle(pathname)}
                        </h2>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 12px", background: "rgba(52,209,134,0.08)", borderRadius: "100px", border: "1px solid rgba(52,209,134,0.15)" }}>
                            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 8px var(--accent)" }} />
                            <span style={{ fontSize: "0.65rem", fontWeight: 950, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em" }}>System Nominal</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                        <div style={{ position: "relative" }}>
                            <Search style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--muted-foreground)", pointerEvents: "none" }} size={18} />
                            <input
                                type="text"
                                placeholder="Search administrative records..."
                                style={{ width: "320px", height: "48px", background: "var(--muted)", border: "1px solid var(--border)", borderRadius: "16px", padding: "0 48px", fontSize: "0.9rem", fontWeight: 700, color: "var(--foreground)", outline: "none" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <div ref={notifsAnchorRef} style={{ position: "relative" }}>
                                <button type="button" className={adminStyles.refreshBtn} onClick={() => setShowNotifs(!showNotifs)} style={{ width: "48px", height: "48px", borderRadius: "14px" }}>
                                    <Bell size={20} />
                                </button>
                                {showNotifs && (
                                    <div style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "300px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "var(--shadow-premium)", padding: "12px", zIndex: 1000 }}>
                                        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", marginBottom: "8px", fontSize: "0.75rem", fontWeight: 950, textTransform: "uppercase", color: "var(--muted-foreground)" }}>Global Notifications</div>
                                        <div style={{ padding: "24px", textAlign: "center", color: "var(--muted-foreground)", fontSize: "0.85rem" }}>No critical alerts found.</div>
                                    </div>
                                )}
                            </div>

                            <div ref={userMenuAnchorRef} style={{ position: "relative" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    style={{ display: "flex", alignItems: "center", gap: "14px", background: "var(--muted)", padding: "6px 6px 6px 16px", borderRadius: "16px", border: "1px solid var(--border)", cursor: "pointer" }}
                                >
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 950, color: "var(--foreground)" }}>{user.name}</div>
                                        <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--muted-foreground)", textTransform: "uppercase" }}>{user.role}</div>
                                    </div>
                                    <div style={{ width: "36px", height: "36px", background: "var(--foreground)", color: "var(--background)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 950 }}>
                                        {user.name.charAt(0)}
                                    </div>
                                </button>

                                {showUserMenu && (
                                    <div style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: "280px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", boxShadow: "var(--shadow-premium)", padding: "12px", zIndex: 1000 }}>
                                        <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", marginBottom: "8px" }}>
                                            <div style={{ fontWeight: 950, color: "var(--foreground)" }}>{user.name}</div>
                                            <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>{user.email}</div>
                                        </div>
                                        <button
                                            type="button"
                                            className={adminStyles.navLink}
                                            style={{ width: "100%", border: "none", background: "none", justifyContent: "flex-start", color: "var(--destructive)", cursor: "pointer" }}
                                            onClick={handleLogout}
                                        >
                                            <LogOut size={18} /> Logout Session
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
                <div className={adminStyles.contentArea}>
                    {children}
                </div>
            </main>

            {/* Premium In-App Stacked Toast Notification Center */}
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
                                style={{ background: 'none', border: 'none', padding: 0, color: '#94A3B8', cursor: 'pointer', display: 'flex', transition: 'color 0.2s' }}
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
