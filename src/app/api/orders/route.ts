import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createOrderFromPayment, runOrderProvisioning } from "@/lib/order-pipeline";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const teamId = (session.user as any).teamId;
        const userId = (session.user as any).id;
        if (!teamId) return NextResponse.json({ error: 'Missing Team Anchor' }, { status: 400 });

        const body = await request.json();
        const { workflowName, price, templateId } = body;

        // Simulate creating the order
        const { orderId } = await createOrderFromPayment({
            teamId,
            userId,
            templateId: templateId || uuidv4(), // Fallback if no template ID is sent
            workflowName,
            amount: price,
            stripeSessionId: 'simulated_payment_' + Date.now()
        });

        // Trigger provisioning asynchronously
        runOrderProvisioning(orderId).catch(console.error);

        return NextResponse.json({ success: true, orderId });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('id');
        if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

        const [order] = await db.query(
            'SELECT status, logs FROM "WorkflowOrder" WHERE id = $1',
            [orderId]
        ) as any[];

        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        return NextResponse.json({ status: order.status, logs: order.logs || [] });
    } catch (error) {
        console.error('Error fetching order logs:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

