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

        // Auto-migrate: ensure permissions column exists on AIEmployee table
        await db.execute('ALTER TABLE "AIEmployee" ADD COLUMN IF NOT EXISTS "permissions" JSONB DEFAULT \'{}\'');

        let rows = await db.query(
            `SELECT * FROM "AIEmployee" WHERE "teamId" = $1 ORDER BY name ASC`,
            [teamId]
        );

        if (rows.length === 0) {
            // Seed standard AI Employees with initial permissions
            const defaultEmployees = [
                {
                    name: "Finance AI",
                    type: "Finance AI",
                    permissions: {
                        "Invoices": true,
                        "Stripe": true,
                        "Bank": true,
                        "Accounting": true,
                        "HR Files": false,
                        "Contracts": false
                    }
                },
                {
                    name: "Support AI",
                    type: "Support AI",
                    permissions: {
                        "Knowledge Base": true,
                        "Gmail": true,
                        "Tickets": true,
                        "Finance": false
                    }
                },
                {
                    name: "Sales AI",
                    type: "Sales AI",
                    permissions: {
                        "CRM": true,
                        "Calendar": true,
                        "Quotes": true
                    }
                }
            ];

            for (const emp of defaultEmployees) {
                await db.execute(
                    `INSERT INTO "AIEmployee" (name, type, "teamId", permissions) 
                     VALUES ($1, $2, $3, $4)`,
                    [emp.name, emp.type, teamId, JSON.stringify(emp.permissions)]
                );
            }

            rows = await db.query(
                `SELECT * FROM "AIEmployee" WHERE "teamId" = $1 ORDER BY name ASC`,
                [teamId]
            );
        }

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[GET Company Brain Employees Error]', error);
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
        const { id, name, permissions } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing employee ID.' }, { status: 400 });
        }

        const updates: string[] = [];
        const params: any[] = [];
        let i = 1;

        if (name !== undefined) {
            updates.push(`name = $${i++}`);
            params.push(name);
        }
        if (permissions !== undefined) {
            updates.push(`permissions = $${i++}`);
            params.push(JSON.stringify(permissions));
        }

        if (updates.length > 0) {
            params.push(id);
            params.push(teamId);
            const sql = `UPDATE "AIEmployee" SET ${updates.join(', ')} WHERE id = $${i} AND "teamId" = $${i + 1}`;
            await db.execute(sql, params);
        }

        const rows = await db.query(
            `SELECT * FROM "AIEmployee" WHERE "teamId" = $1 ORDER BY name ASC`,
            [teamId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[PATCH Company Brain Employees Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
