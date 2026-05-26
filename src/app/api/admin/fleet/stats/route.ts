import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get count of successes and failures in the last 24 hours
        const stats = await db.query(`
            SELECT 
                COUNT(*)::int as total,
                COUNT(CASE WHEN status = 'Success' OR status = 'success' THEN 1 END)::int as success,
                COUNT(CASE WHEN status = 'Failed' OR status = 'failed' OR status = 'error' THEN 1 END)::int as failed
            FROM "WorkflowLog"
            WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
        `) as any[];

        const result = stats[0] || { total: 0, success: 0, failed: 0 };

        return NextResponse.json({
            total: result.total || 0,
            success: result.success || 0,
            failed: result.failed || 0
        });
    } catch (error: any) {
        console.error("[Fleet Stats API] Failure:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
