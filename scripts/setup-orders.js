#!/usr/bin/env node
// scripts/setup-orders.js
// Run on VPS: node scripts/setup-orders.js
// Creates WorkflowOrder + OrderEvent tables and adds missing columns to Workflow

require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    console.log('✅ Connected to database:', process.env.DATABASE_URL?.split('@')[1]);

    try {
        // 1. Create WorkflowOrder table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "WorkflowOrder" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "orderNumber" SERIAL,
                "teamId" UUID NOT NULL,
                "userId" UUID NOT NULL,
                "templateId" UUID,
                "workflowName" VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_RECEIVED',
                amount DECIMAL(15,2) DEFAULT 0,
                "serverId" UUID,
                "workflowId" UUID,
                "stripeSessionId" VARCHAR(255),
                "n8nWorkflowId" VARCHAR(255),
                logs JSONB DEFAULT '[]',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ WorkflowOrder table ready');

        // 2. Create OrderEvent table
        await client.query(`
            CREATE TABLE IF NOT EXISTS "OrderEvent" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "orderId" UUID NOT NULL,
                message TEXT NOT NULL,
                level VARCHAR(20) DEFAULT 'info',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ OrderEvent table ready');

        // 3. Add missing columns to Workflow table (safe - IF NOT EXISTS)
        await client.query(`ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "templateId" UUID`).catch(() => {});
        await client.query(`ALTER TABLE "Workflow" ADD COLUMN IF NOT EXISTS "serverId" UUID`).catch(() => {});
        console.log('✅ Workflow table columns updated');

        // 4. Verify counts
        const orderCount = await client.query('SELECT count(*) FROM "WorkflowOrder"');
        const userCount  = await client.query('SELECT count(*) FROM "User"');
        const teamCount  = await client.query('SELECT count(*) FROM "Team"');

        console.log('');
        console.log('📊 Database status:');
        console.log(`   Users:          ${userCount.rows[0].count}`);
        console.log(`   Teams:          ${teamCount.rows[0].count}`);
        console.log(`   WorkflowOrders: ${orderCount.rows[0].count}`);
        console.log('');
        console.log('🚀 All done! Now run: pm2 restart blonk');

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
