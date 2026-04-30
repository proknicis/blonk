import { db } from "@/lib/db";
import { ShieldAlert } from "lucide-react";
import adminStyles from "../admin.module.css";
import React from 'react';
import IncidentFeed from "./IncidentFeed";

export const dynamic = 'force-dynamic';

export default async function IncidentCommandPage() {
    // Fetch initial data for SSR
    const errorLogs = await db.query(`
        SELECT 
            wl.id, 
            t."firmName", 
            wl."workflowName", 
            COALESCE(wl.result::jsonb->>'error', 'Unknown Operational Fault') as "errorMessage", 
            wl."createdAt",
            wl.status,
            n.url as "serverUrl",
            w."n8nWorkflowId"
        FROM "WorkflowLog" wl
        LEFT JOIN "Team" t ON wl."teamId" = t.id
        LEFT JOIN "Workflow" w ON wl."workflowId" = w.id
        LEFT JOIN "ClusterNode" n ON w."serverId" = n.id
        WHERE wl.status = 'error'
        ORDER BY wl."createdAt" DESC
        LIMIT 20
    `) as any[];

    const incidents = errorLogs.map(log => {
        const created = new Date(log.createdAt);
        const diffMs = new Date().getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const timeStr = diffMins < 1 ? 'Just now' : diffMins < 60 ? `${diffMins}m ago` : `${Math.floor(diffMins / 60)}h ago`;

        return {
            id: log.id.substring(0, 8),
            firm: log.firmName || 'System Archive',
            description: log.errorMessage || `Unknown failure in ${log.workflowName}`,
            severity: 'High' as 'High' | 'Medium' | 'Low',
            timestamp: timeStr,
            status: 'Active' as 'Active' | 'Investigating' | 'Resolved',
            debugUrl: log.serverUrl && log.n8nWorkflowId ? `${log.serverUrl.replace(/\/+$/, '')}/workflow/${log.n8nWorkflowId}` : log.serverUrl
        };
    });

    return (
        <div style={{ animation: "fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)", display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* INTEGRITY PANEL */}
            <div className={adminStyles.integrityPanel} style={{ background: '#09090B', color: 'white', border: 'none' }}>
                <div className={adminStyles.integrityHub}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.05)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ShieldAlert size={28} color={incidents.length > 0 ? '#EF4444' : '#10B981'} className={adminStyles.pulse} />
                        </div>
                    </div>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.6rem', fontWeight: 950, margin: 0, letterSpacing: '-0.03em' }}>Incident Command</h2>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', margin: '6px 0 0', fontWeight: 700 }}>{incidents.length} active exceptions detected in the institutional ledger.</p>
                    </div>
                </div>
                <div className={adminStyles.hubMetrics}>
                    <div style={{ padding: '0 40px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 950, opacity: 0.4, letterSpacing: '0.1em' }}>System State</span>
                        <div style={{ fontSize: '1.4rem', fontWeight: 950, color: incidents.length > 0 ? '#EF4444' : '#10B981', marginTop: '4px' }}>
                            {incidents.length > 0 ? 'COMPROMISED' : 'NOMINAL'}
                        </div>
                    </div>
                </div>
            </div>

            <IncidentFeed initialIncidents={incidents} />
        </div>
    );
}
        </div>
    );
}

