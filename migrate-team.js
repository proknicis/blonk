const { Client } = require('pg');
require('dotenv').config();

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    console.log('🏛️ Connecting to PostgreSQL Fleet Gateway for Schema Provisioning...');
    try {
        await client.connect();
        
        // 1. Create Team Table (Identity Pillar)
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

        // 2. Add Team Pillars to Legacy Tables (Sovereign Injection)
        // Note: Using DO block to safely handle if columns already exist
        await client.query(`
            DO $$ 
            BEGIN 
                -- User Table Upgrade
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='teamId') THEN
                    ALTER TABLE "User" ADD COLUMN "teamId" UUID;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='role') THEN
                    ALTER TABLE "User" ADD COLUMN "role" VARCHAR(50) DEFAULT 'MEMBER';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='User' AND column_name='onboardingStatus') THEN
                    ALTER TABLE "User" ADD COLUMN "onboardingStatus" VARCHAR(50) DEFAULT 'COMPLETED';
                END IF;

                -- Workflow Table Upgrade
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Workflow' AND column_name='teamId') THEN
                    ALTER TABLE "Workflow" ADD COLUMN "teamId" UUID;
                END IF;

                -- Agent Table Upgrade
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Agent' AND column_name='teamId') THEN
                    ALTER TABLE "Agent" ADD COLUMN "teamId" UUID;
                END IF;

                -- Notification Table Upgrade
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Notification' AND column_name='teamId') THEN
                    ALTER TABLE "Notification" ADD COLUMN "teamId" UUID;
                END IF;

                -- WorkflowLog Table Upgrade
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='WorkflowLog' AND column_name='teamId') THEN
                    ALTER TABLE "WorkflowLog" ADD COLUMN "teamId" UUID;
                END IF;
            END $$;
        `);

        // 3. Anchor Existing Orphaned Users to a Default Sovereign Team
        const adminUsers = await client.query('SELECT id, email, name FROM "User" WHERE "teamId" IS NULL');
        for (const user of adminUsers.rows) {
            const teamRes = await client.query(
                'INSERT INTO "Team" (name, "ownerId", "firmName") VALUES ($1, $2, $3) RETURNING id',
                [`${user.name || 'Sovereign'}'s Command`, user.id, 'Legacy Firm Hub']
            );
            const teamId = teamRes.rows[0].id;
            await client.query('UPDATE "User" SET "teamId" = $1, role = \'OWNER\' WHERE id = $2', [teamId, user.id]);
            console.log(`✅ Provisioned Team ID ${teamId} for legacy operator ${user.email}.`);
        }

        console.log('✨ Global Schema Provisioning Complete. All Sovereign Pillars Synchronized.');
    } catch (err) {
        console.error('❌ Schema Migration failure:', err);
    } finally {
        await client.end();
    }
}
migrate();
