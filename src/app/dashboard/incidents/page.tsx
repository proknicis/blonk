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
    
    // Fetch direct workflows for this team to catch anything not in WorkflowOrder
    const workflows = await db.query(
        `SELECT w.*, cn.name as "serverName", cn.status as "serverStatus"
         FROM "Workflow" w
         LEFT JOIN "ClusterNode" cn ON cn.id = w."serverId"
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
        };
    });

    // Add workflows that aren't linked to an active order card
    const existingOrderWorkflowIds = new Set(orderCards.map(oc => oc.workflowId));
    
    workflows.forEach((w) => {
        if (!existingOrderWorkflowIds.has(w.id)) {
            orderCards.push({
                id: w.id, // Use workflow ID as card ID
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
            time: new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            stats: "",
        }));
    } catch {
        feed = [];
    }

    return <OfficeClient orders={orderCards} initialFeed={feed} userRole={(session.user as any).role || "MEMBER"} />;
}
