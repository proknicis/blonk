import React from "react";
import { db } from "@/lib/db";
import SovereigntyClient from "./SovereigntyClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Sovereignty Settings | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

export default async function SovereigntyPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");

    const teamId = (session.user as any).teamId;
    if (!teamId) redirect("/setup");

    let residency: "eu-cloud" | "local" = "eu-cloud";
    let killSwitch = false;
    let apiKeys: any[] = [];

    try {
        const rows = await db.query(`SELECT key, value FROM "OperationalSetting" WHERE "teamId" = $1`, [teamId]) as any[];
        
        rows.forEach(row => {
            if (row.key === 'residency') {
                residency = (row.value === 'local' || row.value === 'eu-cloud') ? row.value : "eu-cloud";
            }
            if (row.key === 'kill_switch_armed') {
                killSwitch = row.value === 'true';
            }
            if (row.key.startsWith('apikey_')) {
                try {
                    const parsed = JSON.parse(row.value);
                    apiKeys.push(parsed);
                } catch(e) {
                    // if it wasn't json, handle gracefully
                }
            }
        });
    } catch(e) {
        console.error("Failed to fetch operational settings:", e);
    }

    return (
        <SovereigntyClient 
            initialResidency={residency}
            initialKillSwitch={killSwitch}
            initialKeys={apiKeys}
        />
    );
}
