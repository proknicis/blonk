import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        console.log("[Diagnostics] Scanning node:", id);
        
        const node = await db.query('SELECT * FROM "ClusterNode" WHERE id = $1', [id]) as any[];
        
        if (!node.length) {
            console.log("[Diagnostics] Node not found:", id);
            return NextResponse.json({ error: "Node not found" }, { status: 404 });
        }

        const targetNode = node[0];
        console.log("[Diagnostics] Node record:", { 
            name: targetNode.name, 
            url: targetNode.url, 
            hasApiKey: !!(targetNode.api_key || targetNode.apiKey),
            columns: Object.keys(targetNode)
        });

        // Support both column naming conventions
        const apiKey = targetNode.api_key || targetNode.apiKey;
        if (!apiKey) {
            return NextResponse.json({ 
                error: "No API key configured for this node",
                nodeColumns: Object.keys(targetNode)
            }, { status: 400 });
        }

        let apiUrl = targetNode.url.endsWith('/') ? targetNode.url.slice(0, -1) : targetNode.url;
        if (!apiUrl.includes('/api/v1')) apiUrl += '/api/v1';

        console.log("[Diagnostics] Fetching from:", `${apiUrl}/workflows`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${apiUrl}/workflows`, {
            headers: { "X-N8N-API-KEY": apiKey },
            cache: 'no-store',
            signal: controller.signal
        });
        clearTimeout(timeout);

        if (!response.ok) {
            const text = await response.text();
            console.error("[Diagnostics] n8n API error:", response.status, text.substring(0, 200));
            return NextResponse.json({ 
                error: `Node responded with ${response.status}`,
                detail: text.substring(0, 200)
            });
        }

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            return NextResponse.json({ 
                error: "Node returned non-JSON response",
                contentType 
            });
        }

        const data = await response.json();
        
        // Format workflow data for display
        const workflows = (data.data || data || []).map((wf: any) => ({
            id: wf.id,
            name: wf.name,
            active: wf.active,
            updatedAt: wf.updatedAt
        }));

        return NextResponse.json({
            node: targetNode.name,
            endpoint: apiUrl,
            workflowCount: workflows.length,
            activeWorkflows: workflows.filter((w: any) => w.active).length,
            workflows
        });
    } catch (error: any) {
        console.error("[Diagnostics] Scan failed:", error.message || error);
        return NextResponse.json({ 
            error: "Diagnostic scan failed", 
            detail: error.message || "Unknown error"
        }, { status: 500 });
    }
}
