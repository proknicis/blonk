const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('Adjusting Workflow table constraints for multi-tenancy...');
        
        // Drop old single-name unique constraint
        await pool.query('ALTER TABLE "Workflow" DROP CONSTRAINT IF EXISTS "Workflow_name_key"');
        
        // Add new composite unique constraint
        await pool.query('ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_name_teamId_key" UNIQUE (name, "teamId")');
        
        console.log('Migration complete: (name, teamId) is now unique.');
        
    } catch (e) {
        console.error('Migration failed (maybe already applied):', e.message);
    } finally {
        await pool.end();
    }
}

migrate();
