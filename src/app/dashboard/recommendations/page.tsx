import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import RecommendationsClient from "./RecommendationsClient";

export const metadata = {
    title: "Recommendations | Blonk",
};

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let dbTemplates: any[] = [];
    try {
        dbTemplates = await db.query(
            `SELECT id, name, description, sector AS category, requirements, status
             FROM "WorkflowTemplate"
             ORDER BY name ASC`
        ) as any[];
    } catch (e) {
        console.error("Failed to query workflow templates:", e);
    }

    return <RecommendationsClient initialTemplates={dbTemplates} />;
}
