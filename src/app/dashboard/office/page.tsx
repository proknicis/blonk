import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import OfficeClient from "./OfficeClient";

async function getAgents(teamId: string) {
    try {
        const workflowRows = await db.query('SELECT * FROM "Workflow" WHERE "teamId" = $1 ORDER BY "createdAt" DESC', [teamId]);

        const workflowAgents = (workflowRows || []).map((wf: any) => {
            const names = (wf.name || 'Automation').split(' ');
            const initials = names.length > 1 ? names[0][0] + names[1][0] : names[0][0] + (names[0][1] || 'A');
            
            let displayStatus = wf.status || 'Idle';
            let color = '#94A3B8';
            let statusKey = 'idle';

            if (wf.status === 'Failed' || wf.status === 'Error') {
                displayStatus = 'Failed';
                color = '#EF4444';
                statusKey = 'failed';
            } else if (wf.status === 'Active' || wf.status === 'Published' || wf.status === 'Running' || wf.status === 'Success' || wf.status === 'Completed') {
                displayStatus = 'Running';
                color = '#34D186';
                statusKey = 'running';
            }

            return {
                id: wf.id,
                name: wf.name,
                role: `${wf.sector || 'General'} Workflow`,
                status: displayStatus,
                statusKey: statusKey,
                initials: initials.toUpperCase(),
                color: color,
                lastRun: wf.lastRun || null,
                tasksCount: wf.tasksCount || 0
            };
        });

        const notifRows = await db.query('SELECT * FROM "Notification" WHERE "teamId" = $1 ORDER BY "createdAt" DESC LIMIT 10', [teamId]);
        
        const feed = (notifRows || []).map((n: any) => {
            let type = 'info';
            if (n.title?.toLowerCase().includes('success') || n.message?.toLowerCase().includes('success')) type = 'success';
            if (n.title?.toLowerCase().includes('fail') || n.message?.toLowerCase().includes('fail')) type = 'error';

            return {
                id: n.id,
                msg: n.title,
                detail: n.message,
                type,
                time: new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
        });

        return { workflows: workflowAgents, feed };

    } catch (error) {
        console.error("Fetch workflows error:", error);
        return { workflows: [], feed: [] };
    }
}

export default async function OfficePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    const { workflows, feed } = await getAgents(teamId);

    return (
        <OfficeClient 
            initialWorkflows={workflows} 
            initialFeed={feed} 
            userRole={(session.user as any).role || 'VIEWER'} 
        />
    );
}
