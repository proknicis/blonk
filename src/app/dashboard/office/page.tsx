import { db } from "@/lib/db";
import styles from "./office.module.css";
import React from "react";

async function getAgents() {
    try {
        const [agentRows]: any = await db.execute('SELECT * FROM Agent');
        const [workflowRows]: any = await db.execute('SELECT * FROM Workflow');

        // 1. Standard Agents: Use their DB status ONLY if they have an active loop
        const realAgents = agentRows.map((a: any) => ({
            ...a,
            status: a.n8nWorkflow ? a.status : 'Idle',
            color: a.n8nWorkflow ? a.color : '#949A97'
        }));

        // 2. Workflows as Autonomous Agents: Derive status from webhook connectivity
        const workflowAgents = workflowRows.map((wf: any) => {
            const names = wf.name.split(' ');
            const initials = names.length > 1 ? names[0][0] + names[1][0] : names[0][0] + (names[0][1] || '');
            const isOperational = wf.n8nWebhookUrl && wf.n8nWebhookUrl.startsWith('http');

            // Logic: If has URL and status is 'Pending', it's 'Online' (Idle but ready).
            // If it has a URL and status is anything else (Success/Running), show that.
            let displayStatus = 'Disconnected';
            let color = '#949A97';

            if (isOperational) {
                if (wf.status === 'Pending') {
                    displayStatus = 'Online';
                    color = '#34D186';
                } else {
                    displayStatus = wf.status;
                    color = wf.status === 'error' ? '#FF5252' : '#34D186';
                }
            } else {
                displayStatus = 'Offline';
                color = '#FFB038'; // Analyzing/Offline
            }

            return {
                id: wf.id,
                name: wf.name,
                role: `${wf.sector} Automation`,
                status: displayStatus,
                initials: initials.toUpperCase(),
                color: color,
                n8nWorkflow: isOperational ? 'Active Loop' : 'No backend linked',
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
                        {agents.filter((a: any) => a.status === 'Working').length} Agents Operational
                    </div>
                </div>
            </div>

            <div className={styles.officeGrid}>
                {agents.map((agent: any) => (
                    <div
                        key={agent.id}
                        className={`${styles.workstation} ${agent.status !== 'Idle' ? styles.workstationActive : ''}`}
                    >
                        <span className={`${styles.statusChip} ${agent.status === 'Working' ? styles.statusWorking :
                            agent.status === 'Analyzing' ? styles.statusAnalyzing :
                                styles.statusIdle
                            }`}>
                            {agent.status}
                        </span>

                        <div className={styles.deskArea}>
                            <div className={`${styles.monitor} ${agent.status !== 'Idle' ? styles.screenActive : ''}`}>
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
                                {agent.status === 'Working' && <div className={styles.avatarPulse} />}
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
