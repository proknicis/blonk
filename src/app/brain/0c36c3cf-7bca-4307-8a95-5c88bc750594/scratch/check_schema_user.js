const { Pool } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Checking ALL columns for table 'User'...");
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'User'");
        console.log(res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error("Schema check failed:", err);
    } finally {
        await pool.end();
    }
}

checkSchema();
