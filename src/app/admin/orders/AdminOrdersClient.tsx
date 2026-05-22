"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
    Loader2, 
    ArrowRight, 
    RefreshCw, 
    ShoppingCart,
    Cpu,
    Users,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Terminal
} from "lucide-react";
import adminStyles from "../admin.module.css";

const STATUS_ORDER = [
    'PAYMENT_RECEIVED',
    'PROVISIONING',
    'INSTALLING_N8N',
    'SERVER_READY',
    'WORKFLOW_IMPORTED',
    'WAITING_CREDENTIALS',
    'CREDENTIALS_RECEIVED',
    'ADMIN_SETUP',
    'TESTING',
    'COMPLETED',
    'FAILED',
];

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
    PAYMENT_RECEIVED:    { bg: 'rgba(59, 130, 246, 0.08)', color: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' },
    PROVISIONING:        { bg: 'rgba(249, 115, 22, 0.08)', color: '#F97316', border: 'rgba(249, 115, 22, 0.2)' },
    INSTALLING_N8N:      { bg: 'rgba(249, 115, 22, 0.08)', color: '#F97316', border: 'rgba(249, 115, 22, 0.2)' },
    SERVER_READY:        { bg: 'rgba(34, 197, 94, 0.08)', color: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' },
    WORKFLOW_IMPORTED:   { bg: 'rgba(34, 197, 94, 0.08)', color: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' },
    WAITING_CREDENTIALS: { bg: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.2)' },
    CREDENTIALS_RECEIVED:{ bg: 'rgba(245, 158, 11, 0.08)', color: '#F59E0B', border: 'rgba(245, 158, 11, 0.2)' },
    ADMIN_SETUP:         { bg: 'rgba(168, 85, 247, 0.08)', color: '#A855F7', border: 'rgba(168, 85, 247, 0.2)' },
    TESTING:             { bg: 'rgba(168, 85, 247, 0.08)', color: '#A855F7', border: 'rgba(168, 85, 247, 0.2)' },
    COMPLETED:           { bg: 'rgba(22, 163, 74, 0.08)',  color: '#16A34A', border: 'rgba(22, 163, 74, 0.2)' },
    FAILED:              { bg: 'rgba(239, 68, 68, 0.08)',  color: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' },
};

// Friendly button labels for the next pipeline transition
const NEXT_STEP_LABELS: Record<string, string> = {
    PAYMENT_RECEIVED:    'Start Provisioning',
    PROVISIONING:        'Install n8n',
    INSTALLING_N8N:      'Confirm Server Ready',
    SERVER_READY:        'Import Workflow JSON',
    WORKFLOW_IMPORTED:   'Request Credentials',
    WAITING_CREDENTIALS: 'Force Sync Credentials',
    CREDENTIALS_RECEIVED:'Begin Admin Setup',
    ADMIN_SETUP:         'Trigger Testing Suite',
    TESTING:             'Promote to Live',
};

export default function AdminOrdersClient() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        if (typeof window !== 'undefined' && (window as any).showToast) {
            (window as any).showToast(message, type);
        } else {
            console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/orders');
            if (!res.ok) {
                const text = await res.text();
                setError(`Server responded ${res.status}: ${text.slice(0, 200)}`);
                return;
            }
            const data = await res.json();
            setOrders(data.orders ?? []);
        } catch (e: any) {
            setError(e.message || 'Network error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const updateStatus = async (id: string, newStatus: string) => {
        setUpdatingId(id);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });
            if (res.ok) {
                showToast(`Order status updated to ${newStatus.replace(/_/g, ' ')}`, "success");
                await fetchOrders();
            } else {
                showToast("Failed to update status", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error occurred", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const fmt = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    if (isLoading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', gap: 16, color: 'var(--muted-foreground)' }}>
            <Loader2 size={36} className={adminStyles.spinning} />
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1rem' }}>Synchronizing Order Pipeline…</span>
        </div>
    );

    if (error) return (
        <div style={{ padding: 40 }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 24, padding: '32px 40px', color: '#EF4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 950, fontSize: '1.1rem', marginBottom: 8 }}>
                    <AlertCircle size={20} /> Connection Exception
                </div>
                <p style={{ margin: 0, fontWeight: 700, opacity: 0.8 }}>{error}</p>
                <button 
                    onClick={fetchOrders} 
                    className={adminStyles.primaryBtn}
                    style={{ marginTop: 24, height: 44, background: '#EF4444', color: '#fff' }}
                >
                    Retry Connection
                </button>
            </div>
        </div>
    );

    return (
        <div className={adminStyles.dashboard}>
            {/* Header / Mission Control Status */}
            <div className={adminStyles.integrityPanel}>
                <div className={adminStyles.integrityHub}>
                    <div className={adminStyles.statusIndicatorHealthy}>
                        <div className={adminStyles.beaconPulseActive} />
                    </div>
                    <div>
                        <h1 className={adminStyles.panelTitle}>Orders Mission Control</h1>
                        <p className={adminStyles.panelSubtitle}>End-to-end client workspace provisioning pipeline</p>
                    </div>
                </div>
                
                <div className={adminStyles.hubMetrics}>
                    <div className={adminStyles.hubItem}>
                        <div>
                            <span className={adminStyles.hubLabel}>Active Orders</span>
                            <div className={adminStyles.hubValue}>{orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'FAILED').length}</div>
                        </div>
                    </div>
                    <div className={adminStyles.hubItem}>
                        <div>
                            <span className={adminStyles.hubLabel}>Total Processed</span>
                            <div className={adminStyles.hubValue}>{orders.length}</div>
                        </div>
                    </div>
                    <button onClick={fetchOrders} className={adminStyles.refreshBtn} style={{ marginLeft: 16 }}>
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Main Orders Table */}
            <div className={adminStyles.registryCard}>
                <div className={adminStyles.registryHeader}>
                    <div>
                        <h2 className={adminStyles.registryTitle}>Provisioning Queue</h2>
                        <p className={adminStyles.registrySubtitle}>Review user requests, servers, and advance deployment stages</p>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div style={{ border: '1px dashed var(--border)', borderRadius: 28, padding: '96px 40px', textAlign: 'center', background: 'var(--muted)' }}>
                        <ShoppingCart size={56} style={{ color: 'var(--muted-foreground)', marginBottom: 20, opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: 'var(--foreground)', margin: '0 0 8px', letterSpacing: '-0.03em' }}>No Orders Registered</h3>
                        <p style={{ color: 'var(--muted-foreground)', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>Orders will automatically appear here once users submit requests.</p>
                    </div>
                ) : (
                    <div className={adminStyles.tableWrapper}>
                        <table className={adminStyles.registryTable}>
                            <thead>
                                <tr>
                                    <th className={adminStyles.registryTH}>Order #</th>
                                    <th className={adminStyles.registryTH}>Client Profile</th>
                                    <th className={adminStyles.registryTH}>Organization / Node</th>
                                    <th className={adminStyles.registryTH}>Workflow Name</th>
                                    <th className={adminStyles.registryTH}>Pipeline Status</th>
                                    <th className={adminStyles.registryTH}>Revenue</th>
                                    <th className={adminStyles.registryTH}>Submission</th>
                                    <th className={adminStyles.registryTH} style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => {
                                    const currentIndex = STATUS_ORDER.indexOf(order.status);
                                    const nextStatus = currentIndex >= 0 && currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;
                                    const col = STATUS_COLORS[order.status] ?? { bg: 'var(--muted)', color: 'var(--muted-foreground)', border: 'var(--border)' };
                                    const isUpdating = updatingId === order.id;

                                    // Professional fallback for Client name/email
                                    const clientName = order.userName || order.userEmail?.split('@')[0] || 'Operator';
                                    const clientEmail = order.userEmail || 'system.provision@blonk.ai';

                                    // Next step friendly text
                                    const nextStepLabel = nextStatus ? (NEXT_STEP_LABELS[order.status] || `Advance to ${nextStatus.replace(/_/g, ' ')}`) : null;

                                    return (
                                        <tr key={order.id} className={adminStyles.registryRow} style={{ opacity: isUpdating ? 0.6 : 1 }}>
                                            {/* Order Number Monospace hash */}
                                            <td>
                                                <span className={adminStyles.identityHash}>
                                                    #{order.orderNumber ? String(order.orderNumber).padStart(4, '0') : order.id?.slice(0, 8).toUpperCase()}
                                                </span>
                                            </td>

                                            {/* Client Profile */}
                                            <td>
                                                <div className={adminStyles.requesterInfo}>
                                                    <div className={adminStyles.requesterAvatar} style={{ background: 'var(--primary)' }}>
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className={adminStyles.requesterName} style={{ color: 'var(--foreground)' }}>
                                                            {clientName}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                                            {clientEmail}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Team and Server Status */}
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: 'var(--foreground)', fontSize: '0.85rem' }}>
                                                        <Users size={14} style={{ color: 'var(--muted-foreground)' }} />
                                                        {order.teamName || 'Standalone Tier'}
                                                    </div>
                                                    {order.serverName && (
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 850, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <Cpu size={12} /> {order.serverName} ({order.serverStatus || 'Active'})
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Workflow Name */}
                                            <td>
                                                <div style={{ fontWeight: 800, color: 'var(--foreground)', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Terminal size={14} style={{ color: 'var(--muted-foreground)' }} />
                                                    {order.workflowName || 'Legacy Integration'}
                                                </div>
                                            </td>

                                            {/* Status Dropdown */}
                                            <td>
                                                <div style={{ position: 'relative', display: 'inline-block' }}>
                                                    <select
                                                        value={order.status}
                                                        disabled={isUpdating}
                                                        onChange={e => updateStatus(order.id, e.target.value)}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            borderRadius: '12px', 
                                                            border: `1px solid ${col.border}`, 
                                                            fontSize: '0.78rem', 
                                                            fontWeight: 900, 
                                                            background: col.bg, 
                                                            color: col.color, 
                                                            cursor: 'pointer',
                                                            outline: 'none',
                                                            appearance: 'none',
                                                            WebkitAppearance: 'none',
                                                            paddingRight: '32px',
                                                            letterSpacing: '0.04em',
                                                            textTransform: 'uppercase',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {STATUS_ORDER.map(s => (
                                                            <option key={s} value={s} style={{ background: 'var(--card)', color: 'var(--foreground)' }}>
                                                                {s.replace(/_/g, ' ')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: col.color, display: 'flex', alignItems: 'center' }}>
                                                        <Loader2 size={12} className={isUpdating ? adminStyles.spinning : ''} style={{ display: isUpdating ? 'block' : 'none' }} />
                                                        <span style={{ display: isUpdating ? 'none' : 'block', fontSize: '8px' }}>▼</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Amount formatted */}
                                            <td>
                                                <div style={{ fontWeight: 950, color: 'var(--foreground)', fontSize: '0.9rem' }}>
                                                    {order.amount && Number(order.amount) > 0 ? (
                                                        `€${Number(order.amount).toFixed(2)}`
                                                    ) : (
                                                        <span style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Free Setup</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Submission Date */}
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: 700 }}>
                                                    <Clock size={13} />
                                                    {fmt(order.createdAt)}
                                                </div>
                                            </td>

                                            {/* Action Button: Advance step */}
                                            <td style={{ textAlign: 'right' }}>
                                                {nextStepLabel && order.status !== 'FAILED' ? (
                                                    <button
                                                        disabled={isUpdating}
                                                        onClick={() => nextStatus && updateStatus(order.id, nextStatus)}
                                                        className={adminStyles.primaryBtn}
                                                        style={{ 
                                                            display: 'inline-flex', 
                                                            alignItems: 'center', 
                                                            gap: 8, 
                                                            height: '38px', 
                                                            padding: '0 16px', 
                                                            borderRadius: '12px', 
                                                            fontSize: '0.78rem', 
                                                            fontWeight: 950, 
                                                            cursor: 'pointer',
                                                            background: 'var(--foreground)',
                                                            color: 'var(--background)',
                                                            border: 'none',
                                                            whiteSpace: 'nowrap',
                                                            transition: 'all 0.25s'
                                                        }}
                                                    >
                                                        {isUpdating ? (
                                                            <Loader2 size={13} className={adminStyles.spinning} />
                                                        ) : (
                                                            <>
                                                                {nextStepLabel}
                                                                <ArrowRight size={13} style={{ transition: 'transform 0.2s' }} />
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: order.status === 'COMPLETED' ? 'var(--accent)' : 'var(--destructive)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        {order.status === 'COMPLETED' ? (
                                                            <>
                                                                <CheckCircle2 size={14} /> Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <AlertCircle size={14} /> Failed
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
