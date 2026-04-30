import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await db.execute('DELETE FROM "ClusterNode" WHERE id = $1', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete node" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, url, api_key, status, max_workflows } = body;

        await db.execute(
            `UPDATE "ClusterNode" 
             SET name = COALESCE($1, name), 
                 url = COALESCE($2, url), 
                 api_key = COALESCE($3, api_key), 
                 status = COALESCE($4, status),
                 max_workflows = COALESCE($5, max_workflows)
             WHERE id = $6`,
            [name, url, api_key, status, max_workflows, id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update node:", error);
        return NextResponse.json({ error: "Failed to update node" }, { status: 500 });
    }
}
