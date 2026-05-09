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
        let liveUserContext = "";
        
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        try {
            // A. Marketplace Context
            const rows = await db.query('SELECT name, sector, complexity FROM "WorkflowTemplate" WHERE status IN (\'Published\', \'Live\') LIMIT 10');
            if (rows && rows.length > 0) {
                workflowsContext = "\n**Available Workflows in Marketplace:**\n" + 
                    rows.map((r: any) => `- ${r.name} (${r.sector}). Complexity: ${r.complexity}.`).join("\n");
            }

            // B. Live User Statistics (If logged in)
            if (teamId) {
                const [stats, activeWf, teamInfo] = await Promise.all([
                    db.query(`
                        SELECT 
                            COUNT(*) as total,
                            SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errs
                        FROM "WorkflowLog"
                        WHERE "teamId" = $1
                    `, [teamId]),
                    db.query('SELECT COUNT(*) as count FROM "Workflow" WHERE "teamId" = $1', [teamId]),
                    db.query('SELECT name FROM "Team" WHERE id = $1', [teamId])
                ]);

                const total = parseInt((stats as any)[0]?.total || '0');
                const errors = parseInt((stats as any)[0]?.errs || '0');
                const health = total > 0 ? (100 - (errors / total * 100)).toFixed(1) : "100";
                const active = (activeWf as any)[0]?.count || 0;
                const firmName = (teamInfo as any)[0]?.name || "Your Firm";

                liveUserContext = `
### LIVE USER DATA (AUTHENTICATED) ###
- **User Name**: ${session?.user?.name || 'User'}
- **User Role**: ${(session?.user as any)?.role || 'Member'}
- **Firm Name**: ${firmName}
- **Active Workflows**: ${active}
- **Total Automated Tasks**: ${total}
- **Fleet Integrity (Health)**: ${health}%
- **Team ID**: ${teamId}
Use this data to answer questions about their performance or current setup.
`;
            }
        } catch (dbError) {
            console.error("[AI Chat DB Error]", dbError);
        }

        const systemPrompt = `You are BLONK AI — a professional, friendly, and knowledgeable support assistant for the BLONK platform. BLONK is a workflow automation platform for professional services firms.

${liveUserContext}

### YOUR PERSONALITY ###
- Professional but approachable — like a helpful colleague, not a robot
- Clear and concise — no jargon unless the user uses it first
- Proactive — suggest next steps and relevant features

### BLONK PLATFORM KNOWLEDGE ###
**Dashboard Pages & Navigation:**
- **Overview** (/dashboard) — Main dashboard showing active workflows, recent activity, key metrics.
- **Mission Control** (/dashboard/office) — Central workspace for managing active workflow instances.
- **Team** (/dashboard/team) — Manage team members, invite new members.
- **Marketplace** (/dashboard/workflows) — Browse and install automation workflow templates.
- **Audit Vault** (/dashboard/audit) — Immutable audit logs of all system actions.
- **Reports** (/dashboard/reports) — Intelligence reports and analytics.
- **Sovereignty** (/dashboard/sovereignty) — Data residency, API keys, and the **EMERGENCY KILL SWITCH**.
- **Settings** (/dashboard/settings) — Account settings, profile, firm details.

**Critical Features (USE THESE FOR ANSWERS):**
- **Emergency Kill Switch** (on /dashboard/sovereignty) — Allows immediate termination of all running automations across the entire firm. Use in case of data incidents.
- **Beacon Guidance** — You can guide users to any element using the [GUIDE|Label|Selector|Path] format.

${workflowsContext}

### RESPONSE GUIDELINES ###
1. **Be helpful first** — Answer directly using the Live User Data provided above.
2. **Navigate & Guide users** — When recommending a page, use:
   - **Simple Nav**: \`[Button Label|/path]\`
   - **Interactive Guide**: \`[GUIDE|Label|Selector|Path]\`
   
   **Use these Selectors for GUIDES:**
   - **Emergency Kill Switch**: \`#kill-switch-section\` (on /dashboard/sovereignty)
   - **ROI Metrics**: \`#roi-card\` (on /dashboard/reports)
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
