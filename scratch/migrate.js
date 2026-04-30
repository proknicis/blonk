const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log("Adding max_workflows to ClusterNode...");
    await pool.query(`ALTER TABLE "ClusterNode" ADD COLUMN IF NOT EXISTS max_workflows integer DEFAULT 100`);
    console.log("Done.");
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
