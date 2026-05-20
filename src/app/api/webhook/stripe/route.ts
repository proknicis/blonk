import { POST as stripePost } from '../../stripe/webhook/route';

/** 
 * Legacy webhook endpoint proxy. 
 * Redirects traffic from /api/webhook/stripe to /api/stripe/webhook 
 */
export async function POST(request: Request) {
    console.log('[Stripe Legacy Proxy] Redirecting request to /api/stripe/webhook');
    return stripePost(request);
}
