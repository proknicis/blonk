"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ArrowRight, Zap, ShieldCheck, Layers, Rocket, Sparkles } from "lucide-react";
import styles from "../marketplace.module.css";

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("templateId");
    const [workflowName, setWorkflowName] = useState("Your Automation");

    useEffect(() => {
        // Try to fetch template name if available
        if (templateId) {
            fetch(`/api/workflows`)
                .then(res => res.json())
                .then(data => {
                    if (data.templates) {
                        const template = data.templates.find((t: any) => t.id === templateId);
                        if (template) setWorkflowName(template.name);
                    }
                })
                .catch(() => {});
        }
    }, [templateId]);

    return (
        <div style={{ 
            minHeight: '80vh', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <div style={{ 
                maxWidth: '600px', 
                width: '100%',
                background: '#FFF',
                borderRadius: '32px',
                padding: '48px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid #F1F5F9'
            }}>
                {/* Decorative Elements */}
                <div style={{ 
                    position: 'absolute', 
                    top: '-50px', 
                    right: '-50px', 
                    width: '150px', 
                    height: '150px', 
                    background: 'rgba(16, 185, 129, 0.05)', 
                    borderRadius: '50%' 
                }} />
                
                <div style={{ 
                    width: '80px', 
                    height: '80px', 
                    background: '#10B981', 
                    borderRadius: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 32px',
                    color: '#FFF',
                    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)'
                }}>
                    <Check size={40} strokeWidth={3} />
                </div>

                <h1 style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: 950, 
                    color: '#0F172A', 
                    marginBottom: 16,
                    letterSpacing: '-0.02em'
                }}>
                    Payment Successful
                </h1>
                
                <p style={{ 
                    fontSize: '1.1rem', 
                    color: '#64748B', 
                    fontWeight: 600, 
                    lineHeight: 1.6,
                    marginBottom: 40
                }}>
                    Your investment in <span style={{ color: '#0F172A', fontWeight: 800 }}>{workflowName}</span> has been confirmed. 
                    We are now provisioning your dedicated sovereign infrastructure.
                </p>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '16px',
                    marginBottom: 40,
                    textAlign: 'left'
                }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                        <ShieldCheck size={20} color="#10B981" style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Security</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Sovereign VPS</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                        <Zap size={20} color="#10B981" style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Speed</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Instant Import</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                        <Layers size={20} color="#10B981" style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>Status</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Provisioning</div>
                    </div>
                </div>

                <button 
                    onClick={() => router.push(`/dashboard/incidents?highlight=${templateId}`)}
                    style={{ 
                        width: '100%',
                        height: '64px',
                        background: '#0F172A',
                        color: '#FFF',
                        borderRadius: '20px',
                        fontSize: '1.1rem',
                        fontWeight: 950,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Track Deployment Progress <ArrowRight size={20} />
                </button>
                
                <p style={{ marginTop: '24px', fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700 }}>
                    <Sparkles size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> 
                    Average provisioning time is 3-5 minutes
                </p>
            </div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
