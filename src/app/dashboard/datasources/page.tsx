import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DatasourcesClient from "./DatasourcesClient";

export const metadata = {
    title: "Data Sources | Blonk",
};

export const dynamic = "force-dynamic";

export default async function DatasourcesPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let dbCredentials: any[] = [];
    try {
        dbCredentials = await db.query(
            `SELECT id, provider, status, "createdAt"
             FROM "Credential"
             WHERE "teamId" = $1`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query data sources credentials:", e);
    }

    return <DatasourcesClient initialCreds={dbCredentials} />;
}
