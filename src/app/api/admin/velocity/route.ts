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

    const teamId = (session.user as any).teamId;
    if (!teamId) return NextResponse.json({ error: "No team context" }, { status: 400 });

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
                "workflowName",
                DATE_TRUNC($1, "createdAt") as time_block, 
                COUNT(*) as ops
            FROM "WorkflowLog" 
            WHERE "createdAt" > CURRENT_TIMESTAMP - $2::interval
            AND "teamId" = $3
            GROUP BY "workflowName", time_block
            ORDER BY time_block ASC
        `, [trunc, interval, teamId]) as any[];

        const fleetPaths: Record<string, { name: string, data: number[] }> = {};
        
        velocityRows.forEach(row => {
            const name = row.workflowName || 'Alpha Sector';
            if (!fleetPaths[name]) {
                fleetPaths[name] = { 
                    name: name, 
                    data: new Array(arraySize).fill(0) 
                };
            }

            const blockDate = new Date(row.time_block);
            let idx = 0;
            
            if (range === '24h') {
                idx = blockDate.getHours();
            } else {
                // Calculation for daily indices in 7d/30d views
                const today = new Date();
                today.setHours(23, 59, 59, 999);
                const diffTime = Math.abs(today.getTime() - blockDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                idx = (arraySize - 1) - diffDays;
            }

            if (idx >= 0 && idx < arraySize) {
                fleetPaths[name].data[idx] = parseInt(row.ops);
            }
        });

        return NextResponse.json(Object.values(fleetPaths));
    } catch (error) {
        console.error("Velocity API Failure", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
