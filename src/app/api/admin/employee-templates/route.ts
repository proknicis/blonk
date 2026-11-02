import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET() {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rows = await db.query(`
            SELECT aet.*, bt.name as "brainTemplateName", bt.version as "brainTemplateVersion"
            FROM "AIEmployeeTemplate" aet
            JOIN "BrainTemplate" bt ON aet."brainTemplateId" = bt.id
            ORDER BY aet."createdAt" DESC
        `);
        return NextResponse.json(rows);
    } catch (err: any) {
        console.error("GET employee templates error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, suggestedName, defaultPermissions, brainTemplateId } = await request.json();
        if (!name || !brainTemplateId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await db.execute(`
            INSERT INTO "AIEmployeeTemplate" (name, description, "suggestedName", "defaultPermissions", "brainTemplateId")
            VALUES ($1, $2, $3, $4, $5)
        `, [name, description || "", suggestedName || name, JSON.stringify(defaultPermissions || {}), brainTemplateId]);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("POST employee templates error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
