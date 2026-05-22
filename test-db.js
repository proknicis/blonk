require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    const orders = await client.query('SELECT * FROM "WorkflowOrder"');
    console.log('Orders count:', orders.rows.length);
    const workflows = await client.query('SELECT * FROM "Workflow"');
    console.log('Workflows count:', workflows.rows.length);
    await client.end();
}
main();
