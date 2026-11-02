const { Client } = require('pg');
require('dotenv').config();

async function runMigration() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    console.log('🏛️ Connecting to PostgreSQL Gateway for Company Brain v2 Migration...');

    try {
        await client.connect();

        console.log('🧬 Creating Company Brain table schemas...');

        await client.query(`
            -- 1. CompanyProfile Table
            CREATE TABLE IF NOT EXISTS "CompanyProfile" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID UNIQUE NOT NULL,
                "companyName" VARCHAR(255) DEFAULT 'Your Company SIA',
                industry VARCHAR(255) DEFAULT '',
                employees VARCHAR(50) DEFAULT '1',
                countries VARCHAR(255) DEFAULT '',
                languages VARCHAR(255) DEFAULT '',
                "workingHours" VARCHAR(100) DEFAULT '09:00 - 18:00',
                timezone VARCHAR(100) DEFAULT 'UTC',
                "vatCode" VARCHAR(100) DEFAULT '',
                currencies VARCHAR(100) DEFAULT 'EUR (€)',
                departments TEXT DEFAULT '',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 2. BrainDocument Table
            CREATE TABLE IF NOT EXISTS "BrainDocument" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) DEFAULT 'General',
                "mimeType" VARCHAR(100) DEFAULT '',
                size VARCHAR(50) DEFAULT '0 KB',
                status VARCHAR(50) DEFAULT 'Indexed',
                "uploadedBy" VARCHAR(255) DEFAULT 'System',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 3. BrainChunk Table
            CREATE TABLE IF NOT EXISTS "BrainChunk" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "documentId" UUID NOT NULL REFERENCES "BrainDocument"(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                "embeddingId" VARCHAR(255),
                page INTEGER DEFAULT 1,
                "chunkIndex" INTEGER DEFAULT 0
            );

            -- 4. BrainSource Table
            CREATE TABLE IF NOT EXISTS "BrainSource" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL,
                name VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Disconnected',
                "lastSync" TIMESTAMP,
                owner VARCHAR(255) DEFAULT '',
                permissions TEXT DEFAULT '',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 5. BrainRule Table
            CREATE TABLE IF NOT EXISTS "BrainRule" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL,
                text TEXT NOT NULL,
                active BOOLEAN DEFAULT TRUE,
                priority VARCHAR(50) DEFAULT 'Medium',
                scope VARCHAR(100) DEFAULT 'Global',
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 6. BrainMemory Table
            CREATE TABLE IF NOT EXISTS "BrainMemory" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "employeeId" UUID,
                type VARCHAR(50) DEFAULT 'Short-Term',
                summary TEXT NOT NULL,
                confidence INTEGER DEFAULT 100,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- 7. BrainInsight Table
            CREATE TABLE IF NOT EXISTS "BrainInsight" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                "teamId" UUID NOT NULL,
                severity VARCHAR(50) DEFAULT 'Info',
                title VARCHAR(255) NOT NULL,
                description TEXT NOT NULL,
                resolved BOOLEAN DEFAULT FALSE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('✅ Migration succeeded! Company Brain v2 tables are provisioned.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await client.end();
    }
}

runMigration();
