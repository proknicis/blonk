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

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamId = (session.user as any).teamId;
    const userRole = (session.user as any).role;

    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return NextResponse.json({ error: "Insufficient Directive Authority" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { email, role } = body;

        if (!email) return NextResponse.json({ error: "Target email required" }, { status: 400 });

        // Generate invitation signal
        const token = uuidv4();
        await db.query(
            'INSERT INTO "TeamInvitation" ("teamId", email, token, role) VALUES ($1, $2, $3, $4)',
            [teamId, email.toLowerCase(), token, role || 'MEMBER']
        );

        // NOTE: In a production environment, this would trigger a professional email dispatch.
        console.log(`[SOVEREIGN INVITE] Signal generated for ${email}: ${token}`);

        return NextResponse.json({ success: true, message: "Invitation signal successfully dispatched." });
    } catch (error) {
        return NextResponse.json({ error: "Invitation pulse failure" }, { status: 500 });
    }
}
