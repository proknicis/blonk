const { Pool } = require('pg'); 
require('dotenv').config(); 
const pool = new Pool({ connectionString: process.env.DATABASE_URL }); 
async function run() { 
    const tables = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`); 
    for (let row of tables.rows) { 
        const cols = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`, [row.table_name]); 
        console.log('Table:', row.table_name);
        console.log(cols.rows); 
    } 
    await pool.end(); 
} 
run().catch(console.dir);
