import React from "react";
import { db } from "@/lib/db";
import AuditClient from "./AuditClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Audit Logs | Blonk",
};

export const dynamic = 'force-dynamic';

export default async function AuditVaultPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    const currentUserEmail = session.user.email || "";
    const currentUserName  = session.user.name  || "Unknown";

    interface AuditRow {
        id: string;
        ts: string;
        process: string;
        user: string;
        userInitials: string;
        action: string;
        outcome: string;
        duration: string;
        rawId: string;
    }

    let logs: AuditRow[] = [];
    let totalLogs = 0;
    let failures   = 0;
    let todayCount = 0;
    let successCount = 0;

    try {
        // Pull logs for THIS team only — scoped to teamId
        const rows = await db.query(`
            SELECT
                id,
                "workflowName",
                status,
                result,
                "createdAt"
            FROM "WorkflowLog"
            WHERE "teamId" = $1
            ORDER BY "createdAt" DESC
            LIMIT 200
        `, [teamId]) as any[];

        // Accurate aggregate counts scoped to team
        const counts = await db.query(`
            SELECT
                COUNT(*)                                                          AS total,
                SUM(CASE WHEN status IN ('error','failed') THEN 1 ELSE 0 END)    AS errs,
                SUM(CASE WHEN status = 'success'           THEN 1 ELSE 0 END)    AS successes,
                SUM(CASE WHEN "createdAt" >= CURRENT_DATE  THEN 1 ELSE 0 END)    AS today
            FROM "WorkflowLog"
            WHERE "teamId" = $1
        `, [teamId]) as any[];

        if (counts.length > 0) {
            totalLogs    = parseInt(counts[0].total     || '0');
            failures     = parseInt(counts[0].errs      || '0');
            successCount = parseInt(counts[0].successes || '0');
            todayCount   = parseInt(counts[0].today     || '0');
        }

        const pad = (n: number) => n.toString().padStart(2, '0');

        logs = rows.map((r: any) => {
            const d      = new Date(r.createdAt || new Date());
            const tsStr  = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
            const shortId = "EVT-" + String(r.id).substring(0, 8).toUpperCase();

            // Parse result JSON safely
            let resObj: any = {};
            try {
                resObj = typeof r.result === 'string' ? JSON.parse(r.result) : (r.result || {});
            } catch { resObj = {}; }

            // Build action text from real result data
            let actionText = `Executed ${r.workflowName || 'system'} workflow`;
            if (resObj.activity?.action)  actionText = resObj.activity.action;
            else if (resObj.message)      actionText = resObj.message;
            else if (r.status === 'success') actionText = `Workflow "${r.workflowName || 'system'}" completed successfully`;
            else if (r.status in { error: 1, failed: 1 }) actionText = `Workflow "${r.workflowName || 'system'}" failed during execution`;

            // Resolve display name — prefer DB user, fallback to session
            const userName     = r.userName  || currentUserName;
            const userInitials = userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

            // Duration from result metadata
            const durationMs = resObj.durationMs || resObj.duration || null;
            const duration   = durationMs ? `${(durationMs / 1000).toFixed(1)}s` : '—';

            return {
                id:           shortId,
                rawId:        String(r.id),
                ts:           tsStr,
                process:      r.workflowName || "System Process",
                user:         userName,
                userInitials: userInitials,
                action:       actionText,
                outcome:      (r.status === 'error' || r.status === 'failed') ? "Failed" : "Success",
                duration,
            };
        });

    } catch (e) {
        console.error("Audit DB error:", e);
    }

    return (
        <AuditClient
            initialLogs={logs}
            total={totalLogs}
            failures={failures}
            successes={successCount}
            today={todayCount}
            currentUser={currentUserName}
        />
    );
}
