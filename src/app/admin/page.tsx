"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

function Counter({ value }: { value: number }) {
    const count = useMotionValue(0);
    const rounded = useTransform(count, Math.round);

    useEffect(() => {
        const animation = animate(count, value, { duration: 0.8, ease: "easeOut" });
        return animation.stop;
    }, [value, count]);

    return <motion.span>{rounded}</motion.span>;
}
import { 
    Layers, Shield, Activity, Clock, AlertTriangle, 
    ArrowUpRight, AlertCircle, CheckCircle, Info, ChevronRight, UserCheck
} from "lucide-react";
import adminStyles from "./admin.module.css";

export default function OverviewPage() {
    const router = useRouter();
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [auditEvents, setAuditEvents] = useState<any[]>([]);
    const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
    const [servers, setServers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const usersRes = await fetch("/api/admin/users");
            const workspacesData = usersRes.ok ? await usersRes.json() : [];
            const filteredWorkspaces = workspacesData.filter((w: any) => w.role !== "SuperAdmin");
            setWorkspaces(filteredWorkspaces);

            const approvalsRes = await fetch("/api/admin/approvals");
            const approvalsData = approvalsRes.ok ? await approvalsRes.json() : [];
            setApprovals(approvalsData);

            const eventsRes = await fetch("/api/admin/events");
            const eventsData = eventsRes.ok ? await eventsRes.json() : [];
            setAuditEvents(eventsData);

            const logsRes = await fetch("/api/admin/logs");
            const logsData = logsRes.ok ? await logsRes.json() : [];
            setTelemetryLogs(logsData);

            const nodesRes = await fetch("/api/admin/nodes");
            const nodesData = nodesRes.ok ? await nodesRes.json() : [];
            setServers(nodesData);
        } catch (e) {
            console.error("Failed to fetch dashboard data:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Relative time utility helper
    const getRelativeTimeString = (dateString: string) => {
        if (!dateString) return "recently";
        const now = new Date();
        const then = new Date(dateString);
        const diffMs = now.getTime() - then.getTime();
        if (isNaN(diffMs)) return "recently";
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    // Friendly status mapper
    const getFriendlyStatus = (state: string) => {
        const s = String(state || "").toUpperCase();
        if (s === 'ACTIVATED' || s === 'READY' || s === 'ACTIVE') return "Active";
        if (s === 'CONNECTIONS_IN_PROGRESS' || s === 'AWAITING_CREDENTIALS' || s === 'NEEDS_CREDENTIALS') return "Needs a Connection";
        return "Not Started";
    };

    // Dynamic KPIs calculations
    const totalWorkspaces = workspaces.length;
    const inActivation = workspaces.filter(w => 
        w.activationStatus === 'DEPLOYING' || w.activationStatus === 'READY_FOR_DEPLOY'
    ).length;
    const awaitingCredentials = workspaces.filter(w => 
        w.activationStatus === 'CONNECTIONS_IN_PROGRESS'
    ).length;
    const pendingApprovals = approvals.filter(a => a.status === 'PENDING').length;
    const failedRunsCount = telemetryLogs.filter(l => 
        l.status?.toLowerCase() === 'error' || l.status?.toLowerCase() === 'failed'
    ).length;

    // Create action queue
    const actionItems: { title: string; desc: string; type: "approval" | "failed_run" | "workspace" | "server"; href: string }[] = [];
    
    // 1. Offline servers
    servers.filter(s => s.status !== 'Active').forEach(node => {
        actionItems.push({
            title: `Infrastructure Alarm: Server ${node.name} is OFFLINE`,
            desc: `Node API at ${node.url} is unreachable. Check hosting settings.`,
            type: "server",
            href: `/admin/servers/${node.id}`
        });
    });

    // 2. Approvals requiring attention
    approvals.filter(a => a.status === 'PENDING').forEach(app => {
        actionItems.push({
            title: `Approval Gate Triggered: ${app.policyName || 'invoice_limit_override'}`,
            desc: `High-risk event awaiting authorization requested by ${app.requestedBy || 'Autonomous Engine'}.`,
            type: "approval",
            href: "/admin/approvals"
        });
    });

    // 3. Group and Deduplicate Failed Runs
    const failedRuns = telemetryLogs.filter(l => l.status?.toLowerCase() === 'error' || l.status?.toLowerCase() === 'failed');
    const groupedFailures: Record<string, { log: any; count: number }> = {};
    failedRuns.forEach(log => {
        const key = `${log.workflowName}-${log.teamId}`;
        if (!groupedFailures[key]) {
            groupedFailures[key] = { log, count: 0 };
        }
        groupedFailures[key].count += 1;
        if (new Date(log.executedAt) > new Date(groupedFailures[key].log.executedAt)) {
            groupedFailures[key].log = log;
        }
    });

    Object.values(groupedFailures).slice(0, 5).forEach(({ log, count }) => {
        const affectedCustomer = workspaces.find(w => w.teamId === log.teamId);
        const customerName = affectedCustomer?.firmName || "Unknown Customer";
        const relativeTime = getRelativeTimeString(log.executedAt);
        
        actionItems.push({
            title: `${log.workflowName} failed (occurred ${count} times)`,
            desc: `Customer: ${customerName} | ${relativeTime}`,
            type: "failed_run",
            href: affectedCustomer ? `/admin/workspaces/${affectedCustomer.id}` : "/admin/telemetry?filter=error"
        });
    });

    // 4. Workspaces suspended or needing intervention
    workspaces.filter(w => w.status === 'Suspended').forEach(ws => {
        actionItems.push({
            title: `Intervention Required: ${ws.firmName || 'Sovereign Workspace'}`,
            desc: `Operations suspended. Action required on credential mappings.`,
            type: "workspace",
            href: `/admin/workspaces/${ws.id}`
        });
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* KPI MATRIX */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {[
                    { label: 'Active Customers', value: totalWorkspaces, desc: 'Registered customers', icon: Layers, color: 'var(--accent)', href: '/admin/workspaces?filter=all' },
                    { label: 'In Activation', value: inActivation, desc: 'Customers being set up', icon: Clock, color: '#F59E0B', href: '/admin/workspaces?filter=provisioning' },
                    { label: 'Awaiting Credentials', value: awaitingCredentials, desc: 'Waiting on customer to connect an app', icon: ChevronRight, color: '#3B82F6', href: '/admin/workspaces?filter=awaiting credentials' },
                    { label: 'Pending Approvals', value: pendingApprovals, desc: 'Manual reviews pending', icon: Shield, color: '#EF4444', href: '/admin/approvals' },
                    { label: 'Failed Runs', value: failedRunsCount, desc: 'Automation run failed', icon: AlertTriangle, color: '#EF4444', href: '/admin/telemetry?filter=error' }
                ].map((kpi, idx) => {
                    const Icon = kpi.icon;
                    const hasWarning = kpi.value > 0 && (kpi.color === '#EF4444' || kpi.color === '#F59E0B');
                    return (
                        <motion.div 
                            key={idx} 
                            onClick={() => router.push(kpi.href)}
                            className={adminStyles.adminMetricCard} 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ 
                                padding: '24px', 
                                minHeight: '120px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'space-between',
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                                border: hasWarning ? `1.5px solid ${kpi.color}` : '1px solid var(--border)',
                                background: hasWarning ? `${kpi.color}08` : 'var(--card)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = hasWarning ? kpi.color : 'var(--border)';
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{kpi.label}</span>
                                <Icon size={18} style={{ color: kpi.color }} />
                            </div>
                            <div style={{ margin: '12px 0 4px' }}>
                                {isLoading ? (
                                    <div style={{ height: '32px', width: '60px', background: 'var(--muted)', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
                                ) : (
                                    <span style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--foreground)', letterSpacing: '-0.04em' }}>
                                        <Counter value={kpi.value} />
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)' }}>{kpi.desc}</span>
                        </motion.div>
                    );
                })}
            </div>

            {/* ACTION ITEMS & SYSTEM ALERTS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1.35fr', gap: '32px' }}>
                
                {/* COLUMN 1: ITEMS NEEDING ATTENTION */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: 0, color: 'var(--foreground)' }}>CRITICAL ACTION QUEUE</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '4px 0 0', fontWeight: 750 }}>Operational blockages requiring platform owner intervention</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                        {isLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ height: '58px', background: 'var(--muted)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                                <div style={{ height: '58px', background: 'var(--muted)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        ) : actionItems.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--muted-foreground)', gap: '10px' }}>
                                <CheckCircle size={24} style={{ color: 'var(--accent)' }} />
                                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>System nominal. Action queue empty.</span>
                            </div>
                        ) : (
                            actionItems.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => router.push(item.href)}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px', cursor: 'pointer', transition: 'all 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                >
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        {item.type === 'approval' ? (
                                            <Shield size={18} style={{ color: '#EF4444' }} />
                                        ) : item.type === 'failed_run' ? (
                                            <AlertCircle size={18} style={{ color: '#EF4444' }} />
                                        ) : (
                                            <AlertTriangle size={18} style={{ color: '#F59E0B' }} />
                                        )}
                                        <div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--foreground)' }}>{item.title}</div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted-foreground)', marginTop: '2px' }}>{item.desc}</div>
                                        </div>
                                    </div>
                                    <ArrowUpRight size={14} style={{ color: 'var(--muted-foreground)' }} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* COLUMN 2: RECENT AUDIT EVENTS */}
                <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: 0, color: 'var(--foreground)' }}>GOVERNANCE AUDIT RECORD</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '4px 0 0', fontWeight: 750 }}>Immutable log trace of administrator determinations</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                        {isLoading ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ height: '40px', background: 'var(--muted)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                                <div style={{ height: '40px', background: 'var(--muted)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        ) : auditEvents.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--muted-foreground)' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Audit timeline is empty.</span>
                            </div>
                        ) : (
                            auditEvents
                                .filter((e: any) => e.eventType !== 'page_visit')
                                .slice(0, 8)
                                .map((event, idx) => {
                                const hasWorkspaceLink = event.userId && event.userId !== 'system';
                                return (
                                    <div 
                                        key={idx} 
                                        onClick={() => {
                                            if (hasWorkspaceLink) {
                                                router.push(`/admin/workspaces/${event.userId}`);
                                            }
                                        }}
                                        style={{ 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            gap: '4px', 
                                            borderBottom: '1px solid var(--border)', 
                                            paddingBottom: '10px',
                                            cursor: hasWorkspaceLink ? 'pointer' : 'default',
                                            transition: 'opacity 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (hasWorkspaceLink) e.currentTarget.style.opacity = '0.8';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (hasWorkspaceLink) e.currentTarget.style.opacity = '1';
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 950, color: 'var(--foreground)' }}>
                                                {event.eventType}
                                            </span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                                {new Date(event.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 800 }}>
                                            User: <span style={{ color: hasWorkspaceLink ? 'var(--accent)' : 'var(--foreground)' }}>{event.userName || event.userEmail || 'System'}</span> | Source: <span style={{ color: 'var(--foreground)' }}>{event.source || 'internal'}</span>
                                        </div>
                                        {event.metadata && (
                                            <div style={{ fontSize: '0.65rem', background: 'var(--muted)', padding: '4px 8px', borderRadius: '4px', color: 'var(--muted-foreground)', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {JSON.stringify(event.metadata)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>

            {/* LOWER PORTION: RECENT CUSTOMER ACTIVATION */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 950, margin: 0, color: 'var(--foreground)' }}>CUSTOMER ACTIVATION TIMELINE</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: '4px 0 0', fontWeight: 750 }}>Overview of active customer activation details</p>
                    </div>
                    <Link href="/admin/workspaces" style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Manage Customers <ChevronRight size={14} />
                    </Link>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ height: '48px', background: 'var(--muted)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
                        </div>
                    ) : workspaces.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--muted-foreground)' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>No customers registered.</span>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Customer</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>AI Employees</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Server</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Activation Status</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'left' }}>Integrations</th>
                                    <th style={{ padding: '8px 16px', fontSize: '0.7rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', textAlign: 'right' }}>Registered Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workspaces.slice(0, 6).map((ws, idx) => {
                                    const rawState = ws.activationStatus || 'NOT_STARTED';
                                    const friendlyState = getFriendlyStatus(rawState);
                                    const connCreds = ws.connectedCredentials || [];
                                    
                                    return (
                                        <tr 
                                            key={ws.id} 
                                            onClick={() => router.push(`/admin/workspaces/${ws.id}`)}
                                            style={{ background: 'var(--muted)', cursor: 'pointer', transition: 'opacity 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                                        >
                                            <td style={{ padding: '12px 16px', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--foreground)' }}>{ws.firmName || 'Sovereign Customer'}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>{ws.email}</div>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                    <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--foreground)' }}>
                                                        {ws.aiEmployee || 'General'}
                                                    </div>
                                                    {ws.activeEmployeesCount > 1 && (
                                                        <div style={{ fontSize: '0.68rem', color: 'var(--accent)', fontWeight: 800 }}>
                                                            {ws.activeEmployeesCount} AI Employees
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--foreground)' }}>
                                                {ws.serverName || 'Unassigned'}
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{ 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: 950, 
                                                    padding: '3px 8px', 
                                                    borderRadius: '100px',
                                                    background: friendlyState === 'Active' ? 'rgba(16, 185, 129, 0.15)' : (friendlyState === 'Needs a Connection' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(148, 163, 184, 0.15)'),
                                                    color: friendlyState === 'Active' ? '#10B981' : (friendlyState === 'Needs a Connection' ? '#F59E0B' : '#94A3B8')
                                                }}>
                                                    {friendlyState}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 800 }}>
                                                {connCreds.length > 0 ? (
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {connCreds.map((c: any, cIdx: number) => (
                                                            <span key={cIdx} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem' }}>
                                                                 {c.provider}
                                                             </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.7rem' }}>None connected</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 16px', borderTopRightRadius: '10px', borderBottomRightRadius: '10px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)' }}>
                                                {new Date(ws.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

        </div>
    );
}
