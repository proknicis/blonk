import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

/**
 * AI Chat Route
 * Integrated with sovereign PostgreSQL database to give the AI context about existing workflows
 * and security guardrails to protect internal info.
 * Includes a fallback model for reliability via OpenRouter.
 */

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 1. Fetch available workflows from the sovereign database to give the AI context
        let workflowsContext = "";
        try {
            // Updated to use PostgreSQL double-quoted identifiers
            const rows = await db.query('SELECT name, sector, complexity FROM "Workflow" WHERE status = \'Published\' LIMIT 10');
            
            if (rows && rows.length > 0) {
                workflowsContext = "\nHere is the current list of available workflows in our marketplace:\n" + 
                    rows.map((r: any) => `- ${r.name} (${r.sector}). Complexity: ${r.complexity}.`).join("\n");
            } else {
                workflowsContext = "\nThere are currently no workflows published in the marketplace yet.";
            }
        } catch (dbError) {
            console.error("[AI Chat DB Error]", dbError);
            workflowsContext = "\n(System note: Could not retrieve current workflows from the database at this moment.)";
        }

        const systemPrompt = `You are BLONK AI — an intelligent assistant built into the BLONK automation platform. Your identity is a Senior Automation Architect for elite professional service firms.

### CORE IDENTITY & STYLE ###
- **Elite Professionalism:** Assume the persona of a senior consultant. Tone is authoritative, concise, and extremely helpful.
- **Visual Hierarchy:** Use H1 for main titles (#), H2 for numbered sections (## X.), and H3 for Steps (### Step X:).
- **Structural Integrity:** Use separators (---) to isolate "Pro-Tips" and concluding advice. 
- **Action-Oriented:** Use bolding (**) for key action items and structured lists (-) for details.

### RESPONSE SPECIFICATION ###
1. **Title:** Use a single H1 title.
2. **Intro:** Short, punchy context about the value created.
3. **Sections:** Numbered H2 sections for each major workflow area.
4. **Steps:** H3 "Step X: [Action]" format under each H2.
5. **Callouts:** Include a "💡 **Pro-Tip:** [Advice]" block after every major section, wrapped in separators (---).
6. **Closing:** Always end with: "Need more tailored workflows or specific implementations? Just ask! 🤙"

### EXAMPLE STRUCTURE ###
# [Sovereign Title]
[Short Context]

## 1. [Workflow Name]
[Description]

### Step 1: [Action]
- Detailed bullet point with **Bold Action**

---
💡 **Pro-Tip:** [Strategic Advice]
---

Need more tailored workflows or specific implementations? Just ask! 🤙

### WORKFLOW CONTEXT ###${workflowsContext}`;

        // Function to attempt the chat completion with a specific model
        const tryChat = async (model: string) => {
            return fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://blonk.ai",
                    "X-Title": "BLONK AI",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages
                    ],
                    stream: true,
                    include_reasoning: true
                })
            });
        };

        // Primary Model (Premium/Institutional with Reasoning Capability)
        // Using Gemini 2.0 Flash Thinking for high-speed reasoning tokens
        let response = await tryChat("google/gemini-2.0-flash-thinking-exp:free");

        // If primary fails, try the standard fallback
        if (!response.ok) {
            console.warn(`[AI Chat] Primary reasoning model failed (${response.status}). Trying fallback: openai/gpt-4o-mini...`);
            response = await tryChat("openai/gpt-4o-mini");
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[OpenRouter SSE Error]", response.status, errorText);
            return new Response(JSON.stringify({ error: "OpenRouter failure", detail: errorText }), {
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                let hasSentReasoningEnd = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split("\n");

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed || trimmed === "data: [DONE]") continue;

                        if (trimmed.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(trimmed.slice(6));
                                const delta = data.choices?.[0]?.delta;
                                
                                // 1. Check for Reasoning Tokens (OpenRouter reasoning field)
                                const reasoning = delta?.reasoning || delta?.reasoning_content;
                                if (reasoning) {
                                    controller.enqueue(encoder.encode(`THINKING:${reasoning}`));
                                    continue;
                                }

                                // 2. Handle standard content tokens
                                const content = delta?.content;
                                if (content) {
                                    // If we are moving from reasoning to content, signal the end once
                                    if (delta?.content && !hasSentReasoningEnd) {
                                        // Some models don't have distinct reasoning tokens, but if they do, we separate them
                                    }
                                    controller.enqueue(encoder.encode(content));
                                }
                            } catch (e) {
                                // Ignore non-JSON lines
                            }
                        }
                    }
                }
                controller.close();
            }
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Cache-Control": "no-cache"
            }
        });

    } catch (error) {
        console.error('[AI Chat Error]', error);
        return new Response(JSON.stringify({ error: 'Internal server error', detail: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
