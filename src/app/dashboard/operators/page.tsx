import React from "react";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OperatorsClient from "./OperatorsClient";

export const metadata = {
    title: "Operator Directory | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

export default async function OperatorsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let operators: any[] = [];
    try {
        const users = await db.query(`SELECT id, name, email, role, "lastSeen" FROM "User" WHERE "teamId" = $1`, [teamId]) as any[];
        
        operators = users.map(u => {
            const lastSeenDate = new Date(u.lastSeen);
            const now = new Date();
            const diffMins = Math.floor((now.getTime() - lastSeenDate.getTime()) / 60000);
            
            let status = "Active";
            if (diffMins > 43200) status = "Suspended"; // > 30 days
            else if (diffMins > 10080) status = "Pending"; // > 7 days

            let lastActionStr = "Just now";
            if (diffMins > 0 && diffMins < 60) lastActionStr = `${diffMins} mins ago`;
            else if (diffMins >= 60 && diffMins < 1440) lastActionStr = `${Math.floor(diffMins/60)} hours ago`;
            else if (diffMins >= 1440) lastActionStr = `${Math.floor(diffMins/1440)} days ago`;

            let accessLevel = "Standard Access";
            if (u.role === 'OWNER') accessLevel = "Full System Access";
            if (u.role === 'ADMIN') accessLevel = "Operations & Governance";
            if (u.role === 'EDITOR') accessLevel = "Provisioning Only";
            if (u.role === 'VIEWER') accessLevel = "Read-Only Audit";

            return {
                id: u.id,
                name: u.name || "Unknown Operator",
                email: u.email,
                role: u.role || "VIEWER",
                accessLevel: accessLevel,
                assignedNodes: Math.floor(Math.random() * 10), // Mocked for now until node assignment is modeled
                status: status,
                lastAction: lastActionStr
            };
        });

    } catch (e) {
        console.error("Failed to fetch operators:", e);
    }

    return (
        <OperatorsClient initialOperators={operators} />
    );
}
