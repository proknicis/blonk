"use client";

import React, { useState } from 'react';
import { Plus, Server, Globe, Key, X, Activity } from 'lucide-react';
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
                style={{ border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'white', padding: '8px 16px' }}
            >
                <Plus size={14} /> 
                <span>Provision Node</span>
            </button>

            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '32px', width: '100%', maxWidth: '500px', padding: '32px', boxShadow: 'var(--shadow-premium)', animation: 'fadeInScale 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                    <Server size={20} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontWeight: 950, fontSize: '1.25rem' }}>Add Cluster Node</h3>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Register a new n8n instance for monitoring.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleAddNode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '8px' }}>Node Label</label>
                                <div style={{ position: 'relative' }}>
                                    <Activity style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="e.g. ALPHA-CENTAURI-01"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '8px' }}>API URL</label>
                                <div style={{ position: 'relative' }}>
                                    <Globe style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                                    <input 
                                        type="url" 
                                        required
                                        placeholder="https://n8n.your-instance.com"
                                        value={formData.url}
                                        onChange={e => setFormData({...formData, url: e.target.value})}
                                        style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '8px' }}>X-N8N-API-KEY</label>
                                <div style={{ position: 'relative' }}>
                                    <Key style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                                    <input 
                                        type="password" 
                                        required
                                        placeholder="Enter secure API key..."
                                        value={formData.api_key}
                                        onChange={e => setFormData({...formData, api_key: e.target.value})}
                                        style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 950, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '8px' }}>Max Capacity (Workflows)</label>
                                <div style={{ position: 'relative' }}>
                                    <Activity style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={16} />
                                    <input 
                                        type="number" 
                                        required
                                        placeholder="e.g. 100"
                                        value={formData.max_workflows}
                                        onChange={e => setFormData({...formData, max_workflows: parseInt(e.target.value)})}
                                        style={{ width: '100%', padding: '12px 16px 12px 48px', background: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '16px', color: 'var(--foreground)', fontSize: '0.9rem', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{ width: '100%', padding: '16px', background: 'var(--foreground)', color: 'var(--background)', border: 'none', borderRadius: '16px', fontWeight: 950, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {loading && <Activity size={18} className={adminStyles.spinning} />}
                                {loading ? 'Validating Instance...' : 'Deploy Node to Cluster'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}
