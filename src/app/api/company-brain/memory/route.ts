import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team context found.' }, { status: 401 });
        }

        // Ensure "teamId" column exists on "BrainMemory" table for direct association
        await db.execute('ALTER TABLE "BrainMemory" ADD COLUMN IF NOT EXISTS "teamId" UUID');

        let rows = await db.query(
            `SELECT bm.*, e.name as "employeeName"
             FROM "BrainMemory" bm
             LEFT JOIN "AIEmployee" e ON bm."employeeId" = e.id
             WHERE bm."teamId" = $1 OR e."teamId" = $1
             ORDER BY bm."createdAt" DESC`,
            [teamId]
        );

        if (rows.length === 0) {
            // Seed default memory items
            const defaultMemories = [
                {
                    type: "Company Memory",
                    summary: "Refunds are processed automatically via Stripe within 14 days, subject to supervisor approval.",
                    confidence: 98
                },
                {
                    type: "Short-Term",
                    summary: "Learned standard working hours of '09:00 - 18:00' and timezone EET (UTC+2) for Latvia offices.",
                    confidence: 95
                },
                {
                    type: "Reflection",
                    summary: "Identified outdated refund terms in product-catalog matching 2025 rates. Suggested update to 2026.",
                    confidence: 89
                }
            ];

            for (const m of defaultMemories) {
                await db.execute(
                    `INSERT INTO "BrainMemory" ("teamId", type, summary, confidence) 
                     VALUES ($1, $2, $3, $4)`,
                    [teamId, m.type, m.summary, m.confidence]
                );
            }

            rows = await db.query(
                `SELECT bm.*, e.name as "employeeName"
                 FROM "BrainMemory" bm
                 LEFT JOIN "AIEmployee" e ON bm."employeeId" = e.id
                 WHERE bm."teamId" = $1 OR e."teamId" = $1
                 ORDER BY bm."createdAt" DESC`,
                [teamId]
            );
        }

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[GET Company Brain Memory Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team context found.' }, { status: 401 });
        }

        const body = await request.json();
        const { employeeId, type, summary, confidence } = body;

        if (!summary) {
            return NextResponse.json({ error: 'Missing memory summary content.' }, { status: 400 });
        }

        await db.execute(
            `INSERT INTO "BrainMemory" ("teamId", "employeeId", type, summary, confidence) 
             VALUES ($1, $2, $3, $4, $5)`,
            [
                teamId,
                employeeId || null,
                type || 'Short-Term',
                summary,
                confidence !== undefined ? confidence : 100
            ]
        );

        const rows = await db.query(
            `SELECT bm.*, e.name as "employeeName"
             FROM "BrainMemory" bm
             LEFT JOIN "AIEmployee" e ON bm."employeeId" = e.id
             WHERE bm."teamId" = $1 OR e."teamId" = $1
             ORDER BY bm."createdAt" DESC`,
            [teamId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[POST Company Brain Memory Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
