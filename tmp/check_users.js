require('dotenv').config();
const { Pool } = require('pg');

async function checkUsers() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const res = await pool.query('SELECT id, email, "teamId", role FROM "User"');
        console.log('Users:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkUsers();
