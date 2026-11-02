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

        // Fetch company profile
        let rows = await db.query(
            `SELECT * FROM "CompanyProfile" WHERE "teamId" = $1`,
            [teamId]
        );

        if (rows.length === 0) {
            // Provision default profile row
            await db.execute(
                `INSERT INTO "CompanyProfile" ("teamId", "companyName") VALUES ($1, $2)`,
                [teamId, "Blonk SIA"]
            );
            rows = await db.query(
                `SELECT * FROM "CompanyProfile" WHERE "teamId" = $1`,
                [teamId]
            );
        }

        return NextResponse.json(rows[0]);
    } catch (error: any) {
        console.error('[GET Company Profile API Error]', error);
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
        const {
            companyName,
            industry,
            employees,
            countries,
            languages,
            workingHours,
            timezone,
            vatCode,
            currencies,
            departments
        } = body;

        // Perform update since it's already created on GET
        await db.execute(
            `UPDATE "CompanyProfile" SET 
                "companyName" = $1,
                industry = $2,
                employees = $3,
                countries = $4,
                languages = $5,
                "workingHours" = $6,
                timezone = $7,
                "vatCode" = $8,
                currencies = $9,
                departments = $10,
                "updatedAt" = CURRENT_TIMESTAMP
             WHERE "teamId" = $11`,
            [
                companyName || "Blonk SIA",
                industry || "",
                employees || "1",
                countries || "",
                languages || "",
                workingHours || "09:00 - 18:00",
                timezone || "UTC",
                vatCode || "",
                currencies || "EUR (€)",
                departments || "",
                teamId
            ]
        );

        const rows = await db.query(
            `SELECT * FROM "CompanyProfile" WHERE "teamId" = $1`,
            [teamId]
        );

        return NextResponse.json(rows[0]);
    } catch (error: any) {
        console.error('[PATCH Company Profile API Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
