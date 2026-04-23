const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        await pool.query('ALTER TABLE "WorkflowLog" ADD COLUMN IF NOT EXISTS "workflowId" UUID');
        console.log('[MIGRATION] ✓ Added "workflowId" column to WorkflowLog table');
    } catch (e) {
        console.error('[MIGRATION] FAILED:', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
