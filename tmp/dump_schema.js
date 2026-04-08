const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'Report'");
    fs.writeFileSync('tmp/report_schema.json', JSON.stringify(res.rows, null, 2));
    await client.end();
}
run();
