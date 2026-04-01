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
            // 1. Update User Plan to Professional in sovereign PostgreSQL
            await db.execute(
                "UPDATE \"User\" SET plan = 'Professional' WHERE email = $1",
                [session.customer_email]
            );

            // 2. Create an Transaction (Invoice) Record in the sovereign vault
            const trxId = `INV-${Date.now()}`;
            const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : '$49.00';
            const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            await db.execute(
                'INSERT INTO "Transaction" ("trxId", date, category, status, amount) VALUES ($1, $2, \'Subscription\', \'Paid\', $3)',
                [trxId, date, amount]
            );

            console.log(`User ${session.customer_email} upgraded to Professional tier.`);
        } catch (error) {
            console.error('Database update failed on webhook:', error);
            return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
