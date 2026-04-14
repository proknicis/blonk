import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '24h';
    const emailRef = session.user.email.toLowerCase();

    try {
        let interval = '24 hours';
        let trunc = 'hour';
        let arraySize = 24;

        if (range === '7d') {
            interval = '7 days';
            trunc = 'day';
            arraySize = 7;
        } else if (range === '30d') {
            interval = '30 days';
            trunc = 'day';
            arraySize = 30;
        }

        const velocityRows = await db.query(`
            SELECT 
                "workflowId", 
                "workflowName",
                DATE_TRUNC($1, "executedAt") as time_block, 
                COUNT(*) as ops
            FROM "WorkflowLog" 
            WHERE "executedAt" > CURRENT_TIMESTAMP - $2::interval
            AND "workflowId" IN (SELECT id FROM "Workflow" WHERE LOWER("requestedBy") = LOWER($3))
            GROUP BY "workflowId", "workflowName", time_block
            ORDER BY time_block ASC
        `, [trunc, interval, emailRef]) as any[];

        const fleetPaths: Record<string, { name: string, data: number[] }> = {};
        
        velocityRows.forEach(row => {
            const id = row.workflowId || 'unknown';
            if (!fleetPaths[id]) {
                fleetPaths[id] = { 
                    name: row.workflowName || 'ID: ' + id.substring(0, 4), 
                    data: new Array(arraySize).fill(0) 
                };
            }

            // Calculate index based on range
            const blockDate = new Date(row.time_block);
            let idx = 0;
            
            if (range === '24h') {
                idx = blockDate.getHours();
            } else if (range === '7d' || range === '30d') {
                const diffTime = Math.abs(new Date().getTime() - blockDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                idx = arraySize - diffDays;
            }

            if (idx >= 0 && idx < arraySize) {
                fleetPaths[id].data[idx] = parseInt(row.ops);
            }
        });

        return NextResponse.json(Object.values(fleetPaths));
    } catch (error) {
        console.error("Velocity API Failure", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
