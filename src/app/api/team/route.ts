import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamId = (session.user as any).teamId;
    if (!teamId) return NextResponse.json({ error: "No team associated" }, { status: 400 });

    try {
        const members = await db.query(
            'SELECT id, name, email, role, "lastSeen", "lastActivity" FROM "User" WHERE "teamId" = $1 ORDER BY role DESC',
            [teamId]
        );
        return NextResponse.json({ members });
    } catch (error) {
        console.error("Team fetch error:", error);
        return NextResponse.json({ error: "Institutional fetch failure" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { action, teamName, firmName } = body;

    // INITIAL TEAM CREATION FOR OWNERS
    if (action === 'CREATE_TEAM') {
        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;
        
        if (userRole !== 'OWNER') return NextResponse.json({ error: "Only Owners can initialize a team" }, { status: 403 });

        try {
            const finalTeamName = teamName || `${session.user.name}'s Command Node`;
            const teamRes = await db.query(
                'INSERT INTO "Team" (name, "firmName", "ownerId") VALUES ($1, $2, $3) RETURNING id',
                [finalTeamName, firmName || 'Institutional Firm', userId]
            ) as any[];
            const teamId = teamRes[0].id;

            await db.execute('UPDATE "User" SET "teamId" = $1, "onboardingStatus" = $2 WHERE id = $3', [teamId, 'COMPLETED', userId]);
            
            return NextResponse.json({ success: true, teamId });
        } catch (error) {
            console.error("Team initialization failure", error);
            return NextResponse.json({ error: "Failed to initialize command node" }, { status: 500 });
        }
    }

    // REGULAR MEMBER PROVISIONING
    const teamId = (session.user as any).teamId;
    const userRole = (session.user as any).role;

    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return NextResponse.json({ error: "Insufficient Directive Authority" }, { status: 403 });
    }

    try {
        const { email, password, role, name } = body;
        if (!email) return NextResponse.json({ error: "Identity email required" }, { status: 400 });
        if (!password) return NextResponse.json({ error: "Password is required to provision an account" }, { status: 400 });
        if (!name) return NextResponse.json({ error: "Full name is required" }, { status: 400 });

        const emailRef = email.toLowerCase().trim();
        const existing = await db.query('SELECT id FROM "User" WHERE LOWER(email) = LOWER($1)', [emailRef]) as any[];
        if (existing.length > 0) return NextResponse.json({ error: "Operator identity already registered in fleet." }, { status: 400 });

        const ownerData = await db.query('SELECT "firmName" FROM "User" WHERE id = $1', [(session.user as any).id]) as any[];
        const inheritedFirm = ownerData[0]?.firmName || 'Legacy Firm Hub';

        const hashedPw = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO "User" (id, name, email, password, role, "teamId", "firmName", "onboardingStatus") VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [uuidv4(), name.trim(), emailRef, hashedPw, role || 'MEMBER', teamId, inheritedFirm, 'COMPLETED']
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Personnel provisioning failure" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamId = (session.user as any).teamId;
    const userRole = (session.user as any).role;

    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return NextResponse.json({ error: "Insufficient Directive Authority" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { memberId, role, workflows } = body;

        if (!memberId) return NextResponse.json({ error: "Member ID required" }, { status: 400 });

        // Verify target is in same team and not an OWNER (unless it's self, but usually owners don't edit themselves via this)
        const target = await db.query('SELECT id, role FROM "User" WHERE id = $1 AND "teamId" = $2', [memberId, teamId]) as any[];
        if (target.length === 0) return NextResponse.json({ error: "Operator not found in your team." }, { status: 404 });
        
        if (target[0].role === 'OWNER' && memberId !== (session.user as any).id) {
             return NextResponse.json({ error: "Cannot modify the team owner." }, { status: 403 });
        }

        const updates: string[] = [];
        const params: any[] = [];
        let i = 1;

        if (role) {
            updates.push(`role = $${i++}`);
            params.push(role);
        }
        if (workflows !== undefined) {
            updates.push(`workflows = $${i++}`);
            params.push(JSON.stringify(workflows));
        }

        if (updates.length === 0) return NextResponse.json({ error: "No updates provided" }, { status: 400 });

        params.push(memberId);
        await db.execute(`UPDATE "User" SET ${updates.join(', ')} WHERE id = $${i}`, params);

        return NextResponse.json({ success: true, message: "Operator profile updated." });
    } catch (error) {
        console.error("Member update failure", error);
        return NextResponse.json({ error: "Operator update failure" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const teamId = (session.user as any).teamId;
    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;

    if (userRole !== 'OWNER' && userRole !== 'ADMIN') {
        return NextResponse.json({ error: "Insufficient Directive Authority" }, { status: 403 });
    }

    try {
        const { memberId } = await req.json();
        if (!memberId) return NextResponse.json({ error: "Member ID required" }, { status: 400 });
        if (memberId === currentUserId) return NextResponse.json({ error: "Cannot remove yourself from the team." }, { status: 400 });

        // Verify target is in same team and not an OWNER
        const target = await db.query('SELECT id, role FROM "User" WHERE id = $1 AND "teamId" = $2', [memberId, teamId]) as any[];
        if (target.length === 0) return NextResponse.json({ error: "Operator not found in your team." }, { status: 404 });
        if (target[0].role === 'OWNER') return NextResponse.json({ error: "Cannot remove the team owner." }, { status: 403 });

        await db.query('DELETE FROM "User" WHERE id = $1', [memberId]);
        return NextResponse.json({ success: true, message: "Operator removed from team." });
    } catch (error) {
        console.error("Member removal failure", error);
        return NextResponse.json({ error: "Operator removal failure" }, { status: 500 });
    }
}
