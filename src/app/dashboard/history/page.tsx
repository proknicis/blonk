import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import HistoryClient from "./HistoryClient";

export const metadata = {
    title: "Execution History | Blonk",
};

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
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
             LIMIT 150`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query execution history logs:", e);
    }

    return <HistoryClient initialLogs={dbLogs} />;
}
