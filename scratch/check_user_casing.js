const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function checkCasing() {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'User'
            ORDER BY ordinal_position;
        `);
        console.log('Exact column names in User:');
        res.rows.forEach(row => console.log(`'${row.column_name}'`));
    } finally {
        client.release();
        await pool.end();
    }
}

checkCasing().catch(console.error);
