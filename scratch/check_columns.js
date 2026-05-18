const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://myuser:mypassword@127.0.0.1:5432/mydb',
        ssl: false
    });

    try {
        for (const table of ['ClusterNode', 'Team', 'Workflow', 'User']) {
            console.log(`Checking table structure for '${table}'...`);
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
            `);
            console.log("Columns found:");
            res.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));
            console.log("\n");
        }
    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await pool.end();
    }
}

check();
