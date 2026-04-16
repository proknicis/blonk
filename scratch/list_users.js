const { Pool } = require('pg');
require('dotenv').config();

async function listUsers() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pool.query('SELECT name, email, role, plan FROM "User"');
        console.log('All Users:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error listing users:', err);
    } finally {
        await pool.end();
    }
}

listUsers();
