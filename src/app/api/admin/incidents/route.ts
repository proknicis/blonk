import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
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
            LIMIT 50
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
                severity: 'High',
                timestamp: timeStr,
                status: 'Active',
                debugUrl: log.serverUrl && log.n8nWorkflowId ? `${log.serverUrl.replace(/\/+$/, '')}/workflow/${log.n8nWorkflowId}` : log.serverUrl
            };
        });

        return NextResponse.json(incidents);
    } catch (error) {
        console.error("Incidents API Error:", error);
        return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }
}
