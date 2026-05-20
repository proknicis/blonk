import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OfficeClient from "./OfficeClient";
import { getTeamOrders } from "@/lib/order-pipeline";
import { getOrderChecklist, formatOrderNumber, needsCredentialsAction, isOrderComplete } from "@/lib/order-lifecycle";
import { db } from "@/lib/db";

export default async function OfficePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    const orders = await getTeamOrders(teamId);
    
    // Fetch direct workflows for this team with template metadata and run stats
    const workflows = await db.query(
        `SELECT 
            w.*, 
            cn.name as "serverName", 
            cn.status as "serverStatus",
            wt.description as "templateDescription",
            wt.icon as "templateIcon",
            wt.color as "templateColor",
            wt.requirements as "templateRequirements",
            (SELECT count(*) FROM "WorkflowLog" wl WHERE wl."workflowId" = w.id AND wl."createdAt" > CURRENT_DATE) as "runsToday",
            (SELECT count(*) FROM "WorkflowLog" wl WHERE wl."workflowId" = w.id AND wl.status = 'Success') as "totalSuccess",
            (SELECT count(*) FROM "WorkflowLog" wl WHERE wl."workflowId" = w.id) as "totalRuns"
         FROM "Workflow" w
         LEFT JOIN "ClusterNode" cn ON cn.id = w."serverId"
         LEFT JOIN "WorkflowTemplate" wt ON wt.id = w."templateId"
         WHERE w."teamId" = $1
         ORDER BY w."createdAt" DESC`,
        [teamId]
    ) as any[];

    // Map existing orders
    const orderCards = (orders || []).map((o: any) => {
        const logs = typeof o.logs === "string" ? JSON.parse(o.logs || "[]") : o.logs || [];
        return {
            id: o.id,
            orderNumber: formatOrderNumber(o.orderNumber || 0),
            workflowName: o.workflowName,
            status: o.status,
            checklist: getOrderChecklist(o.status),
            needsCredentials: needsCredentialsAction(o.status),
            isComplete: isOrderComplete(o.status),
            serverName: o.serverName,
            serverStatus: o.serverStatus,
            logs: logs.slice(-8),
            n8nWorkflowId: o.n8nWorkflowId,
            workflowId: o.workflowId,
            templateId: o.templateId,
            createdAt: o.createdAt,
            // Real stats if available (orders usually don't have them yet)
            runsToday: 0,
            successRate: "0%",
            lastRun: "Never",
            description: "Provisioning your automated infrastructure...",
            apps: []
        };
    });

    // Add workflows that aren't linked to an active order card
    const existingOrderWorkflowIds = new Set(orderCards.map(oc => oc.workflowId));
    
    workflows.forEach((w) => {
        if (!existingOrderWorkflowIds.has(w.id)) {
            const successRate = w.totalRuns > 0 
                ? Math.round((w.totalSuccess / w.totalRuns) * 100) + "%" 
                : "0%";

            orderCards.push({
                id: w.id, 
                orderNumber: "INSTALLED",
                workflowName: w.name,
                status: w.status,
                checklist: getOrderChecklist(w.status === 'Active' || w.status === 'Ready' ? 'COMPLETED' : w.status),
                needsCredentials: w.status === 'Awaiting_Credentials',
                isComplete: w.status === 'Active' || w.status === 'Ready' || w.status === 'Running',
                serverName: w.serverName,
                serverStatus: w.serverStatus,
                logs: [],
                n8nWorkflowId: w.n8nWorkflowId,
                workflowId: w.id,
                templateId: w.templateId,
                createdAt: w.createdAt,
                // Real data
                runsToday: parseInt(w.runsToday || 0),
                successRate: successRate,
                lastRun: w.lastRun ? formatTimeAgo(w.lastRun) : "Never",
                description: w.templateDescription || "Institutional automation workflow.",
                icon: w.templateIcon,
                color: w.templateColor,
                apps: parseRequirementsToApps(w.templateRequirements)
            });
        }
    });

    // Sort again by creation date
    orderCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let feed: any[] = [];
    try {
        const notifRows = await db.query(
            'SELECT * FROM "Notification" WHERE "teamId" = $1 ORDER BY "createdAt" DESC LIMIT 10',
            [teamId]
        );
        feed = (notifRows || []).map((n: any) => ({
            id: n.id,
            msg: n.title,
            detail: n.message,
            type: "success",
            time: formatTimeAgo(n.createdAt),
            stats: "",
        }));
    } catch {
        feed = [];
    }

    return <OfficeClient orders={orderCards} initialFeed={feed} userRole={(session.user as any).role || "MEMBER"} />;
}

function formatTimeAgo(date: any) {
    if (!date) return "Never";
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function parseRequirementsToApps(requirements: any) {
    try {
        const reqs = typeof requirements === 'string' ? JSON.parse(requirements) : requirements;
        if (!Array.isArray(reqs)) return [];
        
        return reqs.slice(0, 3).map((r: any) => {
            const name = r.name || r.service || "App";
            // Map common names to icons
            let icon = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg';
            if (name.toLowerCase().includes('slack')) icon = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg';
            if (name.toLowerCase().includes('discord')) icon = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/discordjs/discordjs-original.svg';
            if (name.toLowerCase().includes('openai') || name.toLowerCase().includes('gpt')) icon = 'https://static.cdnlogo.com/logos/o/38/openai.svg';
            if (name.toLowerCase().includes('google')) icon = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg';
            
            return { name, icon };
        });
    } catch {
        return [];
    }
}
