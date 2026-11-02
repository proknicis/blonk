const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('Adding tier column to ClusterNode...');
        await client.query(`
            ALTER TABLE "ClusterNode" 
            ADD COLUMN IF NOT EXISTS "tier" VARCHAR(50) DEFAULT 'Standard';
        `);
        console.log('✓ ClusterNode table migrated successfully with tier column.');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
