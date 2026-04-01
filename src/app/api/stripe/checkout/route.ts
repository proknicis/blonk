import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const plan = body?.plan || 'Professional';

        // 1. Environmental Validation - Institutional Grade
        const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
        const setupFeeId = process.env.STRIPE_SETUP_FEE_PRICE_ID;

        if (!proPriceId || proPriceId.includes("placeholder")) {
            console.error("[Sovereign Billing Failure] STRIPE_PRO_PRICE_ID is not configured in .env");
            return NextResponse.json({ error: "Institutional pricing is not initialized. Please configure STRIPE_PRO_PRICE_ID." }, { status: 500 });
        }

        // 2. Get User Identity (Sovereign postgres)
        const rows = await db.query('SELECT id, email, "firmName" FROM "User" LIMIT 1');
        const user = rows[0];
        const userEmail = user?.email || 'user@blonk.ai';

        // 3. Initiate High-Stakes Handshake
        const lineItems: any[] = [
            {
                price: proPriceId,
                quantity: 1,
            }
        ];

        // Include setup fee if it's the first time
        if (setupFeeId && !setupFeeId.includes("placeholder")) {
            lineItems.push({
                price: setupFeeId,
                quantity: 1,
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?success=true&sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?canceled=true`,
            customer_email: userEmail,
            client_reference_id: user?.id || 'GLOBAL_ADMIN',
            metadata: {
                firmName: user?.firmName || 'BLONK Firm',
                planRequest: plan
            }
        });

        if (!session.url) {
            throw new Error("Stripe session creation failed (Missing URL)");
        }

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
