"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateOperatorRole(userId: string, newRole: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const teamId = (session.user as any).teamId;

    await db.query(`UPDATE "User" SET role = $1 WHERE id = $2 AND "teamId" = $3`, [newRole, userId, teamId]);
    revalidatePath("/dashboard/operators");
}

export async function decommissionOperator(userId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");
    const teamId = (session.user as any).teamId;

    // We can simulate decommissioning by removing them from the team, or setting a status.
    // Since we don't have a status field in User table, we can just remove them from the team for now,
    // or change their role to 'DECOMMISSIONED' if we want to retain the record.
    await db.query(`UPDATE "User" SET role = 'DECOMMISSIONED' WHERE id = $1 AND "teamId" = $2`, [userId, teamId]);
    revalidatePath("/dashboard/operators");
}
