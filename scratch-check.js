require('dotenv').config();
const { Pool } = require('pg');

async function main() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
        const res = await client.query('SELECT * FROM "WorkflowTemplate" LIMIT 1');
        if (res.rows.length > 0) {
            console.log("WorkflowTemplate Columns:", Object.keys(res.rows[0]));
            console.log("WorkflowTemplate Row 0:", res.rows[0]);
        } else {
            console.log("No templates found");
        }
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        await pool.end();
    }
}

main();
