import { NextResponse } from "next/server";

export async function GET() {
    try {
        const n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.manadavana.lv';
        const url = `${n8nBaseUrl}/webhook/stats`;

        console.log(`[STATS_BRIDGE] Synchronizing with n8n Core: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            next: { revalidate: 0 } // Ensure we always get fresh pulses
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Core Pulse Missing" }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("[STATS_BRIDGE] Connection Failure:", error);
        return NextResponse.json({ error: "System Connectivity Failure" }, { status: 500 });
    }
}
