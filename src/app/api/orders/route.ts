import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const teamId = (session.user as any).teamId;
        if (!teamId) return NextResponse.json({ error: 'Missing Team Anchor' }, { status: 400 });

        const body = await request.json();
        const { workflowName, price } = body;

        const res = await db.execute(
            `INSERT INTO "Order" ("teamId", "workflowName", price, status) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [teamId, workflowName, price, 'PAYMENT_RECEIVED']
        );

        return NextResponse.json({ success: true, order: res.rows[0] });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const teamId = (session.user as any).teamId;
        if (!teamId) return NextResponse.json({ error: 'Missing Team Anchor' }, { status: 400 });

        const orders = await db.query(
            `SELECT * FROM "Order" WHERE "teamId" = $1 ORDER BY "createdAt" DESC`,
            [teamId]
        );

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
