import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ApprovalsClient from "./ApprovalsClient";

export const metadata = {
    title: "Approvals Queue | Blonk",
};

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let dbOrders: any[] = [];
    try {
        dbOrders = await db.query(
            `SELECT id, "workflowName", status, amount, "createdAt", "customDetails"
             FROM "WorkflowOrder"
             WHERE "teamId" = $1 AND status IN ('UNDER REVIEW', 'PAYMENT_RECEIVED')
             ORDER BY "createdAt" DESC`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query approvals orders:", e);
    }

    return <ApprovalsClient initialOrders={dbOrders} />;
}
