"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Clock, ArrowRight, Loader2, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

const STATUS_LABELS: Record<string, string> = {
    'PAYMENT_RECEIVED': 'Payment received',
    'SERVER_CREATING': 'Creating server',
    'SERVER_READY': 'Server ready',
    'WORKFLOW_IMPORTED': 'Importing workflow',
    'WAITING_CREDENTIALS': 'Waiting credentials',
    'CREDENTIALS_RECEIVED': 'Credentials received',
    'ADMIN_SETUP': 'Admin setup',
    'TESTING': 'Testing',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed'
};

const CHECKLIST_STEPS = [
    { id: 'PAYMENT_RECEIVED', label: 'Payment received' },
    { id: 'SERVER_CREATING', label: 'Creating server' },
    { id: 'SERVER_READY', label: 'Installing n8n' },
    { id: 'WORKFLOW_IMPORTED', label: 'Importing workflow' },
    { id: 'WAITING_CREDENTIALS', label: 'Waiting credentials' },
    { id: 'ADMIN_SETUP', label: 'Admin setup' },
    { id: 'TESTING', label: 'Testing' },
    { id: 'COMPLETED', label: 'Completed' }
];

export default function OrdersClient() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (data.orders) setOrders(data.orders);
        } catch (e) {}
        setIsLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStepState = (orderStatus: string, stepId: string) => {
        const currentIndex = STATUS_ORDER.indexOf(orderStatus);
        const stepIndex = STATUS_ORDER.indexOf(stepId);
        
        // Special case for credentials
        if (stepId === 'WAITING_CREDENTIALS' && (orderStatus === 'CREDENTIALS_RECEIVED' || currentIndex > STATUS_ORDER.indexOf('WAITING_CREDENTIALS'))) {
            return 'completed';
        }

        if (currentIndex > stepIndex) return 'completed';
        if (currentIndex === stepIndex) return 'current';
        return 'pending';
    };

    if (isLoading) return <div style={{ padding: 40, textAlign: 'center' }}><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>Your Orders</h1>
            <p style={{ color: '#64748B', marginBottom: '32px' }}>Track the provisioning of your automation workflows.</p>

            {orders.length === 0 && (
                <div style={{ background: '#F8FAFC', padding: 40, borderRadius: 16, textAlign: 'center', border: '1px dashed #CBD5E1' }}>
                    <p style={{ color: '#64748B', fontWeight: 600 }}>No active orders.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {orders.map(order => (
                    <div key={order.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 16, padding: 24, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #F1F5F9' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94A3B8', marginBottom: 4 }}>ORDER #{order.id.split('-')[0].toUpperCase()}</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A' }}>Workflow: {order.workflowName}</div>
                            </div>
                            <div style={{ background: order.status === 'COMPLETED' ? '#10B98115' : '#F8FAFC', color: order.status === 'COMPLETED' ? '#10B981' : '#64748B', padding: '6px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 800 }}>
                                {STATUS_LABELS[order.status] || order.status}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: order.status === 'WAITING_CREDENTIALS' || order.status === 'COMPLETED' ? 24 : 0 }}>
                            {CHECKLIST_STEPS.map(step => {
                                const state = getStepState(order.status, step.id);
                                return (
                                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {state === 'completed' ? (
                                            <CheckCircle2 size={18} color="#10B981" />
                                        ) : state === 'current' ? (
                                            <Loader2 size={18} color="#3B82F6" style={{ animation: 'spin 2s linear infinite' }} />
                                        ) : (
                                            <Circle size={18} color="#CBD5E1" />
                                        )}
                                        <span style={{ 
                                            fontSize: '0.9rem', 
                                            fontWeight: state === 'current' ? 800 : 600,
                                            color: state === 'completed' ? '#0F172A' : (state === 'current' ? '#3B82F6' : '#94A3B8')
                                        }}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {order.status === 'WAITING_CREDENTIALS' && (
                            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontWeight: 800, color: '#991B1B', marginBottom: 4 }}>Action Required</div>
                                <div style={{ fontSize: '0.85rem', color: '#B91C1C', marginBottom: 12 }}>Connect integrations to continue provisioning.</div>
                                <button onClick={() => router.push('/dashboard/integrations')} style={{ background: '#DC2626', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                                    Connect Integrations
                                </button>
                            </div>
                        )}

                        {order.status === 'COMPLETED' && (
                            <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 12, padding: 16 }}>
                                <div style={{ fontWeight: 800, color: '#065F46', marginBottom: 4 }}>Your workflow is ready</div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                                    <button style={{ background: '#10B981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        Open n8n <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
