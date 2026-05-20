import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from "@/lib/db";
import { createOrderFromPayment, runOrderProvisioning } from "@/lib/order-pipeline";
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature') as string;

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET');
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

            // 1. Common logic: Update user plan and record payment
            const userEmail = session.customer_email || session.customer_details?.email;
            if (userEmail) {
                await db.execute(
                    "UPDATE \"User\" SET plan = 'Professional', tier = 'Professional' WHERE email = $1",
                    [userEmail]
                );
            }

            const amount = session.amount_total ? (session.amount_total / 100) : 0;
            const userId = metadata?.userId || session.client_reference_id;

            if (userId) {
                // Record Real Payment
                await db.execute(
                    'INSERT INTO "Payment" ("userId", "amount", "currency", "status", "stripeSessionId") VALUES ($1, $2, $3, \'completed\', $4)',
                    [userId, amount, session.currency?.toUpperCase() || 'EUR', session.id]
                );

                // Update User Total Spend
                await db.execute(
                    'UPDATE "User" SET "totalSpend" = COALESCE("totalSpend", 0) + $1 WHERE id = $2',
                    [amount, userId]
                );

                // Record Analytics Events
                await db.execute(
                    'INSERT INTO "Event" ("userId", "eventType", "metadata") VALUES ($1, \'payment_completed\', $2)',
                    [userId, JSON.stringify({ amount, currency: session.currency, type: metadata?.type || 'subscription' })]
                );
            }

            // 2. Specific logic for Marketplace Purchases
            if (metadata?.type === 'marketplace_purchase') {
                const { templateId, userId: metaUserId } = metadata;
                const finalUserId = metaUserId || userId;
                if (templateId && finalUserId) {
                    await handleMarketplacePurchase(templateId, finalUserId, session);
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
    
    if (!userRows.length) {
        console.error('[Webhook] User missing:', userId);
        return;
    }

    let teamId = userRows[0].teamId;

    // If user has no team, create one for them (Sovereign Auto-Provisioning)
    if (!teamId) {
        console.log(`[Webhook] User ${userId} has no team. Creating default team...`);
        const teamName = `${userRows[0].name || 'User'}'s Command Node`;
        const teamRes = await db.query(
            'INSERT INTO "Team" (name, "firmName", "ownerId") VALUES ($1, $2, $3) RETURNING id',
            [teamName, 'Institutional Firm', userId]
        ) as any[];
        teamId = teamRes[0].id;
        await db.execute('UPDATE "User" SET "teamId" = $1, "onboardingStatus" = \'COMPLETED\' WHERE id = $2', [teamId, userId]);
    }

    const templateRows = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [templateId]) as any[];
    if (!templateRows.length) {
        console.error('[Webhook] Template missing:', templateId);
        return;
    }
    const template = templateRows[0];

    const amount = parseFloat(template.price || 0) || (session.amount_total ? session.amount_total / 100 : 0);

    // Update Marketplace Stats
    await db.execute(
        'UPDATE "WorkflowTemplate" SET purchases = COALESCE(purchases, 0) + 1, revenue = COALESCE(revenue, 0) + $1 WHERE id = $2',
        [amount, templateId]
    );

    // Create Order and Workflow
    const { orderId } = await createOrderFromPayment({
        teamId: teamId,
        userId: userId,
        templateId,
        workflowName: template.name,
        amount,
        stripeSessionId: session.id,
    });

    if (orderId) {
        console.log(`[Webhook] Order ${orderId} created successfully. Starting provisioning...`);
        runOrderProvisioning(orderId).catch((e) => console.error('[Webhook] Provision async failure:', e));
    } else {
        console.error('[Webhook] Failed to create order for userId:', userId);
    }
}
