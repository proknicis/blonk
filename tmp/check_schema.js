require('dotenv').config();
const { Pool } = require('pg');

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'WorkflowTemplate'
            ORDER BY ordinal_position
        `);
        console.log('Schema:', JSON.stringify(res.rows, null, 2));

        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', JSON.stringify(tables.rows, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

checkSchema();
