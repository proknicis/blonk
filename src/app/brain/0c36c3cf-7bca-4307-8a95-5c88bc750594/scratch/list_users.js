const { Pool } = require('pg');
require('dotenv').config();

async function list() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Listing all users...");
        const res = await pool.query("SELECT id, name, email, role, \"teamId\" FROM \"User\"");
        console.table(res.rows);
    } catch (err) {
        console.error("Fetch failed:", err);
    } finally {
        await pool.end();
    }
}

list();
