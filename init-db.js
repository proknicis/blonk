const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// BLONK | UNIVERSAL SOVEREIGN DATABASE INITIALIZATION (PostgreSQL)
// This script provisions the complete institutional architecture for the entire fleet.

async function setupDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('🏛️ Connecting to PostgreSQL Fleet Gateway...');

    try {
        await client.connect();
        
        // 1. CLEAR STALE ASSETS (Institutional Purge)
        console.log('🧹 Purging legacy relations...');
        const dropTables = [
            '"WorkflowLog"', '"OperationalSetting"', '"Notification"', 
            '"Transaction"', '"ChartData"', '"Kpi"', '"Workflow"', 
            '"WorkflowTemplate"', '"Agent"', '"Report"', '"User"', '"Invoice"'
        ];
        
        for (const table of dropTables) {
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        }

        // 2. IDENTITY SECTOR
        console.log('🧬 Provisioning Identity Protocols...');
        await client.query(`
            DROP TABLE IF EXISTS "ChartData" CASCADE;
            DROP TABLE IF EXISTS "Notification" CASCADE;
            DROP TABLE IF EXISTS "Kpi" CASCADE;
            DROP TABLE IF EXISTS "OperationalSetting" CASCADE;
            DROP TABLE IF EXISTS "WorkflowLog" CASCADE;
            DROP TABLE IF EXISTS "Agent" CASCADE;
            DROP TABLE IF EXISTS "Workflow" CASCADE;
            DROP TABLE IF EXISTS "WorkflowTemplate" CASCADE;
            DROP TABLE IF EXISTS "Transaction" CASCADE;
            DROP TABLE IF EXISTS "Invoice" CASCADE;
            DROP TABLE IF EXISTS "User" CASCADE;

            CREATE TABLE "Team" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                "ownerId" UUID,
                "firmName" VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "User" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) DEFAULT 'MEMBER', -- OWNER, ADMIN, MEMBER
                "teamId" UUID,
                plan VARCHAR(50) DEFAULT 'Starter',
                "onboardingStatus" VARCHAR(50) DEFAULT 'PENDING',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE "TeamInvitation" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID REFERENCES "Team"(id) ON DELETE CASCADE,
                email VARCHAR(255) NOT NULL,
                token VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) DEFAULT 'MEMBER',
                status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, EXPIRED
                "expiresAt" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 3. FINANCIAL SECTOR
        console.log('💰 Provisioning Financial Ledgers...');
        await client.query(`
            CREATE TABLE "Invoice" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                "invoiceNumber" VARCHAR(100) UNIQUE NOT NULL,
                amount VARCHAR(100) NOT NULL,
                status VARCHAR(50) DEFAULT 'Paid',
                "planName" VARCHAR(100),
                "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE "Transaction" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                "trxId" VARCHAR(100) UNIQUE NOT NULL,
                "date" VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                status VARCHAR(50) NOT NULL,
                amount VARCHAR(50) NOT NULL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. AUTOMATION SECTOR (WORKFLOWS & AGENTS)
        console.log('🤖 Provisioning AI & Automation Infrastructure...');
        await client.query(`
            CREATE TABLE "WorkflowTemplate" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                sector VARCHAR(255) NOT NULL,
                description TEXT,
                savings VARCHAR(255),
                complexity VARCHAR(50),
                icon VARCHAR(50),
                color VARCHAR(50) DEFAULT '#F8F9FA',
                featured BOOLEAN DEFAULT FALSE,
                requirements JSONB DEFAULT '[]',
                "setupGuide" TEXT,
                status VARCHAR(50) DEFAULT 'Published',
                "webhookUrl" TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE "Workflow" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                name VARCHAR(255) NOT NULL,
                sector VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Active',
                performance VARCHAR(50) DEFAULT '0',
                "tasksCount" INT DEFAULT 0,
                "n8nWebhookUrl" TEXT,
                inputs JSONB DEFAULT '{}',
                "requestedBy" VARCHAR(255),
                "userId" UUID,
                "lastRun" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE "Agent" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Online',
                initials VARCHAR(10),
                color VARCHAR(50),
                "n8nWorkflow" TEXT,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE "WorkflowLog" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                "workflowName" VARCHAR(255) NOT NULL,
                "workflowId" UUID,
                status VARCHAR(50) NOT NULL,
                result TEXT,
                "executedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 5. ANALYTICS & DIAGNOSTICS
        console.log('📊 Initializing Analytics & Alerts...');
        await client.query(`
            CREATE TABLE "OperationalSetting" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                key VARCHAR(100) NOT NULL,
                value TEXT NOT NULL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("teamId", key)
            );
            CREATE TABLE "Kpi" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                label VARCHAR(100) NOT NULL,
                value VARCHAR(100) NOT NULL,
                change VARCHAR(100),
                positive BOOLEAN,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE("teamId", label)
            );
            CREATE TABLE "Notification" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                "isRead" BOOLEAN DEFAULT FALSE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE "ChartData" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                day VARCHAR(10) NOT NULL,
                revenue INT NOT NULL,
                expenses INT NOT NULL,
                profit INT NOT NULL,
                sequence INT NOT NULL,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE "Report" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID,
                title VARCHAR(255) NOT NULL,
                type VARCHAR(100) DEFAULT 'General',
                status VARCHAR(50) DEFAULT 'Draft',
                result TEXT,
                "requestedBy" VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 6. MASTER SEEDING (Sovereign Team-Ready Credentials)
        console.log('🔑 Establishing Sovereign Team-Ready Identity Seed...');
        
        // 6a. Create Primary Admin Team
        const teamRes = await client.query(
            'INSERT INTO "Team" (name, "firmName") VALUES ($1, $2) RETURNING id',
            ['BLONK Command', 'BLONK HQ']
        );
        const teamId = teamRes.rows[0].id;

        // 6b. Create Platform Owner (Team Lead)
        const adminEmail = 'admin@blonk.ai';
        const hashedPw = await bcrypt.hash('blonkadmin2026', 10);

        const userRes = await client.query(
            'INSERT INTO "User" (name, email, password, role, "teamId", plan) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            ['Platform Owner', adminEmail, hashedPw, 'OWNER', teamId, 'SuperAdmin']
        );
        const userId = userRes.rows[0].id;

        // Link owner to team
        await client.query('UPDATE "Team" SET "ownerId" = $1 WHERE id = $2', [userId, teamId]);

        // Core System Status Seed (Team-Scoped)
        await client.query(`
            INSERT INTO "OperationalSetting" ("teamId", key, value) VALUES ($1, 'system_uptime', '100.00');
            INSERT INTO "Kpi" ("teamId", label, value, change, positive) VALUES 
            ($1, 'Total Revenue', '$124,500', '+12.4%', true),
            ($1, 'Growth Rate', '22.8%', '+4.2%', true),
            ($1, 'System Stability', '99.98%', 'Stable', true);
        `, [teamId]);

        console.log('✨ BLONK Universal Fleet Initialized Successfully (Team-Enabled).');

    } catch (err) {
        console.error('❌ Universal Sync Failure:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
