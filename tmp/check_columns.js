const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function checkColumns() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const res = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'WorkflowLog'
    `);
    console.log(res.rows.map(r => r.column_name).join(', '));
    await client.end();
}

checkColumns().catch(console.error);
