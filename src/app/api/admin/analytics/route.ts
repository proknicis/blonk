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

        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';

        // 1. Fetch Revenue Data
        const transactions = await db.query('SELECT amount, "createdAt" FROM "Transaction" WHERE status = \'Paid\'') as any[];
        
        let totalRevenue = 0;
        let monthlyRevenue = 0;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

        transactions.forEach(t => {
            const val = parseFloat(t.amount.replace(/[^0-9.]/g, ''));
            if (!isNaN(val)) {
                totalRevenue += val;
                if (new Date(t.createdAt) > thirtyDaysAgo) {
                    monthlyRevenue += val;
                }
            }
        });

        // 2. Fetch User Data
        const users = await db.query('SELECT "createdAt", plan FROM "User"') as any[];
        const totalUsers = users.length;
        const paidUsers = users.filter(u => u.plan !== 'Starter').length;

        // 3. Simulated Analytics (as requested)
        // In a real app, these would come from a tracking table or external API
        const simulatedVisitors = totalUsers * 12; // Assume 1:12 signup rate
        const visitorToSignupRate = totalUsers > 0 ? (totalUsers / simulatedVisitors) * 100 : 0;
        const signupToPaidRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;

        const cac = 125.50; // Simulated CAC
        const ltv = paidUsers > 0 ? (totalRevenue / paidUsers) * 1.5 : 450; // Simulated LTV

        // 4. Generate Chart Data
        // Revenue over time (Last 7 points)
        const revenueChart = {
            name: "Revenue",
            data: [1200, 1500, 1100, 1800, 2200, 1900, monthlyRevenue]
        };

        // User growth (Last 7 points)
        const userGrowthChart = {
            name: "Users",
            data: [140, 165, 190, 210, 245, 280, totalUsers]
        };

        // Conversion Funnel (Visitors -> Signups -> Paid)
        const funnelChart = {
            name: "Funnel",
            data: [simulatedVisitors, totalUsers, paidUsers]
        };

        return NextResponse.json({
            kpis: {
                revenue: {
                    total: `$${totalRevenue.toLocaleString()}`,
                    monthly: `$${monthlyRevenue.toLocaleString()}`,
                    change: "+12.4%"
                },
                mrr: {
                    value: `$${(monthlyRevenue * 0.9).toLocaleString()}`, // MRR estimation
                    change: "+8.2%"
                },
                cac: {
                    value: `$${cac.toFixed(2)}`,
                    change: "-4.1%",
                    positive: false
                },
                ltv: {
                    value: `$${ltv.toFixed(2)}`,
                    change: "+15.3%"
                },
                conversion: {
                    visitorToSignup: `${visitorToSignupRate.toFixed(1)}%`,
                    signupToPaid: `${signupToPaidRate.toFixed(1)}%`
                },
                activeUsers: {
                    daily: Math.floor(totalUsers * 0.15),
                    monthly: Math.floor(totalUsers * 0.65)
                }
            },
            charts: {
                revenue: [revenueChart],
                users: [userGrowthChart],
                funnel: [funnelChart]
            }
        });

    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
