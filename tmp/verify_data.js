const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    try {
        const templates = await pool.query('SELECT COUNT(*) FROM "WorkflowTemplate"');
        console.log('Templates Count:', templates.rows[0].count);

        const workflows = await pool.query('SELECT COUNT(*) FROM "Workflow"');
        console.log('Active Workflows Count:', workflows.rows[0].count);
        
        const logs = await pool.query('SELECT COUNT(*) FROM "WorkflowLog"');
        console.log('Logs Count:', logs.rows[0].count);

        const samples = await pool.query('SELECT name, sector FROM "WorkflowTemplate" LIMIT 3');
        console.log('Sample Templates:', samples.rows);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await pool.end();
    }
}

check();
