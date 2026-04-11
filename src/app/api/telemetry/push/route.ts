import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { eventType, visitorId, sessionId, source, metadata } = body;

        if (!eventType) {
            return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
        }

        const userId = (session?.user as any)?.id || null;

        await db.execute(
            'INSERT INTO "Event" ("userId", "visitorId", "sessionId", "eventType", "source", "metadata") VALUES ($1, $2, $3, $4, $5, $6)',
            [userId, visitorId, sessionId, eventType, source || null, JSON.stringify(metadata || {})]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Telemetry] Tracking Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
