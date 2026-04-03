import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // 1. Fetch administrative user from PostgreSQL
        const rows = await db.query(
            'SELECT id, name, plan, password FROM "User" WHERE email = $1 AND plan = \'SuperAdmin\' LIMIT 1',
            [email]
        ) as any[];

        if (rows.length > 0) {
            const user = rows[0];

            // 2. Cryptographic identity verification
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Administrative credential failure' }, { status: 401 });
            }

            const res = NextResponse.json({
                success: true,
                user: { id: user.id, name: user.name }
            });

            // 3. Establish sovereign session token
            res.cookies.set("admin_token", `admin_${user.id}`, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
            });

            return res;
        } else {
            return NextResponse.json({ error: 'Unauthorized Administrative Access' }, { status: 401 });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ error: 'System error' }, { status: 500 });
    }
}
