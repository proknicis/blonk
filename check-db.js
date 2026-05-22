require('dotenv').config();
const { Client } = require('pg');
async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        await client.query('SELECT * FROM "ClusterNode"');
        console.log('ClusterNode exists!');
    } catch(err) {
        console.error('ClusterNode error:', err.message);
    }
    await client.end();
}
main();
