import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAllOrdersForAdmin, setOrderStatus } from "@/lib/order-pipeline";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const orders = await getAllOrdersForAdmin();
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

        await setOrderStatus(id, status);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

