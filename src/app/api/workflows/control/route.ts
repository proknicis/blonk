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
        
        // 1. FETCH THE WORKFLOW METADATA FROM PRIVATE DB
        const [wf] = await db.query('SELECT "n8nWorkflowId" FROM "Workflow" WHERE id = $1', [workflowId]);
        
        if (!wf || !wf.n8nWorkflowId) {
            console.error(`[MASTER_CONTROL] No professional n8n mapping found for node: ${workflowId}`);
            return NextResponse.json({ 
                error: "Node Not Calibrated", 
                details: "This node requires an Institutional Workflow ID from the admin panel." 
            }, { status: 400 });
        }

        const n8nBaseUrl = process.env.N8N_BASE_URL || 'https://n8n.manadavana.lv';
        const url = `${n8nBaseUrl}/api/v1/workflows/${wf.n8nWorkflowId}`;
        const apiKey = process.env.N8N_API_KEY;

        if (!apiKey) {
            console.error("[MASTER_CONTROL] Missing N8N_API_KEY.");
            return NextResponse.json({ error: "Core Configuration Missing" }, { status: 500 });
        }

        // 2. DISPATCH DIRECT PUT TO N8N API (Institutional Standard)
        console.log(`[MASTER_CONTROL] Dispatching ${action.toUpperCase()} command to n8n: ${wf.n8nWorkflowId}`);
        
        const putResponse = await fetch(url, {
            method: 'PUT',
            headers: {
                'X-N8N-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ active: shouldBeActive })
        });

        if (!putResponse.ok) {
            const errorData = await putResponse.json().catch(() => ({}));
            return NextResponse.json({ 
                error: "Core Control Failure", 
                details: errorData.message || "n8n API rejected the handshake."
            }, { status: putResponse.status });
        }

        const finalData = await putResponse.json();

        // 3. SYNCHRONIZE INTERNAL STATE
        await db.execute('UPDATE "Workflow" SET status = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2', [
            finalData.active ? 'Active' : 'Ready',
            workflowId
        ]);

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
