const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        await pool.query('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "serverId" UUID');
        await pool.query('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "templateId" UUID');
        console.log('[MIGRATION] ✓ Added "serverId" and "templateId" columns to Workflow table');
    } catch (e) {
        console.error('[MIGRATION] FAILED:', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
