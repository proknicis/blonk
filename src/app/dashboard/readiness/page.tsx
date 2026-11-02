import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ReadinessClient from "./ReadinessClient";

export const metadata = {
    title: "Readiness Checklist | Blonk",
};

export const dynamic = "force-dynamic";

export default async function ReadinessPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let credentialStatuses: any[] = [];
    let pendingApprovalsCount = 0;
    try {
        credentialStatuses = await db.query(
            `SELECT provider, status FROM "Credential" WHERE "teamId" = $1`,
            [teamId]
        ) as any[];

        // Count pending orders that are under review or awaiting checkouts
        const approvals = await db.query(
            `SELECT COUNT(*) as count FROM "WorkflowOrder" 
             WHERE "teamId" = $1 AND status IN ('PENDING', 'AWAITING_CREDENTIALS', 'UNDER REVIEW')`,
            [teamId]
        ) as any[];
        pendingApprovalsCount = parseInt(approvals[0]?.count || "0");
    } catch (e) {
        console.error("Failed to query readiness data:", e);
    }

    return (
        <ReadinessClient 
            credentialStatuses={credentialStatuses} 
            pendingApprovalsCount={pendingApprovalsCount} 
        />
    );
}
