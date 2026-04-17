import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        // Try fetching from registered ClusterNodes first
        let nodes: any[] = [];
        try {
            nodes = await db.query('SELECT * FROM "ClusterNode" ORDER BY "createdAt" DESC');
        } catch {
            // Table might not exist yet - fall back to env
        }

        // If we have registered nodes, aggregate workflows from all of them
        if (nodes.length > 0) {
            let allWorkflows: any[] = [];

            for (const node of nodes) {
                const apiKey = node.api_key || node.apiKey || process.env.N8N_API_KEY;
                if (!apiKey) continue;

                let baseUrl = node.url.replace(/\/+$/, '');
                try {
                    const res = await fetch(`${baseUrl}/api/v1/workflows`, {
                        headers: { "X-N8N-API-KEY": apiKey },
                        cache: 'no-store',
                        signal: AbortSignal.timeout(8000)
                    });

                    const ct = res.headers.get('content-type') || '';
                    if (res.ok && ct.includes('application/json')) {
                        const data = await res.json();
                        const wfs = (data.data || data || []).map((wf: any) => ({
                            ...wf,
                            _sourceNode: node.name
                        }));
                        allWorkflows.push(...wfs);
                    }
                } catch {
                    // Node unreachable, skip it
                }
            }

            return NextResponse.json({ data: allWorkflows });
        }

        // Fallback: use env variables if no ClusterNodes registered
        const n8nApiUrl = process.env.N8N_API_URL;
        const n8nApiKey = process.env.N8N_API_KEY;

        if (!n8nApiUrl || !n8nApiKey) {
            return NextResponse.json({ data: [], error: "No n8n nodes configured" });
        }

        let apiUrl = n8nApiUrl.replace(/\/+$/, '');
        if (!apiUrl.includes('/api/v1')) apiUrl += '/api/v1';

        const response = await fetch(`${apiUrl}/workflows`, {
            headers: { "X-N8N-API-KEY": n8nApiKey },
            cache: 'no-store',
            signal: AbortSignal.timeout(8000)
        });

        const contentType = response.headers.get("content-type") || '';
        if (!response.ok || !contentType.includes("application/json")) {
            return NextResponse.json({ data: [], error: `n8n returned ${response.status}` });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching n8n workflows:", error.message);
        return NextResponse.json({ data: [], error: error.message });
    }
}
