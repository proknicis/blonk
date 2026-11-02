import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from "@/lib/db";

async function ensureSchema() {
    await db.execute(`
        ALTER TABLE "ApprovalEvidence"
        ADD COLUMN IF NOT EXISTS "actionType" VARCHAR(100) DEFAULT 'send_email',
        ADD COLUMN IF NOT EXISTS "actionPreview" TEXT,
        ADD COLUMN IF NOT EXISTS "automationName" VARCHAR(255)
    `);
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !token.startsWith('admin_')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminId = token.split('_')[1];
        const [user] = await db.query('SELECT plan FROM "User" WHERE id = $1 LIMIT 1', [adminId]) as any[];
        
        const isAdmin = user && user.plan === 'SuperAdmin';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await ensureSchema();

        const rows = await db.query(`
            SELECT * FROM (
                SELECT DISTINCT ON (a.id)
                    a.id,
                    a."workflowLogId",
                    a."workflowId",
                    a."teamId",
                    a."requestedBy",
                    a."approvedBy" as "decidedBy",
                    a.status,
                    COALESCE(a."actionPreview", a."outputPreview") as "actionPreview",
                    COALESCE(a."actionType", a."policyName") as "actionType",
                    a."createdAt" as "requestedAt",
                    a."decidedAt",
                    a."decisionRationale",
                    COALESCE(a."automationName", w.name, 'Autonomous Loop') as "automationName",
                    t.name as "teamName",
                    COALESCE(t."firmName", u."firmName", t.name) as "customerName",
                    COALESCE(u."aiEmployee", 'General AI Employee') as "aiEmployeeName"
                FROM "ApprovalEvidence" a
                LEFT JOIN "Workflow" w ON a."workflowId" = w.id
                LEFT JOIN "Team" t ON a."teamId" = t.id
                LEFT JOIN "User" u ON a."teamId" = u."teamId" AND u.plan != 'SuperAdmin'
                ORDER BY a.id, a."createdAt" DESC
            ) sub
            ORDER BY sub."requestedAt" DESC
            LIMIT 100
        `);

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('Error fetching approvals:', error);
        return NextResponse.json({ error: 'Failed', details: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !token.startsWith('admin_')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const adminId = token.split('_')[1];
        const [user] = await db.query('SELECT email, plan FROM "User" WHERE id = $1 LIMIT 1', [adminId]) as any[];
        
        const isAdmin = user && user.plan === 'SuperAdmin';
        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const approverEmail = user.email || 'unknown_admin';
        const userId = adminId;
        const body = await request.json();
        const { approvalId, decision, rationale, bypassReason, overrideSegregationOfDuties, bypassJustification, editedPreview } = body;

        await ensureSchema();

        if (!approvalId || !decision) {
            return NextResponse.json({ error: 'Missing approvalId or decision parameters' }, { status: 400 });
        }

        // Fetch approval evidence detail
        const approvals = await db.query(
            'SELECT * FROM "ApprovalEvidence" WHERE id = $1 LIMIT 1',
            [approvalId]
        ) as any[];

        if (approvals.length === 0) {
            return NextResponse.json({ error: 'Approval record not found' }, { status: 404 });
        }

        const approval = approvals[0];
        const requestedBy = approval.requestedBy || '';

        // Segregation of Duties Check
        let exceptionBypassReason = bypassReason || '';
        if (requestedBy && requestedBy.toLowerCase() === approverEmail.toLowerCase()) {
            if (!overrideSegregationOfDuties) {
                return NextResponse.json({ 
                    success: false,
                    segregationViolation: true,
                    error: 'Segregation of Duties Warning: You are the initiator of this task. Self-approval is blocked unless explicitly authorized by policy override.'
                }, { status: 409 });
            } else {
                exceptionBypassReason = bypassJustification || 'Self-approval override justification: Owner/Administrator bypass policy.';
            }
        }

        const writebackAllowed = decision === 'APPROVED';
        const writtenBack = writebackAllowed;
        const writebackTimestamp = writtenBack ? new Date() : null;

        // Save updated action preview if edited during review
        const finalPreview = editedPreview !== undefined ? editedPreview : (approval.actionPreview || approval.outputPreview);

        // 1. Update ApprovalEvidence
        await db.execute(
            `UPDATE "ApprovalEvidence" 
             SET status = $1, 
                 "approvedBy" = $2, 
                 "decidedAt" = CURRENT_TIMESTAMP, 
                 "decisionRationale" = $3, 
                 "writebackAllowed" = $4, 
                 "writtenBack" = $5, 
                 "writebackTimestamp" = $6, 
                 "exceptionBypassReason" = $7,
                 "actionPreview" = $8
             WHERE id = $9`,
            [decision, approverEmail, rationale || '', writebackAllowed, writtenBack, writebackTimestamp, exceptionBypassReason, finalPreview, approvalId]
        );

        // 2. Insert Audit Event
        await db.execute(
            `INSERT INTO "Event" (id, "userId", "eventType", source, metadata) 
             VALUES (gen_random_uuid(), $1, 'APPROVAL_DECIDED', 'admin_console', $2)`,
            [
                userId, 
                JSON.stringify({ 
                    approvalId, 
                    decision, 
                    approvedBy: approverEmail, 
                    policyName: approval.policyName, 
                    writtenBack,
                    exceptionBypassReason,
                    finalPreview
                })
            ]
        );

        // 3. Update execution log status if applicable
        if (approval.workflowLogId) {
            let logStatus = 'active';
            if (decision === 'APPROVED') logStatus = 'success';
            if (decision === 'REJECTED') logStatus = 'error';

            await db.execute(
                `UPDATE "WorkflowLog" 
                 SET status = $1, 
                     result = result || $2::jsonb
                 WHERE id = $3`,
                [logStatus, JSON.stringify({ approvalDecision: decision, approvedBy: approverEmail, decidedAt: new Date(), finalPreview }), approval.workflowLogId]
            );
        }

        // 4. Trigger the actual automation workflow webhook if approved
        if (decision === 'APPROVED') {
            const workflowId = approval.workflowId;
            if (workflowId) {
                const [wf] = await db.query('SELECT "n8nWebhookUrl" FROM "Workflow" WHERE id = $1 LIMIT 1', [workflowId]) as any[];
                if (wf && wf.n8nWebhookUrl) {
                    console.log(`[Approvals API] Dispatched approved request payload to: ${wf.n8nWebhookUrl}`);
                    try {
                        await fetch(wf.n8nWebhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                approvalId: approval.id,
                                status: 'APPROVED',
                                decidedBy: approverEmail,
                                payload: finalPreview
                            })
                        });
                    } catch (triggerError) {
                        console.error('[Approvals API] Failed to trigger workflow webhook:', triggerError);
                    }
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            status: decision, 
            writtenBack, 
            exceptionBypassReason 
        });
    } catch (e: any) {
        console.error('Error deciding approval:', e);
        return NextResponse.json({ error: 'Failed to record decision', details: e.message }, { status: 500 });
    }
}
