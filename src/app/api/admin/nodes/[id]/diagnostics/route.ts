import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const node = await db.query('SELECT * FROM "ClusterNode" WHERE id = $1', [id]) as any[];
        
        if (!node.length) {
            return NextResponse.json({ error: "Node not found" }, { status: 404 });
        }

        const targetNode = node[0];

        // Support both column naming conventions, fall back to env key
        const apiKey = targetNode.api_key || targetNode.apiKey || process.env.N8N_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "No API key available" }, { status: 400 });
        }

        let baseUrl = targetNode.url.replace(/\/+$/, '');

        // 1. Health check first
        let healthStatus = "unknown";
        try {
            const healthRes = await fetch(`${baseUrl}/api/v1/health`, {
                headers: { "X-N8N-API-KEY": apiKey },
                cache: 'no-store',
                signal: AbortSignal.timeout(8000)
            });
            if (healthRes.ok) {
                const h = await healthRes.json();
                healthStatus = h.status || "healthy";
            } else {
                healthStatus = `error (${healthRes.status})`;
            }
        } catch {
            healthStatus = "unreachable";
        }

        // 2. Fetch workflows
        let workflows: any[] = [];
        let workflowError = null;
        try {
            const wfRes = await fetch(`${baseUrl}/api/v1/workflows`, {
                headers: { "X-N8N-API-KEY": apiKey },
                cache: 'no-store',
                signal: AbortSignal.timeout(8000)
            });

            const contentType = wfRes.headers.get('content-type') || '';
            if (wfRes.ok && contentType.includes('application/json')) {
                const data = await wfRes.json();
                workflows = (data.data || data || []).map((wf: any) => ({
                    id: wf.id,
                    name: wf.name,
                    active: wf.active,
                    nodes: wf.nodes?.length || 0,
                    updatedAt: wf.updatedAt
                }));
            } else {
                workflowError = `API returned ${wfRes.status}`;
            }
        } catch (e: any) {
            workflowError = e.message || "Connection failed";
        }

        // 3. Fetch executions summary
        let recentExecutions = 0;
        let failedExecutions = 0;
        try {
            const execRes = await fetch(`${baseUrl}/api/v1/executions?limit=20`, {
                headers: { "X-N8N-API-KEY": apiKey },
                cache: 'no-store',
                signal: AbortSignal.timeout(8000)
            });
            const ct = execRes.headers.get('content-type') || '';
            if (execRes.ok && ct.includes('application/json')) {
                const execData = await execRes.json();
                const execs = execData.data || execData || [];
                recentExecutions = execs.length;
                failedExecutions = execs.filter((e: any) => e.finished === false || e.status === 'error' || e.status === 'failed').length;
            }
        } catch { /* non-critical */ }

        return NextResponse.json({
            node: targetNode.name,
            endpoint: baseUrl,
            health: healthStatus,
            workflowCount: workflows.length,
            activeWorkflows: workflows.filter((w: any) => w.active).length,
            inactiveWorkflows: workflows.filter((w: any) => !w.active).length,
            recentExecutions,
            failedExecutions,
            workflows,
            workflowError,
            scannedAt: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("[Diagnostics] Scan failed:", error.message);
        return NextResponse.json({ 
            error: "Diagnostic scan failed", 
            detail: error.message 
        }, { status: 500 });
    }
}
