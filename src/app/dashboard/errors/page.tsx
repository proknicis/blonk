import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ErrorsClient from "./ErrorsClient";

export const metadata = {
    title: "Incidents & Errors | Blonk",
};

export const dynamic = "force-dynamic";

export default async function ErrorsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let dbErrors: any[] = [];
    try {
        dbErrors = await db.query(
            `SELECT id, "workflowName", status, "createdAt", result
             FROM "WorkflowLog"
             WHERE "teamId" = $1 AND status IN ('error', 'failed')
             ORDER BY "createdAt" DESC
             LIMIT 50`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query incidents and errors:", e);
    }

    return <ErrorsClient initialErrors={dbErrors} />;
}
