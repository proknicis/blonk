const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkSchema() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'WorkflowLog'
    `);
    console.log(JSON.stringify(res.rows, null, 2));
    await client.end();
}

checkSchema().catch(console.error);
