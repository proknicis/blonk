import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'OWNER' && (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

        // 1. REVENUE & MRR (Real Data)
        const revenueRes = await db.query(`
            SELECT 
                COALESCE(SUM(CAST(REPLACE(REPLACE(amount, '$', ''), ',', '') AS DECIMAL)), 0) as total,
                COALESCE(SUM(CASE WHEN "createdAt" >= $1 THEN CAST(REPLACE(REPLACE(amount, '$', ''), ',', '') AS DECIMAL) ELSE 0 END), 0) as monthly,
                COALESCE(SUM(CASE WHEN "createdAt" >= $2 AND "createdAt" < $1 THEN CAST(REPLACE(REPLACE(amount, '$', ''), ',', '') AS DECIMAL) ELSE 0 END), 0) as prev_monthly
            FROM "Transaction" 
            WHERE status = 'Paid'
        `, [thirtyDaysAgo, sixtyDaysAgo]) as any[];
        
        const totalRevenue = parseFloat(revenueRes[0].total);
        const monthlyRevenue = parseFloat(revenueRes[0].monthly);
        const prevMonthlyRevenue = parseFloat(revenueRes[0].prev_monthly);
        const revenueChange = prevMonthlyRevenue > 0 ? ((monthlyRevenue - prevMonthlyRevenue) / prevMonthlyRevenue) * 100 : 0;

        // MRR Calculation (Sum of monthly payments from active users)
        const activePaidUsers = await db.query('SELECT COUNT(*) as count FROM "User" WHERE plan != \'Starter\'') as any[];
        const paidCount = parseInt(activePaidUsers[0].count);
        // Assuming average monthly plan is $49 as per Stripe webhook fallback
        const mrr = paidCount * 49; 

        // 2. CONVERSION FUNNEL (Real Data)
        const visitorCountRes = await db.query('SELECT COUNT(DISTINCT "visitorId") as count FROM "Visit"') as any[];
        const totalVisitors = parseInt(visitorCountRes[0].count);

        const signupCountRes = await db.query('SELECT COUNT(*) as count FROM "User"') as any[];
        const totalSignups = parseInt(signupCountRes[0].count);

        const visitorToSignupRate = totalVisitors > 0 ? (totalSignups / totalVisitors) * 100 : 0;
        const signupToPaidRate = totalSignups > 0 ? (paidCount / totalSignups) * 100 : 0;

        // 3. CAC & LTV (Real Data)
        const marketingSpendRes = await db.query(`
            SELECT 
                COALESCE(SUM(amount), 0) as total,
                COALESCE(SUM(CASE WHEN "date" >= $1 THEN amount ELSE 0 END), 0) as monthly
            FROM "MarketingSpend"
        `, [thirtyDaysAgo]) as any[];
        
        const totalSpend = parseFloat(marketingSpendRes[0].total);
        const monthlySpend = parseFloat(marketingSpendRes[0].monthly);

        // New paid users in last 30 days
        const newPaidUsersRes = await db.query('SELECT COUNT(*) as count FROM "User" WHERE plan != \'Starter\' AND "createdAt" >= $1', [thirtyDaysAgo]) as any[];
        const newPaidCount = parseInt(newPaidUsersRes[0].count);

        const cac = newPaidCount > 0 ? monthlySpend / newPaidCount : 0;
        const ltv = paidCount > 0 ? totalRevenue / paidCount : 0;

        // 4. KEY INSIGHTS (Dynamic Logic)
        const insights = [];
        if (totalRevenue === 0) insights.push({ type: 'warning', text: "No revenue generated yet. Focus on conversion and onboarding." });
        if (cac > ltv && cac > 0) insights.push({ type: 'critical', text: "LTV/CAC Ratio is negative ($" + (ltv-cac).toFixed(2) + "). You are losing money per customer." });
        if (visitorToSignupRate < 5 && totalVisitors > 10) insights.push({ type: 'warning', text: "Low Visitor → Signup conversion (" + visitorToSignupRate.toFixed(1) + "%). Optimize landing page clarity." });
        if (signupToPaidRate < 10 && totalSignups > 5) insights.push({ type: 'critical', text: "High signup drop-off. Review pricing or trial onboarding." });
        if (ltv > cac * 3 && cac > 0) insights.push({ type: 'healthy', text: "Strong LTV/CAC ratio. Consider scaling marketing spend." });

        // 5. CHART DATA (Real Grouping)
        const revenueChartRows = await db.query(`
            SELECT DATE_TRUNC('day', "createdAt") as day, SUM(CAST(REPLACE(REPLACE(amount, '$', ''), ',', '') AS DECIMAL)) as val
            FROM "Transaction" 
            WHERE status = 'Paid' AND "createdAt" >= $1
            GROUP BY day ORDER BY day ASC
        `, [thirtyDaysAgo]) as any[];

        const userGrowthRows = await db.query(`
            SELECT DATE_TRUNC('day', "createdAt") as day, COUNT(*) as val
            FROM "User" 
            WHERE "createdAt" >= $1
            GROUP BY day ORDER BY day ASC
        `, [thirtyDaysAgo]) as any[];

        return NextResponse.json({
            kpis: {
                revenue: {
                    total: `$${totalRevenue.toLocaleString()}`,
                    monthly: `$${monthlyRevenue.toLocaleString()}`,
                    change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
                    status: revenueChange >= 0 ? 'healthy' : 'warning'
                },
                mrr: {
                    value: `$${mrr.toLocaleString()}`,
                    change: "+0.0%", // Placeholder for MRR trend if we tracked history
                    status: 'healthy'
                },
                cac: {
                    value: `$${cac.toFixed(2)}`,
                    change: "vs LTV",
                    status: (cac > ltv && cac > 0) ? 'critical' : (cac > 0 ? 'healthy' : 'warning')
                },
                ltv: {
                    value: `$${ltv.toFixed(2)}`,
                    change: "Avg Revenue",
                    status: ltv > 0 ? 'healthy' : 'warning'
                },
                conversion: {
                    visitorToSignup: `${visitorToSignupRate.toFixed(1)}%`,
                    signupToPaid: `${signupToPaidRate.toFixed(1)}%`
                },
                activeUsers: {
                    daily: Math.floor(totalSignups * 0.1), // Still simulated until we track daily logins
                    monthly: totalSignups
                }
            },
            insights,
            charts: {
                revenue: [{ name: "Revenue", data: revenueChartRows.map(r => parseFloat(r.val)) }],
                users: [{ name: "Users", data: userGrowthRows.map(r => parseInt(r.val)) }],
                funnel: [totalVisitors, totalSignups, paidCount]
            }
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
