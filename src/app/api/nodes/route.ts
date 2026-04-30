import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const nodes = await db.query('SELECT id, name, url, status FROM "ClusterNode" ORDER BY name ASC');
        return NextResponse.json(nodes);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
    }
}
