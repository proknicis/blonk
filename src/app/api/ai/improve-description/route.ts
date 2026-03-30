export async function POST(req: Request) {
    try {
        const { text, name, category } = await req.json();

        if (!text) {
            return new Response(JSON.stringify({ error: "No text provided" }), { status: 400 });
        }

        const improveText = async (model: string) => {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "HTTP-Referer": "https://blonk.ai",
                    "X-Title": "BLONK AI",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        {
                            role: "system",
                            content: `You are an expert copywriter for business automation. 
Your goal is to take a rough description of a workflow and turn it into a professional, compelling, and clear description that explains the value to a business owner.
Keep it concise but impactful. Use professional yet accessible language.
Focus on: What it does, How it saves time, and The result.`
                        },
                        {
                            role: "user",
                            content: `Workflow Name: ${name || "Unnamed Workflow"}\nCategory: ${category || "General"}\nDescription: ${text}\n\nPlease provide a polished, high-quality version of this description (max 3-4 sentences). Return ONLY the polished text.`
                        }
                    ],
                    max_tokens: 300,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw { status: response.status, data: err };
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content;
        };

        let result;
        try {
            // Try primary model (Minimax)
            result = await improveText("minimax/minimax-m2.5:free");
        } catch (e: any) {
            console.warn(`[AI] Primary model failed (${e.status || 'Error'}). Retrying with Llama 3.1 8B fallback...`);
            
            // If primary fails for ANY reason, fallback to openrouter/free (Auto-selects best available free model)
            try {
                result = await improveText("openrouter/free");
            } catch (fallbackError: any) {
                console.error("[AI] Fallback model also failed:", fallbackError);
                throw new Error("AI service temporarily unavailable. Please try again in 5 minutes.");
            }
        }

        if (!result) throw new Error("AI returned empty result");

        return new Response(JSON.stringify({ text: result.trim() }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        console.error('[Improve Description Error]', error);
        return new Response(JSON.stringify({ 
            error: error.message || 'Failed to improve text',
            retry: true 
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
