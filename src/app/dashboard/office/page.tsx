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
            
            let displayStatus = wf.status || 'Idle';
            let color = '#94A3B8';
            let statusKey = 'idle';

            if (wf.status === 'Failed' || wf.status === 'Error') {
                displayStatus = 'Failed';
                color = '#EF4444';
                statusKey = 'failed';
            } else if (wf.status === 'Active' || wf.status === 'Published' || wf.status === 'Running') {
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
                lastRun: wf.lastRun || null,
                tasksCount: wf.tasksCount || 0
            };
        });

        const notifRows = await db.query('SELECT * FROM "Notification" WHERE "teamId" = $1 ORDER BY "createdAt" DESC LIMIT 10', [teamId]);
        
        const feed = (notifRows || []).map((n: any) => {
            let type = 'info';
            if (n.title?.toLowerCase().includes('success') || n.message?.toLowerCase().includes('success')) type = 'success';
            if (n.title?.toLowerCase().includes('fail') || n.message?.toLowerCase().includes('fail')) type = 'error';

            return {
                id: n.id,
                msg: n.title,
                detail: n.message,
                type,
                time: new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
        });

        return { workflows: workflowAgents, feed };

    } catch (error) {
        console.error("Fetch workflows error:", error);
        return { workflows: [], feed: [] };
    }
}

export default async function OfficePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    const { workflows, feed } = await getAgents(teamId);

    return (
        <div className={styles.officeContainer}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#F8FAFC', borderRadius: '100px', fontWeight: 900, fontSize: '0.85rem', color: '#0F172A', border: '1px solid #E2E8F0' }}>
                    <div className={styles.pulseDot} style={{ background: '#34D186', width: '8px', height: '8px', borderRadius: '50%' }} />
                    {workflows.filter((a: any) => a.statusKey === 'running').length} Workflows Running
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 950, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Workflows Grid</h3>
                    {workflows.length === 0 ? (
                        <div style={{ padding: '64px', textAlign: 'center', background: '#F8FAFC', borderRadius: '24px', border: '1px dashed #CBD5E1' }}>
                            <p style={{ color: '#64748B', fontWeight: 700 }}>No active workflows. Add one from the Marketplace.</p>
                        </div>
                    ) : (
                        <div className={styles.officeGrid} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                            {workflows.map((agent: any) => (
                                <div
                                    key={agent.id}
                                    style={{ padding: '32px', background: '#FFFFFF', borderRadius: '24px', border: agent.statusKey === 'running' ? '2px solid #34D186' : '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: agent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 950, fontSize: '1.4rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                            {agent.initials}
                                        </div>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '100px', background: agent.statusKey === 'running' ? '#F0FAF5' : agent.statusKey === 'failed' ? '#FEF2F2' : '#F8FAFC', color: agent.statusKey === 'running' ? '#34D186' : agent.statusKey === 'failed' ? '#EF4444' : '#64748B', fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase' }}>
                                            {agent.statusKey === 'running' && <div className={styles.pulseDot} style={{ background: '#34D186', width: '6px', height: '6px', margin: 0, borderRadius: '50%' }} />}
                                            {agent.status}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '32px' }}>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 950, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>{agent.name}</h3>
                                        <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0, fontWeight: 700 }}>{agent.role}</p>
                                    </div>

                                    <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '20px', marginTop: 'auto' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Total Tasks</div>
                                            <div style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 950 }}>{agent.tasksCount}</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 900, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Last Activity</div>
                                            <div style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: 950 }}>{agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}</div>
                                        </div>
                                    </div>
                                    
                                    {(agent.statusKey === 'failed' && (session.user as any).role !== 'VIEWER') && (
                                        <button style={{ width: '100%', marginTop: '24px', padding: '12px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', borderRadius: '12px', fontWeight: 900, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                                            View Logs & Retry
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
                        {feed.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontWeight: 600 }}>No recent activity.</div>
                        ) : feed.map((log: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: i !== feed.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: log.type === 'success' ? '#F0FAF5' : log.type === 'error' ? '#FEF2F2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: log.type === 'success' ? '#34D186' : log.type === 'error' ? '#EF4444' : '#3B82F6' }} />
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#0F172A', fontWeight: 800 }}>{log.msg}</p>
                                    {log.detail && log.detail !== log.msg && (
                                        <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', color: '#64748B', fontWeight: 500, lineHeight: 1.4 }}>{log.detail}</p>
                                    )}
                                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{log.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
