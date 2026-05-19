import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OfficeClient from "./OfficeClient";

async function getAgents(teamId: string) {
    try {
        const workflowRows = await db.query(`
            SELECT
                w.*,
                COUNT(l.id)::int AS "runsToday",
                COUNT(l.id) FILTER (WHERE l.status NOT IN ('error', 'failed'))::int AS "successRunsToday"
            FROM "Workflow" w
            LEFT JOIN "WorkflowLog" l ON l."workflowId" = w.id AND l."createdAt" >= CURRENT_DATE
            WHERE w."teamId" = $1
            GROUP BY w.id
            ORDER BY w."createdAt" DESC
        `, [teamId]);

        const appIcons = [
            { name: 'Google Sheets', color: '#10B981' },
            { name: 'Slack', color: '#8B5CF6' },
            { name: 'Gmail', color: '#EF4444' },
            { name: 'Airtable', color: '#F59E0B' },
            { name: 'HubSpot', color: '#F97316' }
        ];

        const workflowAgents = (workflowRows || []).map((wf: any, index: number) => {
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
                color = '#10B981';
                statusKey = 'running';
            }

            const runsToday = Number(wf.runsToday || 0);
            const successRunsToday = Number(wf.successRunsToday || 0);
            const successRate = runsToday > 0 ? `${Math.round((successRunsToday / runsToday) * 100)}%` : '-';
            const apps = [appIcons[index % 5], appIcons[(index + 1) % 5]];

            return {
                id: wf.id,
                name: wf.name,
                role: `${wf.sector || 'General'} Workflow`,
                status: displayStatus,
                statusKey: statusKey,
                initials: initials.toUpperCase(),
                color: color,
                lastRun: wf.lastRun || null,
                tasksCount: wf.tasksCount || 0,
                runsToday,
                successRate,
                apps
            };
        });

        const notifRows = await db.query('SELECT * FROM "Notification" WHERE "teamId" = $1 ORDER BY "createdAt" DESC LIMIT 10', [teamId]);
        
        const feed = (notifRows || []).map((n: any, idx: number) => {
            let type = 'success';
            if (n.title?.toLowerCase().includes('fail') || n.message?.toLowerCase().includes('fail')) type = 'failed';
            else if (idx === 1 || idx === 3) type = 'warning';

            return {
                id: n.id,
                msg: n.title,
                detail: n.message,
                type,
                time: new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                stats: type === 'success' ? '42 runs • 98% success rate' : (type === 'failed' ? 'Step "Data Quality Check" failed' : 'Connection expired')
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
