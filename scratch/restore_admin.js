const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function provisionAdmin() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    try {
        console.log('🧬 Initializing Administrative Identity Restoration...');

        const adminEmail = 'admin@blonk.ai';
        const rawPassword = 'blonkadmin2026';
        const hashedPw = await bcrypt.hash(rawPassword, 10);

        // 1. Ensure a Team exists for the admin
        const teamRes = await pool.query(
            'INSERT INTO "Team" (name, "firmName") VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING id',
            ['BLONK Command', 'BLONK HQ']
        );

        let teamId;
        if (teamRes.rows.length > 0) {
            teamId = teamRes.rows[0].id;
        } else {
            const existingTeam = await pool.query('SELECT id FROM "Team" LIMIT 1');
            teamId = existingTeam.rows[0].id;
        }

        // 2. Provision the SuperAdmin User
        await pool.query(`
            INSERT INTO "User" (name, email, password, role, "teamId", plan, "onboardingStatus")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (email) DO UPDATE 
            SET plan = 'SuperAdmin'
        `, ['Platform Owner', adminEmail, hashedPw, 'OWNER', teamId, 'SuperAdmin', 'COMPLETED']);

        console.log('✨ SUCCESS: Administrative credentials restored.');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${rawPassword}`);

    } catch (err) {
        console.error('❌ Restoration Failure:', err);
    } finally {
        await pool.end();
    }
}

provisionAdmin();
