import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import mysql from 'mysql2/promise';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
    try {
        const contentType = request.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");

        let priceId: string | null = null;
        if (isJson) {
            const body = await request.json();
            priceId = body?.priceId ?? null;
        } else {
            const form = await request.formData();
            priceId = (form.get("priceId") as string | null) ?? null;
        }

        if (!priceId) {
            return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
        }

        // Get the current user email for customer_email
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows]: any = await connection.execute('SELECT email FROM User LIMIT 1');
        await connection.end();
        
        const userEmail = rows[0]?.email || 'nikolass@blonk.ai';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    // 1. Setup Fee (One-Time)
                    price: process.env.STRIPE_SETUP_FEE_PRICE_ID,
                    quantity: 1,
                },
                {
                    // 2. Pro Plan (Recurring)
                    price: process.env.STRIPE_PRO_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?success=true&sessionId={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/settings?canceled=true`,
            customer_email: userEmail,
            client_reference_id: rows[0]?.id || 'MASTER_USER',
            metadata: {
                firmName: rows[0]?.firmName || 'BLONK Firm'
            }
        });

        if (!session.url) {
            return NextResponse.json({ error: "Stripe session missing URL" }, { status: 500 });
        }

        // If called via a non-JSON POST (e.g., FormData), do a server redirect to Stripe.
        if (!isJson) {
            return NextResponse.redirect(session.url, { status: 303 });
        }

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
