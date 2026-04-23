const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        console.log('--- TABLE: WorkflowLog ---');
        const resLog = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'WorkflowLog'");
        console.log(resLog.rows.map(r => r.column_name).join(', '));

        console.log('\n--- TABLE: Workflow ---');
        const resWf = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Workflow'");
        console.log(resWf.rows.map(r => r.column_name).join(', '));
    } catch (e) {
        console.error('FAILED:', e.message);
    } finally {
        await pool.end();
    }
}

check();
