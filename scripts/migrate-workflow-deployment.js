const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('--- STARTING WORKFLOW DEPLOYMENT SCHEMA MIGRATION ---');

        // 1. Create CustomerWorkflowDeployment table
        console.log('Creating [CustomerWorkflowDeployment] table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "CustomerWorkflowDeployment" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE,
                "blueprintId" UUID NOT NULL REFERENCES "WorkflowTemplate"(id) ON DELETE CASCADE,
                "serverId" UUID NOT NULL REFERENCES "ClusterNode"(id) ON DELETE CASCADE,
                "n8nWorkflowId" VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'active',
                "deployedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Add template_source & n8n_master_workflow_id to WorkflowTemplate
        console.log('Adding template source columns to [WorkflowTemplate]...');
        await client.query(`
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "template_source" TEXT;
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "n8n_master_workflow_id" VARCHAR(255);
        `);

        console.log('--- MIGRATION COMPLETE ---');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(console.error);
