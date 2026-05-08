const { Pool } = require('pg');
require('dotenv').config();

async function debug() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Testing Team Query...");
        // Mock teamId
        const teamRes = await pool.query('SELECT id FROM "Team" LIMIT 1');
        const teamId = teamRes.rows[0]?.id;
        
        if (!teamId) {
            console.log("No teams found in database.");
            return;
        }

        console.log(`Using teamId: ${teamId}`);
        const members = await pool.query(
            'SELECT id, name, email, role, "lastSeen", "lastActivity" FROM "User" WHERE "teamId" = $1 ORDER BY role DESC',
            [teamId]
        );
        console.log("Successfully fetched members:", members.rows.length);
    } catch (err) {
        console.error("Query failed:", err.message);
        console.error("Stack:", err.stack);
    } finally {
        await pool.end();
    }
}

debug();
