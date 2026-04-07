const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkData() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query(`
        SELECT status, message, "executedAt" 
        FROM "WorkflowLog" 
        ORDER BY "executedAt" DESC 
        LIMIT 5
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

checkData().catch(console.error);
