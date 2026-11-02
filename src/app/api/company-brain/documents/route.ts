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
            `SELECT * FROM "BrainDocument" WHERE "teamId" = $1 ORDER BY "createdAt" DESC`,
            [teamId]
        );

        if (rows.length === 0) {
            // Seed default documents
            const defaultDocs = [
                { name: "SOP-InvoiceReconciliation-v2.pdf", category: "Finance", mimeType: "application/pdf", size: "1.2 MB" },
                { name: "ProductCatalog-Summer2026.xlsx", category: "Inventory", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", size: "4.8 MB" },
                { name: "TermsOfService-v4.pdf", category: "Policies", mimeType: "application/pdf", size: "850 KB" },
                { name: "StandardNDA-Template.docx", category: "HR Files", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: "320 KB" }
            ];

            for (const doc of defaultDocs) {
                await db.execute(
                    `INSERT INTO "BrainDocument" ("teamId", name, category, "mimeType", size, status, "uploadedBy") 
                     VALUES ($1, $2, $3, $4, $5, 'Indexed', 'System')`,
                    [teamId, doc.name, doc.category, doc.mimeType, doc.size]
                );
            }

            rows = await db.query(
                `SELECT * FROM "BrainDocument" WHERE "teamId" = $1 ORDER BY "createdAt" DESC`,
                [teamId]
            );
        }

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[GET Company Brain Documents Error]', error);
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
        const { name, category, mimeType, size } = body;

        if (!name) {
            return NextResponse.json({ error: 'Missing document name.' }, { status: 400 });
        }

        await db.execute(
            `INSERT INTO "BrainDocument" ("teamId", name, category, "mimeType", size, status, "uploadedBy") 
             VALUES ($1, $2, $3, $4, $5, 'Indexed', $6)`,
            [
                teamId, 
                name, 
                category || 'General', 
                mimeType || 'application/octet-stream', 
                size || '0 KB',
                session?.user?.name || 'User'
            ]
        );

        const rows = await db.query(
            `SELECT * FROM "BrainDocument" WHERE "teamId" = $1 ORDER BY "createdAt" DESC`,
            [teamId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[POST Company Brain Documents Error]', error);
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
            return NextResponse.json({ error: 'Missing document identification ID.' }, { status: 400 });
        }

        await db.execute(
            `DELETE FROM "BrainDocument" WHERE id = $1 AND "teamId" = $2`,
            [id, teamId]
        );

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[DELETE Company Brain Documents Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
