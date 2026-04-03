const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// BLONK | SOVEREIGN DATABASE INITIALIZATION (PostgreSQL)
// This script initializes the institutional ledger with the master admin credentials.

async function setupDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('🏛️ Connecting to PostgreSQL Fleet Gateway...');

    try {
        await client.connect();
        
        // 1. CLEAR STALE ASSETS
        console.log('🧹 Purging legacy institutional logs...');
        const dropTables = [
            '"WorkflowLog"', '"OperationalSetting"', '"Notification"', 
            '"Transaction"', '"ChartData"', '"Kpi"', '"Workflow"', 
            '"WorkflowTemplate"', '"Agent"', '"Report"', '"User"'
        ];
        
        for (const table of dropTables) {
            await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        }

        // 2. PROVISION SOVEREIGN IDENTITY (USER TABLE)
        console.log('🧬 Provisioning User Identity Protocol...');
        await client.query(`
            CREATE TABLE "User" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                "firmName" VARCHAR(255),
                industry VARCHAR(255),
                plan VARCHAR(50) DEFAULT 'Starter',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. PROVISION OPERATIONAL METADATA
        console.log('⚙️ Initializing System Parameters...');
        await client.query(`
            CREATE TABLE "OperationalSetting" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                key VARCHAR(100) UNIQUE NOT NULL,
                value TEXT NOT NULL
            )
        `);

        // 4. PROVISION FINANCIAL ANALYTICS
        await client.query(`
            CREATE TABLE "Kpi" (
                label VARCHAR(100) PRIMARY KEY,
                value VARCHAR(100) NOT NULL,
                change VARCHAR(100),
                positive BOOLEAN
            )
        `);

        // 5. MASTER SEEDING (AUTHENTICATION)
        console.log('🔑 Establishing Master Admin Handshake...');
        
        // Hash the admin password for institutional security
        const adminEmail = 'admin@blonk.ai';
        const adminPasswordRaw = 'blonkadmin2026';
        const hashedAdminPassword = await bcrypt.hash(adminPasswordRaw, 10);

        await client.query(
            'INSERT INTO "User" (name, email, password, "firmName", industry, plan) VALUES ($1, $2, $3, $4, $5, $6)',
            ['Platform Owner', adminEmail, hashedAdminPassword, 'BLONK HQ', 'SaaS', 'SuperAdmin']
        );

        // 6. SYSTEM STATUS SEEDING
        await client.query(
            'INSERT INTO "OperationalSetting" (key, value) VALUES ($1, $2)',
            ['system_uptime', '100.00']
        );

        await client.query(`
            INSERT INTO "Kpi" (label, value, change, positive) VALUES 
            ('Total Revenue', '$124,500', '+12.4%', true),
            ('Growth Rate', '22.8%', '+4.2%', true),
            ('System Stability', '99.98%', 'Stable', true)
        `);

        console.log('✨ BLONK Sovereign Fleet Initialized Successfully (PostgreSQL).');
        console.log('Credential: ' + adminEmail);

    } catch (err) {
        console.error('❌ Database Sync Failure:', err);
    } finally {
        await client.end();
    }
}

setupDatabase();
