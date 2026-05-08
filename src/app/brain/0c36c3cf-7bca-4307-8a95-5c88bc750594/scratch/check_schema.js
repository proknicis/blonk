const { Pool } = require('pg');
require('dotenv').config();

async function check() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Checking table structure for 'User'...");
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'User'
        `);
        console.log("Columns found:");
        res.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));
    } catch (err) {
        console.error("Check failed:", err);
    } finally {
        await pool.end();
    }
}

check();
