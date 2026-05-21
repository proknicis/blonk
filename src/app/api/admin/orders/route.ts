import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        // Let middleware handle strict admin auth or check here if needed
        const orders = await db.query(`
            SELECT o.*, t.name as team_name, t."firmName" 
            FROM "Order" o 
            LEFT JOIN "Team" t ON o."teamId" = t.id 
            ORDER BY o."createdAt" DESC
        `);
        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await request.json();
        const { id, status } = body;

        const res = await db.execute(
            `UPDATE "Order" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
            [status, id]
        );

        return NextResponse.json({ success: true, order: res.rows[0] });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
