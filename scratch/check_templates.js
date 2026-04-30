const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkTemplates() {
  try {
    const res = await pool.query('SELECT name, requirements FROM "WorkflowTemplate" WHERE requirements IS NOT NULL');
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkTemplates();
