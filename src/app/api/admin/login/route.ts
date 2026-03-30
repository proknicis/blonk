import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute(
            'SELECT id, name, role FROM User WHERE email = ? AND password = ? AND role = "SuperAdmin"',
            [email, password]
        ) as any[];

        await connection.end();

        if (rows.length > 0) {
            const res = NextResponse.json({
                success: true,
                user: rows[0]
            });

            res.cookies.set("admin_token", `admin_${rows[0].id}`, {
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
