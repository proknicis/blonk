import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import BillingClient from "./BillingClient";

export const metadata = { title: "Billing — BLONK" };
export const dynamic = "force-dynamic";

async function safeCount(queryStr: string, params: any[]): Promise<number> {
    try {
        const rows = await db.query(queryStr, params) as any[];
        return parseInt(rows[0]?.cnt || rows[0]?.count || "0", 10);
    } catch (e) {
        console.warn(`[safeCount] Query failed: ${queryStr}`, e);
        return 0;
    }
}

export default async function BillingPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;

    let teamName = "Your Team";
    let plan = "professional";
    let memberSince = new Date().toISOString();
    let totalWorkflows = 0;
    let activeWorkflows = 0;
    let runCount = 0;
    let seatsCount = 1;
    let invoices: any[] = [];

    if (teamId) {
        try {
            const userId = (session.user as any).id;

            const [teamRows, userRows, transactionRows] = await Promise.all([
                db.query(
                    `SELECT name, "createdAt" FROM "Team" WHERE id = $1 LIMIT 1`,
                    [teamId]
                ).catch(e => {
                    console.error("Team query failed", e);
                    return [];
                }),
                db.query(
                    `SELECT plan FROM "User" WHERE id = $1 LIMIT 1`,
                    [userId]
                ).catch(e => {
                    console.error("User plan query failed", e);
                    return [];
                }),
                db.query(
                    `SELECT "trxId" as id, date, category as period, amount, status 
                     FROM "Transaction" 
                     WHERE "teamId" = $1 
                     ORDER BY "createdAt" DESC`,
                    [teamId]
                ).catch(e => {
                    console.error("Transaction query failed", e);
                    return [];
                })
            ]) as any[][];

            if (teamRows && teamRows[0]) {
                teamName   = teamRows[0].name ?? teamName;
                memberSince = teamRows[0].createdAt?.toISOString() ?? memberSince;
            }

            if (userRows && userRows[0]) {
                const dbPlan = String(userRows[0].plan || "").toLowerCase();
                if (dbPlan.includes("growth")) {
                    plan = "growth";
                } else if (dbPlan.includes("enterprise")) {
                    plan = "enterprise";
                } else {
                    plan = "professional";
                }
            }

            invoices = transactionRows || [];
            
            // Query each metric safely so a single table or column issue doesn't fail the whole promise
            totalWorkflows = await safeCount(`SELECT COUNT(*)::int AS cnt FROM "Workflow" WHERE "teamId" = $1`, [teamId]);
            activeWorkflows = await safeCount(`SELECT COUNT(*)::int AS cnt FROM "Workflow" WHERE "teamId" = $1 AND (status = 'active' OR status = 'Active')`, [teamId]);
            
            // Safe runCount query: try direct teamId count, fallback to joining via Workflow
            runCount = await safeCount(`SELECT COUNT(*)::int AS cnt FROM "WorkflowLog" WHERE "teamId" = $1`, [teamId]);
            if (runCount === 0) {
                runCount = await safeCount(`
                    SELECT COUNT(*)::int AS cnt 
                    FROM "WorkflowLog" l
                    JOIN "Workflow" w ON l."workflowId" = w.id
                    WHERE w."teamId" = $1
                `, [teamId]);
            }
            
            seatsCount = await safeCount(`SELECT COUNT(*)::int AS cnt FROM "User" WHERE "teamId" = $1`, [teamId]);
        } catch (e) {
            console.error("[BillingPage] Error loading metrics:", e);
        }
    }

    const planLimits: Record<string, { workflows: number; activeWorkflows: number; executions: number; seats: number }> = {
        professional: { workflows: 10, activeWorkflows: 5, executions: 10000, seats: 5 },
        growth:       { workflows: 30, activeWorkflows: 15, executions: 50000, seats: 15 },
        enterprise:   { workflows: 100, activeWorkflows: 50, executions: 500000, seats: 100 },
    };

    const limits = planLimits[plan] || planLimits.professional;

    return (
        <BillingClient
            plan={plan}
            teamName={teamName}
            memberSince={memberSince}
            usage={{
                workflows:       { used: totalWorkflows,  limit: limits.workflows },
                activeWorkflows: { used: activeWorkflows, limit: limits.activeWorkflows },
                executions:      { used: runCount,        limit: limits.executions },
                seats:           { used: seatsCount,      limit: limits.seats },
            }}
            invoices={invoices}
        />
    );
}
