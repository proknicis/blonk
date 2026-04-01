import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

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

        // Use sovereign DB helper for PostgreSQL compatibility
        const rows = await db.query(
            'SELECT id, email, name, "firmName", password FROM "User" WHERE email = $1 LIMIT 1',
            [email],
        );

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

    } catch (error) {
        console.error("[auth/login] Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
