import React from "react";
import { db } from "@/lib/db";
import AuditClient from "./AuditClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Audit Vault | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

export default async function AuditVaultPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let logs: Array<{ id: string; ts: string; process: string; user: string; action: string; outcome: string }> = [];
    let totalLogs = 0;
    let failures = 0;

    try {
        // Fetch raw workflow logs pinned to team
        const rows = await db.query(`
            SELECT id, "workflowName", status, result, "createdAt"
            FROM "WorkflowLog"
            WHERE "teamId" = $1
            ORDER BY "createdAt" DESC
            LIMIT 100
        `, [teamId]) as any[];

        // Fetch counts for stats pinned to team
        const counts = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as errs
            FROM "WorkflowLog"
            WHERE "teamId" = $1
        `, [teamId]) as any[];

        if (counts.length > 0) {
            totalLogs = parseInt(counts[0].total || '0');
            failures = parseInt(counts[0].errs || '0');
        }

        // Map to structured display format
        logs = rows.map((r: any) => {
            const shortId = "EVT-" + r.id.substring(0, 5).toUpperCase();
            
            // Format timestamp (YYYY-MM-DD HH:MM)
            const d = new Date(r.createdAt || new Date());
            const pad = (n: number) => n.toString().padStart(2, '0');
            const tsStr = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

            // Determine safe action message from jsonb result
            let actionText = "Executed automated procedure";
            if (r.result && typeof r.result === 'object') {
                if (r.result.action) {
                    actionText = r.result.action;
                } else if (r.result.message) {
                    actionText = r.result.message;
                } else {
                    actionText = JSON.stringify(r.result).substring(0, 100);
                }
            } else if (r.status === 'success') {
                actionText = `Completed ${r.workflowName || 'system'} loop successfully.`;
            } else {
                actionText = `Failed executing ${r.workflowName || 'system'} loop.`;
            }

            return {
                id: shortId,
                ts: tsStr,
                process: r.workflowName || "System Process",
                user: "System Context", // In an advanced setup, could JOIN User
                action: actionText,
                outcome: (r.status === 'error' || r.status === 'failed') ? "Failed" : "Success",
            };
        });
    } catch(e) {
        console.error("Error fetching audit logs from DB:", e);
    }

    return <AuditClient initialLogs={logs} total={totalLogs} failures={failures} />;
}
