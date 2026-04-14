const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function inspectSchema() {
  try {
    const tables = ['User', 'Team'];
    for (const table of tables) {
      console.log(`\nInspecting Table: ${table}`);
      const res = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = '${table}'
      `);
      console.log(res.rows);
    }
  } catch (err) {
    console.error('Inspection Error:', err);
  } finally {
    await pool.end();
  }
}

inspectSchema();
