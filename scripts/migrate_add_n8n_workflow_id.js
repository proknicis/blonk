const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        await pool.query('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "n8nWorkflowId" VARCHAR(255)');
        console.log('[MIGRATION] ✓ Added "n8nWorkflowId" column to Workflow table');
        // Also mark existing workflows without n8nWorkflowId as Pending
        const res = await pool.query('UPDATE "Workflow" SET status = \'Pending\' WHERE "n8nWorkflowId" IS NULL AND status = \'Ready\'');
        console.log(`[MIGRATION] ✓ Marked ${res.rowCount} workflows as Pending (awaiting admin setup)`);
    } catch (e) {
        console.error('[MIGRATION] FAILED:', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
