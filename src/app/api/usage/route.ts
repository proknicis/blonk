import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);

        // Fetch User Plan to see limits
        const [user]: any = await connection.execute('SELECT plan FROM User LIMIT 1');
        const currentTier = user[0]?.plan || 'Starter';

        // Fetch Total Active Loops
        const [workflowRows]: any = await connection.execute('SELECT COUNT(*) as count FROM Workflow');
        const activeLoops = workflowRows[0]?.count || 0;

        // Fetch Total Task Requests (from logs)
        const [logRows]: any = await connection.execute('SELECT COUNT(*) as count FROM WorkflowLog');
        const totalTasks = logRows[0]?.count || 0;

        await connection.end();

        const isPro = currentTier === 'Professional';

        return NextResponse.json({
            activeLoops,
            activeLoopsLimit: isPro ? 5 : 1,
            totalTasks,
            totalTasksLimit: isPro ? 500 : 10,
            proLoopsLimit: 5,
            proTasksLimit: 500,
            plan: currentTier
        });
    } catch (error) {
        console.error('Error fetching usage data:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
