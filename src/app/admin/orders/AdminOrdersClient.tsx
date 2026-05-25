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
    Search,
    SlidersHorizontal,
    Download,
    Plus,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    MoreHorizontal,
    Sparkles,
    CreditCard,
    Undo,
    Calendar,
    ArrowUpDown,
    CheckCircle,
    AlertTriangle,
    Info,
    Trash2
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

const PRIORITY_COLORS: Record<string, { color: string; bg: string; border: string }> = {
    HIGH: { color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' },
    MEDIUM: { color: '#D97706', bg: '#FFFBEB', border: '#FEF3C7' },
    LOW: { color: '#2563EB', bg: '#EFF6FF', border: '#DBEAF8' },
};

export default function AdminOrdersClient() {
    const [orders, setOrders] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [nodes, setNodes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [activeStatusDropdown, setActiveStatusDropdown] = useState<string | null>(null);

    // Filter, Search, Tab, and Pagination states
    const [activeTab, setActiveTab] = useState<string>("ALL"); // ALL, Marketplace, Custom Requests, Subscriptions, Refunds
    const [searchText, setSearchText] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [clientFilter, setClientFilter] = useState<string>("ALL");
    const [dateRangeFilter, setDateRangeFilter] = useState<string>("");
    const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
    
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);

    const [templates, setTemplates] = useState<any[]>([]);

    // Modals states
    const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);
    const [editingDetailsOrder, setEditingDetailsOrder] = useState<any | null>(null);
    const [editDetailsData, setEditDetailsData] = useState<{ 
        workflowName: string; 
        serverId: string | null; 
        n8nWorkflowId: string | null; 
        amount: number;
        orderType: string;
        orderSubType: string;
        plan: string;
        priority: string;
        assignedTo: string;
        templateId: string | null;
    }>({
        workflowName: "",
        serverId: null,
        n8nWorkflowId: null,
        amount: 0,
        orderType: "Marketplace",
        orderSubType: "Workflow Purchase",
        plan: "Startup",
        priority: "MEDIUM",
        assignedTo: "System Auto",
        templateId: null
    });
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [customQuotePrice, setCustomQuotePrice] = useState<number>(0);
    const [isSavingPrice, setIsSavingPrice] = useState(false);

    // Create Order Modal state
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [createData, setCreateData] = useState<{
        workflowName: string;
        userId: string;
        teamId: string;
        amount: number;
        status: string;
        orderType: string;
        orderSubType: string;
        plan: string;
        priority: string;
        assignedTo: string;
        serverId: string | null;
        n8nWorkflowId: string | null;
        templateId: string | null;
    }>({
        workflowName: "",
        userId: "",
        teamId: "",
        amount: 0,
        status: "PAYMENT_RECEIVED",
        orderType: "Marketplace",
        orderSubType: "Workflow Purchase",
        plan: "Startup",
        priority: "MEDIUM",
        assignedTo: "System Auto",
        serverId: null,
        n8nWorkflowId: null,
        templateId: null
    });
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

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
            setUsers(data.users ?? []);
            setTeams(data.teams ?? []);
            setTemplates(data.templates ?? []);
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

    useEffect(() => {
        if (editingDetailsOrder) {
            setEditDetailsData({
                workflowName: editingDetailsOrder.workflowName || "",
                serverId: editingDetailsOrder.serverId || null,
                n8nWorkflowId: editingDetailsOrder.n8nWorkflowId || null,
                amount: editingDetailsOrder.amount ? Number(editingDetailsOrder.amount) : 0,
                orderType: editingDetailsOrder.orderType || "Marketplace",
                orderSubType: editingDetailsOrder.orderSubType || "Workflow Purchase",
                plan: editingDetailsOrder.plan || "Startup",
                priority: editingDetailsOrder.priority || "MEDIUM",
                assignedTo: editingDetailsOrder.assignedTo || "System Auto",
                templateId: editingDetailsOrder.templateId || null
            });
        }
    }, [editingDetailsOrder]);

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
                    amount: editDetailsData.amount,
                    orderType: editDetailsData.orderType,
                    orderSubType: editDetailsData.orderSubType,
                    plan: editDetailsData.plan,
                    priority: editDetailsData.priority,
                    assignedTo: editDetailsData.assignedTo,
                    templateId: editDetailsData.templateId
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

    const handleCreateOrder = async () => {
        setIsCreatingOrder(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createData),
            });
            if (res.ok) {
                showToast("Order manually created successfully", "success");
                setShowCreateModal(false);
                // Reset form
                setCreateData({
                    workflowName: "",
                    userId: "",
                    teamId: "",
                    amount: 0,
                    status: "PAYMENT_RECEIVED",
                    orderType: "Marketplace",
                    orderSubType: "Workflow Purchase",
                    plan: "Startup",
                    priority: "MEDIUM",
                    assignedTo: "System Auto",
                    serverId: null,
                    n8nWorkflowId: null,
                    templateId: null
                });
                await fetchOrders();
            } else {
                showToast("Failed to create order", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("Network error", "error");
        } finally {
            setIsCreatingOrder(false);
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

    const handleDeleteOrder = async (id: string, orderNumber: string | number) => {
        if (!window.confirm(`Are you sure you want to delete order ORD-${orderNumber}? This will also delete associated events and workflow deployments.`)) {
            return;
        }
        setUpdatingId(id);
        try {
            const res = await fetch(`/api/admin/orders?id=${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast("Order deleted successfully", "success");
                await fetchOrders();
            } else {
                showToast("Failed to delete order", "error");
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
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    const getStatusTextAndStyle = (dbStatus: string, orderType?: string) => {
        if (orderType === 'Refund' || dbStatus === 'REFUNDED' || dbStatus === 'REFUND') {
            return { label: 'REFUNDED', bg: '#F3E8FF', color: '#A855F7', dot: '#8B5CF6', border: '#E9D5FF' };
        }
        // Map database status string to design spec friendly name and color
        switch (dbStatus) {
            case 'PAYMENT_RECEIVED':
                return { label: 'PENDING', bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', border: '#FEF3C7' };
            case 'WAITING_CREDENTIALS':
                return { label: 'AWAITING CLIENT', bg: '#FFFBEB', color: '#D97706', dot: '#F59E0B', border: '#FEF3C7' };
            case 'COMPLETED':
                return { label: 'ACTIVE', bg: '#DCFCE7', color: '#16A34A', dot: '#10B981', border: '#BBF7D0' };
            case 'FAILED':
                return { label: 'CANCELLED', bg: '#FEF2F2', color: '#EF4444', dot: '#EF4444', border: '#FEE2E2' };
            default:
                // Intermediate states are provisioning stages -> IN PROGRESS
                return { label: 'IN PROGRESS', bg: '#EFF6FF', color: '#2563EB', dot: '#3B82F6', border: '#DBEAF8' };
        }
    };

    // Calculate metrics based on current order status
    const totalCount = orders.length;
    const pendingCount = orders.filter(o => o.status === 'PAYMENT_RECEIVED' || o.status === 'WAITING_CREDENTIALS').length;
    const inProgressCount = orders.filter(o => !['PAYMENT_RECEIVED', 'WAITING_CREDENTIALS', 'COMPLETED', 'FAILED'].includes(o.status)).length;
    const completedCount = orders.filter(o => o.status === 'COMPLETED').length;
    const refundedCount = orders.filter(o => o.orderType === 'Refund').length;

    // Filter logic
    const filteredOrders = orders.filter(order => {
        // Tab type filter
        if (activeTab === "Marketplace" && order.orderType !== "Marketplace") return false;
        if (activeTab === "Custom Requests" && order.orderType !== "Custom Request") return false;
        if (activeTab === "Subscriptions" && order.orderType !== "Subscription") return false;
        if (activeTab === "Refunds" && order.orderType !== "Refund") return false;

        // Search text matching OrderID, customer name/email, workflow name, plan
        if (searchText) {
            const query = searchText.toLowerCase();
            const orderIdStr = `ORD-${new Date(order.createdAt).getFullYear()}-${String(order.orderNumber).padStart(4, '0')}`.toLowerCase();
            const uuidStr = `#${order.id?.slice(0, 10).toUpperCase()}`.toLowerCase();
            const customerName = (order.userName || "").toLowerCase();
            const customerEmail = (order.userEmail || "").toLowerCase();
            const workflowName = (order.workflowName || "").toLowerCase();
            const planName = (order.plan || "").toLowerCase();

            if (!orderIdStr.includes(query) && 
                !uuidStr.includes(query) &&
                !customerName.includes(query) && 
                !customerEmail.includes(query) && 
                !workflowName.includes(query) &&
                !planName.includes(query)) {
                return false;
            }
        }

        // Status select filter
        if (statusFilter !== "ALL") {
            const friendlyStatus = getStatusTextAndStyle(order.status, order.orderType).label;
            if (friendlyStatus !== statusFilter) return false;
        }

        // Priority filter
        if (priorityFilter !== "ALL" && order.priority !== priorityFilter) return false;

        // Client filter (domain/email match)
        if (clientFilter !== "ALL") {
            const domain = order.userEmail?.split('@')[1] || "";
            if (!domain.includes(clientFilter) && !order.userEmail?.includes(clientFilter)) return false;
        }

        // Date Range filter (check year/month/date match if entered)
        if (dateRangeFilter) {
            const createdDate = new Date(order.createdAt).toDateString().toLowerCase();
            if (!createdDate.includes(dateRangeFilter.toLowerCase())) return false;
        }

        return true;
    });

    // Pagination slice
    const totalFiltered = filteredOrders.length;
    const totalPages = Math.ceil(totalFiltered / rowsPerPage) || 1;
    const displayedOrders = filteredOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Quick counts for tab badges
    const mktCount = orders.filter(o => o.orderType === 'Marketplace').length;
    const custCount = orders.filter(o => o.orderType === 'Custom Request').length;
    const subCount = orders.filter(o => o.orderType === 'Subscription').length;
    const refCount = orders.filter(o => o.orderType === 'Refund').length;

    if (isLoading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', gap: 16, color: 'var(--muted-foreground)' }}>
            <Loader2 size={36} className={adminStyles.spinning} style={{ color: '#10B981' }} />
            <span style={{ fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1rem', color: '#64748B' }}>Synchronizing Order Pipeline…</span>
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
        <div style={{ background: '#FCFCFC', minHeight: '100vh', padding: '16px 24px', fontFamily: 'Inter, system-ui, sans-serif' }}>
            
            {/* 1. ORDER SUMMARY METRIC HEADER CARD */}
            <div style={{ 
                background: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: '16px', 
                padding: '24px 32px', 
                marginBottom: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap',
                gap: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flex: '1 1 300px' }}>
                    <div style={{ 
                        width: '52px', 
                        height: '52px', 
                        borderRadius: '12px', 
                        background: 'rgba(52, 209, 134, 0.08)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: '#10B981' 
                    }}>
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>ORDER MANAGEMENT</h1>
                        <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
                            Track, manage and fulfill marketplace orders and custom requests.
                        </p>
                    </div>
                </div>

                {/* Metrics boxes */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>TOTAL ORDERS</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{totalCount}</div>
                        </div>
                        <div style={{ width: '1px', height: '36px', background: '#E2E8F0', marginLeft: '12px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>PENDING</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{pendingCount}</div>
                        </div>
                        <div style={{ width: '1px', height: '36px', background: '#E2E8F0', marginLeft: '12px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>IN PROGRESS</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{inProgressCount}</div>
                        </div>
                        <div style={{ width: '1px', height: '36px', background: '#E2E8F0', marginLeft: '12px' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>COMPLETED</span>
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{completedCount}</div>
                        </div>
                        <div style={{ width: '1px', height: '36px', background: '#E2E8F0', marginLeft: '12px' }} />
                    </div>

                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em' }}>REFUNDED</span>
                        </div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{refundedCount}</div>
                    </div>
                </div>
            </div>

            {/* 2. ORDER TYPE FILTER TABS */}
            <div style={{ 
                display: 'flex', 
                borderBottom: '1px solid #E2E8F0', 
                marginBottom: '20px', 
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '2px'
            }}>
                {[
                    { id: "ALL", label: "All Orders", count: totalCount },
                    { id: "Marketplace", label: "Marketplace", count: mktCount },
                    { id: "Custom Requests", label: "Custom Requests", count: custCount },
                    { id: "Subscriptions", label: "Subscriptions", count: subCount },
                    { id: "Refunds", label: "Refunds", count: refCount }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setCurrentPage(1);
                        }}
                        style={{
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #0F172A' : '2px solid transparent',
                            color: activeTab === tab.id ? '#0F172A' : '#64748B',
                            fontWeight: activeTab === tab.id ? 700 : 500,
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                        <span style={{ 
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '100px',
                            background: activeTab === tab.id ? '#F1F5F9' : '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: activeTab === tab.id ? '#0F172A' : '#64748B',
                            fontWeight: 700
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* 3. CONTROL TOOLBAR (Search, Selectors, Export, Create) */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '12px',
                marginBottom: '20px'
            }}>
                
                {/* Left filter inputs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flexGrow: 1 }}>
                    
                    {/* Search Field */}
                    <div style={{ position: 'relative', width: '280px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, workflow..."
                            value={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '100%',
                                height: '40px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                paddingLeft: '36px',
                                paddingRight: '12px',
                                fontSize: '0.88rem',
                                color: '#0F172A',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Status filter select */}
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            height: '40px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '0.88rem',
                            color: '#64748B',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN PROGRESS">In Progress</option>
                        <option value="AWAITING CLIENT">Awaiting Client</option>
                        <option value="ACTIVE">Active / Completed</option>
                        <option value="CANCELLED">Cancelled / Failed</option>
                    </select>

                    {/* Priority select */}
                    <select
                        value={priorityFilter}
                        onChange={(e) => {
                            setPriorityFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            height: '40px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '0.88rem',
                            color: '#64748B',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="ALL">All Priorities</option>
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="LOW">Low Priority</option>
                    </select>

                    {/* Client select */}
                    <select
                        value={clientFilter}
                        onChange={(e) => {
                            setClientFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            height: '40px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 12px',
                            fontSize: '0.88rem',
                            color: '#64748B',
                            outline: 'none',
                            cursor: 'pointer',
                            maxWidth: '160px'
                        }}
                    >
                        <option value="ALL">All Clients</option>
                        {Array.from(new Set(orders.map(o => o.userEmail?.split('@')[1] || "").filter(Boolean))).map(domain => (
                            <option key={domain} value={domain}>{domain}</option>
                        ))}
                    </select>

                    {/* Date filter field */}
                    <div style={{ position: 'relative' }}>
                        <Calendar size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                        <input
                            type="text"
                            placeholder="Date Range"
                            value={dateRangeFilter}
                            onChange={(e) => {
                                setDateRangeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            style={{
                                width: '130px',
                                height: '40px',
                                background: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                paddingLeft: '32px',
                                paddingRight: '12px',
                                fontSize: '0.88rem',
                                color: '#64748B',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Toggle filters */}
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        style={{
                            height: '40px',
                            background: showAdvancedFilters ? '#F1F5F9' : '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 16px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <SlidersHorizontal size={14} />
                        Filters
                    </button>
                </div>

                {/* Right actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => {
                            // Quick CSV exporter
                            const headers = ["Order ID", "Customer", "Email", "Type", "Plan", "Status", "Priority", "Created At", "Amount"];
                            const rows = orders.map(o => [
                                `ORD-${new Date(o.createdAt).getFullYear()}-${o.orderNumber}`,
                                o.userName || "",
                                o.userEmail || "",
                                o.orderType || "",
                                o.plan || "",
                                getStatusTextAndStyle(o.status, o.orderType).label,
                                o.priority || "",
                                o.createdAt,
                                o.amount || 0
                            ]);
                            const csvContent = "data:text/csv;charset=utf-8," 
                                + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", `blonk_workflow_orders_${new Date().toISOString().slice(0,10)}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            showToast("Order records exported to CSV", "success");
                        }}
                        style={{
                            height: '40px',
                            background: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '0 16px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: '#0F172A',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Download size={14} />
                        Export
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{
                            height: '40px',
                            background: '#0F172A',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0 18px',
                            fontSize: '0.88rem',
                            fontWeight: 600,
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={16} />
                        Create Order
                        <ChevronDown size={14} />
                    </button>
                </div>
            </div>

            {/* 4. MAIN REGISTRY DATA TABLE */}
            <div style={{ 
                background: '#FFFFFF', 
                border: '1px solid #E2E8F0', 
                borderRadius: '12px', 
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.01)'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                        ORDER ID <ArrowUpDown size={12} />
                                    </div>
                                </th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CUSTOMER</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ORDER TYPE</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ITEM / WORKFLOW</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PLAN</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>STATUS</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PRIORITY</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CREATED AT</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>VALUE</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ASSIGNED TO</th>
                                <th style={{ padding: '14px 20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={11} style={{ textAlign: 'center', padding: '64px', color: '#64748B', fontWeight: 600 }}>
                                        <ShoppingCart size={32} style={{ margin: '0 auto 12px', color: '#94A3B8' }} />
                                        No workflow orders match the selected filters.
                                    </td>
                                </tr>
                            ) : (
                                displayedOrders.map((order) => {
                                    const statusStyle = getStatusTextAndStyle(order.status, order.orderType);
                                    const priorityStyle = PRIORITY_COLORS[order.priority] || { color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
                                    
                                    // Make ID format ORD-2024-0517-0011
                                    const orderDate = new Date(order.createdAt);
                                    const year = orderDate.getFullYear();
                                    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
                                    const day = String(orderDate.getDate()).padStart(2, '0');
                                    const orderIdDisplay = `ORD-${year}-${month}${day}-${String(order.orderNumber || 0).padStart(4, '0')}`;
                                    const hashDisplay = `#${order.id?.slice(0, 10).toUpperCase()}`;

                                    // Extract initials for avatars
                                    const customerInitials = (order.userName || order.userEmail || "C").slice(0, 2).toUpperCase();
                                    const operatorInitials = (order.assignedTo || "S").slice(0, 2).toUpperCase();

                                    // Render order type badges & subtext
                                    let typeIcon = <ShoppingCart size={14} />;
                                    let typeColor = '#10B981';
                                    let typeBg = '#E6F4EA';
                                    
                                    if (order.orderType === "Custom Request") {
                                        typeIcon = <Sparkles size={14} />;
                                        typeColor = '#A855F7';
                                        typeBg = '#F3E8FF';
                                    } else if (order.orderType === "Subscription") {
                                        typeIcon = <CreditCard size={14} />;
                                        typeColor = '#3B82F6';
                                        typeBg = '#EFF6FF';
                                    } else if (order.orderType === "Refund") {
                                        typeIcon = <Undo size={14} />;
                                        typeColor = '#EF4444';
                                        typeBg = '#FEF2F2';
                                    }

                                    // Render amount text: negative for refunds, monthly for subscriptions
                                    let amountText = `€${Number(order.amount || 0).toLocaleString()}`;
                                    let amountStyle: React.CSSProperties = { fontWeight: 700, color: '#0F172A' };

                                    if (order.orderType === "Refund") {
                                        amountText = `-€${Number(order.amount || 0).toLocaleString()}`;
                                        amountStyle = { fontWeight: 700, color: '#EF4444' };
                                    } else if (order.orderType === "Subscription") {
                                        amountText = `€${Number(order.amount || 0).toLocaleString()}/mo`;
                                    }

                                    return (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.15s ease' }} className={adminStyles.registryRow}>
                                            
                                            {/* Order ID */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                                <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>{orderIdDisplay}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace', marginTop: '2px' }}>{hashDisplay}</div>
                                            </td>

                                            {/* Customer Profile */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ 
                                                        width: '28px', 
                                                        height: '28px', 
                                                        borderRadius: '50%', 
                                                        background: '#0F172A', 
                                                        color: '#FFFFFF', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        fontSize: '0.75rem', 
                                                        fontWeight: 700 
                                                    }}>
                                                        {customerInitials}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{order.userName || 'Unknown User'}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>{order.userEmail || 'no-email@blonk.ai'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Order Type */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ 
                                                        width: '24px', 
                                                        height: '24px', 
                                                        borderRadius: '6px', 
                                                        background: typeBg, 
                                                        color: typeColor, 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center' 
                                                    }}>
                                                        {typeIcon}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{order.orderType || 'Marketplace'}</div>
                                                        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '1px' }}>{order.orderSubType || 'Workflow Purchase'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Item / Workflow */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                                <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.88rem' }}>{order.workflowName}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '1px' }}>v{order.templateVersion || '1.0.0'}</div>
                                            </td>

                                            {/* Plan */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle', fontSize: '0.88rem', color: '#0F172A', fontWeight: 500 }}>
                                                {order.plan || 'Startup'}
                                            </td>

                                            {/* Interactive Status Pill Dropdown */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'inline-block', position: 'relative' }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveStatusDropdown(activeStatusDropdown === order.id ? null : order.id);
                                                        }}
                                                        style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            padding: '4px 10px',
                                                            borderRadius: '100px',
                                                            background: statusStyle.bg,
                                                            color: statusStyle.color,
                                                            border: `1px solid ${statusStyle.border}`,
                                                            fontSize: '0.72rem',
                                                            fontWeight: 700,
                                                            letterSpacing: '0.02em',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusStyle.dot }} />
                                                        {statusStyle.label}
                                                        <ChevronDown size={12} style={{ opacity: 0.7 }} />
                                                    </button>
                                                    
                                                    {activeStatusDropdown === order.id && (
                                                        <>
                                                            <div 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setActiveStatusDropdown(null);
                                                                }} 
                                                                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} 
                                                            />
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 'calc(100% + 4px)',
                                                                left: 0,
                                                                background: '#FFFFFF',
                                                                border: '1px solid #E2E8F0',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                                zIndex: 100,
                                                                minWidth: '150px',
                                                                padding: '4px 0'
                                                            }}>
                                                                {[
                                                                    { label: 'PENDING', value: 'PAYMENT_RECEIVED', dot: '#F59E0B' },
                                                                    { label: 'IN PROGRESS', value: 'PROVISIONING', dot: '#3B82F6' },
                                                                    { label: 'AWAITING CLIENT', value: 'WAITING_CREDENTIALS', dot: '#F59E0B' },
                                                                    { label: 'ACTIVE', value: 'COMPLETED', dot: '#10B981' },
                                                                    { label: 'CANCELLED', value: 'FAILED', dot: '#EF4444' },
                                                                    { label: 'REFUNDED', value: 'REFUNDED', dot: '#8B5CF6' }
                                                                ].map((st) => (
                                                                    <button
                                                                        key={st.value}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActiveStatusDropdown(null);
                                                                            updateStatus(order.id, st.value);
                                                                        }}
                                                                        style={{
                                                                            width: '100%',
                                                                            padding: '8px 12px',
                                                                            background: 'transparent',
                                                                            border: 'none',
                                                                            textAlign: 'left',
                                                                            fontSize: '0.72rem',
                                                                            fontWeight: 700,
                                                                            color: '#334155',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            cursor: 'pointer'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                                    >
                                                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: st.dot }} />
                                                                        {st.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Priority Badge */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                                <div style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: `1px solid ${priorityStyle.border}`,
                                                    background: priorityStyle.bg,
                                                    color: priorityStyle.color,
                                                    fontSize: '0.68rem',
                                                    fontWeight: 700,
                                                    letterSpacing: '0.04em'
                                                }}>
                                                    {order.priority || 'MEDIUM'}
                                                </div>
                                            </td>

                                            {/* Created At */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle', fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                                                {fmt(order.createdAt)}
                                            </td>

                                            {/* Value */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle', fontSize: '0.88rem' }}>
                                                <span style={amountStyle}>{amountText}</span>
                                            </td>

                                            {/* Assigned To */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ 
                                                        width: '22px', 
                                                        height: '22px', 
                                                        borderRadius: '50%', 
                                                        background: '#F1F5F9', 
                                                        border: '1px solid #CBD5E1', 
                                                        color: '#475569', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
                                                        fontSize: '0.65rem', 
                                                        fontWeight: 700 
                                                    }}>
                                                        {operatorInitials}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>{order.assignedTo || 'System Auto'}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td style={{ padding: '16px 20px', verticalAlign: 'middle', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                                    <button
                                                        onClick={() => setInspectingOrder(order)}
                                                        title="Inspect Logs"
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #E2E8F0',
                                                            background: '#FFFFFF',
                                                            color: '#64748B',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.color = '#10B981'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingDetailsOrder(order)}
                                                        title="Configure details"
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #E2E8F0',
                                                            background: '#FFFFFF',
                                                            color: '#64748B',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0F172A'; e.currentTarget.style.color = '#0F172A'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B'; }}
                                                    >
                                                        <MoreHorizontal size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id, order.orderNumber)}
                                                        title="Delete Order"
                                                        style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '6px',
                                                            border: '1px solid #FEE2E2',
                                                            background: '#FEF2F2',
                                                            color: '#EF4444',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.background = '#FCA5A5'; e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#FFFFFF'; }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 5. PAGINATION AND ROWS PER PAGE SELECTOR */}
                <div style={{ 
                    borderTop: '1px solid #E2E8F0', 
                    padding: '16px 24px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <span style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>
                        Showing {totalFiltered > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} to {Math.min(currentPage * rowsPerPage, totalFiltered)} of {totalFiltered} orders
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        
                        {/* Rows per page */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                style={{
                                    height: '36px',
                                    background: '#FFFFFF',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '6px',
                                    padding: '0 8px',
                                    fontSize: '0.85rem',
                                    color: '#64748B',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>

                        {/* Page navigation */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    border: '1px solid #E2E8F0',
                                    background: '#FFFFFF',
                                    color: currentPage === 1 ? '#CBD5E1' : '#64748B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '6px',
                                        border: pageNum === currentPage ? '1px solid #10B981' : '1px solid #E2E8F0',
                                        background: pageNum === currentPage ? '#DCFCE7' : '#FFFFFF',
                                        color: pageNum === currentPage ? '#16A34A' : '#64748B',
                                        fontWeight: pageNum === currentPage ? 700 : 500,
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '6px',
                                    border: '1px solid #E2E8F0',
                                    background: '#FFFFFF',
                                    color: currentPage === totalPages ? '#CBD5E1' : '#64748B',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. STATUS AND ORDER TYPES LEGENDS */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-start', 
                alignItems: 'center', 
                flexWrap: 'wrap', 
                gap: '40px', 
                marginTop: '32px', 
                borderTop: '1px solid #E2E8F0', 
                paddingTop: '20px' 
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status Legend:</span>
                    {[
                        { label: 'Pending', dot: '#F59E0B' },
                        { label: 'In Progress', dot: '#3B82F6' },
                        { label: 'Awaiting Client', dot: '#D97706' },
                        { label: 'Completed', dot: '#10B981' },
                        { label: 'Active', dot: '#16A34A' },
                        { label: 'Refunded', dot: '#8B5CF6' },
                        { label: 'Cancelled', dot: '#EF4444' }
                    ].map(st => (
                        <div key={st.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.dot }} />
                            {st.label}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Order Types:</span>
                    {[
                        { label: 'Marketplace', icon: <ShoppingCart size={12} />, color: '#10B981', bg: '#E6F4EA' },
                        { label: 'Custom Request', icon: <Sparkles size={12} />, color: '#A855F7', bg: '#F3E8FF' },
                        { label: 'Subscription', icon: <CreditCard size={12} />, color: '#3B82F6', bg: '#EFF6FF' },
                        { label: 'Refund', icon: <Undo size={12} />, color: '#EF4444', bg: '#FEF2F2' }
                    ].map(ot => (
                        <div key={ot.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#64748B', fontWeight: 500 }}>
                            <div style={{ 
                                width: '20px', 
                                height: '20px', 
                                borderRadius: '4px', 
                                background: ot.bg, 
                                color: ot.color, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                            }}>
                                {ot.icon}
                            </div>
                            {ot.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* 7. MANUAL CREATE ORDER MODAL */}
            {showCreateModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '550px', width: '90%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Create Manual Workflow Order</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0' }}>Provision workflow environments manually from the command core.</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Link Marketplace Template</label>
                                <select
                                    value={createData.templateId || ""}
                                    onChange={(e) => {
                                        const selectedTplId = e.target.value;
                                        if (selectedTplId) {
                                            const tpl = templates.find(t => t.id === selectedTplId);
                                            setCreateData({
                                                ...createData,
                                                templateId: selectedTplId,
                                                workflowName: tpl ? tpl.name : createData.workflowName
                                            });
                                        } else {
                                            setCreateData({
                                                ...createData,
                                                templateId: null
                                            });
                                        }
                                    }}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none', background: '#FFFFFF' }}
                                >
                                    <option value="">None / Custom Workflow</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} (v{t.productInfo?.version || '1.0.0'})</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Workflow / Item Name</label>
                                <input
                                    type="text"
                                    placeholder="Invoice Automator, Lead Enrichment Flow, etc."
                                    value={createData.workflowName}
                                    onChange={(e) => setCreateData({ ...createData, workflowName: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Link User Profile</label>
                                <select
                                    value={createData.userId}
                                    onChange={(e) => setCreateData({ ...createData, userId: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    <option value="">Select User Profile</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Link Team/Org</label>
                                <select
                                    value={createData.teamId}
                                    onChange={(e) => setCreateData({ ...createData, teamId: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    <option value="">Select Team/Organization</option>
                                    {teams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Order Type</label>
                                <select
                                    value={createData.orderType}
                                    onChange={(e) => setCreateData({ ...createData, orderType: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    <option value="Marketplace">Marketplace</option>
                                    <option value="Custom Request">Custom Request</option>
                                    <option value="Subscription">Subscription</option>
                                    <option value="Refund">Refund</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Order Subtype</label>
                                <input
                                    type="text"
                                    placeholder="Workflow Purchase, Monthly Plan..."
                                    value={createData.orderSubType}
                                    onChange={(e) => setCreateData({ ...createData, orderSubType: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Plan Name</label>
                                <select
                                    value={createData.plan}
                                    onChange={(e) => setCreateData({ ...createData, plan: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    <option value="Startup">Startup</option>
                                    <option value="Professional">Professional</option>
                                    <option value="Growth">Growth</option>
                                    <option value="Enterprise">Enterprise</option>
                                    <option value="Starter">Starter</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Revenue Value (€)</label>
                                <input
                                    type="number"
                                    value={createData.amount}
                                    onChange={(e) => setCreateData({ ...createData, amount: Number(e.target.value) })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Priority</label>
                                <select
                                    value={createData.priority}
                                    onChange={(e) => setCreateData({ ...createData, priority: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Assigned Operator</label>
                                <input
                                    type="text"
                                    placeholder="John Carter Admin, etc."
                                    value={createData.assignedTo}
                                    onChange={(e) => setCreateData({ ...createData, assignedTo: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.9rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Initial Status</label>
                                <select
                                    value={createData.status}
                                    onChange={(e) => setCreateData({ ...createData, status: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    {STATUS_ORDER.map(st => (
                                        <option key={st} value={st}>{st.replace(/_/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Assign VPS Server</label>
                                <select
                                    value={createData.serverId || ""}
                                    onChange={(e) => setCreateData({ ...createData, serverId: e.target.value || null })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.9rem', outline: 'none' }}
                                >
                                    <option value="">None Linked</option>
                                    {nodes.map(n => (
                                        <option key={n.id} value={n.id}>{n.name} ({n.url})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button
                                onClick={handleCreateOrder}
                                disabled={isCreatingOrder}
                                style={{
                                    flex: 1,
                                    height: '48px',
                                    background: '#0F172A',
                                    color: '#FFFFFF',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {isCreatingOrder ? 'Creating Order...' : 'Submit Order'}
                            </button>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                style={{
                                    flex: 1,
                                    height: '48px',
                                    background: 'transparent',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    color: '#64748B',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 8. INSPECT LOGS MODAL */}
            {inspectingOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '680px', width: '90%', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                                    {inspectingOrder.orderType === 'Custom Request' ? '✦ Custom Request Details' : 'Provisioning Log Stream'}
                                </h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0', fontWeight: 600 }}>
                                    Order #{inspectingOrder.orderNumber ? String(inspectingOrder.orderNumber).padStart(4, '0') : inspectingOrder.id?.slice(0, 8).toUpperCase()} for {inspectingOrder.userName || inspectingOrder.userEmail}
                                </p>
                            </div>
                            <button onClick={() => setInspectingOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* CUSTOM REQUEST DETAILS PANEL */}
                        {inspectingOrder.orderType === 'Custom Request' && (() => {
                            const cd = typeof inspectingOrder.customDetails === 'string'
                                ? JSON.parse(inspectingOrder.customDetails || '{}')
                                : inspectingOrder.customDetails || {};
                            return (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {/* Header banner */}
                                    <div style={{ background: 'linear-gradient(135deg, #F3E8FF, #EDE9FE)', border: '1px solid #C4B5FD', borderRadius: 12, padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                            <Sparkles size={16} color="#7C3AED" />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#5B21B6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Custom Workflow Request</span>
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3B0764' }}>{inspectingOrder.workflowName}</div>
                                        <div style={{ fontSize: '0.78rem', color: '#6D28D9', marginTop: 2, fontWeight: 600 }}>Submitted by {inspectingOrder.userName || inspectingOrder.userEmail}</div>
                                    </div>

                                    {/* Description */}
                                    {cd.description && (
                                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
                                            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Description / Requirements</div>
                                            <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1E293B', lineHeight: 1.6, margin: 0 }}>{cd.description}</p>
                                        </div>
                                    )}

                                    {/* Grid details */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        {cd.category && (
                                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Category</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{cd.category}</div>
                                            </div>
                                        )}
                                        {cd.urgency && (
                                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Urgency / Priority</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>{cd.urgency}</div>
                                            </div>
                                        )}
                                        {cd.timeline && (
                                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Requested Timeline</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{cd.timeline}</div>
                                            </div>
                                        )}
                                        {inspectingOrder.priority && (
                                            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
                                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Order Priority</div>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>{inspectingOrder.priority}</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tools / Integrations */}
                                    {cd.tools && (
                                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px' }}>
                                            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Requested Integrations / Tools</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {cd.tools.split(',').map((tool: string, i: number) => (
                                                    <span key={i} style={{ background: '#EDE9FE', color: '#5B21B6', padding: '4px 10px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 700 }}>{tool.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Set Price & Request Payment panel */}
                                    <div style={{ background: inspectingOrder.amount > 0 ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : '#F8FAFC', border: `1.5px solid ${inspectingOrder.amount > 0 ? '#10B981' : '#E2E8F0'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <CreditCard size={16} color={inspectingOrder.amount > 0 ? '#059669' : '#64748B'} />
                                            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: inspectingOrder.amount > 0 ? '#065F46' : '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                {inspectingOrder.amount > 0 ? `Price Quoted: €${Number(inspectingOrder.amount).toLocaleString()}` : 'Set Price & Request Payment'}
                                            </span>
                                        </div>
                                        {inspectingOrder.amount > 0 && (
                                            <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#065F46', margin: 0 }}>A payment request of €{Number(inspectingOrder.amount).toLocaleString()} has been sent to the client. Update the price below to change it.</p>
                                        )}
                                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', fontWeight: 700, color: '#64748B' }}>€</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    defaultValue={inspectingOrder.amount > 0 ? Number(inspectingOrder.amount) : undefined}
                                                    placeholder="Enter quoted price..."
                                                    onChange={(e) => setCustomQuotePrice(parseFloat(e.target.value) || 0)}
                                                    style={{ width: '100%', height: 44, border: '1.5px solid #CBD5E1', borderRadius: 8, paddingLeft: 28, paddingRight: 12, fontSize: '1rem', fontWeight: 700, outline: 'none', background: '#FFFFFF', boxSizing: 'border-box' }}
                                                />
                                            </div>
                                            <button
                                                disabled={isSavingPrice || customQuotePrice <= 0}
                                                onClick={async () => {
                                                    setIsSavingPrice(true);
                                                    try {
                                                        const res = await fetch('/api/admin/orders', {
                                                            method: 'PATCH',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                id: inspectingOrder.id,
                                                                amount: customQuotePrice,
                                                                addLogMessage: `Admin quoted price of €${customQuotePrice} for this custom workflow request.`
                                                            })
                                                        });
                                                        if (res.ok) {
                                                            showToast(`Price of €${customQuotePrice} sent to client`, 'success');
                                                            await fetchOrders();
                                                        } else {
                                                            showToast('Failed to save price', 'error');
                                                        }
                                                    } catch {
                                                        showToast('Network error', 'error');
                                                    } finally {
                                                        setIsSavingPrice(false);
                                                    }
                                                }}
                                                style={{
                                                    height: 44,
                                                    padding: '0 20px',
                                                    background: customQuotePrice > 0 ? '#059669' : '#CBD5E1',
                                                    color: '#FFFFFF',
                                                    border: 'none',
                                                    borderRadius: 8,
                                                    fontWeight: 800,
                                                    fontSize: '0.85rem',
                                                    cursor: customQuotePrice > 0 && !isSavingPrice ? 'pointer' : 'not-allowed',
                                                    whiteSpace: 'nowrap',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                {isSavingPrice ? 'Sending...' : inspectingOrder.amount > 0 ? 'Update Price' : 'Send to Client'}
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '0.72rem', color: '#64748B', margin: 0, fontWeight: 600 }}>
                                            Setting a price will show a payment button on the client's My Workflows page.
                                        </p>
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Logs Stream */}
                        <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Provisioning Log Stream</div>
                            <div style={{ flex: 1, overflowY: 'auto', background: '#0F172A', borderRadius: '12px', padding: '20px', maxHeight: '260px', display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#E2E8F0' }}>
                                {(!inspectingOrder.logs || inspectingOrder.logs.length === 0) ? (
                                    <div style={{ color: '#64748B', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>No log entries recorded.</div>
                                ) : (
                                    [...inspectingOrder.logs].reverse().map((log: any, idx: number) => {
                                        let levelColor = '#10B981';
                                        if (log.level === 'error') levelColor = '#EF4444';
                                        if (log.level === 'warning') levelColor = '#F59E0B';

                                        return (
                                            <div key={idx} style={{ display: 'flex', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                                                <span style={{ color: '#64748B' }}>[{log.at ? new Date(log.at).toLocaleTimeString() : '—'}]</span>
                                                <span style={{ color: levelColor, fontWeight: 'bold' }}>{log.level?.toUpperCase() || 'INFO'}</span>
                                                <span style={{ color: '#FFFFFF' }}>{log.message}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Add Log Entry Form */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>Add Manual Log Entry</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
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
                                    style={{ flex: 1, height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.88rem', outline: 'none' }}
                                />
                                <button
                                    onClick={async () => {
                                        const input = document.getElementById('manualLogInput') as HTMLInputElement;
                                        if (input && input.value.trim()) {
                                            await handleAddLogMessage(inspectingOrder.id, input.value.trim());
                                            input.value = '';
                                        }
                                    }}
                                    style={{ height: '40px', padding: '0 16px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                            <button onClick={() => setInspectingOrder(null)} style={{ height: '40px', padding: '0 20px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem', cursor: 'pointer' }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 9. EDIT CONFIGURATION DETAILS MODAL */}
            {editingDetailsOrder && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>Configure Order Details</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748B', margin: '4px 0 0', fontWeight: 500 }}>
                                    Modify attributes for Order #{editingDetailsOrder.orderNumber ? String(editingDetailsOrder.orderNumber).padStart(4, '0') : editingDetailsOrder.id?.slice(0, 8).toUpperCase()}
                                </p>
                            </div>
                            <button onClick={() => setEditingDetailsOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Link Marketplace Template</label>
                                <select
                                    value={editDetailsData.templateId || ""}
                                    onChange={(e) => {
                                        const selectedTplId = e.target.value;
                                        if (selectedTplId) {
                                            const tpl = templates.find(t => t.id === selectedTplId);
                                            setEditDetailsData({
                                                ...editDetailsData,
                                                templateId: selectedTplId,
                                                workflowName: tpl ? tpl.name : editDetailsData.workflowName
                                            });
                                        } else {
                                            setEditDetailsData({
                                                ...editDetailsData,
                                                templateId: null
                                            });
                                        }
                                    }}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.88rem', outline: 'none', background: '#FFFFFF' }}
                                >
                                    <option value="">None / Custom Workflow</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} (v{t.productInfo?.version || '1.0.0'})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Workflow Name</label>
                                <input 
                                    type="text"
                                    value={editDetailsData.workflowName}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, workflowName: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Order Type</label>
                                <select
                                    value={editDetailsData.orderType}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, orderType: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.88rem', outline: 'none' }}
                                >
                                    <option value="Marketplace">Marketplace</option>
                                    <option value="Custom Request">Custom Request</option>
                                    <option value="Subscription">Subscription</option>
                                    <option value="Refund">Refund</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Order Subtype</label>
                                <input 
                                    type="text"
                                    value={editDetailsData.orderSubType}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, orderSubType: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Plan Name</label>
                                <select
                                    value={editDetailsData.plan}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, plan: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.88rem', outline: 'none' }}
                                >
                                    <option value="Startup">Startup</option>
                                    <option value="Professional">Professional</option>
                                    <option value="Growth">Growth</option>
                                    <option value="Enterprise">Enterprise</option>
                                    <option value="Starter">Starter</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Priority</label>
                                <select
                                    value={editDetailsData.priority}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, priority: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.88rem', outline: 'none' }}
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Assigned Operator</label>
                                <input 
                                    type="text"
                                    value={editDetailsData.assignedTo}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, assignedTo: e.target.value })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Assign VPS Server / Node</label>
                                <select 
                                    value={editDetailsData.serverId || ""}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, serverId: e.target.value || null })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.88rem', outline: 'none' }}
                                >
                                    <option value="">No Server Linked</option>
                                    {nodes.map(n => (
                                        <option key={n.id} value={n.id}>{n.name} ({n.url})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>n8n Workflow ID</label>
                                <input 
                                    type="text"
                                    value={editDetailsData.n8nWorkflowId || ""}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, n8nWorkflowId: e.target.value || null })}
                                    placeholder="Enter instance workflow ID..."
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Revenue Amount (€)</label>
                                <input 
                                    type="number"
                                    value={editDetailsData.amount}
                                    onChange={(e) => setEditDetailsData({ ...editDetailsData, amount: parseFloat(e.target.value) || 0 })}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 12px', fontSize: '0.88rem', outline: 'none' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '4px' }}>Advance Status Stage</label>
                                <select
                                    value={editingDetailsOrder.status}
                                    disabled={updatingId === editingDetailsOrder.id}
                                    onChange={e => updateStatus(editingDetailsOrder.id, e.target.value)}
                                    style={{ width: '100%', height: '40px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 8px', fontSize: '0.88rem', outline: 'none' }}
                                >
                                    {STATUS_ORDER.map(s => (
                                        <option key={s} value={s}>
                                            {s.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <button 
                                onClick={handleSaveDetails}
                                disabled={isSavingDetails}
                                style={{ flex: 1, height: '48px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, cursor: isSavingDetails ? 'not-allowed' : 'pointer' }}
                            >
                                {isSavingDetails ? 'Saving...' : 'Save Configuration'}
                            </button>
                            <button 
                                onClick={() => setEditingDetailsOrder(null)}
                                style={{ flex: 1, height: '48px', background: 'transparent', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer' }}
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
