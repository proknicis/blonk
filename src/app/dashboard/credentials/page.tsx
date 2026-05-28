import React from "react";
import CredentialsClient from "./CredentialsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const metadata = {
    title: "Credentials Vault | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

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

function getRequirementName(req: Record<string, unknown>): string {
    return String(req.service || req.app || req.name || req.label || req.type || "");
}

export default async function CredentialsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const teamId = (session.user as any).teamId;
    if (!teamId) {
        redirect("/setup");
    }

    let requiredServices: string[] = [];
    try {
        const workflowRows = await db.query(`
            SELECT wt.requirements
            FROM "Workflow" w
            LEFT JOIN "WorkflowTemplate" wt ON wt.id = w."templateId"
            WHERE w."teamId" = $1
        `, [teamId]) as any[];

        const servicesSet = new Set<string>();
        workflowRows.forEach(row => {
            normalizeRequirements(row.requirements).forEach(req => {
                const app = getRequirementName(req).toLowerCase().trim();
                if (app) servicesSet.add(app);
            });
        });
        requiredServices = Array.from(servicesSet);
    } catch (error) {
        console.error("[CredentialsPage] Error resolving required services:", error);
    }

    return <CredentialsClient requiredServices={requiredServices} />;
}
