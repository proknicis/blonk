const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function inspectTable(tableName) {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position;
        `, [tableName]);
        console.log(`Exact columns in ${tableName}:`);
        res.rows.forEach(row => console.log(`'${row.column_name}'`));
    } finally {
        client.release();
    }
}

async function main() {
    await inspectTable('Workflow');
    await pool.end();
}

main().catch(console.error);
