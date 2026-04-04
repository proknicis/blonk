const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('🏛️ Connected to Database for V2 migration.');

        // Add featured boolean to WorkflowTemplate
        await client.query(`
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN DEFAULT FALSE;
        `);
        
        console.log('✅ Column "featured" added to "WorkflowTemplate" successfully.');

    } catch (err) {
        console.error('❌ V2 Migration failure:', err);
    } finally {
        await client.end();
    }
}

migrate();
