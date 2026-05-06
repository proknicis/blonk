const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log('--- STARTING SOVEREIGN DATABASE ENRICHMENT ---');
        
        // Add workflows column if it doesn't exist
        await pool.query(`
            ALTER TABLE "User" 
            ADD COLUMN IF NOT EXISTS workflows JSONB DEFAULT '[]'::jsonb;
        `);
        
        console.log('--- DATABASE SUCCESSFULLY ENRICHED WITH WORKFLOW PROVISIONING ---');
    } catch (err) {
        console.error('Migration failure:', err);
    } finally {
        await pool.end();
    }
}

migrate();
