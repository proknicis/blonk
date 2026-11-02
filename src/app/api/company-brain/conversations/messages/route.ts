import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ensureChatSchema } from "@/lib/chat-db";

export async function GET(request: Request) {
    try {
        await ensureChatSchema();
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team context found.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const conversationId = searchParams.get('conversationId');

        if (!conversationId) {
            return NextResponse.json({ error: 'Missing conversationId parameter.' }, { status: 400 });
        }

        // Verify the conversation belongs to the user's team
        const convCheck = await db.query(
            `SELECT 1 FROM "ChatConversation" WHERE id = $1 AND "teamId" = $2`,
            [conversationId, teamId]
        );

        if (convCheck.length === 0) {
            return NextResponse.json({ error: 'Conversation not found or access denied.' }, { status: 404 });
        }

        const rows = await db.query(
            `SELECT * FROM "ChatMessage" WHERE "conversationId" = $1 ORDER BY "createdAt" ASC`,
            [conversationId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[GET Messages Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
