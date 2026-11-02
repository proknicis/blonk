const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        
        console.log('🧬 Provisioning AIEmployeeTemplate table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "AIEmployeeTemplate" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                "suggestedName" VARCHAR(100),
                "defaultPermissions" JSONB DEFAULT '{}',
                "brainTemplateId" UUID NOT NULL REFERENCES "BrainTemplate"(id) ON DELETE CASCADE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Find the seeded brain templates
        const brainsRes = await client.query('SELECT id, name FROM "BrainTemplate"');
        const brains = brainsRes.rows;

        const financeBrain = brains.find(b => b.name.includes('Finance'));
        const supportBrain = brains.find(b => b.name.includes('Support'));

        if (financeBrain) {
            console.log('Seeding Finance Assistant AI Employee Template...');
            const perms = JSON.stringify({
                "Invoices": true,
                "Stripe": true,
                "Bank": true,
                "Accounting": true,
                "HR Files": false,
                "Contracts": false
            });
            await client.query(`
                INSERT INTO "AIEmployeeTemplate" (name, description, "suggestedName", "defaultPermissions", "brainTemplateId")
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (name) DO UPDATE 
                SET description = $2, "suggestedName" = $3, "defaultPermissions" = $4, "brainTemplateId" = $5
            `, [
                'Finance Assistant', 
                'Processes vendor invoices, reconciles Stripe payments, coordinates bookkeeping entries, and handles reflection audits.', 
                'Finance AI', 
                perms, 
                financeBrain.id
            ]);
        }

        if (supportBrain) {
            console.log('Seeding Customer Support AI Employee Template...');
            const perms = JSON.stringify({
                "Knowledge Base": true,
                "Gmail": true,
                "Tickets": true,
                "Finance": false
            });
            await client.query(`
                INSERT INTO "AIEmployeeTemplate" (name, description, "suggestedName", "defaultPermissions", "brainTemplateId")
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (name) DO UPDATE 
                SET description = $2, "suggestedName" = $3, "defaultPermissions" = $4, "brainTemplateId" = $5
            `, [
                'Customer Support', 
                'Scans incoming ticket queues, searches Company Brain documents, drafts proposed email replies, and flags complex inquiries.', 
                'Support AI', 
                perms, 
                supportBrain.id
            ]);
        }

        console.log('✅ Migration of AIEmployeeTemplate completed successfully!');
    } catch (e) {
        console.error('Migration failed:', e.stack || e);
    } finally {
        await client.end();
    }
}
run();
