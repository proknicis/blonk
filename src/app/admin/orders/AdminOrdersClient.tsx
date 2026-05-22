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
    Terminal,
    X,
    SlidersHorizontal,
    TrendingUp
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

    // Advanced UI state variables
    const [activeTab, setActiveTab] = useState<string>("ALL");
    const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);
    const [editingDetailsOrder, setEditingDetailsOrder] = useState<any | null>(null);
    const [editDetailsData, setEditDetailsData] = useState<{ workflowName: string; serverId: string | null; n8nWorkflowId: string | null; amount: number }>({
        workflowName: "",
        serverId: null,
        n8nWorkflowId: null,
        amount: 0
    });
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [nodes, setNodes] = useState<any[]>([]);

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        if (typeof window !== 'undefined' && (window as any).showToast) {
            (window as any).showToast(message, type);
        } else {
            console.log(`[Toast] ${type.toUpperCase()}: ${message}`);
        }
    }, []);

    const fetchNodes = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/nodes');
            if (res.ok) {
                const data = await res.json();
                setNodes(data);
            }
        } catch (e) {
            console.error("Failed to fetch nodes", e);
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

    useEffect(() => { 
        fetchOrders(); 
        fetchNodes();
    }, [fetchOrders, fetchNodes]);

    // Handle updating edit modal values when an order is selected
    useEffect(() => {
        if (editingDetailsOrder) {
            setEditDetailsData({
                workflowName: editingDetailsOrder.workflowName || "",
                serverId: editingDetailsOrder.serverId || null,
                n8nWorkflowId: editingDetailsOrder.n8nWorkflowId || null,
                amount: editingDetailsOrder.amount ? Number(editingDetailsOrder.amount) : 0
            });
        }
    }, [editingDetailsOrder]);

    // Sync inspection order when orders list updates (to show live log updates)
    useEffect(() => {
        if (inspectingOrder) {
            const current = orders.find(o => o.id === inspectingOrder.id);
            if (current) setInspectingOrder(current);
        }
    }, [orders, inspectingOrder]);

    const handleAddLogMessage = async (orderId: string, message: string) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, addLogMessage: message }),
            });
            if (res.ok) {
                showToast("Log entry added", "success");
                await fetchOrders();
            } else {
                showToast("Failed to add log", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error", "error");
        }
    };

    const handleSaveDetails = async () => {
        if (!editingDetailsOrder) return;
        setIsSavingDetails(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingDetailsOrder.id,
                    workflowName: editDetailsData.workflowName,
                    serverId: editDetailsData.serverId,
                    n8nWorkflowId: editDetailsData.n8nWorkflowId,
                    amount: editDetailsData.amount
                }),
            });
            if (res.ok) {
                showToast("Order settings saved successfully", "success");
                setEditingDetailsOrder(null);
                await fetchOrders();
            } else {
                showToast("Failed to save settings", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error", "error");
        } finally {
            setIsSavingDetails(false);
        }
    };

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

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '24px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    {[
                        { id: "ALL", label: "All Orders", count: orders.length },
                        { id: "NEW", label: "New Payments", count: orders.filter(o => o.status === 'PAYMENT_RECEIVED').length },
                        { id: "PROVISIONING", label: "Provisioning", count: orders.filter(o => ['PROVISIONING', 'INSTALLING_N8N', 'SERVER_READY', 'WORKFLOW_IMPORTED'].includes(o.status)).length },
                        { id: "CREDENTIALS", label: "Awaiting Credentials", count: orders.filter(o => o.status === 'WAITING_CREDENTIALS').length },
                        { id: "SETUP", label: "Setup & Testing", count: orders.filter(o => ['CREDENTIALS_RECEIVED', 'ADMIN_SETUP', 'TESTING'].includes(o.status)).length },
                        { id: "COMPLETED", label: "Completed", count: orders.filter(o => o.status === 'COMPLETED').length },
                        { id: "FAILED", label: "Failed", count: orders.filter(o => o.status === 'FAILED').length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '12px',
                                border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                                background: activeTab === tab.id ? 'var(--muted)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                                fontWeight: 850,
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                            <span style={{ 
                                fontSize: '0.72rem', 
                                padding: '2px 8px', 
                                background: activeTab === tab.id ? 'var(--card)' : 'var(--muted)', 
                                color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted-foreground)', 
                                borderRadius: '6px',
                                fontWeight: 950
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
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
                                {(() => {
                                    const filteredOrders = orders.filter(order => {
                                        if (activeTab === "ALL") return true;
                                        if (activeTab === "NEW") return order.status === 'PAYMENT_RECEIVED';
                                        if (activeTab === "PROVISIONING") return ['PROVISIONING', 'INSTALLING_N8N', 'SERVER_READY', 'WORKFLOW_IMPORTED'].includes(order.status);
                                        if (activeTab === "CREDENTIALS") return order.status === 'WAITING_CREDENTIALS';
                                        if (activeTab === "SETUP") return ['CREDENTIALS_RECEIVED', 'ADMIN_SETUP', 'TESTING'].includes(order.status);
                                        if (activeTab === "COMPLETED") return order.status === 'COMPLETED';
                                        if (activeTab === "FAILED") return order.status === 'FAILED';
                                        return true;
                                    });

                                    if (filteredOrders.length === 0) {
                                        return (
                                            <tr>
                                                <td colSpan={8} style={{ textAlign: 'center', padding: '64px', color: 'var(--muted-foreground)', fontWeight: 800 }}>
                                                    No orders match the selected filter.
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return filteredOrders.map(order => {
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
                                                        {order.serverName ? (
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 850, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                <Cpu size={12} /> {order.serverName} ({order.serverStatus || 'Active'})
                                                            </div>
                                                        ) : (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No Node Assigned</span>
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

                                                {/* Actions block */}
                                                <td style={{ textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                        {/* View logs btn */}
                                                        <button
                                                            onClick={() => setInspectingOrder(order)}
                                                            title="View Provisioning Logs"
                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted-foreground)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                                                        >
                                                            <Terminal size={14} />
                                                        </button>

                                                        {/* Edit details btn */}
                                                        <button
                                                            onClick={() => setEditingDetailsOrder(order)}
                                                            title="Edit Order Details"
                                                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--muted-foreground)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--foreground)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                                                        >
                                                            <Cpu size={14} />
                                                        </button>

                                                        {/* Next status btn */}
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
                                                                        <ArrowRight size={13} />
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: order.status === 'COMPLETED' ? 'var(--accent)' : 'var(--destructive)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', height: '38px', padding: '0 12px' }}>
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
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* INSPECT LOGS MODAL */}
            {inspectingOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', maxWidth: '650px', width: '90%', maxHeight: '85vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>Provisioning Log Stream</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>
                                    Order #{inspectingOrder.orderNumber ? String(inspectingOrder.orderNumber).padStart(4, '0') : inspectingOrder.id?.slice(0, 8).toUpperCase()} for {inspectingOrder.userName || inspectingOrder.userEmail}
                                </p>
                            </div>
                            <button 
                                onClick={() => setInspectingOrder(null)}
                                style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Logs Stream */}
                        <div style={{ flex: 1, overflowY: 'auto', background: '#0F172A', borderRadius: '16px', padding: '24px', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#E2E8F0' }}>
                            {(!inspectingOrder.logs || inspectingOrder.logs.length === 0) ? (
                                <div style={{ color: '#64748B', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>No log entries recorded.</div>
                            ) : (
                                [...inspectingOrder.logs].reverse().map((log: any, idx: number) => {
                                    let levelColor = '#10B981'; // green for info/success
                                    if (log.level === 'error') levelColor = '#EF4444';
                                    if (log.level === 'warning') levelColor = '#F59E0B';

                                    return (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                                            <span style={{ color: '#64748B' }}>[{log.at ? new Date(log.at).toLocaleTimeString() : '—'}]</span>
                                            <span style={{ color: levelColor, fontWeight: 'bold' }}>{log.level?.toUpperCase() || 'INFO'}</span>
                                            <span style={{ color: '#FFFFFF' }}>{log.message}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Add Log Entry Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>Add Manual Log Entry</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <input 
                                    type="text"
                                    placeholder="Enter operator note or update..."
                                    id="manualLogInput"
                                    onKeyDown={async (e) => {
                                        if (e.key === 'Enter') {
                                            const input = e.currentTarget;
                                            if (input.value.trim()) {
                                                await handleAddLogMessage(inspectingOrder.id, input.value.trim());
                                                input.value = '';
                                            }
                                        }
                                    }}
                                    style={{ flex: 1, height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', outline: 'none' }}
                                />
                                <button 
                                    onClick={async () => {
                                        const input = document.getElementById('manualLogInput') as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                            await handleAddLogMessage(inspectingOrder.id, input.value.trim());
                                            input.value = '';
                                        }
                                    }}
                                    style={{ height: '48px', padding: '0 20px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setInspectingOrder(null)}
                                style={{ height: '48px', padding: '0 24px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT DETAILS MODAL */}
            {editingDetailsOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column', gap: '24px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>Configure Order Details</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0', fontWeight: 700 }}>
                                    Modify attributes for Order #{editingDetailsOrder.orderNumber ? String(editingDetailsOrder.orderNumber).padStart(4, '0') : editingDetailsOrder.id?.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                            <button 
                                onClick={() => setEditingDetailsOrder(null)}
                                style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '6px' }}>Workflow Name</label>
                                <input 
                                    type="text"
                                    value={editDetailsData.workflowName}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, workflowName: e.target.value })}
                                    style={{ width: '100%', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '6px' }}>Assign Server / Node</label>
                                <select 
                                    value={editDetailsData.serverId || ""}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, serverId: e.target.value || null })}
                                    style={{ width: '100%', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', outline: 'none' }}
                                >
                                    <option value="">No Server Linked</option>
                                    {nodes.map(n => (
                                        <option key={n.id} value={n.id}>{n.name} ({n.url})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '6px' }}>n8n Workflow ID</label>
                                <input 
                                    type="text"
                                    value={editDetailsData.n8nWorkflowId || ""}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, n8nWorkflowId: e.target.value || null })}
                                    placeholder="Enter instance workflow ID..."
                                    style={{ width: '100%', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: '6px' }}>Revenue Amount (€)</label>
                                <input 
                                    type="number"
                                    value={editDetailsData.amount}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, amount: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', height: '48px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0 16px', fontSize: '0.9rem', fontWeight: 600, color: '#0F172A', outline: 'none' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button 
                                onClick={handleSaveDetails}
                                disabled={isSavingDetails}
                                style={{ flex: 1, height: '52px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800, cursor: isSavingDetails ? 'not-allowed' : 'pointer' }}
                            >
                                {isSavingDetails ? 'Saving...' : 'Save Configuration'}
                            </button>
                            <button 
                                onClick={() => setEditingDetailsOrder(null)}
                                style={{ flex: 1, height: '52px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
