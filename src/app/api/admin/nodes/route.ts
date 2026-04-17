import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const nodes = await db.query('SELECT * FROM "ClusterNode" ORDER BY "createdAt" DESC');
        return NextResponse.json(nodes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch nodes" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, url, api_key } = await req.json();
        
        if (!name || !url || !api_key) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const res = await db.execute(
            'INSERT INTO "ClusterNode" (name, url, api_key, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, url, api_key, 'Pending']
        );

        return NextResponse.json(res.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: "Failed to add node" }, { status: 500 });
    }
}
