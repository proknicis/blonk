import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config(); // fallback
import { db } from '../src/lib/db';

async function run() {
    try {
        await db.execute(`
            CREATE TYPE "OrderStatus" AS ENUM (
                'PAYMENT_RECEIVED',
                'SERVER_CREATING',
                'SERVER_READY',
                'WORKFLOW_IMPORTED',
                'WAITING_CREDENTIALS',
                'CREDENTIALS_RECEIVED',
                'ADMIN_SETUP',
                'TESTING',
                'COMPLETED',
                'FAILED'
            );
        `).catch(e => console.log('Enum exists', e.message));

        await db.execute(`
            CREATE TABLE IF NOT EXISTS "Order" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID REFERENCES "Team"(id) ON DELETE CASCADE,
                "workflowName" VARCHAR NOT NULL,
                "price" INTEGER NOT NULL,
                "status" "OrderStatus" DEFAULT 'PAYMENT_RECEIVED',
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('DB Updated');
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
