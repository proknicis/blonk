import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import NotificationsClient from "./NotificationsClient";

export const metadata = {
    title: "Notifications | Blonk",
};

export const dynamic = "force-dynamic";

export async function ensureNotificationSchema() {
    try {
        await db.execute('ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "teamId" UUID');
        await db.execute('ALTER TABLE "Notification" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT \'unread\'');
    } catch (e) {
        console.warn("Could not patch Notification schema:", e);
    }
}

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    await ensureNotificationSchema();

    let dbNotifications: any[] = [];
    try {
        dbNotifications = await db.query(
            `SELECT id, title, message, status, "createdAt", "teamId"
             FROM "Notification"
             WHERE "teamId" = $1
             ORDER BY "createdAt" DESC`,
            [teamId]
        ) as any[];
    } catch (e) {
        console.error("Failed to query notifications:", e);
    }

    return <NotificationsClient initialNotifications={dbNotifications} />;
}
