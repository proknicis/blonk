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

        let rows = await db.query(
            `SELECT * FROM "BrainRule" WHERE "teamId" = $1 ORDER BY "createdAt" ASC`,
            [teamId]
        );

        if (rows.length === 0) {
            const defaultRules = [
                "Never email after 18:00",
                "Finance AI can't delete invoices",
                "Support AI answers Latvian customers in Latvian",
                "Marketing AI can't publish automatically",
                "Always ask approval above €1000"
            ];

            for (const text of defaultRules) {
                await db.execute(
                    `INSERT INTO "BrainRule" ("teamId", text, active, priority, scope) 
                     VALUES ($1, $2, true, 'High', 'Global')`,
                    [teamId, text]
                );
            }

            rows = await db.query(
                `SELECT * FROM "BrainRule" WHERE "teamId" = $1 ORDER BY "createdAt" ASC`,
                [teamId]
            );
        }

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[GET Company Brain Rules Error]', error);
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
        const { text, priority, scope } = body;

        if (!text) {
            return NextResponse.json({ error: 'Missing rule text.' }, { status: 400 });
        }

        await db.execute(
            `INSERT INTO "BrainRule" ("teamId", text, active, priority, scope) 
             VALUES ($1, $2, true, $3, $4)`,
            [teamId, text, priority || 'Medium', scope || 'Global']
        );

        const rows = await db.query(
            `SELECT * FROM "BrainRule" WHERE "teamId" = $1 ORDER BY "createdAt" ASC`,
            [teamId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[POST Company Brain Rules Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team context found.' }, { status: 401 });
        }

        const body = await request.json();
        const { id, active, text, priority, scope } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing rule ID.' }, { status: 400 });
        }

        const updates: string[] = [];
        const params: any[] = [];
        let i = 1;

        if (active !== undefined) {
            updates.push(`active = $${i++}`);
            params.push(active);
        }
        if (text !== undefined) {
            updates.push(`text = $${i++}`);
            params.push(text);
        }
        if (priority !== undefined) {
            updates.push(`priority = $${i++}`);
            params.push(priority);
        }
        if (scope !== undefined) {
            updates.push(`scope = $${i++}`);
            params.push(scope);
        }

        if (updates.length > 0) {
            updates.push(`"updatedAt" = CURRENT_TIMESTAMP`);
            params.push(id);
            params.push(teamId);
            const sql = `UPDATE "BrainRule" SET ${updates.join(', ')} WHERE id = $${i} AND "teamId" = $${i + 1}`;
            await db.execute(sql, params);
        }

        const rows = await db.query(
            `SELECT * FROM "BrainRule" WHERE "teamId" = $1 ORDER BY "createdAt" ASC`,
            [teamId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[PATCH Company Brain Rules Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team context found.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing rule ID.' }, { status: 400 });
        }

        await db.execute(
            `DELETE FROM "BrainRule" WHERE id = $1 AND "teamId" = $2`,
            [id, teamId]
        );

        const rows = await db.query(
            `SELECT * FROM "BrainRule" WHERE "teamId" = $1 ORDER BY "createdAt" ASC`,
            [teamId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[DELETE Company Brain Rules Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
