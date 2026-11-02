import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ActivationLayoutClient from "./ActivationLayoutClient";

// State machine mappings for server-side guards
const STATUS_PATHS: Record<string, string[]> = {
    NOT_STARTED: ["/setup"],
    SUMMARY_READY: ["/activation", "/activation/recommendations"],
    WORKFLOW_SELECTED: ["/activation/connect", "/activation/recommendations"],
    CONNECTIONS_IN_PROGRESS: ["/activation/connect"],
    READY_FOR_DEPLOY: ["/activation/review"],
    DEPLOYING: ["/activation/deploy"],
    ACTIVATED: ["/dashboard"],
    CUSTOM_REQUEST_SUBMITTED: ["/dashboard"]
};

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

export default async function ActivationLayoutServer({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const userId = (session.user as any).id;
    
    // Server-side check of activation status
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
        console.error("[ActivationLayoutServer] DB query error:", e);
    }

    // Determine current request path on server
    // Since headers can expose URL paths in Next.js Server Components, we can check routing.
    // However, Next.js page layouts automatically wrap subpages. To check exact URL matches
    // and prevent direct unauthorized subpage navigation, we can use the server-side checks.
    // Wait, let's verify if redirecting to DEFAULT_REDIRECTS[activationStatus] if they are
    // already ACTIVATED or CUSTOM_REQUEST_SUBMITTED works:
    if (activationStatus === "ACTIVATED" || activationStatus === "CUSTOM_REQUEST_SUBMITTED") {
        redirect("/dashboard");
    }

    // Note: Layout guards on server handle global status redirection correctly.
    // If user's status is NOT_STARTED, they are sent to setup.
    if (activationStatus === "NOT_STARTED") {
        redirect("/setup");
    }

    return <ActivationLayoutClient>{children}</ActivationLayoutClient>;
}
