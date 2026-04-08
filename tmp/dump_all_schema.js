const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    // Get all columns from any table named 'Report' or 'Reports' or similar
    const res = await client.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_name ILIKE 'Report%'");
    fs.writeFileSync('tmp/all_report_schema.json', JSON.stringify(res.rows, null, 2));
    await client.end();
}
run();
