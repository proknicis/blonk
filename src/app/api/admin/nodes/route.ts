import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function probeNode(node: any) {
    const apiKey = node.api_key || node.apiKey;
    if (!apiKey) return { ...node, status: 'No API Key', cpu: 0, ram: 0, queue: 0, uptime: 'N/A' };

    const baseUrl = node.url.replace(/\/+$/, '');

    try {
        // Health check
        const healthRes = await fetch(`${baseUrl}/api/v1/health`, {
            headers: { "X-N8N-API-KEY": apiKey },
            cache: 'no-store',
            signal: AbortSignal.timeout(6000)
        });

        if (!healthRes.ok) {
            return { ...node, status: 'Unreachable', cpu: 0, ram: 0, queue: 0, uptime: 'OFFLINE' };
        }

        const ct = healthRes.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
            return { ...node, status: 'Auth Failed', cpu: 0, ram: 0, queue: 0, uptime: 'N/A' };
        }

        const health = await healthRes.json();

        // Fetch executions for queue/activity metrics
        let activeExecs = 0;
        let recentCount = 0;
        try {
            const execRes = await fetch(`${baseUrl}/api/v1/executions?status=running&limit=50`, {
                headers: { "X-N8N-API-KEY": apiKey },
                cache: 'no-store',
                signal: AbortSignal.timeout(6000)
            });
            const ect = execRes.headers.get('content-type') || '';
            if (execRes.ok && ect.includes('application/json')) {
                const execData = await execRes.json();
                activeExecs = (execData.data || execData || []).length;
            }
        } catch { /* non-critical */ }

        try {
            const recentRes = await fetch(`${baseUrl}/api/v1/executions?limit=100`, {
                headers: { "X-N8N-API-KEY": apiKey },
                cache: 'no-store',
                signal: AbortSignal.timeout(6000)
            });
            const rct = recentRes.headers.get('content-type') || '';
            if (recentRes.ok && rct.includes('application/json')) {
                const recentData = await recentRes.json();
                recentCount = (recentData.data || recentData || []).length;
            }
        } catch { /* non-critical */ }

        // Estimate resource usage from activity levels
        // n8n doesn't expose system metrics, so we estimate from execution load
        const cpuEstimate = Math.min(95, Math.max(5, activeExecs * 15 + recentCount * 0.3 + 8));
        const ramEstimate = Math.min(90, Math.max(10, recentCount * 0.5 + 15));

        return {
            ...node,
            status: 'Active',
            cpu: Math.round(cpuEstimate),
            ram: Math.round(ramEstimate),
            queue: activeExecs,
            uptime: health.status === 'ok' ? 'ONLINE' : health.status?.toUpperCase() || 'ONLINE'
        };
    } catch (error: any) {
        return { ...node, status: 'Unreachable', cpu: 0, ram: 0, queue: 0, uptime: 'TIMEOUT' };
    }
}

export async function GET() {
    try {
        const nodes = await db.query('SELECT * FROM "ClusterNode" ORDER BY "createdAt" DESC');
        
        // Probe all nodes in parallel
        const probedNodes = await Promise.all(nodes.map(probeNode));
        
        return NextResponse.json(probedNodes);
    } catch (error) {
        console.error("[Fleet] Failed to fetch nodes:", error);
        return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, url, api_key } = await req.json();
        
        if (!name || !url || !api_key) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const res = await db.execute(
            'INSERT INTO "ClusterNode" (name, url, api_key, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, url, api_key, 'Pending']
        );

        return NextResponse.json(res.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add node" }, { status: 500 });
    }
}
