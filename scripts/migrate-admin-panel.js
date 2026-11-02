const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        console.log("Connected to database for admin panel migrations...");

        // 1. Create AIEmployee table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "AIEmployee" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                type VARCHAR(255) NOT NULL,
                "teamId" UUID NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE,
                "activeWorkflowId" UUID
            );
        `);
        console.log("AIEmployee table checked.");

        // 2. Enhance WorkflowTemplate table
        await client.query(`
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "category" VARCHAR(100);
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "maps_to_employee_type" VARCHAR(255);
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "n8n_workflow_id" VARCHAR(255);
        `);
        console.log("WorkflowTemplate columns enhanced.");

        // 3. Create CustomerWorkflowAssignment table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "CustomerWorkflowAssignment" (
                "teamId" UUID NOT NULL REFERENCES "Team"(id) ON DELETE CASCADE,
                "aiEmployeeId" UUID NOT NULL REFERENCES "AIEmployee"(id) ON DELETE CASCADE,
                "workflowTemplateId" UUID NOT NULL REFERENCES "WorkflowTemplate"(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'active',
                PRIMARY KEY ("teamId", "aiEmployeeId", "workflowTemplateId")
            );
        `);
        console.log("CustomerWorkflowAssignment table checked.");

        // 4. Update seed template mappings to map standard employee types
        // Let's seed "maps_to_employee_type" and "category" for existing templates
        await client.query(`
            UPDATE "WorkflowTemplate" SET 
                "category" = 'productivity',
                "maps_to_employee_type" = 'Support Manager',
                "n8n_workflow_id" = '1'
            WHERE name LIKE '%Billing%' OR name LIKE '%Invoice%' OR name LIKE '%Parsing%';

            UPDATE "WorkflowTemplate" SET 
                "category" = 'crm',
                "maps_to_employee_type" = 'Sales Manager',
                "n8n_workflow_id" = '2'
            WHERE name LIKE '%CRM%' OR name LIKE '%Sync%' OR name LIKE '%Customer%' OR name LIKE '%Intake%';

            UPDATE "WorkflowTemplate" SET 
                "category" = 'ai',
                "maps_to_employee_type" = 'Support Manager',
                "n8n_workflow_id" = '3'
            WHERE name LIKE '%Support%' OR name LIKE '%Ticket%' OR name LIKE '%Routing%';
        `);
        console.log("Seeded basic employee mappings on templates.");

        console.log("Admin migrations complete!");
    } catch (err) {
        console.error("Migration error:", err);
    } finally {
        await client.end();
    }
}

run();
