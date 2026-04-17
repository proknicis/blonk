import { NextResponse } from "next/server";

export async function GET() {
    const n8nApiUrl = process.env.N8N_API_URL;
    const n8nApiKey = process.env.N8N_API_KEY;

    if (!n8nApiUrl || !n8nApiKey) {
        return NextResponse.json({ error: "n8n configuration missing" }, { status: 500 });
    }

    try {
        // Ensure URL has /api/v1 if not already present
        let apiUrl = n8nApiUrl.endsWith('/') ? n8nApiUrl.slice(0, -1) : n8nApiUrl;
        if (!apiUrl.includes('/api/v1')) {
            apiUrl += '/api/v1';
        }
        
        console.log(`Fetching n8n workflows from: ${apiUrl}/workflows`);
        const response = await fetch(`${apiUrl}/workflows`, {
            headers: {
                "X-N8N-API-KEY": n8nApiKey,
            },
            cache: 'no-store'
        });

        const contentType = response.headers.get("content-type");
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`n8n API error: ${response.status} ${response.statusText}`, errorText);
            return NextResponse.json({ 
                error: `n8n API error: ${response.status}`, 
                details: errorText,
                status: response.status 
            }, { status: response.status });
        }

        if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("n8n API returned non-JSON response:", text.substring(0, 100));
            return NextResponse.json({ 
                error: "Invalid Response", 
                details: "The n8n server returned an HTML page instead of JSON. Check your API URL and Key." 
            }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Error fetching n8n workflows:", error);
        return NextResponse.json({ 
            error: "Failed to fetch n8n data", 
            message: error.message 
        }, { status: 500 });
    }
}
