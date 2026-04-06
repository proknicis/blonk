const { Client } = require('pg');
require('dotenv').config();

async function verify() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        await client.connect();
        const res = await client.query('SELECT name, email, "onboardingStatus", role FROM "User"');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
verify();
