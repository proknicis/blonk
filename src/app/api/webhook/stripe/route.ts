import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(request: Request) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        try {
            // 1. Fetch User ID from email
            const userRows = await db.query('SELECT id FROM "User" WHERE email = $1', [session.customer_email]) as any[];
            const userId = userRows[0]?.id;

            // 2. Update User Plan to Professional in sovereign PostgreSQL
            await db.execute(
                "UPDATE \"User\" SET plan = 'Professional' WHERE email = $1",
                [session.customer_email]
            );

            // 3. Record REAL Payment
            const amount = session.amount_total ? (session.amount_total / 100) : 49.00;
            await db.execute(
                'INSERT INTO "Payment" ("userId", "amount", "currency", "status", "stripeSessionId") VALUES ($1, $2, $3, \'completed\', $4)',
                [userId, amount, session.currency?.toUpperCase() || 'USD', session.id]
            );

            // 4. Record Analytics Events
            await db.execute(
                'INSERT INTO "Event" ("userId", "eventType", "metadata") VALUES ($1, \'subscription_started\', $2)',
                [userId, JSON.stringify({ plan: 'Professional', sessionId: session.id })]
            );
            await db.execute(
                'INSERT INTO "Event" ("userId", "eventType", "metadata") VALUES ($1, \'payment_completed\', $2)',
                [userId, JSON.stringify({ amount, currency: session.currency })]
            );

            // 5. Legacy Transaction Record (for compatibility with current UI if needed)
            const trxId = `INV-${Date.now()}`;
            const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            await db.execute(
                'INSERT INTO "Transaction" ("trxId", date, category, status, amount) VALUES ($1, $2, \'Subscription\', \'Paid\', $3)',
                [trxId, date, `$${amount.toFixed(2)}`]
            );

            console.log(`[Stripe Webhook] User ${session.customer_email} upgraded. Payment & Events recorded.`);
        } catch (error) {
            console.error('[Stripe Webhook] Database update failed:', error);
            return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
