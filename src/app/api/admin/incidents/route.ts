import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

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
                w."n8nWorkflowId",
                wl."teamId",
                wl."workflowId"
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
            const dateStr = created.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return {
                id: log.id,
                firm: log.firmName || 'System Archive',
                description: log.errorMessage || `Unknown failure in ${log.workflowName}`,
                severity: 'High',
                timestamp: dateStr,
                status: 'Active',
                debugUrl: log.serverUrl && log.n8nWorkflowId ? `${log.serverUrl.replace(/\/+$/, '')}/workflow/${log.n8nWorkflowId}` : log.serverUrl,
                workflowName: log.workflowName || 'Orphaned Execution',
                serverName: log.serverName || 'Unknown Node',
                teamId: log.teamId,
                workflowId: log.workflowId
            };
        });

        return NextResponse.json(incidents);
    } catch (error) {
        console.error("Incidents API Error:", error);
        return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, action } = body;
        
        console.log(`[INCIDENT_UPDATE] Action: ${action}, ID: ${id}`);

        if (action === 'RESOLVE') {
            if (!id) return NextResponse.json({ error: "Missing incident ID" }, { status: 400 });

            // Ensure the ID is a valid UUID to prevent PostgreSQL from crashing on cast failure
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(id)) {
                return NextResponse.json({ error: "Invalid Incident ID format (Expected UUID)" }, { status: 400 });
            }

            // PostgreSQL IDs can be UUIDs or Strings. We use $1 to be safe.
            const result = await db.execute('UPDATE "WorkflowLog" SET status = \'resolved\' WHERE id = $1', [id]);
            
            console.log(`[INCIDENT_UPDATE] Rows affected: ${result.rowCount}`);

            if (result.rowCount === 0) {
                console.warn(`[INCIDENT_UPDATE] No record found with ID: ${id}`);
                return NextResponse.json({ error: "Incident record not found in database" }, { status: 404 });
            }

            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("Incidents Update Error:", error);
        return NextResponse.json({ 
            error: "Update failed", 
            details: error.message,
            hint: "Check if WorkflowLog table exists and has a 'status' column" 
        }, { status: 500 });
    }
}
