import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get('stripe-signature') as string;

        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('Stripe webhook secret not configured');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle checkout.session.completed event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const metadata = session.metadata;

            if (metadata?.type === 'marketplace_purchase') {
                const { templateId, userId } = metadata;

                // Create installation record
                const installationId = `install_${Date.now()}`;
                await db.execute(
                    'INSERT INTO "MarketplaceInstallation" (id, "templateId", "userId", status) VALUES ($1, $2, $3, $4)',
                    [installationId, templateId, userId, 'provisioning']
                );

                // Update template purchase count
                const template = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [templateId]);
                if (template.length) {
                    await db.execute(
                        'UPDATE "WorkflowTemplate" SET purchases = purchases + 1, revenue = revenue + $1 WHERE id = $2',
                        [parseFloat(template[0].price || 0), templateId]
                    );

                    // Trigger automatic Contabo provisioning
                    await triggerProvisioning(templateId, userId, template[0]);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function triggerProvisioning(templateId: string, userId: string, template: any) {
    try {
        // Get user details
        const user = await db.query('SELECT * FROM "User" WHERE id = $1', [userId]) as any[];
        if (!user.length) {
            console.error('User not found for provisioning');
            return;
        }

        const userData = user[0];

        // Call Contabo API to provision server
        const contaboRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/contabo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerId: userId,
                customerName: userData.name || 'User',
                customerEmail: userData.email,
                instanceType: 'VPS-2', // Default instance type
                region: 'EU-CENTRAL-1'
            })
        });

        if (contaboRes.ok) {
            const contaboData = await contaboRes.json();
            
            // Update installation with server details
            await db.execute(
                'UPDATE "MarketplaceInstallation" SET "serverId" = $1, status = $2 WHERE "templateId" = $3 AND "userId" = $4',
                [contaboData.node?.id, 'installing', templateId, userId]
            );

            // Deploy workflow to the new server
            await deployWorkflowToServer(templateId, contaboData.node?.id, template);
        } else {
            console.error('Contabo provisioning failed');
            await db.execute(
                'UPDATE "MarketplaceInstallation" SET status = $1 WHERE "templateId" = $2 AND "userId" = $3',
                ['failed', templateId, userId]
            );
        }
    } catch (error) {
        console.error('Provisioning error:', error);
        await db.execute(
            'UPDATE "MarketplaceInstallation" SET status = $1 WHERE "templateId" = $2 AND "userId" = $3',
            ['failed', templateId, userId]
        );
    }
}

async function deployWorkflowToServer(templateId: string, serverId: string, template: any) {
    try {
        // Call workflow deployment API
        const deployRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/workflows/deploy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                workflowId: templateId,
                serverId: serverId
            })
        });

        if (deployRes.ok) {
            // Update installation status to complete
            await db.execute(
                'UPDATE "MarketplaceInstallation" SET status = $1 WHERE "templateId" = $2',
                ['installed', templateId]
            );
        }
    } catch (error) {
        console.error('Workflow deployment error:', error);
    }
}
