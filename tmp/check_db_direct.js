require('dotenv').config();
const { Pool } = require('pg');

async function checkTemplates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        const res = await pool.query('SELECT * FROM "WorkflowTemplate"');
        console.log('Templates Count:', res.rowCount);
        console.log('Templates:', JSON.stringify(res.rows, null, 2));

        const workflowRes = await pool.query('SELECT * FROM "Workflow"');
        console.log('Workflows Count:', workflowRes.rowCount);
        console.log('Workflows:', JSON.stringify(workflowRes.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkTemplates();
