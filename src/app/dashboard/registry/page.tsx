import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import RegistryClient from "./RegistryClient";

export const metadata = { title: "Workflow Registry — BLONK" };
export const dynamic = "force-dynamic";

export default async function RegistryPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;

    let workflows: any[] = [];
    if (teamId) {
        try {
            workflows = await db.query(
                `SELECT
                    id::text,
                    name,
                    status,
                    trigger,
                    "updatedAt"
                 FROM "Workflow"
                 WHERE "teamId" = $1
                 ORDER BY "updatedAt" DESC
                 LIMIT 20`,
                [teamId]
            );
        } catch (e) {
            console.error("[RegistryPage] DB error:", e);
        }
    }

    return <RegistryClient workflows={workflows} />;
}
