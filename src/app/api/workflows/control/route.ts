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
        
        const n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.manadavana.lv';
        const url = `${n8nBaseUrl}/api/v1/workflows/${workflowId}`;
        const apiKey = process.env.N8N_API_KEY;

        if (!apiKey) {
            console.error("[MASTER_CONTROL] Missing N8N_API_KEY.");
            return NextResponse.json({ error: "Core Configuration Missing" }, { status: 500 });
        }

        // 1. FETCH THE CURRENT WORKFLOW SNAPSHOT
        console.log(`[MASTER_CONTROL] Synchronizing with Core for Workflow: ${workflowId}`);
        const getResponse = await fetch(url, {
            method: 'GET',
            headers: { 'X-N8N-API-KEY': apiKey }
        });

        if (!getResponse.ok) {
            return NextResponse.json({ error: "Could not retrieve workflow data from n8n" }, { status: getResponse.status });
        }

        const workflowData = await getResponse.json();

        // 2. MODIFY STATUS WHILE PRESERVING ALL OTHER PROPERTIES (nodes, connections, settings)
        const updatedPayload = {
            ...workflowData,
            active: shouldBeActive
        };

        // 3. PUSH THE COMPLETE PACKAGE BACK TO CORE
        console.log(`[MASTER_CONTROL] Dispatching ${action.toUpperCase()} command with full payload integrity.`);
        
        const putResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedPayload)
        });

        if (!putResponse.ok) {
            const errorData = await putResponse.json().catch(() => ({}));
            return NextResponse.json({ 
                error: "Core Control Failure", 
                details: errorData.message || "Final package rejected by n8n API"
            }, { status: putResponse.status });
        }

        const finalData = await putResponse.json();
        return NextResponse.json({ 
            success: true, 
            active: finalData.active,
            message: `Sovereign Loop ${action.toUpperCase()} successful.`
        });

    } catch (error: any) {
        console.error("[MASTER_CONTROL] Connection Error:", error);
        return NextResponse.json({ 
            error: "Connectivity Failure", 
            details: error.message 
        }, { status: 500 });
    }
}
