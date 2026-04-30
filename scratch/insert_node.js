const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function addNode() {
  try {
    const apiKey = process.env.N8N_API_KEY || 'dummy_key';
    const res = await pool.query(`
      INSERT INTO "ClusterNode" (name, url, api_key, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, ['AWS Europe Node', 'https://n8n.manadavana.lv', apiKey, 'Active']);
    
    console.log('Inserted:', res.rows[0]);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

addNode();
