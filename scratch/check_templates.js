const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkTemplates() {
  try {
    const res = await pool.query('SELECT id, name, workflow IS NOT NULL as has_json FROM "WorkflowTemplate"');
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkTemplates();
