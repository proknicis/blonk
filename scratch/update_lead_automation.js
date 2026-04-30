const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const reqs = JSON.stringify([
  { name: 'google_creds', type: 'google_auth', required: true, help: 'Authorize your Google account to send emails.' }
]);

async function update() {
  try {
    await pool.query('UPDATE "WorkflowTemplate" SET requirements = $1 WHERE name = \'Lead Automation\'', [reqs]);
    console.log('Successfully updated Lead Automation requirements');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

update();
