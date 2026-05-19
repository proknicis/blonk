import React from "react";
import ConnectionsClient from "./ConnectionsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export const metadata = {
    title: "Connections | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

const COLORS = ["#10B981", "#8B5CF6", "#EF4444", "#F59E0B", "#F97316", "#0F172A", "#3B82F6"];

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

function getRequirementName(req: Record<string, unknown>) {
    return String(req.service || req.app || req.name || req.label || req.type || "Custom Integration");
}

export default async function ConnectionsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let connections: any[] = [];

    try {
        const workflowRows = await db.query(`
            SELECT w.name, wt.requirements
            FROM "Workflow" w
            LEFT JOIN "WorkflowTemplate" wt ON wt.id = w."templateId"
            WHERE w."teamId" = $1
            ORDER BY w."createdAt" DESC
        `, [teamId]) as any[];

        const settings = await db.query(`
            SELECT key, value
            FROM "OperationalSetting"
            WHERE "teamId" = $1 AND key LIKE 'apikey_%'
        `, [teamId]) as any[];

        const savedKeys = settings.map(row => {
            try {
                return JSON.parse(row.value);
            } catch {
                return null;
            }
        }).filter(Boolean);

        const byApp = new Map<string, { app: string; category: string; workflows: Set<string>; connected: boolean }>();

        workflowRows.forEach(row => {
            normalizeRequirements(row.requirements).forEach(req => {
                const app = getRequirementName(req);
                const category = String(req.category || req.type || "Integration");
                const existing = byApp.get(app) || { app, category, workflows: new Set<string>(), connected: false };
                existing.workflows.add(row.name || "Unnamed Workflow");
                byApp.set(app, existing);
            });
        });

        savedKeys.forEach(key => {
            const app = String(key.service || key.label || "Custom Integration");
            const existing = byApp.get(app) || { app, category: "API Key", workflows: new Set<string>(), connected: true };
            existing.connected = true;
            byApp.set(app, existing);
        });

        connections = Array.from(byApp.values()).map((conn, index) => ({
            id: conn.app.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            app: conn.app,
            category: conn.category,
            status: conn.connected ? "CONNECTED" : "NOT CONNECTED",
            statusKey: conn.connected ? "connected" : "not_connected",
            workflows: conn.workflows.size ? Array.from(conn.workflows).slice(0, 3) : ["No active workflows"],
            lastChecked: conn.connected ? "Stored in vault" : "Not configured",
            health: conn.connected ? "Healthy" : "Not connected",
            action: conn.connected ? "Manage" : "Connect",
            color: COLORS[index % COLORS.length],
        }));
    } catch (error) {
        console.error("Connections DB error:", error);
    }

    const needsAttention = connections
        .filter(conn => conn.statusKey !== "connected")
        .map(conn => ({ id: conn.id, app: conn.app, issue: conn.health, time: conn.lastChecked, color: conn.color }));

    return (
        <ConnectionsClient 
            initialConnections={connections} 
            needsAttention={needsAttention}
        />
    );
}
