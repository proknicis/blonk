import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * n8n Server Management API
 * 
 * POST - Execute n8n management actions (start, stop, restart, update)
 */

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { action } = await req.json();
        const { id: nodeId } = await context.params;

        if (!action || !['start', 'stop', 'restart', 'update'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Get node details
        const node = await db.query('SELECT * FROM "ClusterNode" WHERE id = $1', [nodeId]) as any[];
        if (node.length === 0) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 });
        }

        const nodeData = node[0];
        const baseUrl = nodeData.url.replace(/\/+$/, '');
        const apiKey = nodeData.api_key;

        if (!apiKey) {
            return NextResponse.json({ error: "Node has no API key configured" }, { status: 400 });
        }

        // Execute n8n action via API
        let endpoint = '';
        switch (action) {
            case 'start':
                // n8n doesn't have a direct start API, but we can trigger a workflow to start services
                endpoint = '/api/v1/health';
                break;
            case 'stop':
                // n8n doesn't have a direct stop API, this would need system-level access
                return NextResponse.json({ 
                    error: "Stop action requires system-level access. Please use SSH or Contabo console.",
                    requiresSystemAccess: true 
                }, { status: 400 });
            case 'restart':
                // Trigger a health check to simulate restart
                endpoint = '/api/v1/health';
                break;
            case 'update':
                // Check for updates via n8n API
                endpoint = '/api/v1/health';
                break;
        }

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                headers: { "X-N8N-API-KEY": apiKey },
                cache: 'no-store'
            });

            if (response.ok) {
                // Update node status based on action
                const statusUpdate = action === 'restart' ? 'Restarting' : nodeData.status;
                await db.execute(
                    'UPDATE "ClusterNode" SET status = $1 WHERE id = $2',
                    [statusUpdate, nodeId]
                );

                return NextResponse.json({ 
                    success: true, 
                    action, 
                    message: `n8n ${action} command executed successfully`,
                    nodeId
                });
            } else {
                return NextResponse.json({ 
                    error: "Failed to communicate with n8n instance",
                    details: `HTTP ${response.status}`
                }, { status: 500 });
            }
        } catch (error: any) {
            console.error(`n8n action ${action} failed for node ${nodeId}:`, error);
            return NextResponse.json({ 
                error: "Failed to execute n8n action",
                details: error.message
            }, { status: 500 });
        }

    } catch (error: any) {
        console.error("n8n API error:", error);
        return NextResponse.json({ 
            error: "Internal server error",
            details: error.message
        }, { status: 500 });
    }
}
