import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import mysql from 'mysql2/promise';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
        return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    try {
        // 1. Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const connection = await mysql.createConnection(process.env.DATABASE_URL!);
            
            // 2. Fetch User to confirm upgrade
            const [user]: any = await connection.execute('SELECT plan FROM User LIMIT 1');
            const currentPlan = user[0]?.plan;

            if (currentPlan === 'Starter') {
                // 3. Perform the Atomic Upgrade
                await connection.execute("UPDATE User SET plan = 'Professional' LIMIT 1");
                
                // 4. Record the Invoice
                const invId = `INV-${Date.now()}`;
                const amount = session.amount_total ? `$${(session.amount_total/100).toFixed(2)}` : '$49.00';
                await connection.execute(
                    "INSERT INTO Invoice (id, invoiceNumber, amount, status, planName) VALUES (UUID(), ?, ?, 'Paid', 'Professional')",
                    [invId, amount]
                );
            }

            await connection.end();
            return NextResponse.json({ success: true, plan: 'Professional' });
        }

        return NextResponse.json({ success: false, status: session.payment_status });
    } catch (error: any) {
        console.error('Handshake verification failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
