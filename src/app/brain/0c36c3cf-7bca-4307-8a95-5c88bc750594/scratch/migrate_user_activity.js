const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Starting migration: Adding lastSeen and lastActivity to User table...");
        await pool.query(`
            ALTER TABLE "User" 
            ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            ADD COLUMN IF NOT EXISTS "lastActivity" TEXT DEFAULT 'Joined the platform';
        `);
        console.log("Migration successful.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
