import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await db.execute('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "workflows" JSONB DEFAULT \'[]\'::jsonb');
        return NextResponse.json({ success: true, message: "Database schema synchronized. Workflows column verified." });
    } catch (error: any) {
        console.error("Schema sync failure:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
