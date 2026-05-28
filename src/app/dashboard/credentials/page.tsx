import React from "react";
import CredentialsClient from "./CredentialsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Credentials Vault | Sovereign Blonk",
};

export const dynamic = 'force-dynamic';

export default async function CredentialsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect("/login");
    }

    const teamId = (session.user as any).teamId;
    if (!teamId) {
        redirect("/setup");
    }

    return <CredentialsClient />;
}
