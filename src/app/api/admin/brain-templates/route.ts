import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let templates = await db.query(
            `SELECT * FROM "BrainTemplate" ORDER BY name ASC`
        );

        if (templates.length === 0) {
            // Seed premium templates
            const defaultTemplates = [
                {
                    name: "Finance Brain",
                    description: "Main Brain workflow, Invoice reader, payment reconciliation, reflection, approval engine.",
                    version: "2.4",
                    category: "Finance",
                    mainWorkflowId: "finance-main-wf",
                    published: true,
                    workflows: [
                        { workflowId: "finance-main", workflowName: "Main Brain Workflow", type: "Main" },
                        { workflowId: "invoice-parser", workflowName: "Invoice Parser", type: "Subagent" },
                        { workflowId: "payment-reconciliation", workflowName: "Payment Reconciliation", type: "Approval" },
                        { workflowId: "finance-reflection", workflowName: "Reflection", type: "Reflection" }
                    ]
                },
                {
                    name: "Customer Support Brain",
                    description: "Incorporate support knowledge bases, classify tickets, auto-reply draft templates, escalate edge cases.",
                    version: "1.2",
                    category: "Support",
                    mainWorkflowId: "support-main-wf",
                    published: true,
                    workflows: [
                        { workflowId: "support-main", workflowName: "Support Main Workflow", type: "Main" },
                        { workflowId: "faq-search", workflowName: "FAQ Search", type: "Subagent" },
                        { workflowId: "email-generator", workflowName: "Email Generator", type: "Subagent" }
                    ]
                }
            ];

            for (const t of defaultTemplates) {
                const [inserted] = await db.query(
                    `INSERT INTO "BrainTemplate" (name, description, version, category, "mainWorkflowId", published) 
                     VALUES ($1, $2, $3, $4, $5, $6) 
                     RETURNING id`,
                    [t.name, t.description, t.version, t.category, t.mainWorkflowId, t.published]
                ) as any[];

                if (inserted?.id) {
                    for (const w of t.workflows) {
                        await db.execute(
                            `INSERT INTO "BrainWorkflow" ("brainTemplateId", "workflowId", "workflowName", type) 
                             VALUES ($1, $2, $3, $4)`,
                            [inserted.id, w.workflowId, w.workflowName, w.type]
                        );
                    }
                }
            }

            templates = await db.query(
                `SELECT * FROM "BrainTemplate" ORDER BY name ASC`
            );
        }

        // Fetch workflows for each template
        const enriched = [];
        for (const t of templates) {
            const wfs = await db.query(
                `SELECT * FROM "BrainWorkflow" WHERE "brainTemplateId" = $1`,
                [t.id]
            );
            enriched.push({
                ...t,
                workflows: wfs
            });
        }

        return NextResponse.json(enriched);
    } catch (err: any) {
        console.error("GET brain templates error:", err);
        return NextResponse.json({ error: err.message || "Failed to load templates" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { action, id, name, description, version, category, mainWorkflowId, published, workflows } = body;

        if (action === "DELETE") {
            if (!id) return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
            await db.execute(`DELETE FROM "BrainTemplate" WHERE id = $1`, [id]);
            return NextResponse.json({ success: true });
        }

        if (!name || !version) {
            return NextResponse.json({ error: "Missing template name or version" }, { status: 400 });
        }

        let templateId = id;

        if (id) {
            // Update
            await db.execute(
                `UPDATE "BrainTemplate" SET 
                    name = $1, description = $2, version = $3, category = $4, "mainWorkflowId" = $5, published = $6 
                 WHERE id = $7`,
                [name, description || "", version, category || "General", mainWorkflowId || null, !!published, id]
            );
            // Recreate workflows
            await db.execute(`DELETE FROM "BrainWorkflow" WHERE "brainTemplateId" = $1`, [id]);
        } else {
            // Create
            const [inserted] = await db.query(
                `INSERT INTO "BrainTemplate" (name, description, version, category, "mainWorkflowId", published) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id`,
                [name, description || "", version, category || "General", mainWorkflowId || null, !!published]
            ) as any[];
            templateId = inserted?.id;
        }

        // Add workflows if provided
        if (templateId && Array.isArray(workflows)) {
            for (const w of workflows) {
                if (w.workflowId && w.workflowName) {
                    await db.execute(
                        `INSERT INTO "BrainWorkflow" ("brainTemplateId", "workflowId", "workflowName", type) 
                         VALUES ($1, $2, $3, $4)`,
                        [templateId, w.workflowId, w.workflowName, w.type || 'Subagent']
                    );
                }
            }
        }

        return NextResponse.json({ success: true, id: templateId });
    } catch (err: any) {
        console.error("POST brain templates error:", err);
        return NextResponse.json({ error: err.message || "Failed to process template request" }, { status: 500 });
    }
}
