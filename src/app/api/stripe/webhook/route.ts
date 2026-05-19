import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from "@/lib/db";
import { createOrderFromPayment, runOrderProvisioning } from "@/lib/order-pipeline";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature') as string;

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (metadata?.type === 'marketplace_purchase') {
                const { templateId, userId } = metadata;
                if (templateId && userId) {
                    await handleMarketplacePurchase(templateId, userId, session);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handleMarketplacePurchase(templateId: string, userId: string, session: Stripe.Checkout.Session) {
    const userRows = await db.query('SELECT id, email, name, "teamId" FROM "User" WHERE id = $1', [userId]) as any[];
    if (!userRows.length || !userRows[0].teamId) {
        console.error('[Webhook] User or team missing:', userId);
        return;
    }
    const user = userRows[0];

    const templateRows = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [templateId]) as any[];
    if (!templateRows.length) return;
    const template = templateRows[0];

    const amount = parseFloat(template.price || 0) || (session.amount_total ? session.amount_total / 100 : 0);

    await db.execute(
        'UPDATE "WorkflowTemplate" SET purchases = COALESCE(purchases, 0) + 1, revenue = COALESCE(revenue, 0) + $1 WHERE id = $2',
        [amount, templateId]
    );

    const { orderId } = await createOrderFromPayment({
        teamId: user.teamId,
        userId: user.id,
        templateId,
        workflowName: template.name,
        amount,
        stripeSessionId: session.id,
    });

    runOrderProvisioning(orderId).catch((e) => console.error('[Webhook] Provision async:', e));
}
