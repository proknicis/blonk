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
        const mrr = activePaidUsers * 49.00;

        // 3. ACTIVATION METRICS (Canonical: activationStatus = 'ACTIVATED')
        const usersCountRes = await db.query('SELECT COUNT(*) as count FROM "User"') as any[];
        const totalUsers = parseInt(usersCountRes[0].count || 0);

        const setupCompletedRes = await db.query('SELECT COUNT(*) as count FROM "User" WHERE "onboardingStatus" = \'COMPLETED\'') as any[];
        const setupCompleted = parseInt(setupCompletedRes[0].count || 0);

        const activationStartedRes = await db.query('SELECT COUNT(*) as count FROM "User" WHERE "activationStartedAt" IS NOT NULL') as any[];
        const activationStarted = parseInt(activationStartedRes[0].count || 0);

        const activationCompletedRes = await db.query('SELECT COUNT(*) as count FROM "User" WHERE "activationStatus" = \'ACTIVATED\'') as any[];
        const activationCompleted = parseInt(activationCompletedRes[0].count || 0);

        // Funnel Step Grouping
        const funnelStepsRes = await db.query(`
            SELECT "activationStatus", COUNT(*) as count
            FROM "User"
            GROUP BY "activationStatus"
        `) as any[];

        const funnelMap: Record<string, number> = {
            NOT_STARTED: 0,
            SUMMARY_READY: 0,
            WORKFLOW_SELECTED: 0,
            CONNECTIONS_IN_PROGRESS: 0,
            READY_FOR_DEPLOY: 0,
            DEPLOYING: 0,
            ACTIVATED: 0,
            CUSTOM_REQUEST_SUBMITTED: 0
        };
        funnelStepsRes.forEach(r => {
            if (r.activationStatus && funnelMap[r.activationStatus] !== undefined) {
                funnelMap[r.activationStatus] = parseInt(r.count);
            }
        });

        // AI Employee Selector counts
        const rolesRes = await db.query(`
            SELECT "aiEmployee" as role, COUNT(*) as count
            FROM "User"
            WHERE "aiEmployee" IS NOT NULL
            GROUP BY "aiEmployee"
            ORDER BY count DESC
        `) as any[];

        // Blueprints match counts
        const blueprintRes = await db.query(`
            SELECT "selectedWorkflowId" as id, COUNT(*) as count
            FROM "User"
            WHERE "selectedWorkflowId" IS NOT NULL
            GROUP BY "selectedWorkflowId"
            ORDER BY count DESC
        `) as any[];

        // Missing integrations (Credential status check)
        const missingCredsRes = await db.query(`
            SELECT provider, COUNT(*) as count
            FROM "credentials"
            WHERE status != 'Connected'
            GROUP BY provider
            ORDER BY count DESC
        `) as any[];

        // Time to deploy (Average minutes from activation start to complete)
        const timeToDeployRes = await db.query(`
            SELECT AVG(EXTRACT(EPOCH FROM ("activationCompletedAt" - "activationStartedAt"))) as avg_sec
            FROM "User"
            WHERE "activationStatus" = 'ACTIVATED' 
              AND "activationCompletedAt" IS NOT NULL 
              AND "activationStartedAt" IS NOT NULL
        `) as any[];
        const avgSec = parseFloat(timeToDeployRes[0].avg_sec || 0);
        const avgTimeToDeployMinutes = Math.round(avgSec / 60);

        // Deployments success vs failure count
        const deploysRes = await db.query(`
            SELECT 
                COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as success,
                COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
            FROM "WorkflowOrder"
        `) as any[];
        const successCount = parseInt(deploysRes[0].success || 0);
        const failureCount = parseInt(deploysRes[0].failed || 0);

        // Conversions
        const setupCompletionRate = totalUsers > 0 ? (setupCompleted / totalUsers) * 100 : 0;
        const activationStartedRate = totalUsers > 0 ? (activationStarted / totalUsers) * 100 : 0;
        const activationCompletionRate = totalUsers > 0 ? (activationCompleted / totalUsers) * 100 : 0;

        // 4. CAC & LTV CALCULATIONS
        const spendRes = await db.query('SELECT COALESCE(SUM(amount), 0) as total FROM "MarketingSpend" WHERE "date" >= $1', [thirtyDaysAgo]) as any[];
        const monthlySpend = parseFloat(spendRes[0].total);
        const newPaidUsersRes = await db.query('SELECT COUNT(*) as count FROM "Event" WHERE "eventType" = \'payment_completed\' AND "createdAt" >= $1', [thirtyDaysAgo]) as any[];
        const newPaidCount = parseInt(newPaidUsersRes[0].count || 0);

        const cac = newPaidCount > 0 ? monthlySpend / newPaidCount : 0;
        const ltv = activePaidUsers > 0 ? totalRevenue / activePaidUsers : 0;

        // 5. STRATEGIC INSIGHTS ENGINE
        const insights = [];
        if (totalUsers === 0) {
            insights.push({ type: 'warning', text: "No user enrollment logs detected in cluster ledger." });
        } else {
            if (setupCompletionRate < 50) insights.push({ type: 'critical', text: `High intake friction: Only ${setupCompletionRate.toFixed(1)}% completed the onboarding setup.` });
            if (activationCompletionRate < 30) insights.push({ type: 'warning', text: `Deploy Bottleneck: ${activationCompletionRate.toFixed(1)}% final workspace activation rate.` });
            if (failureCount > 0) insights.push({ type: 'critical', text: `Infrastructure warnings: ${failureCount} container provisioning faults detected.` });
            if (activationCompletionRate >= 60) insights.push({ type: 'healthy', text: `High efficiency: Workspace deployment conversion is optimal at ${activationCompletionRate.toFixed(1)}%.` });
        }

        // 6. CHART DATA
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
                    visitorToSignup: `${setupCompletionRate.toFixed(1)}%`,
                    signupToPaid: `${activationCompletionRate.toFixed(1)}%`
                },
                activeUsers: {
                    daily: 0,
                    monthly: activePaidUsers
                }
            },
            insights,
            charts: {
                revenue: [{ name: "Revenue", data: revenueChartRows.map(r => parseFloat(r.val)) }],
                users: [{ name: "Growth", data: userGrowthRows.map(r => parseInt(r.val)) }],
                funnel: [
                    totalUsers,
                    setupCompleted,
                    activationStarted,
                    activationCompleted
                ]
            },
            activationAnalytics: {
                totalEnrolled: totalUsers,
                setupCompletionRate,
                activationStartedRate,
                activationCompletionRate,
                avgTimeToDeploy: avgTimeToDeployMinutes,
                successCount,
                failureCount,
                funnel: funnelMap,
                mostSelectedRoles: rolesRes,
                mostRecommendedBlueprints: blueprintRes,
                missingIntegrations: missingCredsRes
            }
        });

    } catch (error) {
        console.error('[Analytics API] Aggregation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
