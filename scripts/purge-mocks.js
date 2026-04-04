const { Client } = require('pg');
require('dotenv').config();

async function purge() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('🏛️ Connected to Fleet Database...');
        
        const res = await client.query('DELETE FROM "Agent" WHERE name IN (\'Sovereign AI\', \'Billie Agent\')');
        console.log(`🧹 Successfully purged ${res.rowCount} mock units from the fleet.`);
        
    } catch (err) {
        console.error('❌ Purge Failure:', err);
    } finally {
        await client.end();
    }
}

purge();
