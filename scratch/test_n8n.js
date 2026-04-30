const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testConnectivity() {
  try {
    const res = await pool.query('SELECT * FROM "ClusterNode" WHERE url = \'https://n8n.manadavana.lv\'');
    const node = res.rows[0];
    if (!node) {
      console.log('Node not found in DB');
      return;
    }

    console.log(`Testing Node: ${node.name} (${node.url})`);
    console.log(`Key length: ${node.api_key ? node.api_key.length : 0}`);

    const n8nRes = await fetch(`${node.url}/api/v1/workflows`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': node.api_key
      }
    });

    if (n8nRes.ok) {
      console.log('SUCCESS: n8n API responded correctly!');
    } else {
      const errText = await n8nRes.text();
      console.log(`FAILURE: n8n returned ${n8nRes.status} - ${errText}`);
    }
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
  } finally {
    await pool.end();
  }
}

testConnectivity();
