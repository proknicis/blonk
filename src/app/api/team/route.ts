import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamId = (session.user as any).teamId;
    if (!teamId) return NextResponse.json({ error: "No team associated" }, { status: 400 });

    try {
        const members = await db.query(
            'SELECT id, name, email, role FROM "User" WHERE "teamId" = $1 ORDER BY role DESC',
            [teamId]
        );
        return NextResponse.json({ members });
    } catch (error) {
        return NextResponse.json({ error: "Institutional fetch failure" }, { status: 500 });
    }
}

import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamId = (session.user as any).teamId;
    const userRole = (session.user as any).role;

    // Direct Provisioning requires Institutional Authority (OWNER/ADMIN)
    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return NextResponse.json({ error: "Insufficient Directive Authority" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { email, password, role, name } = body;

        if (!email) return NextResponse.json({ error: "Identity email required" }, { status: 400 });

        const emailRef = email.toLowerCase();

        // 1. Check if user already exists
        const existing = await db.query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [emailRef]) as any[];
        if (existing.length > 0) {
            return NextResponse.json({ error: "Operator identity already registered in fleet." }, { status: 400 });
        }

        if (password) {
            // DIRECT PROVISIONING: Create the User account now
            const hashedPw = await bcrypt.hash(password, 10);
            await db.query(
                'INSERT INTO "User" (name, email, password, role, "teamId", "onboardingStatus") VALUES ($1, $2, $3, $4, $5, $6)',
                [name || 'Co-Pilot Operator', emailRef, hashedPw, role || 'MEMBER', teamId, 'COMPLETED']
            );
            return NextResponse.json({ success: true, message: "Sovereign Co-Pilot account successfully provisioned." });
        } else {
            // INVITATION SIGNAL: (Legacy Fallback)
            const token = uuidv4();
            await db.query(
                'INSERT INTO "TeamInvitation" ("teamId", email, token, role) VALUES ($1, $2, $3, $4)',
                [teamId, emailRef, token, role || 'MEMBER']
            );
            return NextResponse.json({ success: true, message: "Invitation signal dispatched." });
        }
    } catch (error) {
        console.error("Direct Prospecting failure", error);
        return NextResponse.json({ error: "Personnel provisioning failure" }, { status: 500 });
    }
}
