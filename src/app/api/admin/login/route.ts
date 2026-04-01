import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // In Postgres we use single quotes for string literals and double quotes for table names
        // Note: SuperAdmin check moved to plan column or logic if applicable
        const rows = await db.query(
            'SELECT id, name, plan FROM "User" WHERE email = $1 AND password = $2 AND plan = \'SuperAdmin\'',
            [email, password]
        );

        if (rows.length > 0) {
            const user = rows[0];
            const res = NextResponse.json({
                success: true,
                user: user
            });

            res.cookies.set("admin_token", `admin_${user.id}`, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });

            return res;
        } else {
            return NextResponse.json({ error: 'Invalid credentials or insufficient permissions' }, { status: 401 });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
}
