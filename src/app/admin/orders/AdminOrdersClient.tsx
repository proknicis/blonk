"use client";

import React, { useState, useEffect } from "react";
import { Loader2, ArrowRight } from "lucide-react";

const STATUS_ORDER = [
    'PAYMENT_RECEIVED',
    'SERVER_CREATING',
    'SERVER_READY',
    'WORKFLOW_IMPORTED',
    'WAITING_CREDENTIALS',
    'CREDENTIALS_RECEIVED',
    'ADMIN_SETUP',
    'TESTING',
    'COMPLETED',
    'FAILED'
];

export default function AdminOrdersClient() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
        } catch (e) {}
        setIsLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus })
            });
            fetchOrders();
        } catch (e) {}
    };

    if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Orders Mission Control</h1>
            <p style={{ color: '#64748B', marginBottom: '32px' }}>Manage client provisioning and setup pipelines.</p>

            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748B' }}>Order ID</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748B' }}>Client</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748B' }}>Workflow</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748B' }}>Status</th>
                        <th style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#64748B' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => {
                        const currentIndex = STATUS_ORDER.indexOf(order.status);
                        const nextStatus = STATUS_ORDER[currentIndex + 1];

                        return (
                            <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 800 }}>#{order.orderNumber || order.id.split('-')[0]}</td>
                                <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{order.teamName || order.userName}</td>
                                <td style={{ padding: '16px 24px', fontSize: '0.85rem', color: '#334155' }}>{order.workflowName}</td>
                                <td style={{ padding: '16px 24px' }}>
                                    <select 
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: '0.8rem', fontWeight: 600, background: '#F8FAFC' }}
                                    >
                                        {STATUS_ORDER.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    {nextStatus && (
                                        <button 
                                            onClick={() => updateStatus(order.id, nextStatus)}
                                            style={{ background: '#0F172A', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                                        >
                                            Advance <ArrowRight size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin { animation: spin 2s linear infinite; }
            `}</style>
        </div>
    );
}
