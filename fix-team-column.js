const { Client } = require('pg');
require('dotenv').config();

async function fix() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    console.log('🏛️ Connecting to PostgreSQL Fleet Gateway for Direct Pillar Injection...');
    try {
        await client.connect();
        
        // 1. Ensure Team Table exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Team" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                "ownerId" UUID,
                "firmName" VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Add Team Pillars to "User" (Sovereign Injection)
        await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teamId" UUID;');
        await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT \'MEMBER\';');
        await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingStatus" VARCHAR(50) DEFAULT \'COMPLETED\';');

        // 3. Anchor Existing Orphaned Users to a Default Sovereign Team
        const adminUsers = await client.query('SELECT id, email, name FROM "User" WHERE "teamId" IS NULL');
        for (const user of adminUsers.rows) {
            const teamRes = await client.query(
                'INSERT INTO "Team" (name, "ownerId", "firmName") VALUES ($1, $2, $3) RETURNING id',
                [`${user.name || 'Sovereign'}'s Command Hub`, user.id, 'Firm Primary Hub']
            );
            const teamId = teamRes.rows[0].id;
            await client.query('UPDATE "User" SET "teamId" = $1, role = \'OWNER\', "onboardingStatus" = \'COMPLETED\' WHERE id = $2', [teamId, user.id]);
            console.log(`✅ Fixed Identity Pillar for legacy operator: ${user.email} -> Team ID: ${teamId}`);
        }

        console.log('✨ Sovereign Identity Columns Successfully Provisioned and Synchronized.');
    } catch (err) {
        console.error('❌ Direct Pillar Injection failure:', err);
    } finally {
        await client.end();
    }
}
fix();
