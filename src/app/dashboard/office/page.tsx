import { db } from "@/lib/db";
import styles from "./office.module.css";
import React from "react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

async function getAgents(teamId: string) {
    try {
        // Agent table and Workflow are now team-scoped
        const agentRows = await db.query('SELECT * FROM "Agent" WHERE "teamId" = $1', [teamId]);
        const workflowRows = await db.query('SELECT * FROM "Workflow" WHERE "teamId" = $1', [teamId]);

        // 1. Standard Agents: Use their DB status ONLY if they have an active loop
        const realAgents = (agentRows || []).map((a: any) => ({
            ...a,
            status: a.n8nWorkflow ? a.status : 'Idle',
            color: a.n8nWorkflow ? a.color : '#949A97',
            // Ensure initials exist
            initials: a.name ? a.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AG',
            role: a.role || 'Autonomous Unit'
        }));

        // 2. Workflows as Autonomous Agents: Derive status from database state (ID-based)
        const workflowAgents = (workflowRows || []).map((wf: any) => {
            const names = (wf.name || 'Loop').split(' ');
            const initials = names.length > 1 ? names[0][0] + names[1][0] : names[0][0] + (names[0][1] || 'L');
            
            // Institutional Threshold: 1 Hour (60 minutes) for Loop Stasis
            const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
            const lastUpdate = wf.lastRun ? new Date(wf.lastRun) : null;
            const isStale = lastUpdate && lastUpdate < sixtyMinutesAgo;

            let displayStatus = wf.status || 'Active';
            let color = '#34D186'; // Default Online Green

            // Logic: Published is our baseline 'Live' state
            if (wf.status === 'Active' || wf.status === 'Success' || wf.status === 'Completed' || wf.status === 'Published') {
                if (isStale && wf.status !== 'Published') {
                    displayStatus = 'Standby';
                    color = '#94A3B8'; // Gray/Standby
                } else {
                    displayStatus = 'Online';
                    color = '#34D186';
                }
            } else if (wf.status === 'Pending') {
                displayStatus = 'Initializing';
                color = '#FFB038';
            }

            return {
                id: wf.id,
                name: wf.name,
                role: `${wf.sector || 'General'} Automation`,
                status: displayStatus,
                initials: initials.toUpperCase(),
                color: color,
                n8nWorkflow: isStale ? 'Sync Dormant' : 'Cloud Autonomous Sync',
                lastRun: wf.lastRun,
                performance: wf.performance,
                tasksCount: wf.tasksCount
            };
        });

        return [...realAgents, ...workflowAgents];
    } catch (error) {
        console.error("Fetch agents error:", error);
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
                    <h1>Digital Office</h1>
                    <p className={styles.subtitle}>Real-time oversight of your autonomous workforce.</p>
                </div>
                <div className={styles.officeStats}>
                    <div className={styles.statChip}>
                        <div className={styles.pulseDot} style={{ background: '#34D186' }} />
                        {agents.filter((a: any) => ['Online', 'Working', 'Analyzing', 'Standby', 'Initializing', 'Awaiting Node'].includes(a.status)).length} Loop Units Deployed
                    </div>
                </div>
            </div>

            <div className={styles.officeGrid}>
                {agents.map((agent: any) => (
                    <div
                        key={agent.id}
                        className={`${styles.workstation} ${agent.status !== 'Idle' && agent.status !== 'Offline' ? styles.workstationActive : ''}`}
                    >
                        <span className={`${styles.statusChip} ${agent.status === 'Working' || agent.status === 'Online' ? styles.statusWorking :
                            agent.status === 'Analyzing' ? styles.statusAnalyzing :
                                styles.statusIdle
                            }`}>
                            {agent.status}
                        </span>

                        <div className={styles.deskArea}>
                                <div className={`${styles.monitor} ${['Online', 'Working', 'Analyzing', 'Analyzing Node'].includes(agent.status) ? styles.screenActive : ''}`}>
                                    <div className={styles.screenContent}>
                                        <div className={styles.waveformContainer}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div 
                                                    key={i} 
                                                    className={styles.waveBar} 
                                                    style={{ 
                                                        animationDelay: `${i * 0.15}s`,
                                                        height: `${Math.random() * 50 + 20}%` 
                                                    }} 
                                                />
                                            ))}
                                        </div>
                                        <div className={styles.telemetryStream}>
                                            {agent.status} :: NODE-{agent.id?.substring(0, 4).toUpperCase() || 'SYS'}-ACTIVE
                                        </div>
                                    </div>
                                    <div className={styles.monitorBase} />
                                </div>

                            <div
                                className={styles.agentAvatar}
                                style={{ background: agent.color }}
                            >
                                {agent.initials}
                                {(agent.status === 'Working' || agent.status === 'Online') && <div className={styles.avatarPulse} />}
                            </div>
                        </div>

                        <div className={styles.info} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 950, color: '#0A0A0A', letterSpacing: '-0.04em', marginBottom: '4px' }}>{agent.name}</h3>
                                <div style={{ fontSize: '0.65rem', fontWeight: 950, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{agent.role}</div>
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(3, 1fr)', 
                                gap: '8px',
                                padding: '16px',
                                background: '#F8FAFC',
                                borderRadius: '16px',
                                border: '1px solid #E2E8F0'
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>TPS</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0A0A0A' }}>{agent.performance?.replace(/loops\/hr/gi, '') || '0'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>YIELD</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#34D186' }}>{agent.tasksCount || '0'}</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.55rem', fontWeight: 950, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>UPTIME</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 950, color: '#0A0A0A' }}>100%</div>
                                </div>
                            </div>

                            <button className={styles.runBtn} style={{ width: '100%', borderRadius: '14px', height: '48px', fontSize: '0.85rem', fontWeight: 950, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                                View Signal
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
