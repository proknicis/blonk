const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkReportSchema() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'Report'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

checkReportSchema().catch(console.error);
