const { Pool } = require('pg');
require('dotenv').config();

async function fixSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Ensuring columns exist for 'User'...");
        
        const queries = [
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastSeen" TIMESTAMP WITH TIME ZONE',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActivity" TEXT',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firmName" TEXT',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStatus" TEXT',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT \'Starter\'',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tier" TEXT DEFAULT \'Free\'',
            'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "industry" TEXT'
        ];

        for (const q of queries) {
            try {
                await pool.query(q);
                console.log(`Executed: ${q}`);
            } catch (err) {
                console.log(`Failed (likely already exists): ${q}`);
            }
        }
        
        console.log("Schema fix complete.");
    } catch (err) {
        console.error("Fix failed:", err);
    } finally {
        await pool.end();
    }
}

fixSchema();
