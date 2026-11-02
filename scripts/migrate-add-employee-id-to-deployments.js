const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function run() {
    const client = await pool.connect();
    try {
        console.log('--- STARTING ADD EMPLOYEE ID TO DEPLOYMENTS MIGRATION ---');
        await client.query(`
            ALTER TABLE "CustomerWorkflowDeployment" 
            ADD COLUMN IF NOT EXISTS "aiEmployeeId" UUID REFERENCES "AIEmployee"(id) ON DELETE SET NULL;
        `);
        console.log('Column added successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(console.error);
