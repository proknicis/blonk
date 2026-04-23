
const { Pool } = require('pg');
require('dotenv').config();

async function addColumn() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        await pool.query('ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "n8nWorkflowId" text');
        console.log('Column "n8nWorkflowId" added or already exists.');
    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await pool.end();
    }
}

addColumn();
