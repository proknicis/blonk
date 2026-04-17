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
        let apiUrl = targetNode.url.endsWith('/') ? targetNode.url.slice(0, -1) : targetNode.url;
        if (!apiUrl.includes('/api/v1')) apiUrl += '/api/v1';

        const response = await fetch(`${apiUrl}/workflows`, {
            headers: { "X-N8N-API-KEY": targetNode.api_key },
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Node unreachable", status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Diagnostic scan failed" }, { status: 500 });
    }
}
