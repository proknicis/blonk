"use client";

import React, { useState, useEffect } from "react";
import { 
    Plus, 
    Search, 
    Zap, 
    ShoppingCart,
    CheckCircle,
    CreditCard,
    Loader2,
    Filter,
    Star,
    Download,
    Layers,
    ArrowUpRight,
    X,
    Clock,
    Users,
    AlertCircle
} from "lucide-react";
import { Skeleton } from "../../components/Skeleton";

export default function MarketplacePage() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [isLoading, setIsLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [installedItems, setInstalledItems] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        fetchTemplates();
        fetchCurrentUser();

        // Check for payment success callback
        const urlParams = new URLSearchParams(window.location.search);
        const success = urlParams.get('success');
        const templateId = urlParams.get('templateId');

        if (success === 'true' && templateId) {
            handlePaymentSuccess(templateId);
        }
    }, []);

    const handlePaymentSuccess = async (templateId: string) => {
        setIsProvisioning(true);
        try {
            // Record the installation
            if (currentUser) {
                await fetch('/api/marketplace/installed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        templateId,
                        userId: currentUser.id
                    })
                });
            }
            
            // Refresh installed items
            fetchInstalledItems();
            
            // Clear URL params
            window.history.replaceState({}, '', '/dashboard/marketplace');
            
            (window as any).showToast("Payment successful! Your server is being provisioned.", "success");
        } catch (error) {
            console.error("Payment success handling error:", error);
        } finally {
            setIsProvisioning(false);
        }
    };

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/marketplace');
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (e) {
            console.error("Failed to fetch templates:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchInstalledItems = async (userId?: string) => {
        try {
            const uid = userId || currentUser?.id;
            if (!uid) return;
            
            const res = await fetch(`/api/marketplace/installed?userId=${uid}`);
            if (res.ok) {
                const data = await res.json();
                setInstalledItems(data);
            }
        } catch (e) {
            console.error("Failed to fetch installed items:", e);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/auth/session');
            if (res.ok) {
                const data = await res.json();
                setCurrentUser(data.user);
                
                // Fetch installed items after user is loaded
                if (data.user?.id) {
                    fetchInstalledItems(data.user.id);
                }
            }
        } catch (e) {
            console.error("Failed to fetch current user:", e);
        }
    };

    const handleInstall = async (template: any) => {
        setSelectedTemplate(template);
        setShowPaymentModal(true);
    };

    const handlePayment = async () => {
        if (!selectedTemplate || !currentUser) return;
        setIsProcessingPayment(true);

        try {
            // Create Stripe checkout session
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: selectedTemplate.id,
                    amount: selectedTemplate.price || 0,
                    userId: currentUser.id
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Redirect to Stripe checkout
                window.location.href = data.checkoutUrl;
            } else {
                const err = await res.json();
                alert(`Payment failed: ${err.error}`);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Error processing payment");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const isInstalled = (templateId: string) => {
        return installedItems.some(item => item.templateId === templateId);
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "All" || (t.sector && t.sector.toLowerCase() === categoryFilter.toLowerCase());
        return matchesSearch && matchesCategory;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', padding: '40px' }}>
            
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 950, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#0F172A' }}>Marketplace</h1>
                <p style={{ fontSize: '0.95rem', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>
                    Discover and install workflows to automate your business
                </p>
            </div>

            {/* Search and Filter */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input 
                        type="text" 
                        placeholder="Search workflows..." 
                        style={{ width: '100%', height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', paddingLeft: '44px', fontSize: '0.9rem', fontWeight: 750, outline: 'none' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    style={{ height: '48px', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '0 20px', fontSize: '0.9rem', fontWeight: 800, background: '#F8FAFC', outline: 'none', cursor: 'pointer' }}
                >
                    <option value="All">All Categories</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="IT">IT</option>
                </select>
            </div>

            {/* Templates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px' }}>
                            <Skeleton width="100%" height="200px" />
                        </div>
                    ))
                ) : filteredTemplates.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: '#64748B', fontWeight: 700 }}>
                        No workflows found matching your criteria.
                    </div>
                ) : (
                    filteredTemplates.map(template => {
                        const price = parseFloat(template.price || 0);
                        const installed = isInstalled(template.id);

                        return (
                            <div key={template.id} style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div style={{ width: '48px', height: '48px', background: template.color || '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                        {template.icon === 'Zap' ? <Zap size={24} /> : <Layers size={24} />}
                                    </div>
                                    {template.featured && (
                                        <span style={{ padding: '4px 12px', background: '#FEF3C7', color: '#D97706', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 950 }}>FEATURED</span>
                                    )}
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>{template.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700, marginTop: '4px' }}>{template.sector || 'General'}</p>
                                </div>

                                <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, lineHeight: '1.5' }}>
                                    {template.description}
                                </p>

                                <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Users size={14} /> {template.purchases || 0} installs
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} /> {template.complexity || 'Low'} complexity
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A' }}>
                                        {price > 0 ? `€${price.toFixed(2)}` : 'Free'}
                                    </div>
                                    {installed ? (
                                        <button 
                                            disabled
                                            style={{ background: '#E8FDF0', color: '#10B981', height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none', fontWeight: 950, fontSize: '0.85rem', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <CheckCircle size={16} /> Installed
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleInstall(template)}
                                            style={{ background: '#0F172A', color: '#FFFFFF', height: '44px', padding: '0 24px', borderRadius: '12px', border: 'none', fontWeight: 950, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            {price > 0 ? <CreditCard size={16} /> : <Download size={16} />}
                                            {price > 0 ? 'Purchase' : 'Install'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedTemplate && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px', maxWidth: '450px', width: '90%', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: 0 }}>Purchase Workflow</h2>
                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                style={{ width: '36px', height: '36px', border: '1px solid #E2E8F0', background: '#F8FAFC', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{ width: '48px', height: '48px', background: selectedTemplate.color || '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F172A' }}>
                                    {selectedTemplate.icon === 'Zap' ? <Zap size={24} /> : <Layers size={24} />}
                                </div>
                                <div>
                                    <div style={{ fontSize: '1rem', fontWeight: 950, color: '#0F172A' }}>{selectedTemplate.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>{selectedTemplate.sector || 'General'}</div>
                                </div>
                            </div>

                            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>Price</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>€{parseFloat(selectedTemplate.price || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>Setup Fee</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0F172A' }}>Included</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A' }}>Total</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 950, color: '#10B981' }}>€{parseFloat(selectedTemplate.price || 0).toFixed(2)}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#64748B', fontWeight: 700 }}>
                                <CheckCircle size={14} color="#10B981" />
                                <span>Automatic server provisioning included</span>
                            </div>
                        </div>

                        <button 
                            onClick={handlePayment}
                            disabled={isProcessingPayment}
                            style={{ width: '100%', height: '52px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800, cursor: isProcessingPayment ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isProcessingPayment ? 0.6 : 1 }}
                        >
                            {isProcessingPayment ? <Loader2 size={18} className="spinning" /> : <CreditCard size={18} />}
                            {isProcessingPayment ? 'Processing...' : 'Proceed to Payment'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
