const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        const res = await pool.query('SELECT "workflowName", "workflowId", "createdAt" FROM "WorkflowLog" ORDER BY "createdAt" DESC LIMIT 10');
        console.log('--- RECENT LOGS ---');
        console.log(JSON.stringify(res.rows, null, 2));
        
        const count = await pool.query('SELECT COUNT(*) FROM "WorkflowLog" WHERE "createdAt" > CURRENT_TIMESTAMP - INTERVAL \'24 hours\'');
        console.log(`Logs in last 24h: ${count.rows[0].count}`);
    } catch (e) {
        console.error('FAILED:', e.message);
    } finally {
        await pool.end();
    }
}

check();
