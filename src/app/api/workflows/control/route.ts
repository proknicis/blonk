import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { workflowId, action } = await req.json();
        const shouldBeActive = action === "start";
        
        // n8n Public API URL
        const n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.manadavana.lv';
        const url = `${n8nBaseUrl}/api/v1/workflows/${workflowId}`;
        const apiKey = process.env.N8N_API_KEY;

        if (!apiKey) {
            console.error("[MASTER_CONTROL] Missing N8N_API_KEY in environment variables.");
            return NextResponse.json({ error: "Core Configuration Missing" }, { status: 500 });
        }

        // Direct PUT request to n8n Public API
        console.log(`[MASTER_CONTROL] Dispatching ${action.toUpperCase()} to workflow: ${workflowId}`);
        
        const response = await fetch(url, {
            method: 'PATCH', // n8n Public API uses PATCH for status updates
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active: shouldBeActive })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[MASTER_CONTROL] n8n API Refused Request:", response.status, errorData);
            return NextResponse.json({ 
                error: "Core Control Failure", 
                details: errorData.message || "n8n API returned an unexpected response"
            }, { status: response.status });
        }

        const data = await response.json();
        console.log(`[MASTER_CONTROL] Status update successful. Workflow active: ${data.active}`);

        return NextResponse.json({ 
            success: true, 
            active: data.active,
            message: `Workflow is now ${data.active ? 'ACTIVE' : 'INACTIVE'}`
        });

    } catch (error: any) {
        console.error("[MASTER_CONTROL] Connection Error:", error);
        return NextResponse.json({ 
            error: "Connectivity Failure", 
            details: error.message 
        }, { status: 500 });
    }
}
