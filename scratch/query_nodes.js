const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function queryNodes() {
  try {
    const res = await pool.query(`SELECT * FROM "ClusterNode"`);
    console.log(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

queryNodes();
