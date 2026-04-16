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
            const rows = await db.query('SELECT name, sector, complexity FROM "WorkflowTemplate" WHERE status IN (\'Published\', \'Live\') LIMIT 10');
            
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

        const systemPrompt = `You are the BLONK Sovereign Operating System (B-SOS) core. Your persona is a high-ranking Fleet Commander — precise, authoritative, and focused 100% on operational efficiency, ROI, and security.

### OPERATIONAL DIRECTIVES ###
- **Militaristic Precision:** No fluff. No filler. Provide facts, strategies, and solutions with zero leakage.
- **Strategic Focus:** Every response must relate to organizational ROI or firm-level sovereign security.
- **Terminal Aesthetics:** Use high-contrast structure. 

### RESPONSE ARCHITECTURE ###
1. **Primary Objective:** Use H1 (#) for the core goal of the response.
2. **Tactical Steps:** Use H2 (##) and H3 (###) for hierarchical execution steps.
3. **Guardrails:** Every strategy must include a "🛡️ **Audit Warning:**" block wrapped in separators (---).
4. **Closing:** End strictly with: "Directives complete. Standing by for next command."

### RECONNAISSANCE CONTEXT ###${workflowsContext}`;

        // Determine Model Density based on complexity
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || "";
        const needsAnalysis = lastMessage.length > 200 || 
                             lastMessage.includes("analyze") || 
                             lastMessage.includes("optimize") || 
                             lastMessage.includes("error") || 
                             lastMessage.includes("failure") ||
                             lastMessage.includes("bug");

        const selectedModel = needsAnalysis 
            ? "google/gemini-2.0-flash-thinking-exp:free" 
            : "meta-llama/llama-3.1-8b-instruct:free";

        const modelDisplay = needsAnalysis ? "Analytical (Gemini 2.0)" : "Fast (Llama 3.1)";

        // Function to attempt the chat completion with a specific model
        const tryChat = async (model: string) => {
            return fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://blonk.ai",
                    "X-Title": "BLONK B-SOS",
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

        let response = await tryChat(selectedModel);

        // Fallback if needed
        if (!response.ok) {
            console.warn(`[B-SOS] Tiered model failed. Switching to mini fallback...`);
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
