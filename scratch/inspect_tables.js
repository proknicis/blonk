const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function inspect() {
  try {
    console.log("WorkflowTemplate Schema:");
    const res = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'WorkflowTemplate'`);
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

inspect();
