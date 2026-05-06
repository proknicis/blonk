const { Client } = require('pg');
require('dotenv').config();

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ClusterNode')");
        console.log('TABLE_EXISTS:', res.rows[0].exists);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

check();
