import { db } from "@/lib/db";
import styles from "./office.module.css";
import React from "react";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

async function getAgents(userEmail: string) {
    try {
        const emailRef = userEmail.toLowerCase();
        // Filter both agents and workflows by the authenticated user
        const agentRows = await db.query('SELECT * FROM "Agent" WHERE LOWER("requestedBy") = LOWER($1)', [emailRef]);
        const workflowRows = await db.query('SELECT * FROM "Workflow" WHERE LOWER("requestedBy") = LOWER($1)', [emailRef]);

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
            
            const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
            const lastUpdate = wf.lastRun ? new Date(wf.lastRun) : null;
            const isStale = lastUpdate && lastUpdate < tenMinutesAgo;

            let displayStatus = wf.status || 'Passive';
            let color = '#FFB038'; // Default

            // If it was Active but hasn't reported for 10 mins -> Standby
            if (wf.status === 'Active' || wf.status === 'Success' || wf.status === 'Completed') {
                if (isStale) {
                    displayStatus = 'Standby';
                    color = '#94A3B8'; // Gray/Standby
                } else {
                    displayStatus = 'Online';
                    color = '#34D186';
                }
            } else if (wf.status === 'Pending') {
                displayStatus = 'Awaiting Node';
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
                lastRun: wf.lastRun
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
    if (!session?.user?.email) redirect("/login");

    const agents = await getAgents(session.user.email);

    return (
        <div className={styles.officeContainer}>
            <div className={styles.header}>
                <div className={styles.headerText}>
                    <h1>Digital Office</h1>
                    <p className={styles.subtitle}>Real-time oversight of your autonomous workforce.</p>
                </div>
                <div className={styles.officeStats}>
                    <div className={styles.statChip}>
                        <div className={styles.pulseDot} />
                        {agents.filter((a: any) => a.status === 'Working' || a.status === 'Online').length} Agents Operational
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
                            <div className={`${styles.monitor} ${agent.status !== 'Idle' && agent.status !== 'Offline' ? styles.screenActive : ''}`}>
                                <div className={styles.screenContent}>
                                    <div className={styles.screenHeader}>
                                        <div className={styles.screenDot} style={{ background: '#FF5F56' }} />
                                        <div className={styles.screenDot} style={{ background: '#FFBD2E' }} />
                                        <div className={styles.screenDot} style={{ background: '#27C93F' }} />
                                    </div>
                                    <div className={styles.codeLines}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                            <div
                                                key={i}
                                                className={styles.codeLine}
                                                style={{
                                                    width: `${Math.random() * 50 + 30}%`,
                                                    animationDelay: `${i * 0.15}s`,
                                                    opacity: Math.random() * 0.5 + 0.3
                                                }}
                                            />
                                        ))}
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

                        <div className={styles.info}>
                            <h3>{agent.name}</h3>
                            <p className={styles.agentRole}>{agent.role}</p>
                            {agent.n8nWorkflow && (
                                <div className={styles.workflowTag}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M2 12h20L12 22 2 12z" /></svg>
                                    {agent.n8nWorkflow}
                                </div>
                            )}
                            {agent.lastRun && (
                                <p style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '4px' }}>
                                    Last Activity: {new Date(agent.lastRun).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
