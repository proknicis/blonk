const { Pool } = require('pg'); 
require('dotenv').config(); 
const pool = new Pool({ connectionString: process.env.DATABASE_URL }); 
async function run() { 
    console.log("OperationalSetting:", (await pool.query(`SELECT * FROM "OperationalSetting"`)).rows);
    await pool.end(); 
} 
run().catch(console.dir);
