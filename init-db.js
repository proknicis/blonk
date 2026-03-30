const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    console.log('Connected to MySQL. Syncing schema...');

    try {
        // Drop existing tables to start completely fresh
        await connection.execute('DROP TABLE IF EXISTS Invoice');
        await connection.execute('DROP TABLE IF EXISTS WorkflowLog');
        await connection.execute('DROP TABLE IF EXISTS OperationalSetting');
        await connection.execute('DROP TABLE IF EXISTS Notification');
        await connection.execute('DROP TABLE IF EXISTS Transaction');
        await connection.execute('DROP TABLE IF EXISTS ChartData');
        await connection.execute('DROP TABLE IF EXISTS Kpi');
        await connection.execute('DROP TABLE IF EXISTS Workflow');
        await connection.execute('DROP TABLE IF EXISTS WorkflowTemplate');
        await connection.execute('DROP TABLE IF EXISTS Agent');
        await connection.execute('DROP TABLE IF EXISTS Report');
        await connection.execute('DROP TABLE IF EXISTS User');

        // 1. User Table
        await connection.execute(`
            CREATE TABLE User (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(191),
                email VARCHAR(191) UNIQUE NOT NULL,
                password VARCHAR(191) NOT NULL,
                firmName VARCHAR(191),
                industry VARCHAR(191),
                role VARCHAR(191) DEFAULT 'User',
                plan VARCHAR(191) DEFAULT 'Starter',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 2. Invoice Table
        await connection.execute(`
            CREATE TABLE Invoice (
                id VARCHAR(191) PRIMARY KEY,
                invoiceNumber VARCHAR(191) UNIQUE NOT NULL,
                amount VARCHAR(191) NOT NULL,
                status VARCHAR(191) DEFAULT 'Paid',
                planName VARCHAR(191) NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Operational Settings
        await connection.execute(`
            CREATE TABLE OperationalSetting (
                id VARCHAR(191) PRIMARY KEY,
                \`key\` VARCHAR(191) UNIQUE NOT NULL,
                value VARCHAR(191) NOT NULL
            )
        `);

        // 3. Workflow Marketplace Templates
        await connection.execute(`
            CREATE TABLE WorkflowTemplate (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                sector VARCHAR(191) NOT NULL,
                description TEXT,
                savings VARCHAR(191),
                complexity VARCHAR(50),
                icon VARCHAR(50),
                color VARCHAR(50),
                featured BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 4. Workflow Instances (User's active loops)
        await connection.execute(`
            CREATE TABLE Workflow (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                sector VARCHAR(191) NOT NULL,
                status VARCHAR(191) DEFAULT 'Pending',
                performance VARCHAR(191) DEFAULT '0',
                lastRun TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tasksCount INT DEFAULT 0,
                n8nWebhookUrl TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 5. Workflow Execution Logs
        await connection.execute(`
            CREATE TABLE WorkflowLog (
                id VARCHAR(191) PRIMARY KEY,
                workflowName VARCHAR(191) NOT NULL,
                status VARCHAR(191) NOT NULL,
                result TEXT,
                executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. Agents
        await connection.execute(`
            CREATE TABLE Agent (
                id VARCHAR(191) PRIMARY KEY,
                name VARCHAR(191) NOT NULL,
                role VARCHAR(191) NOT NULL,
                status VARCHAR(191) NOT NULL,
                initials VARCHAR(10) NOT NULL,
                color VARCHAR(50) NOT NULL,
                n8nWorkflow VARCHAR(191),
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 7. KPIs & Financials
        await connection.execute(`
            CREATE TABLE Kpi (
                id VARCHAR(191) PRIMARY KEY,
                label VARCHAR(191) NOT NULL,
                value VARCHAR(191) NOT NULL,
                \`change\` VARCHAR(191),
                positive BOOLEAN,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        await connection.execute(`
            CREATE TABLE Transaction (
                id VARCHAR(191) PRIMARY KEY,
                trxId VARCHAR(191) NOT NULL,
                date VARCHAR(191) NOT NULL,
                category VARCHAR(191) NOT NULL,
                status VARCHAR(191) NOT NULL,
                amount VARCHAR(191) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. Communications
        await connection.execute(`
            CREATE TABLE Notification (
                id VARCHAR(191) PRIMARY KEY,
                title VARCHAR(191) NOT NULL,
                message VARCHAR(191) NOT NULL,
                isRead BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // 9. Chart Data
        await connection.execute(`
            CREATE TABLE ChartData (
                id VARCHAR(191) PRIMARY KEY,
                day VARCHAR(10) NOT NULL,
                revenue INT NOT NULL,
                expenses INT NOT NULL,
                profit INT NOT NULL,
                sequence INT NOT NULL,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // SEEDING ESSENTIALS ONLY
        console.log('Seeding system accounts...');

        // Master Admin Access
        await connection.execute(
            'INSERT INTO User (id, name, email, password, firmName, industry, role, plan) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)',
            ['Platform Owner', 'admin@blonk.ai', 'blonkadmin2026', 'BLONK HQ', 'SaaS', 'SuperAdmin', 'Starter']
        );

        // Core Invoices
        await connection.execute(
            'INSERT INTO Invoice (id, invoiceNumber, amount, status, planName, date) VALUES (UUID(), ?, ?, ?, ?, ?)',
            ['INV-2024-001', '$0.00', 'Paid', 'Starter', '2024-03-01 10:00:00']
        );
        await connection.execute(
            'INSERT INTO Invoice (id, invoiceNumber, amount, status, planName, date) VALUES (UUID(), ?, ?, ?, ?, ?)',
            ['INV-2024-002', '$0.00', 'Paid', 'Starter', '2024-02-01 10:00:00']
        );
        await connection.execute(
            'INSERT INTO Invoice (id, invoiceNumber, amount, status, planName, date) VALUES (UUID(), ?, ?, ?, ?, ?)',
            ['INV-2024-003', '$0.00', 'Paid', 'Starter', '2024-01-01 10:00:00']
        );

        // Core System Settings
        await connection.execute(
            'INSERT INTO OperationalSetting (id, \`key\`, value) VALUES (UUID(), ?, ?)',
            ['system_uptime', '100.00']
        );

        console.log('Production-ready database initialized (Wiped clean of mock data).');

    } catch (err) {
        console.error('Database Sync Failed:', err);
    } finally {
        await connection.end();
    }
}

setupDatabase();
