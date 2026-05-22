"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, ArrowRight, RefreshCw, ShoppingCart } from "lucide-react";

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

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    PAYMENT_RECEIVED:    { bg: '#EFF6FF', color: '#3B82F6' },
    PROVISIONING:        { bg: '#FFF7ED', color: '#F97316' },
    INSTALLING_N8N:      { bg: '#FFF7ED', color: '#F97316' },
    SERVER_READY:        { bg: '#F0FDF4', color: '#22C55E' },
    WORKFLOW_IMPORTED:   { bg: '#F0FDF4', color: '#22C55E' },
    WAITING_CREDENTIALS: { bg: '#FFFBEB', color: '#F59E0B' },
    CREDENTIALS_RECEIVED:{ bg: '#FFFBEB', color: '#F59E0B' },
    ADMIN_SETUP:         { bg: '#FAF5FF', color: '#A855F7' },
    TESTING:             { bg: '#FAF5FF', color: '#A855F7' },
    COMPLETED:           { bg: '#F0FDF4', color: '#16A34A' },
    FAILED:              { bg: '#FFF1F2', color: '#EF4444' },
};

export default function AdminOrdersClient() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

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
            if (res.ok) await fetchOrders();
        } catch (e) {
            console.error(e);
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: 12, color: '#64748B' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontWeight: 700 }}>Loading orders…</span>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    if (error) return (
        <div style={{ padding: 40 }}>
            <div style={{ background: '#FFF1F2', border: '1px solid #FECDD3', borderRadius: 16, padding: '24px 32px', color: '#EF4444', fontWeight: 700 }}>
                ❌ Error fetching orders: {error}
                <button onClick={fetchOrders} style={{ display: 'block', marginTop: 12, background: '#EF4444', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Retry</button>
            </div>
        </div>
    );

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Orders Mission Control</h1>
                    <p style={{ color: '#64748B', margin: '6px 0 0', fontWeight: 600 }}>
                        {orders.length} order{orders.length !== 1 ? 's' : ''} in pipeline
                    </p>
                </div>
                <button
                    onClick={fetchOrders}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 18px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}
                >
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Empty state */}
            {orders.length === 0 ? (
                <div style={{ background: '#fff', border: '1px dashed #E2E8F0', borderRadius: 24, padding: '80px 40px', textAlign: 'center' }}>
                    <ShoppingCart size={48} style={{ color: '#CBD5E1', marginBottom: 16 }} />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#475569', margin: '0 0 8px' }}>No orders yet</h3>
                    <p style={{ color: '#94A3B8', fontWeight: 600 }}>Orders will appear here once customers purchase a workflow from the marketplace.</p>
                </div>
            ) : (
                <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                {['Order #', 'Client', 'Team', 'Workflow', 'Status', 'Amount', 'Created', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 900, color: '#64748B', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => {
                                const currentIndex = STATUS_ORDER.indexOf(order.status);
                                const nextStatus = currentIndex >= 0 && currentIndex < STATUS_ORDER.length - 1 ? STATUS_ORDER[currentIndex + 1] : null;
                                const col = STATUS_COLORS[order.status] ?? { bg: '#F1F5F9', color: '#64748B' };
                                const isUpdating = updatingId === order.id;

                                return (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9', opacity: isUpdating ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                        <td style={{ padding: '16px 20px', fontWeight: 900, color: '#0F172A', fontSize: '0.9rem' }}>
                                            #{order.orderNumber ?? order.id?.slice(0, 8)}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>{order.userName ?? '—'}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{order.userEmail ?? ''}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                                            {order.teamName ?? '—'}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 700, color: '#334155', fontSize: '0.85rem' }}>
                                            {order.workflowName ?? '—'}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            <select
                                                value={order.status}
                                                disabled={isUpdating}
                                                onChange={e => updateStatus(order.id, e.target.value)}
                                                style={{ padding: '6px 10px', borderRadius: 8, border: `1px solid ${col.color}30`, fontSize: '0.78rem', fontWeight: 700, background: col.bg, color: col.color, cursor: 'pointer' }}
                                            >
                                                {STATUS_ORDER.map(s => (
                                                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{ padding: '16px 20px', fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                                            {order.amount ? `€${Number(order.amount).toFixed(2)}` : '—'}
                                        </td>
                                        <td style={{ padding: '16px 20px', fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                                            {fmt(order.createdAt)}
                                        </td>
                                        <td style={{ padding: '16px 20px' }}>
                                            {nextStatus && order.status !== 'FAILED' && (
                                                <button
                                                    disabled={isUpdating}
                                                    onClick={() => updateStatus(order.id, nextStatus)}
                                                    style={{ background: '#0F172A', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}
                                                >
                                                    {isUpdating ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={12} />}
                                                    Advance
                                                </button>
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
    );
}
