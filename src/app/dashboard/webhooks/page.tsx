import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import WebhooksClient from "./WebhooksClient";

export const metadata = {
    title: "Webhooks & APIs | Blonk",
};

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let dbWorkflows: any[] = [];
    try {
        dbWorkflows = await db.query(
            `SELECT id, name, status, "n8nWebhookUrl"
             FROM "Workflow"
             WHERE "teamId" = $1 AND "n8nWebhookUrl" IS NOT NULL
             ORDER BY name ASC`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query workflow webhooks:", e);
    }

    return <WebhooksClient initialWorkflows={dbWorkflows} />;
}
