import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { path, referrer, utmSource, utmMedium, utmCampaign, visitorId, sessionId } = body;

        await db.execute(
            'INSERT INTO "Visit" ("path", "referrer", "utmSource", "utmMedium", "utmCampaign", "visitorId", "sessionId") VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [path, referrer, utmSource, utmMedium, utmCampaign, visitorId, sessionId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Tracking Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
