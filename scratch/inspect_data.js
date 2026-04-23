
const { Pool } = require('pg');
require('dotenv').config();

async function checkData() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        const userRes = await pool.query('SELECT * FROM "User" LIMIT 1');
        console.log('User Columns:', userRes.fields.map(f => f.name));
        console.log('Sample User:', JSON.stringify(userRes.rows[0], null, 2));

        const wfRes = await pool.query('SELECT * FROM "Workflow" LIMIT 1');
        console.log('Workflow Columns:', wfRes.fields.map(f => f.name));
    } catch (err) {
        console.error('Error checking data:', err);
    } finally {
        await pool.end();
    }
}

checkData();
