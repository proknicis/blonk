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
        timestamp: string;
        category: string;
        actor: string;
        action: string;
        target: string;
        status: string;
        ipAddress: string;
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
                "createdAt",
                COALESCE(result->'activity'->>'actor', result->>'actor') AS "actor",
                COALESCE(result->'activity'->>'ipAddress', result->>'ipAddress') AS "ipAddress"
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
            const userName = r.actor || currentUserName || currentUserEmail || "System";
            const category = r.status === 'error' || r.status === 'failed' ? "Security" : "Provisioning";

            return {
                id: shortId,
                timestamp: tsStr,
                category,
                actor: userName,
                action: actionText,
                target: r.workflowName || "System Process",
                status: (r.status === 'error' || r.status === 'failed') ? "Failed" : "Success",
                ipAddress: r.ipAddress || "Internal",
            };
        });

    } catch (e) {
        console.error("Audit DB error:", e);
    }

    return (
        <AuditClient
            auditLogs={logs}
            stats={{
                securityEvents: failures,
                provisioning: successCount,
                configurations: totalLogs,
                failedAuth: failures,
            }}
        />
    );
}
