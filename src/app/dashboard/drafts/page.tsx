import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import DraftsClient from "./DraftsClient";

export const metadata = {
    title: "Drafts & Approvals | Blonk",
};

export const dynamic = "force-dynamic";

function normalizeRequirements(value: unknown): Array<Record<string, unknown>> {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(item => item && typeof item === "object") as Array<Record<string, unknown>>;
    if (typeof value === "string") {
        try {
            return normalizeRequirements(JSON.parse(value));
        } catch {
            return [];
        }
    }
    return [];
}

export default async function DraftsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    const userId = (session.user as any).id;
    if (!teamId || !userId) redirect("/setup");

    let dbDrafts: any[] = [];
    try {
        // 1. Fetch connected credential providers for the user
        const credentialRows = await db.query(
            `SELECT provider FROM "credentials" WHERE "user_id" = $1 AND status = 'Connected'`,
            [userId]
        ) as any[];
        const connectedProviders = new Set(credentialRows.map(r => String(r.provider || "").toLowerCase().trim()));

        // 2. Fetch workflows in inactive or waiting status, along with template requirements
        const workflowRows = await db.query(
            `SELECT w.id, w.name, w.status, w."createdAt", wt.requirements
             FROM "Workflow" w
             LEFT JOIN "WorkflowTemplate" wt ON wt.id = w."templateId"
             WHERE w."teamId" = $1 AND w.status IN ('Awaiting_Credentials', 'Inactive', 'Draft', 'draft')
             ORDER BY w."createdAt" DESC`,
            [teamId]
        ) as any[];

        dbDrafts = workflowRows.map(w => {
            const requirements = normalizeRequirements(w.requirements);
            const missingList: string[] = [];

            requirements.forEach(req => {
                const service = String(req.service || req.app || req.name || req.type || "").toLowerCase().trim();
                if (service) {
                    // Check if service is connected
                    const isGoogle = service.includes("google") || service.includes("gmail") || service.includes("sheets");
                    const hasMatch = isGoogle
                        ? (connectedProviders.has("gmail") || connectedProviders.has("google-sheets") || connectedProviders.has("google"))
                        : connectedProviders.has(service);

                    if (!hasMatch) {
                        // Human friendly display name for provider
                        const disp = service.charAt(0).toUpperCase() + service.slice(1);
                        if (!missingList.includes(disp)) {
                            missingList.push(disp);
                        }
                    }
                }
            });

            // Map status logic
            let userStatus = "Not Started";
            if (w.status === "Awaiting_Credentials" || missingList.length > 0) {
                userStatus = "Needs a Connection";
            } else if (w.status === "Inactive" || w.status === "Draft" || w.status === "draft") {
                userStatus = "Ready to Launch";
            }

            return {
                id: w.id,
                name: w.name,
                status: w.status,
                userStatus,
                missing: missingList,
                time: new Date(w.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit"
                })
            };
        });
    } catch (e) {
        console.error("Failed to query workflow drafts:", e);
    }

    return <DraftsClient initialDrafts={dbDrafts} />;
}
