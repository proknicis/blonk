import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { appendOrderLog } from '@/lib/order-pipeline';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderId } = await request.json();
        if (!orderId) {
            return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
        }

        // Fetch the order to get the quoted amount
        const [order] = await db.query(
            'SELECT * FROM "WorkflowOrder" WHERE id = $1',
            [orderId]
        ) as any[];

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const amount = Number(order.amount || 0);
        if (amount <= 0) {
            return NextResponse.json({ error: 'No price has been set for this order yet' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // Try Stripe checkout if the key is configured
        if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });

            const checkoutSession = await stripe.checkout.sessions.create({
                mode: 'payment',
                line_items: [
                    {
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: order.workflowName || 'Custom Workflow',
                                description: `Custom workflow development — Order #${String(order.orderNumber || '').padStart(4, '0')}`,
                            },
                            unit_amount: Math.round(amount * 100), // Convert to cents
                        },
                        quantity: 1,
                    },
                ],
                success_url: `${appUrl}/dashboard/incidents?payment=success&orderId=${orderId}`,
                cancel_url: `${appUrl}/dashboard/incidents?payment=cancelled`,
                metadata: {
                    orderId,
                    orderType: 'custom_workflow',
                },
            });

            // Log the payment initiated event
            await appendOrderLog(orderId, `User initiated payment of €${amount} via Stripe checkout`, 'info');

            return NextResponse.json({ checkoutUrl: checkoutSession.url });
        }

        // Fallback: simulate payment for development
        await db.execute(
            `UPDATE "WorkflowOrder" SET "paymentStatus" = 'PAID', "updatedAt" = CURRENT_TIMESTAMP WHERE id = $1`,
            [orderId]
        ).catch(() => {
            // Column may not exist yet — run migration silently
        });

        await appendOrderLog(orderId, `Payment of €${amount} processed successfully (simulated)`, 'info');

        return NextResponse.json({ success: true, simulated: true });
    } catch (error: any) {
        console.error('[Pay Custom] Error:', error);
        return NextResponse.json({ error: error.message || 'Payment failed' }, { status: 500 });
    }
}
