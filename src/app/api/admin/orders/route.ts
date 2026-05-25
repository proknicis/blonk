import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getAllOrdersForAdmin, updateOrderDetails } from "@/lib/order-pipeline";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const orders = await getAllOrdersForAdmin();
        const users = await db.query('SELECT id, name, email FROM "User" ORDER BY name ASC') as any[];
        const teams = await db.query('SELECT id, name FROM "Team" ORDER BY name ASC') as any[];
        return NextResponse.json({ orders, users, teams });
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { 
            userId, 
            teamId, 
            workflowName, 
            amount, 
            status, 
            orderType, 
            orderSubType, 
            plan, 
            priority, 
            assignedTo, 
            serverId, 
            n8nWorkflowId 
        } = body;

        let finalUserId = userId;
        let finalTeamId = teamId;

        if (!finalUserId || !finalTeamId) {
            const defaultUser = await db.query('SELECT id FROM "User" LIMIT 1') as any[];
            const defaultTeam = await db.query('SELECT id FROM "Team" LIMIT 1') as any[];
            finalUserId = finalUserId || defaultUser[0]?.id || '00000000-0000-0000-0000-000000000000';
            finalTeamId = finalTeamId || defaultTeam[0]?.id || '00000000-0000-0000-0000-000000000000';
        }

        const res = await db.query(`
            INSERT INTO "WorkflowOrder" 
            ("userId", "teamId", "workflowName", "amount", "status", "orderType", "orderSubType", "plan", "priority", "assignedTo", "serverId", "n8nWorkflowId", "logs")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
        `, [
            finalUserId, 
            finalTeamId, 
            workflowName || 'New Workflow Order', 
            amount !== undefined ? Number(amount) : 0,
            status || 'PAYMENT_RECEIVED',
            orderType || 'Marketplace',
            orderSubType || 'Workflow Purchase',
            plan || 'Startup',
            priority || 'MEDIUM',
            assignedTo || 'System Auto',
            serverId || null,
            n8nWorkflowId || null,
            JSON.stringify([{ message: 'Order manually created by administrator', level: 'info', at: new Date().toISOString() }])
        ]) as any[];

        return NextResponse.json({ success: true, id: res[0]?.id });
    } catch (error) {
        console.error('Error creating manual order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const body = await request.json();
        const { 
            id, 
            status, 
            workflowName, 
            serverId, 
            n8nWorkflowId, 
            amount, 
            addLogMessage,
            orderType,
            orderSubType,
            plan,
            priority,
            assignedTo
        } = body;

        await updateOrderDetails(id, {
            status,
            workflowName,
            serverId,
            n8nWorkflowId,
            amount: amount !== undefined && amount !== null ? Number(amount) : undefined,
            addLogMessage,
            orderType,
            orderSubType,
            plan,
            priority,
            assignedTo
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
        }

        // Fetch order to find associated workflow
        const [order] = await db.query('SELECT "workflowId" FROM "WorkflowOrder" WHERE id = $1', [id]) as any[];
        
        // Delete related order events
        await db.execute('DELETE FROM "OrderEvent" WHERE "orderId" = $1', [id]);
        
        // Delete the order itself
        await db.execute('DELETE FROM "WorkflowOrder" WHERE id = $1', [id]);

        // Delete associated workflow if present
        if (order?.workflowId) {
            await db.execute('DELETE FROM "Workflow" WHERE id = $1', [order.workflowId]);
        }
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}

