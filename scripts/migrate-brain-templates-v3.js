const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('🏛️ Connecting to PostgreSQL Gateway for Brain Templates v3 Migration...');

    try {
        await client.connect();

        console.log('🧬 Creating Brain Library table schemas...');

        await client.query(`
            -- 1. BrainTemplate Table
            CREATE TABLE IF NOT EXISTS "BrainTemplate" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE,
                description TEXT,
                version VARCHAR(50) DEFAULT '1.0.0',
                category VARCHAR(100),
                "workflowId" VARCHAR(255),
                "mainWorkflowId" VARCHAR(255),
                published BOOLEAN DEFAULT FALSE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 2. CustomerBrain Table
            CREATE TABLE IF NOT EXISTS "CustomerBrain" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE,
                "brainTemplateId" UUID NOT NULL REFERENCES "BrainTemplate"(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'Installed',
                "installedVersion" VARCHAR(50) DEFAULT '1.0.0',
                "installedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_team_brain UNIQUE ("teamId", "brainTemplateId")
            );

            -- 3. BrainWorkflow Table
            CREATE TABLE IF NOT EXISTS "BrainWorkflow" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "brainTemplateId" UUID NOT NULL REFERENCES "BrainTemplate"(id) ON DELETE CASCADE,
                "workflowId" VARCHAR(255) NOT NULL,
                "workflowName" VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL -- 'Main', 'Subagent', 'Trigger', 'Approval', 'Reflection'
            );

            -- 4. BrainDeployment Table
            CREATE TABLE IF NOT EXISTS "BrainDeployment" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE,
                "brainTemplateId" UUID NOT NULL REFERENCES "BrainTemplate"(id) ON DELETE CASCADE,
                "deploymentStatus" VARCHAR(50) DEFAULT 'Active',
                "n8nServer" VARCHAR(255),
                "executionMode" VARCHAR(50) DEFAULT 'Standard',
                "lastUpdated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT unique_team_deployment UNIQUE ("teamId", "brainTemplateId")
            );
        `);

        console.log('✅ Migration succeeded! Brain Templates v3 tables are provisioned.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

runMigration();
