import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

/**
 * BLONK AI Chat Route — Professional Support AI System
 * 
 * Features:
 * - Full website navigation knowledge (all pages, features, capabilities)
 * - Database-aware context (workflows, user info)  
 * - Smart escalation detection — when AI can't resolve, suggests admin connection
 * - Multi-model tiering with fallback
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
                workflowsContext = "\n**Available Workflows in Marketplace:**\n" + 
                    rows.map((r: any) => `- ${r.name} (${r.sector}). Complexity: ${r.complexity}.`).join("\n");
            } else {
                workflowsContext = "\n(No workflows currently published in the marketplace.)";
            }
        } catch (dbError) {
            console.error("[AI Chat DB Error]", dbError);
            workflowsContext = "\n(Could not retrieve workflows at this moment.)";
        }

        const systemPrompt = `You are BLONK AI — a professional, friendly, and knowledgeable support assistant for the BLONK platform. BLONK is a workflow automation platform for professional services firms (law firms, accounting, consulting).

### YOUR PERSONALITY ###
- Professional but approachable — like a helpful colleague, not a robot
- Clear and concise — no jargon unless the user uses it first
- Proactive — suggest next steps and relevant features
- Honest — if you don't know something or can't help, say so clearly

### BLONK PLATFORM KNOWLEDGE ###
Here is everything you know about the BLONK platform. Use this to help users navigate and find what they need:

**Dashboard Pages & Navigation:**
- **Overview** (/dashboard) — Main dashboard showing active workflows, recent activity, key metrics. Users see their workflow count, task completions, and system status.
- **Mission Control** (/dashboard/office) — Central workspace for managing active workflow instances and monitoring running automations.
- **Team** (/dashboard/team) — Manage team members, invite new members (Owners/Admins only), view roles (Owner, Admin, Member).
- **Marketplace** (/dashboard/workflows) — Browse and install automation workflow templates. Filter by sector, complexity. Click "Generate Loop" to create new workflow.
- **Audit Vault** (/dashboard/audit) — Immutable audit logs of all system actions for compliance and governance.
- **Reports** (/dashboard/reports) — Intelligence reports, analytics, performance metrics across all workflows.
- **Sovereignty** (/dashboard/sovereignty) — Data sovereignty and security settings for your organization.
- **Settings** (/dashboard/settings) — Account settings, profile, email preferences, firm details.
- **Support Hub** (/dashboard/help) — Help center with FAQ and resources.

**Key Features:**
- **Workflow Automation** — Automated business processes connected to tools like email, CRM, document management
- **Team Collaboration** — Multi-user support with role-based access (Owner, Admin, Member)
- **Audit Trail** — Complete audit logging for compliance requirements
- **Reports & Analytics** — Real-time performance dashboards
- **Keyboard Shortcuts** — Press Ctrl+K (or Cmd+K) to open the command palette for quick navigation

**Common User Tasks:**
- "Create a workflow" → Go to Marketplace (/dashboard/workflows) and click "Generate Loop" or browse templates
- "Invite team members" → Go to Team page (/dashboard/team), click "Invite Member" (requires Owner/Admin role)
- "View audit logs" → Go to Audit Vault (/dashboard/audit)
- "Check system status" → Look at Overview dashboard (/dashboard)
- "Change settings" → Go to Settings (/dashboard/settings)
- "Find a template" → Go to Marketplace (/dashboard/workflows)

${workflowsContext}

### RESPONSE GUIDELINES ###
1. **Be helpful first** — Try to answer the user's question directly using your platform knowledge above
2. **Navigate users** — When relevant, tell them exactly which page to go to (e.g., "Head to the **Team** page in the sidebar")
3. **Format cleanly** — Use **bold** for emphasis, bullet points for lists, keep paragraphs short
4. **Suggest related features** — After answering, briefly mention related capabilities they might not know about

### ESCALATION RULES ###
When you CANNOT help with something, you must include the exact marker text "[ESCALATE]" somewhere in your response. Only use this when:
- The user has a billing/payment issue you cannot resolve
- The user reports a bug or technical error that requires investigation
- The user asks about pricing, plans, or account changes that need admin approval
- The user explicitly asks to talk to a human/admin/support team
- The user has a complex issue that requires system access you don't have
- The user seems frustrated and has asked the same question multiple times

When escalating, be empathetic. Say something like:
"I want to make sure you get the right help for this. I can connect you with our support team who can look into this directly. Would you like me to do that?"

DO NOT escalate for:
- Simple navigation questions (you know all the pages)
- General "how to" questions about features
- Questions about what BLONK does or how automation works
- Greetings or casual conversation`;

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
                    "X-Title": "BLONK AI Support",
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
            console.warn(`[BLONK AI] Primary model failed. Switching to fallback...`);
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
