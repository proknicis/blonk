import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = (session.user as any).id;
        const userRole = (session.user as any).role;
        let teamId = (session.user as any).teamId;

        const body = await req.json();
        const { industry, teamSize, region, practiceArea, firmName } = body;

        // 1. Update User Profile
        await db.query(
            'UPDATE "User" SET industry = $1 WHERE id = $2',
            [industry || 'General', userId]
        );

        // 2. Create Team if none exists (for Owners)
        if (!teamId && userRole === 'OWNER') {
            const finalTeamName = `${session.user.name}'s Command Node`;
            const teamRes = await db.query(
                'INSERT INTO "Team" (name, "firmName", "ownerId") VALUES ($1, $2, $3) RETURNING id',
                [finalTeamName, firmName || industry || 'Institutional Firm', userId]
            ) as any[];
            teamId = teamRes[0].id;
        }

        // 3. Mark Onboarding as COMPLETED and link Team
        if (teamId) {
            await db.execute(
                'UPDATE "User" SET "teamId" = $1, "onboardingStatus" = $2 WHERE id = $3', 
                [teamId, 'COMPLETED', userId]
            );
        } else {
            await db.execute(
                'UPDATE "User" SET "onboardingStatus" = $1 WHERE id = $2', 
                ['COMPLETED', userId]
            );
        }

        return NextResponse.json({ success: true, teamId });
    } catch (error: any) {
        console.error("Setup completion error:", error);
        return NextResponse.json({ error: "Failed to complete setup" }, { status: 500 });
    }
}
