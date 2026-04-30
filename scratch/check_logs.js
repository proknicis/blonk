const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkLogs() {
  try {
    const res = await pool.query('SELECT status, COUNT(*) FROM "WorkflowLog" GROUP BY status');
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkLogs();
