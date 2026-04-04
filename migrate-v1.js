const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('🏛️ Connected to Database for migration.');

        // Add onboardingStatus if not exists
        await client.query(`
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStatus" VARCHAR(50) DEFAULT 'PENDING';
        `);
        
        console.log('✅ Column "onboardingStatus" added successfully (if it did not exist).');

    } catch (err) {
        console.error('❌ Migration failure:', err);
    } finally {
        await client.end();
    }
}

migrate();
