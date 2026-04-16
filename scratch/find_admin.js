const { Pool } = require('pg');
require('dotenv').config();

async function findAdmin() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const res = await pool.query('SELECT name, email, plan FROM "User" WHERE plan = \'SuperAdmin\'');
        console.log('Super Admin Users:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error finding admin:', err);
    } finally {
        await pool.end();
    }
}

findAdmin();
