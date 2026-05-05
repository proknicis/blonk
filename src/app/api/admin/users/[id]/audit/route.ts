import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = params.id;
        
        const logs = await db.query(`
            SELECT 
                id, 
                "eventType", 
                metadata, 
                "createdAt" 
            FROM "Event" 
            WHERE "userId" = $1 AND "source" = 'audit_log'
            ORDER BY "createdAt" DESC
        `, [userId]);

        const formattedLogs = logs.map(log => {
            const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
            return {
                id: log.id,
                time: new Date(log.createdAt).toLocaleString(),
                action: formatEventType(log.eventType),
                target: meta.target || 'N/A'
            };
        });

        return NextResponse.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching user audit logs:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

function formatEventType(type: string) {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
