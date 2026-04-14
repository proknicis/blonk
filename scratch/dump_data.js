const { Pool } = require('pg'); 
require('dotenv').config(); 
const pool = new Pool({ connectionString: process.env.DATABASE_URL }); 
async function run() { 
    console.log("Kpi:"); console.log((await pool.query(`SELECT * FROM "Kpi"`)).rows);
    console.log("ChartData:"); console.log((await pool.query(`SELECT * FROM "ChartData"`)).rows);
    console.log("Workflow Logs Count:", (await pool.query(`SELECT count(*) FROM "WorkflowLog"`)).rows);
    console.log("Workflows Count:", (await pool.query(`SELECT count(*) FROM "Workflow"`)).rows);
    await pool.end(); 
} 
run().catch(console.dir);
