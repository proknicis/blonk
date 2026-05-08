const { Pool } = require('pg');
require('dotenv').config();

async function debugSettings() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Testing Settings Query...");
        const email = 'proknicis@gmail.com'; // Adjust to a known user if possible
        
        console.log(`Using email: ${email}`);
        
        // Test UPDATE
        console.log("Testing UPDATE heartbeat...");
        const updateRes = await pool.query('UPDATE "User" SET "lastSeen" = NOW() WHERE email = $1', [email]);
        console.log("Update rows affected:", updateRes.rowCount);

        // Test SELECT
        console.log("Testing SELECT...");
        const rows = await pool.query('SELECT id, name, email, role, "firmName", industry, plan, tier, "onboardingStatus", "lastSeen", "lastActivity" FROM "User" WHERE email = $1', [email]);
        console.log("Successfully fetched settings:", rows.rows.length);
        if (rows.rows[0]) {
            console.log("Result:", JSON.stringify(rows.rows[0]));
        } else {
            console.log("User not found.");
        }
    } catch (err) {
        console.error("Query failed:", err.message);
        console.error("Stack:", err.stack);
    } finally {
        await pool.end();
    }
}

debugSettings();
