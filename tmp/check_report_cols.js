const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkReportColumns() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'Report'
    `);
    console.log(res.rows.map(r => r.column_name).join(', '));
    await client.end();
}

checkReportColumns().catch(console.error);
