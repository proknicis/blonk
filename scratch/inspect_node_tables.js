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
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = $1
            ORDER BY ordinal_position;
        `, [tableName]);
        console.log(`Columns in ${tableName}:`);
        res.rows.forEach(row => console.log(`- ${row.column_name} (${row.data_type})`));
    } finally {
        client.release();
    }
}

async function main() {
    await inspectTable('ClusterNode');
    console.log('');
    await inspectTable('Team');
    await pool.end();
}

main().catch(console.error);
