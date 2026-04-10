import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    try {
        const rows = await db.query(`
            SELECT 
                id, 
                name, 
                email, 
                "firmName", 
                plan as role,
                tier,
                "totalSpend",
                "lastActive",
                status,
                "workflowsUsed",
                "updatedAt" as "createdAt" 
            FROM "User" 
            ORDER BY "updatedAt" DESC
        `);
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, role, tier, status, totalSpend } = body;

        if (id) {
            // Update user business fields
            const updates = [];
            const params = [];
            let i = 1;

            if (role !== undefined) { updates.push(`plan = $${i++}`); params.push(role); }
            if (tier !== undefined) { updates.push(`tier = $${i++}`); params.push(tier); }
            if (status !== undefined) { updates.push(`status = $${i++}`); params.push(status); }
            if (totalSpend !== undefined) { updates.push(`"totalSpend" = $${i++}`); params.push(totalSpend); }

            if (updates.length > 0) {
                params.push(id);
                await db.execute(
                    `UPDATE "User" SET ${updates.join(', ')} WHERE id = $${i}`,
                    params
                );
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // PostgreSQL uses single quotes for strings
        await db.execute('DELETE FROM "User" WHERE id = $1 AND plan != \'SuperAdmin\'', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
