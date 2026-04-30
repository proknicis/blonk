const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkNodes() {
  try {
    const res = await pool.query('SELECT id, name, url, api_key IS NOT NULL as has_key, LENGTH(api_key) as key_len FROM "ClusterNode"');
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkNodes();
