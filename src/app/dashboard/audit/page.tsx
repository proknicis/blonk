import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuditClient from "./AuditClient";

export const metadata = {
    title: "Audit Trail | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

export default async function AuditPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let auditLogs: any[] = [];
    try {
        const rows = await db.query(`
            SELECT id, "workflowName", "workflowId", status, "createdAt" 
            FROM "WorkflowLog" 
            WHERE "teamId" = $1 
            ORDER BY "createdAt" DESC 
            LIMIT 50
        `, [teamId]) as any[];
        
        auditLogs = rows.map((row: any) => {
            const d = new Date(row.createdAt);
            const formattedTime = d.toISOString().replace('T', ' ').substring(0, 19);
            
            // Map workflow logs to the required audit log format
            return {
                id: `EVT-${row.id.substring(0, 6).toUpperCase()}`,
                timestamp: formattedTime,
                category: "Provisioning",
                actor: "System",
                action: row.workflowName || "Execute Workflow",
                target: row.workflowId ? row.workflowId.substring(0, 8) : "node-cluster",
                status: row.status === 'success' ? "Success" : "Failed",
                ipAddress: "Internal"
            };
        });

    } catch (e) {
        console.error("Failed to fetch audit logs:", e);
    }

    return (
        <AuditClient initialLogs={auditLogs} />
    );
}
