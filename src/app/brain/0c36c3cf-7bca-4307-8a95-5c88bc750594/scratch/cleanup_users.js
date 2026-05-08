const { Pool } = require('pg');
require('dotenv').config();

async function cleanup() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Cleaning up incorrect users...");
        const res = await pool.query("DELETE FROM \"User\" WHERE email = 'admin@blonk.ai' OR email = 'user@blonk.ai'");
        console.log("Deleted rows:", res.rowCount);
    } catch (err) {
        console.error("Cleanup failed:", err);
    } finally {
        await pool.end();
    }
}

cleanup();
