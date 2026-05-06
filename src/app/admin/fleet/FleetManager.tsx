"use client";

import React, { useState } from 'react';
import { Plus, Server, Globe, Key, X, Activity, Cpu } from 'lucide-react';
import adminStyles from '../admin.module.css';

interface Node {
    id: string;
    name: string;
    url: string;
    status: string;
    cpu: number;
    ram: number;
}

export function FleetManager() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        api_key: '',
        max_workflows: 100
    });

    const handleAddNode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/nodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowAddModal(false);
                setFormData({ name: '', url: '', api_key: '', max_workflows: 100 });
                window.location.reload(); // Refresh to show new node
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button 
                onClick={() => setShowAddModal(true)}
                className={adminStyles.activeBadge} 
                style={{ border: 'none', cursor: 'pointer', background: '#10B981', color: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: 950, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
            >
                <Plus size={16} /> 
                <span>PROVISION NODE</span>
            </button>

            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(12px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#FFFFFF', border: '1px solid #F3F4F6', borderRadius: '40px', width: '100%', maxWidth: '520px', padding: '48px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '56px', height: '56px', background: '#F0FDF4', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                                    <Server size={28} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.5rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Add n8n Instance</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: '#6B7280', fontWeight: 800 }}>Register a new n8n instance for monitoring.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} style={{ background: '#F3F4F6', border: 'none', color: '#6B7280', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddNode} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Instance Name</label>
                                <div style={{ position: 'relative' }}>
                                    <Activity style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={18} />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. n8n-eu-01"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        style={{ width: '100%', padding: '16px 20px 16px 56px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '18px', color: '#111827', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>n8n API URL</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={18} />
                                    <input 
                                        type="url" 
                                        required
                                        placeholder="https://n8n.your-instance.com"
                                        value={formData.url}
                                        onChange={e => setFormData({...formData, url: e.target.value})}
                                        style={{ width: '100%', padding: '16px 20px 16px 56px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '18px', color: '#111827', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>n8n API Key</label>
                                <div style={{ position: 'relative' }}>
                                    <Key style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={18} />
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="Paste n8n API key..."
                                        value={formData.api_key}
                                        onChange={e => setFormData({...formData, api_key: e.target.value})}
                                        style={{ width: '100%', padding: '16px 20px 16px 56px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '18px', color: '#111827', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: '#6B7280', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.05em' }}>Max Workflow Capacity</label>
                                <div style={{ position: 'relative' }}>
                                    <Activity style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} size={18} />
                                    <input 
                                        type="number" 
                                        required
                                        placeholder="100"
                                        value={formData.max_workflows}
                                        onChange={e => setFormData({...formData, max_workflows: parseInt(e.target.value)})}
                                        style={{ width: '100%', padding: '16px 20px 16px 56px', background: '#F9FAFB', border: '1px solid #F3F4F6', borderRadius: '18px', color: '#111827', fontSize: '1rem', fontWeight: 800, outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ width: '100%', padding: '20px', background: '#0F172A', color: '#FFFFFF', border: 'none', borderRadius: '20px', fontWeight: 950, fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s ease' }}
                            >
                                {loading && <Activity size={20} className={adminStyles.spinning} />}
                                {loading ? 'Validating Instance...' : 'Add n8n Instance'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </>
    );
}
