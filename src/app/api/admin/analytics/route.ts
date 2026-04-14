import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Institutional Analytics Engine
 * Performs real-time multi-dimensional aggregations from sovereign Event and Payment ledgers.
 */
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'OWNER' && (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        // 1. REVENUE AGGREGATION (Real Payments)
        const revenueRes = await db.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as total,
                COALESCE(SUM(CASE WHEN "createdAt" >= $1 THEN amount ELSE 0 END), 0) as monthly,
                COALESCE(SUM(CASE WHEN "createdAt" >= $2 AND "createdAt" < $1 THEN amount ELSE 0 END), 0) as prev_monthly
            FROM "Payment" 
            WHERE status = 'completed'
        `, [thirtyDaysAgo, sixtyDaysAgo]) as any[];
        
        const totalRevenue = parseFloat(revenueRes[0].total);
        const monthlyRevenue = parseFloat(revenueRes[0].monthly);
        const prevMonthlyRevenue = parseFloat(revenueRes[0].prev_monthly);
        const revenueChange = prevMonthlyRevenue > 0 ? ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100 : 0;

        // 2. MRR (Real Active Subscriptions)
        const mrrRes = await db.query(`
            SELECT COUNT(*) as count FROM "User" 
            WHERE plan != 'Starter' AND "onboardingStatus" = 'COMPLETED'
        `) as any[];
        const activePaidUsers = parseInt(mrrRes[0].count);
        const mrr = activePaidUsers * 49.00; // Average institutional license fee

        // 3. EVENT-BASED FUNNEL (Real Event Telemetry)
        const funnelRes = await db.query(`
            SELECT 
                (SELECT COUNT(DISTINCT "visitorId") FROM "Event" WHERE "eventType" = 'page_visit') as visits,
                (SELECT COUNT(*) FROM "Event" WHERE "eventType" = 'signup') as signups,
                (SELECT COUNT(*) FROM "Event" WHERE "eventType" = 'payment_completed') as payments
        `) as any[];
        
        const totalVisitors = parseInt(funnelRes[0].visits || 0);
        const totalSignups = parseInt(funnelRes[0].signups || 0);
        const totalPayments = parseInt(funnelRes[0].payments || 0);

        const visitorToSignupRate = totalVisitors > 0 ? (totalSignups / totalVisitors) * 100 : 0;
        const signupToPaidRate = totalSignups > 0 ? (totalPayments / totalSignups) * 100 : 0;

        // 4. CAC & LTV CALCULATIONS
        const spendRes = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM "MarketingSpend" WHERE "date" >= $1', [thirtyDaysAgo]) as any[];
        const monthlySpend = parseFloat(spendRes[0].total);
        const newPaidUsersRes = await db.query('SELECT COUNT(*) as count FROM "Event" WHERE "eventType" = ' + "'payment_completed'" + ' AND "createdAt" >= $1', [thirtyDaysAgo]) as any[];
        const newPaidCount = parseInt(newPaidUsersRes[0].count || 0);

        const cac = newPaidCount > 0 ? monthlySpend / newPaidCount : 0;
        const ltv = activePaidUsers > 0 ? totalRevenue / activePaidUsers : 0;

        // 5. STRATEGIC INSIGHTS ENGINE
        const insights = [];
        if (totalVisitors === 0) {
            insights.push({ type: 'warning', text: "No traffic data detected yet. Tracking initialized." });
        } else {
            if (totalRevenue === 0) insights.push({ type: 'warning', text: "No revenue generated yet. Focus on conversion and onboarding." });
            if (cac > ltv && cac > 0) insights.push({ type: 'critical', text: "Negative Unit Economics ($" + (ltv-cac).toFixed(2) + "). Adjust CAC strategy." });
            if (visitorToSignupRate < 5 && totalVisitors > 10) insights.push({ type: 'warning', text: "Discovery Bottleneck: Landing page conversion below 5%." });
            if (signupToPaidRate < 10 && totalSignups > 5) insights.push({ type: 'critical', text: "Activation Failure: Review onboarding/pricing friction." });
            if (ltv > cac * 3 && cac > 0) insights.push({ type: 'healthy', text: "High Efficiency: Unit economics support aggressive scaling." });
        }

        // 6. CHART DATA (Grouped Temporal Queries)
        const revenueChartRows = await db.query(`
            SELECT DATE_TRUNC('day', "createdAt") as day, SUM(amount) as val
            FROM "Payment" 
            WHERE status = 'completed' AND "createdAt" >= $1
            GROUP BY day ORDER BY day ASC
        `, [thirtyDaysAgo]) as any[];

        const userGrowthRows = await db.query(`
            SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as val
            FROM "Event" 
            WHERE "eventType" = 'signup' AND "createdAt" >= $1
            GROUP BY day ORDER BY day ASC
        `, [thirtyDaysAgo]) as any[];

        return NextResponse.json({
            kpis: {
                revenue: {
                    total: `$${totalRevenue.toLocaleString()}`,
                    monthly: `$${monthlyRevenue.toLocaleString()}`,
                    change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
                    status: totalRevenue > 0 ? (revenueChange >= 0 ? 'healthy' : 'warning') : 'warning'
                },
                mrr: {
                    value: `$${mrr.toLocaleString()}`,
                    change: "+0.0%",
                    status: activePaidUsers > 0 ? 'healthy' : 'warning'
                },
                cac: {
                    value: cac.toFixed(2),
                    change: "Institutional Spend",
                    status: (cac > ltv && cac > 0) ? 'critical' : (cac > 0 ? 'healthy' : 'warning')
                },
                ltv: {
                    value: ltv.toFixed(2),
                    change: "Projected Value",
                    status: ltv > 0 ? 'healthy' : 'warning'
                },
                conversion: {
                    visitorToSignup: `${visitorToSignupRate.toFixed(1)}%`,
                    signupToPaid: `${signupToPaidRate.toFixed(1)}%`
                },
                activeUsers: {
                    daily: 0, // Requires session duration tracking
                    monthly: activePaidUsers
                }
            },
            insights,
            charts: {
                revenue: [{ name: "Revenue", data: revenueChartRows.map(r => parseFloat(r.val)) }],
                users: [{ name: "Growth", data: userGrowthRows.map(r => parseInt(r.val)) }],
                funnel: [totalVisitors, totalSignups, totalPayments]
            }
        });

    } catch (error) {
        console.error('[Analytics API] Aggregation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
