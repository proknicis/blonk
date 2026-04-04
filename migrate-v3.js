const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('🏛️ Connected to Database for V3 Multi-User migration.');

        // 1. Remove Unique constraint on Workflow.name
        // In Postgres, we need to find the constraint name or just DROP it if we know it.
        // Usually it is Workflow_name_key
        try {
            await client.query('ALTER TABLE "Workflow" DROP CONSTRAINT IF EXISTS "Workflow_name_key"');
            console.log('✅ Removed UNIQUE constraint from "Workflow".name');
        } catch (e) {
            console.log('⚠️ Could not drop constraint (might not exist or have different name):', e.message);
        }

        // 2. Add userId to Workflow
        await client.query('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "userId" UUID');
        console.log('✅ Added "userId" column to "Workflow"');

        // 3. Add workflowId to WorkflowLog
        await client.query('ALTER TABLE "WorkflowLog" ADD COLUMN IF NOT EXISTS "workflowId" UUID');
        console.log('✅ Added "workflowId" column to "WorkflowLog"');

    } catch (err) {
        console.error('❌ V3 Migration failure:', err);
    } finally {
        await client.end();
    }
}

migrate();
