import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ActivationStartClient from "./ActivationStartClient";

const DEFAULT_REDIRECTS: Record<string, string> = {
    NOT_STARTED: "/setup",
    SUMMARY_READY: "/activation",
    WORKFLOW_SELECTED: "/activation/connect",
    CONNECTIONS_IN_PROGRESS: "/activation/connect",
    READY_FOR_DEPLOY: "/activation/review",
    DEPLOYING: "/activation/deploy",
    ACTIVATED: "/dashboard",
    CUSTOM_REQUEST_SUBMITTED: "/dashboard"
};

export default async function ActivationStartPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    let activationStatus = "NOT_STARTED";
    try {
        const [user] = await db.query(
            'SELECT "activationStatus" FROM "User" WHERE id = $1 LIMIT 1',
            [userId]
        ) as any[];
        
        if (user) {
            activationStatus = user.activationStatus || "NOT_STARTED";
        }
    } catch (e) {
        console.error("[ActivationStartPage] DB error:", e);
    }

    // Allowed status for root /activation: SUMMARY_READY or WORKFLOW_SELECTED
    if (activationStatus !== "SUMMARY_READY" && activationStatus !== "WORKFLOW_SELECTED") {
        redirect(DEFAULT_REDIRECTS[activationStatus] || "/activation");
    }

    return <ActivationStartClient />;
}
