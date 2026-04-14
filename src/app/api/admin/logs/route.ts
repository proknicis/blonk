import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const workflowId = searchParams.get('workflowId');
        const emailRef = session.user.email.toLowerCase();

        let query = `
            SELECT l.*, l."createdAt" as "executedAt" 
            FROM "WorkflowLog" l 
            LEFT JOIN "Workflow" w ON l."workflowId" = w.id 
            WHERE (LOWER(w."requestedBy") = LOWER($1) 
               OR (l."workflowId" IS NULL AND l."workflowName" IN (SELECT name FROM "Workflow" WHERE LOWER("requestedBy") = LOWER($1))))
              AND l."createdAt" >= NOW() - INTERVAL '48 hours'
        `;
        const params: any[] = [emailRef];

        if (workflowId) {
            query += ` AND (l."workflowId" = $2 OR w.id = $2)`;
            params.push(workflowId);
        }

        query += ` ORDER BY l."createdAt" DESC LIMIT 100`;

        const rows = await db.query(query, params);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
