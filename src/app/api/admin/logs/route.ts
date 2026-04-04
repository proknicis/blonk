import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch logs only for workflows belonging to this user (Case-Insensitive)
        const emailRef = session.user.email.toLowerCase();
        
        const rows = await db.query(
            `SELECT l.*, l."createdAt" as "executedAt" 
             FROM "WorkflowLog" l 
             LEFT JOIN "Workflow" w ON l."workflowId" = w.id 
             WHERE LOWER(w."requestedBy") = LOWER($1) 
                OR (l."workflowId" IS NULL AND l."workflowName" IN (SELECT name FROM "Workflow" WHERE LOWER("requestedBy") = LOWER($1)))
             ORDER BY l."createdAt" DESC LIMIT 30`,
            [emailRef]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
