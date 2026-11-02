import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DashboardLayoutClient from "./DashboardLayoutClient";

export default async function DashboardLayoutServer({ children }: { children: React.ReactNode }) {
    const session = await getServerSession(authOptions);
    let userId = (session?.user as any)?.id;

    if (!session?.user) {
        if (process.env.NODE_ENV === "development") {
            try {
                const [devUser] = await db.query('SELECT id, "activationStatus" FROM "User" ORDER BY id ASC LIMIT 1') as any[];
                if (devUser) {
                    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
                }
            } catch (err) {
                console.error("[Dev Session Fallback Error]", err);
            }
        }
        redirect("/login");
    }
    
    // Server-side check of activation status before rendering any client layouts
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
        console.error("[DashboardLayoutServer] DB query error:", e);
    }

    if (activationStatus !== "ACTIVATED" && activationStatus !== "CUSTOM_REQUEST_SUBMITTED") {
        redirect("/activation");
    }

    return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
