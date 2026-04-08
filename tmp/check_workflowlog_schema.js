const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'WorkflowLog'");
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}
run();
