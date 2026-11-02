import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ActivityClient from "./ActivityClient";

export const metadata = {
    title: "Workspace Activity | Blonk",
};

export const dynamic = "force-dynamic";

export default async function ActivityPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let dbLogs: any[] = [];
    try {
        dbLogs = await db.query(
            `SELECT 
                id, 
                "workflowName", 
                status, 
                "createdAt",
                result
             FROM "WorkflowLog"
             WHERE "teamId" = $1
             ORDER BY "createdAt" DESC
             LIMIT 100`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query workflow logs for activity:", e);
    }

    return <ActivityClient initialLogs={dbLogs} />;
}
