import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch deployed automation templates across workspaces
        const deployments = await db.query(`
            SELECT 
                cb.id as "customerBrainId",
                cb."installedVersion",
                cb."installedAt",
                cb.status as "installationStatus",
                bt.name as "automationName",
                bt.version as "latestVersion",
                bt.category as "category",
                t.name as "teamName",
                t.firmName as "companyName",
                bd."deploymentStatus",
                bd."n8nServer",
                bd."executionMode",
                bd."lastUpdated"
            FROM "CustomerBrain" cb
            JOIN "BrainTemplate" bt ON cb."brainTemplateId" = bt.id
            JOIN "Team" t ON cb."teamId" = t.id
            LEFT JOIN "BrainDeployment" bd ON bd."teamId" = cb."teamId" AND bd."brainTemplateId" = cb."brainTemplateId"
            ORDER BY cb."installedAt" DESC
        `);

        return NextResponse.json(deployments);
    } catch (err: any) {
        console.error("GET admin deployments error:", err);
        return NextResponse.json({ error: err.message || "Failed to load deployments" }, { status: 500 });
    }
}
