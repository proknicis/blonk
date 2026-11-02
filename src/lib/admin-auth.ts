import { cookies } from 'next/headers';
import { db } from "@/lib/db";

export async function getAdminSession() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('admin_token')?.value;

        if (!token || !token.startsWith('admin_')) {
            return null;
        }

        const adminId = token.split('_')[1];
        const rows = await db.query(
            'SELECT id, name, email, plan as role, status FROM "User" WHERE id = $1 AND plan IN (\'SuperAdmin\', \'SupportStaff\') LIMIT 1',
            [adminId]
        ) as any[];

        if (rows.length === 0 || rows[0].status === 'Suspended' || rows[0].status === 'Disabled') {
            return null;
        }

        return rows[0]; // returns user with id, name, email, role, status
    } catch (e) {
        console.error("getAdminSession error:", e);
        return null;
    }
}
