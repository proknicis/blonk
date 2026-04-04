import { db } from "@/lib/db";
import styles from "./office.module.css";
import React from "react";

async function getAgents() {
    try {
        // Migrated from legacy MySQL [rows] destructuring to sovereign PostgreSQL direct query
        // Using double quotes for identifiers and querying rows directly
        const agentRows = await db.query('SELECT * FROM "Agent"');
        const workflowRows = await db.query('SELECT * FROM "Workflow"');

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
            
            // In the new ID-only mode, we are always "operational" as long as the loop exists
            let displayStatus = wf.status || 'Passive';
            let color = '#FFB038'; // Default Pending/Analyzing

            if (wf.status === 'Active' || wf.status === 'Success' || wf.status === 'Completed') {
                displayStatus = 'Online';
                color = '#34D186';
            } else if (wf.status === 'Error' || wf.status === 'Failed') {
                displayStatus = 'Error';
                color = '#FF5252';
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
                n8nWorkflow: 'Cloud Autonomous Sync',
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
    const agents = await getAgents();

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
