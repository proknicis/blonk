import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ensureChatSchema } from "@/lib/chat-db";

export async function GET() {
    try {
        await ensureChatSchema();
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team context found.' }, { status: 401 });
        }

        const rows = await db.query(
            `SELECT * FROM "ChatConversation" WHERE "teamId" = $1 ORDER BY "updatedAt" DESC`,
            [teamId]
        );

        return NextResponse.json(rows);
    } catch (error: any) {
        console.error('[GET Conversations Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await ensureChatSchema();
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;
        const userId = (session?.user as any)?.id;

        if (!teamId || !userId) {
            return NextResponse.json({ error: 'Unauthorized. Active session and team required.' }, { status: 401 });
        }

        const body = await request.json();
        const { title } = body;

        const result = await db.query(
            `INSERT INTO "ChatConversation" ("teamId", "userId", title) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [teamId, userId, title || 'New Chat']
        );

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error('[POST Conversations Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await ensureChatSchema();
        const session = await getServerSession(authOptions);
        const teamId = (session?.user as any)?.teamId;

        if (!teamId) {
            return NextResponse.json({ error: 'Unauthorized. No active team context found.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing conversation ID parameter.' }, { status: 400 });
        }

        await db.execute(
            `DELETE FROM "ChatConversation" WHERE id = $1 AND "teamId" = $2`,
            [id, teamId]
        );

        return NextResponse.json({ success: true, message: 'Conversation deleted.' });
    } catch (error: any) {
        console.error('[DELETE Conversation Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
