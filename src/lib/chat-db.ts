import { db } from "./db";

export async function ensureChatSchema() {
    try {
        // Ensure conversations table exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS "ChatConversation" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL,
                "userId" UUID NOT NULL,
                title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Ensure messages table exists
        await db.execute(`
            CREATE TABLE IF NOT EXISTS "ChatMessage" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "conversationId" UUID NOT NULL REFERENCES "ChatConversation"(id) ON DELETE CASCADE,
                role VARCHAR(50) NOT NULL,
                content TEXT NOT NULL,
                sources JSONB DEFAULT '[]',
                "toolCalls" JSONB DEFAULT '[]',
                duration INT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
    } catch (e) {
        console.error("[CHAT_DB_MIGRATION_ERROR]", e);
    }
}
