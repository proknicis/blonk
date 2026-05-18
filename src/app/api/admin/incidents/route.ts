import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const errorLogs = await db.query(`
            SELECT 
                wl.id, 
                t."firmName", 
                COALESCE(w.name, wl."workflowName") as "workflowName", 
                COALESCE(wl.result::jsonb->>'error', 'Unknown Operational Fault') as "errorMessage", 
                wl."createdAt",
                wl.status,
                n.url as "serverUrl",
                n.name as "serverName",
                w."n8nWorkflowId"
            FROM "WorkflowLog" wl
            LEFT JOIN "Team" t ON wl."teamId" = t.id
            LEFT JOIN "Workflow" w ON wl."workflowId" = w.id
            LEFT JOIN "ClusterNode" n ON w."serverId" = n.id
            WHERE wl.status = 'error'
            ORDER BY wl."createdAt" DESC
            LIMIT 50
        `) as any[];

        const incidents = errorLogs.map(log => {
            const created = new Date(log.createdAt);
            const diffMs = new Date().getTime() - created.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            
            // Format precise date string instead of just relative time
            const dateStr = created.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return {
                id: log.id.substring(0, 8),
                firm: log.firmName || 'System Archive',
                description: log.errorMessage || `Unknown failure in ${log.workflowName}`,
                severity: 'High',
                timestamp: dateStr,
                status: 'Active',
                debugUrl: log.serverUrl && log.n8nWorkflowId ? `${log.serverUrl.replace(/\/+$/, '')}/workflow/${log.n8nWorkflowId}` : log.serverUrl,
                workflowName: log.workflowName || 'Orphaned Execution',
                serverName: log.serverName || 'Unknown Node'
            };
        });

        return NextResponse.json(incidents);
    } catch (error) {
        console.error("Incidents API Error:", error);
        return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }
}
