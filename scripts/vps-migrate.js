const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('--- STARTING VPS DATABASE HARDENING ---');

        // 1. Ensure ClusterNode has all required columns
        console.log('Harden [ClusterNode] table...');
        await client.query(`
            ALTER TABLE "ClusterNode" 
            ADD COLUMN IF NOT EXISTS "max_workflows" INTEGER DEFAULT 100,
            ADD COLUMN IF NOT EXISTS "teamId" UUID;
        `);

        // 2. Ensure Workflow has all required columns
        console.log('Harden [Workflow] table...');
        await client.query(`
            ALTER TABLE "Workflow" 
            ADD COLUMN IF NOT EXISTS "serverId" UUID,
            ADD COLUMN IF NOT EXISTS "progress" INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS "errorMessage" TEXT;
        `);

        // 3. Ensure User has all required columns
        console.log('Harden [User] table...');
        await client.query(`
            ALTER TABLE "User" 
            ADD COLUMN IF NOT EXISTS "onboardingStatus" VARCHAR(50) DEFAULT 'COMPLETED',
            ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT 'MEMBER',
            ADD COLUMN IF NOT EXISTS "teamId" UUID,
            ADD COLUMN IF NOT EXISTS "tier" VARCHAR(50) DEFAULT 'Starter',
            ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'Active';
        `);

        // 4. Ensure WorkflowLog table is hardened
        console.log('Harden [WorkflowLog] table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "WorkflowLog" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "workflowName" VARCHAR(255),
                "workflowId" UUID,
                status VARCHAR(50),
                result JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            ALTER TABLE "WorkflowLog" ADD COLUMN IF NOT EXISTS "teamId" UUID;
        `);

        // 5. Ensure Team table exists (Minimal check)
        console.log('Verify [Team] table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Team" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                "ownerId" UUID,
                "firmName" VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('--- DATABASE HARDENING COMPLETE ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch(console.error);
