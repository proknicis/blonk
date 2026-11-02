import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import LogsClient from "./LogsClient";

export const metadata = {
    title: "Logs & Diagnostics | Blonk",
};

export const dynamic = "force-dynamic";

export default async function LogsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let dbLogs: any[] = [];
    try {
        dbLogs = await db.query(
            `SELECT id, "workflowName", status, "createdAt", result
             FROM "WorkflowLog"
             WHERE "teamId" = $1
             ORDER BY "createdAt" DESC
             LIMIT 100`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query developer diagnostics logs:", e);
    }

    return <LogsClient initialLogs={dbLogs} />;
}
