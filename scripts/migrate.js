const { Client } = require('pg');
require('dotenv').config();

// BLONK | SOVEREIGN DATABASE MIGRATION SYSTEM
// Safely updates the institutional ledger without data loss.

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('🏛️ Connecting to PostgreSQL Fleet Gateway for migration...');

        // 1. EXTENSIONS
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

        // 2. USER TABLE ENHANCEMENTS
        console.log('👤 Synchronizing User registry columns...');
        await client.query(`
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "utmSource" VARCHAR(100);
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "utmMedium" VARCHAR(100);
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "utmCampaign" VARCHAR(100);
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) DEFAULT 'MEMBER';
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teamId" UUID;
        `);

        // 3. NEW ANALYTICS & FINANCIAL LEDGERS
        console.log('📊 Provisioning missing analytics and financial tables...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Event" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "userId" UUID,
                "visitorId" VARCHAR(255),
                "sessionId" VARCHAR(255),
                "eventType" VARCHAR(100) NOT NULL,
                "source" VARCHAR(100),
                "metadata" JSONB DEFAULT '{}',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS "Payment" (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                "userId" UUID,
                "amount" DECIMAL(15,2) NOT NULL,
                "currency" VARCHAR(10) DEFAULT 'USD',
                "status" VARCHAR(50) DEFAULT 'completed',
                "stripeSessionId" VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS "MarketingSpend" (
                id SERIAL PRIMARY KEY,
                "date" DATE NOT NULL,
                "amount" DECIMAL(15,2) DEFAULT 0.00,
                "source" VARCHAR(100),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 4. ENSURE ALL OTHER TABLES EXIST (From schema.sql)
        console.log('🏗️ Verifying structural integrity of the fleet...');
        const tables = [
            'CREATE TABLE IF NOT EXISTS "Workflow" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(255) NOT NULL, sector VARCHAR(100), status VARCHAR(50) DEFAULT \'Pending\', performance VARCHAR(50) DEFAULT \'0\', "tasksCount" INTEGER DEFAULT 0, inputs JSONB DEFAULT \'{}\', "requestedBy" VARCHAR(255), "userId" UUID, "lastRun" TIMESTAMP, "n8nWebhookUrl" TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
            'CREATE TABLE IF NOT EXISTS "WorkflowTemplate" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(255) UNIQUE NOT NULL, sector VARCHAR(100), description TEXT, savings VARCHAR(100), complexity VARCHAR(100), icon VARCHAR(100), color VARCHAR(100), featured BOOLEAN DEFAULT FALSE, requirements JSONB DEFAULT \'[]\', "setupGuide" JSONB DEFAULT \'[]\', "webhookUrl" TEXT, status VARCHAR(50) DEFAULT \'Draft\', "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
            'CREATE TABLE IF NOT EXISTS "Agent" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(255) NOT NULL, status VARCHAR(50) DEFAULT \'Idle\', performance VARCHAR(50), "n8nWorkflow" TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
            'CREATE TABLE IF NOT EXISTS "OperationalSetting" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), key VARCHAR(100) UNIQUE NOT NULL, value TEXT NOT NULL)',
            'CREATE TABLE IF NOT EXISTS "WorkflowLog" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), "workflowName" VARCHAR(255), "workflowId" UUID, status VARCHAR(50), result JSONB DEFAULT \'{}\', "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
            'CREATE TABLE IF NOT EXISTS "Notification" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), title VARCHAR(255), message TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
            'CREATE TABLE IF NOT EXISTS "Report" (id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), name VARCHAR(255), type VARCHAR(100), date VARCHAR(100), size VARCHAR(100), content TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)',
            'CREATE TABLE IF NOT EXISTS "ChartData" (id SERIAL PRIMARY KEY, day VARCHAR(50) UNIQUE, revenue DECIMAL(15,2) DEFAULT 0.00, expenses DECIMAL(15,2) DEFAULT 0.00, profit DECIMAL(15,2) DEFAULT 0.00, sequence INTEGER)',
            'CREATE TABLE IF NOT EXISTS "Kpi" (label VARCHAR(100) PRIMARY KEY, value VARCHAR(100), "change" VARCHAR(50), positive BOOLEAN DEFAULT TRUE)',
            'CREATE TABLE IF NOT EXISTS "Transaction" ("trxId" VARCHAR(100) PRIMARY KEY, date VARCHAR(100), category VARCHAR(100), status VARCHAR(50) DEFAULT \'Pending\', amount VARCHAR(100), "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
        ];

        for (const ddl of tables) {
            await client.query(ddl);
        }

        // 5. UPDATE WORKFLOW TEMPLATE FOR PRODUCT FIELDS
        console.log('📦 Enhancing WorkflowTemplate for Product Management...');
        await client.query(`
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "productInfo" JSONB DEFAULT '{}';
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "price" DECIMAL(15,2) DEFAULT 0.00;
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "purchases" INTEGER DEFAULT 0;
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "revenue" DECIMAL(15,2) DEFAULT 0.00;
            ALTER TABLE "WorkflowTemplate" ADD COLUMN IF NOT EXISTS "conversionRate" DECIMAL(5,2) DEFAULT 0.00;
        `);

        // 6. UPDATE USER TABLE FOR BUSINESS INSIGHTS
        console.log('👤 Enhancing User table for Identity Management...');
        await client.query(`
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tier" VARCHAR(50) DEFAULT 'Free';
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "totalSpend" DECIMAL(15,2) DEFAULT 0.00;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActive" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" VARCHAR(50) DEFAULT 'Active';
            ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "workflowsUsed" JSONB DEFAULT '[]';
        `);

        console.log('✅ Institutional migration successful. Database is in sync with the regional registry.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
