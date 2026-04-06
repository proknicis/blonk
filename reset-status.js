const { Client } = require('pg');
require('dotenv').config();

async function resetStatus() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    console.log('🏛️ Connecting to PostgreSQL Fleet Gateway for Status Reset...');
    try {
        await client.connect();
        const res = await client.query('UPDATE "User" SET "onboardingStatus" = \'COMPLETED\'');
        console.log(`✅ Success: Updated ${res.rowCount} operator identities to COMPLETED status.`);
        console.log('✨ All firm members now have direct access to the Sovereign Executive Hub.');
    } catch (err) {
        console.error('❌ Status Reset failure:', err);
    } finally {
        await client.end();
    }
}
resetStatus();
