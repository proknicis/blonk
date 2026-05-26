const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('Starting DB column verification...');
        
        // 1. Add all expected columns to ClusterNode
        await client.query(`
            ALTER TABLE "ClusterNode" 
            ADD COLUMN IF NOT EXISTS url TEXT,
            ADD COLUMN IF NOT EXISTS api_key TEXT,
            ADD COLUMN IF NOT EXISTS max_workflows INTEGER DEFAULT 100,
            ADD COLUMN IF NOT EXISTS "teamId" UUID,
            ADD COLUMN IF NOT EXISTS "customerId" TEXT,
            ADD COLUMN IF NOT EXISTS "customerName" TEXT,
            ADD COLUMN IF NOT EXISTS "customerEmail" TEXT,
            ADD COLUMN IF NOT EXISTS "instanceId" TEXT,
            ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'manual',
            ADD COLUMN IF NOT EXISTS "region" TEXT,
            ADD COLUMN IF NOT EXISTS "ipAddress" TEXT,
            ADD COLUMN IF NOT EXISTS "sshKeyId" TEXT,
            ADD COLUMN IF NOT EXISTS "contaboInstanceId" TEXT
        `);
        console.log('✓ ClusterNode table hardened successfully.');

    } catch (e) {
        console.error('Hardening failed:', e);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
