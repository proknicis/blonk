import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { command } = await req.json();

        const systemPrompt = `You are the BLONK Sovereign OS Orchestrator. 
Your job is to translate user commands into system actions.

ACTIONS AVAILABLE:
1. NAVIGATE: Change the page.
   - Destinations: /dashboard (Overview), /dashboard/office (Mission Control), /dashboard/audit (Audit Vault), /dashboard/workflows (Marketplace), /dashboard/team (Personnel), /dashboard/settings (Settings).
2. MESSAGE: Trigger the AI Chat for complex questions.
3. SEARCH: Filter current views (requires query).

RESPONSE FORMAT:
You must respond with a JSON object:
{
  "action": "NAVIGATE" | "MESSAGE" | "SEARCH",
  "url": string (for NAVIGATE),
  "content": string (for MESSAGE prompt),
  "query": string (for SEARCH),
  "message": string (to show to user)
}

USER COMMAND: "${command}"`;

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://blonk.ai",
                "X-Title": "BLONK Command Dispatcher",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini", // Use a fast exact model for command parsing
                messages: [{ role: "system", content: systemPrompt }],
                response_format: { type: "json_object" }
            })
        });

        if (!res.ok) throw new Error("OpenRouter command failure");

        const data = await res.json();
        const actionData = JSON.parse(data.choices[0].message.content);

        return NextResponse.json(actionData);

    } catch (error) {
        console.error('[Command AI Error]', error);
        return NextResponse.json({ action: "MESSAGE", content: "I encountered a protocol error. Please retry.", message: "Protocol mismatch." }, { status: 500 });
    }
}
