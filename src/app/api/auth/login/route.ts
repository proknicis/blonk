import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginBody = { email?: unknown; password?: unknown };

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as LoginBody;
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const password = typeof body.password === "string" ? body.password : "";

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 },
            );
        }

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            console.error("[auth/login] Missing DATABASE_URL");
            return NextResponse.json({ error: "Server not configured" }, { status: 500 });
        }

        const connection = await mysql.createConnection(databaseUrl);
        try {
            const [rows] = (await connection.execute(
                "SELECT id, email, name, firmName, password FROM User WHERE email = ? LIMIT 1",
                [email],
            )) as unknown as [{ id: string; email: string; name: string; firmName: string | null; password: string }[]];

            const user = rows?.[0];
            if (!user) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            return NextResponse.json({
                message: "Login successful",
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    firmName: user.firmName,
                },
            });
        } finally {
            await connection.end().catch(() => {});
        }

    } catch (error) {
        console.error("[auth/login] Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
