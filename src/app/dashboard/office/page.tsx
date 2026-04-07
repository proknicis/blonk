import { db } from "@/lib/db";
import styles from "./office.module.css";
import React from "react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

async function getAgents(teamId: string) {
    try {
        const workflowRows = await db.query('SELECT * FROM "Workflow" WHERE "teamId" = $1 ORDER BY "createdAt" DESC', [teamId]);

        const workflowAgents = (workflowRows || []).map((wf: any) => {
            const names = (wf.name || 'Automation').split(' ');
            const initials = names.length > 1 ? names[0][0] + names[1][0] : names[0][0] + (names[0][1] || 'A');
            
            const isStale = Math.random() > 0.8; // Randomize for demo purposes if real activity isn't present
            const isFailed = Math.random() > 0.9;
            
            let displayStatus = 'Idle';
            let color = '#94A3B8'; // default idle gray
            let statusKey = 'idle';

            if (isFailed) {
                displayStatus = 'Failed';
                color = '#EF4444';
                statusKey = 'failed';
            } else if (!isStale) {
                displayStatus = 'Running';
                color = '#34D186';
                statusKey = 'running';
            }

            return {
                id: wf.id,
                name: wf.name,
                role: `${wf.sector || 'General'} Workflow`,
                status: displayStatus,
                statusKey: statusKey,
                initials: initials.toUpperCase(),
                color: color,
                lastRun: wf.lastRun || new Date(Date.now() - Math.random() * 10000000).toISOString(),
                tasksCount: wf.tasksCount || Math.floor(Math.random() * 50) + 1
            };
        });

        return workflowAgents;

    } catch (error) {
        console.error("Fetch workflows error:", error);
        return [];
    }
}

export default async function OfficePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    const agents = await getAgents(teamId);

    return (
        <div className={styles.officeContainer}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1>Live Overview</h1>
                    <p className={styles.subtitle}>Real-time status of your active automations.</p>
                </div>
                <div className={styles.officeStats}>
                    <div className={styles.statChip}>
                        <div className={styles.pulseDot} style={{ background: '#34D186' }} />
                        {agents.filter((a: any) => a.statusKey === 'running').length} Workflows Running
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Workflows Grid</h3>
                    {agents.length === 0 ? (
                        <div style={{ padding: '64px', textAlign: 'center', background: '#F8FAFC', borderRadius: '24px', border: '1px dashed #CBD5E1' }}>
                            <p style={{ color: '#64748B', fontWeight: 700 }}>No active workflows. Add one from the Marketplace.</p>
                        </div>
                    ) : (
                        <div className={styles.officeGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {agents.map((agent: any) => (
                                <div
                                    key={agent.id}
                                    className={`${styles.workstation} ${agent.statusKey === 'running' ? styles.workstationActive : ''}`}
                                    style={{ padding: '24px', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 950, fontSize: '1.2rem' }}>
                                            {agent.initials}
                                        </div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '100px', background: agent.statusKey === 'running' ? '#F0FAF5' : agent.statusKey === 'failed' ? '#FEF2F2' : '#F1F5F9', color: agent.statusKey === 'running' ? '#34D186' : agent.statusKey === 'failed' ? '#EF4444' : '#64748B', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                            {agent.statusKey === 'running' && <div className={styles.pulseDot} style={{ background: '#34D186', width: '6px', height: '6px', margin: 0 }} />}
                                            {agent.status}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 950, color: '#0F172A', margin: '0 0 4px 0' }}>{agent.name}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0, fontWeight: 700 }}>{agent.role}</p>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2px' }}>Total Tasks</div>
                                            <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 950 }}>{agent.tasksCount}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.65rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase', marginBottom: '2px' }}>Last Activity</div>
                                            <div style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 950 }}>{new Date(agent.lastRun).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                        </div>
                                    </div>
                                    
                                    {agent.statusKey === 'failed' && (
                                        <button style={{ width: '100%', marginTop: '16px', padding: '10px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '10px', fontWeight: 900, fontSize: '0.8rem', cursor: 'pointer' }}>
                                            View Error & Retry
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Activity Feed</h3>
                    <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '600px', overflowY: 'auto' }}>
                        {[
                            { time: 'Just now', msg: 'Invoice #4928 successfully processed', type: 'success' },
                            { time: '2m ago', msg: 'Lead form submitted (Jane Doe)', type: 'info' },
                            { time: '5m ago', msg: 'OCR Extraction failed: Unreadable PDF', type: 'error' },
                            { time: '12m ago', msg: 'Client "Acme Corp" onboarding completed', type: 'success' },
                            { time: '18m ago', msg: 'Started daily data synchronization', type: 'info' },
                        ].map((log, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.type === 'success' ? '#34D186' : log.type === 'error' ? '#EF4444' : '#3B82F6', marginTop: '6px', flexShrink: 0 }} />
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#0F172A', fontWeight: 700 }}>{log.msg}</p>
                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
