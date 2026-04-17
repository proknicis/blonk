import { NextResponse } from "next/server";

export async function GET() {
    const n8nApiUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;

    if (!n8nApiUrl || !n8nApiKey) {
        return NextResponse.json({ error: "n8n configuration missing" }, { status: 500 });
    }

    try {
        const response = await fetch(`${n8nApiUrl}/workflows`, {
            headers: {
                "X-N8N-API-KEY": n8nApiKey,
            },
        });

        if (!response.ok) {
            throw new Error(`n8n API error: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching n8n workflows:", error);
        return NextResponse.json({ error: "Failed to fetch n8n data" }, { status: 500 });
    }
}
