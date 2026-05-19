import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');
        const fetchActivity = searchParams.get('activity') === 'true';

        if (userId && fetchActivity) {
            const logs = await db.query(`
                SELECT 
                    id,
                    "eventType" as action,
                    metadata,
                    "createdAt"
                FROM "Event" 
                WHERE "userId" = $1 
                ORDER BY "createdAt" DESC 
                LIMIT 50
            `, [userId]) as any[];

            // Map database events to UI-friendly activity logs
            const mappedLogs = logs.map(log => {
                let title = log.action.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                let description = 'System event recorded';
                
                if (log.metadata) {
                    const meta = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
                    if (meta.target) description = meta.target;
                    else if (meta.newRole) description = `Role updated to ${meta.newRole}`;
                    else if (meta.newStatus) description = `Status updated to ${meta.newStatus}`;
                }

                return {
                    title,
                    description,
                    createdAt: log.createdAt,
                    action: log.action
                };
            });

            return NextResponse.json(mappedLogs);
        }

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
        const { id, role, tier, status, totalSpend, action, subject, title, message, newPassword } = body;

        if (action === 'RESET_PASSWORD') {
            if (!id || !newPassword) return NextResponse.json({ error: "Missing ID or Password" }, { status: 400 });
            
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.execute('UPDATE "User" SET password = $1 WHERE id = $2', [hashedPassword, id]);
            
            await logAudit(id, 'password_reset', 'Admin reset user password');
            return NextResponse.json({ success: true });
        }

        if (action === 'SEND_EMAIL') {
            if (!id || !subject || !title || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
            
            try {
                const target = await db.query('SELECT email FROM "User" WHERE id = $1', [id]) as any[];
                if (target.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 });

                const { sendCustomEmail } = await import("@/lib/mail");
                await sendCustomEmail(target[0].email, subject, title, message);
                
                await logAudit(id, 'admin_mail', 'Admin sent system communication', { subject });
                return NextResponse.json({ success: true });
            } catch (err) {
                console.error("Admin mail failure:", err);
                return NextResponse.json({ error: "Email dispatch failure" }, { status: 500 });
            }
        }

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

                // Log specific changes
                if (role !== undefined) await logAudit(id, 'role_change', 'Admin Dashboard', { newRole: role });
                if (status !== undefined) await logAudit(id, 'admin_change', 'User Status Update', { newStatus: status });
                if (tier !== undefined) await logAudit(id, 'admin_change', 'Plan/Tier Update', { newTier: tier });
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
