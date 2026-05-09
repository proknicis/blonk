const { Pool } = require('pg');
require('dotenv').config();

async function getTeamId() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        const res = await pool.query('SELECT "teamId" FROM "User" WHERE email = $1 LIMIT 1', ['proknicis@gmail.com']);
        console.log(JSON.stringify(res.rows[0]));
    } catch (err) {
        console.error("Query failed:", err);
    } finally {
        await pool.end();
    }
}

getTeamId();
