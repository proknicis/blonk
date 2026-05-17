const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    const client = new Client({ connectionString: 'postgresql://myuser:mypassword@127.0.0.1:5432/mydb' });
    try {
        await client.connect();
        console.log("Connected to database. Starting real data seeding...");

        // Ensure tables exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS "support_tickets" (
                id TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "userEmail" TEXT NOT NULL,
                "userName" TEXT DEFAULT 'User',
                subject TEXT NOT NULL,
                status TEXT DEFAULT 'open',
                priority TEXT DEFAULT 'normal',
                "createdAt" TIMESTAMPTZ DEFAULT NOW(),
                "updatedAt" TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        await client.query(`
            CREATE TABLE IF NOT EXISTS "support_messages" (
                id TEXT PRIMARY KEY,
                "ticketId" TEXT NOT NULL REFERENCES "support_tickets"(id) ON DELETE CASCADE,
                "senderId" TEXT NOT NULL,
                "senderRole" TEXT NOT NULL DEFAULT 'user',
                "senderName" TEXT DEFAULT 'User',
                content TEXT NOT NULL,
                "createdAt" TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Generate UUIDs
        const usrOwnerId = uuidv4();
        const usrMarkusId = uuidv4();
        const usrNikolasId = uuidv4();
        const usrAlexId = uuidv4();
        const usrSarahId = uuidv4();
        const usrTomId = uuidv4();
        const usrPendingId = uuidv4();

        // 1. Seed exact users from Screenshot 2
        console.log("Seeding real users directory...");
        await client.query('DELETE FROM "User" WHERE email IN ($1, $2, $3, $4, $5, $6, $7)', [
            'platform.owner@blonk.com',
            'markus@acme.com',
            'nikolas@nova.ai',
            'alex@lexflow.com',
            'sarah@healthplus.io',
            'tom@finedge.com',
            'invitee@acmecorp.io'
        ]);

        const usersData = [
            {
                id: usrOwnerId,
                name: 'Platform Owner',
                email: 'platform.owner@blonk.com',
                plan: 'Super Admin',
                role: 'Super Admin',
                firmName: 'BLONK Internal',
                industry: 'Internal Team',
                status: 'ACTIVE',
                lastActive: new Date(),
                tier: 'Enterprise',
                totalSpend: '2400.00'
            },
            {
                id: usrMarkusId,
                name: 'Markus Kaknens',
                email: 'markus@acme.com',
                plan: 'Admin',
                role: 'Admin',
                firmName: 'Acme Corp',
                industry: 'acme-corp.io',
                status: 'ACTIVE',
                lastActive: new Date(Date.now() - 12 * 60000), // 12m ago
                tier: 'Pro',
                totalSpend: '850.00'
            },
            {
                id: usrNikolasId,
                name: 'Nikolas Prokopcs',
                email: 'nikolas@nova.ai',
                plan: 'Operator',
                role: 'Operator',
                firmName: 'Nova Analytics',
                industry: 'nova.ai',
                status: 'ACTIVE',
                lastActive: new Date(Date.now() - 60 * 60000), // 1h ago
                tier: 'Pro',
                totalSpend: '620.00'
            },
            {
                id: usrAlexId,
                name: 'Alex Andersen',
                email: 'alex@lexflow.com',
                plan: 'Viewer',
                role: 'Viewer',
                firmName: 'LexFlow LLC',
                industry: 'lexflow.com',
                status: 'ACTIVE',
                lastActive: new Date(Date.now() - 3 * 3600000), // 3h ago
                tier: 'Starter',
                totalSpend: '120.00'
            },
            {
                id: usrSarahId,
                name: 'Sarah Lee',
                email: 'sarah@healthplus.io',
                plan: 'Operator',
                role: 'Operator',
                firmName: 'HealthPlus',
                industry: 'healthplus.io',
                status: 'INACTIVE',
                lastActive: new Date(Date.now() - 7 * 24 * 3600000), // 7d ago
                tier: 'Pro',
                totalSpend: '450.00'
            },
            {
                id: usrTomId,
                name: 'Tom Becker',
                email: 'tom@finedge.com',
                plan: 'Operator',
                role: 'Operator',
                firmName: 'FinEdge Ltd',
                industry: 'finedge.com',
                status: 'INACTIVE',
                lastActive: new Date(Date.now() - 8 * 24 * 3600000), // 8d ago
                tier: 'Pro',
                totalSpend: '520.00'
            },
            {
                id: usrPendingId,
                name: 'Invitation Pending',
                email: 'invitee@acmecorp.io',
                plan: 'Viewer (Invited)',
                role: 'Viewer (Invited)',
                firmName: 'Acme Corp',
                industry: 'acme-corp.io',
                status: 'INVITED',
                lastActive: null,
                tier: 'Starter',
                totalSpend: '0.00'
            }
        ];

        for (const u of usersData) {
            await client.query(`
                INSERT INTO "User" (id, name, email, plan, role, "firmName", industry, status, "lastActive", tier, "totalSpend", password)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'no_password_needed_token_auth')
            `, [u.id, u.name, u.email, u.plan, u.role, u.firmName, u.industry, u.status, u.lastActive, u.tier, u.totalSpend]);
        }
        console.log("Seeded 7 master users successfully.");

        // 2. Seed support tickets matching Screenshot 1
        console.log("Seeding support tickets and messages...");
        await client.query('DELETE FROM "support_tickets"');
        await client.query('DELETE FROM "support_messages"');

        const tickets = [
            {
                id: 'INC-2024-0517-0001',
                userId: usrMarkusId,
                userEmail: 'aa@acmecorp.io',
                userName: 'Acme Corp',
                subject: 'Workflow failing on Data Sync',
                status: 'open',
                priority: 'High',
                createdAt: new Date(Date.now() - 2 * 60000) // 2m ago
            },
            {
                id: 'INC-2024-0517-0002',
                userId: usrNikolasId,
                userEmail: 'nikolas@nova.ai',
                userName: 'Nova Analytics',
                subject: 'Webhook not receiving data',
                status: 'waiting_for_admin',
                priority: 'Medium',
                createdAt: new Date(Date.now() - 11 * 60000) // 11m ago
            },
            {
                id: 'INC-2024-0517-0003',
                userId: usrSarahId,
                userEmail: 'sarah@healthplus.io',
                userName: 'HealthPlus',
                subject: 'Slow execution times',
                status: 'open',
                priority: 'Medium',
                createdAt: new Date(Date.now() - 18 * 60000) // 18m ago
            },
            {
                id: 'INC-2024-0517-0004',
                userId: usrTomId,
                userEmail: 'tom@finedge.com',
                userName: 'FinEdge Ltd',
                subject: 'API authentication error',
                status: 'open',
                priority: 'High',
                createdAt: new Date(Date.now() - 22 * 60000) // 22m ago
            },
            {
                id: 'INC-2024-0517-0005',
                userId: usrAlexId,
                userEmail: 'alex@lexflow.com',
                userName: 'LexFlow LLC',
                subject: 'Missing data in report',
                status: 'open',
                priority: 'Low',
                createdAt: new Date(Date.now() - 35 * 60000) // 35m ago
            },
            {
                id: 'INC-2024-0517-0006',
                userId: usrSarahId,
                userEmail: 'supportpro@domain.com',
                userName: 'SupportPro',
                subject: 'File upload failing',
                status: 'open',
                priority: 'Medium',
                createdAt: new Date(Date.now() - 60 * 60000) // 1h ago
            },
            {
                id: 'INC-2024-0517-0007',
                userId: usrNikolasId,
                userEmail: 'marketify@domain.com',
                userName: 'Marketify',
                subject: 'Credentials expired',
                status: 'open',
                priority: 'High',
                createdAt: new Date(Date.now() - 120 * 60000) // 2h ago
            },
            {
                id: 'INC-2024-0517-0008',
                userId: usrMarkusId,
                userEmail: 'aa@acmecorp.io',
                userName: 'Acme Corp',
                subject: 'Need help with workflow setup',
                status: 'open',
                priority: 'Low',
                createdAt: new Date(Date.now() - 180 * 60000) // 3h ago
            }
        ];

        for (const t of tickets) {
            await client.query(`
                INSERT INTO "support_tickets" (id, "userId", "userEmail", "userName", subject, status, priority, "createdAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
            `, [t.id, t.userId, t.userEmail, t.userName, t.subject, t.status, t.priority, t.createdAt]);
        }

        // Add exact conversation messages to Ticket 1 (Workflow failing on Data Sync)
        const messages = [
            {
                id: uuidv4(),
                ticketId: 'INC-2024-0517-0001',
                senderId: usrMarkusId,
                senderRole: 'user',
                senderName: 'Acme Corp (aa@acmecorp.io)',
                content: 'Daily Sync workflow is failing with a 500 error when processing invoices greater than 100. See screenshot and logs below.',
                createdAt: new Date(Date.now() - 2 * 60000)
            },
            {
                id: uuidv4(),
                ticketId: 'INC-2024-0517-0001',
                senderId: 'system',
                senderRole: 'user',
                senderName: 'System Alert',
                content: 'Incident created automatically due to workflow error threshold exceeded (5 failures in 10 minutes).',
                createdAt: new Date(Date.now() - 2 * 60000)
            },
            {
                id: uuidv4(),
                ticketId: 'INC-2024-0517-0001',
                senderId: usrOwnerId,
                senderRole: 'admin',
                senderName: 'Blonk Admin (platform.owner@blonk.com)',
                content: "We're on it! Our engineers are investigating the issue now.",
                createdAt: new Date()
            }
        ];

        for (const m of messages) {
            await client.query(`
                INSERT INTO "support_messages" (id, "ticketId", "senderId", "senderRole", "senderName", content, "createdAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [m.id, m.ticketId, m.senderId, m.senderRole, m.senderName, m.content, m.createdAt]);
        }

        // Seed some single starter messages for other tickets so lastMessage doesn't look empty
        for (const t of tickets) {
            if (t.id === 'INC-2024-0517-0001') continue;
            await client.query(`
                INSERT INTO "support_messages" (id, "ticketId", "senderId", "senderRole", "senderName", content, "createdAt")
                VALUES ($1, $2, $3, 'user', $4, $5, $6)
            `, [uuidv4(), t.id, t.userId, t.userName, `Support request regarding ${t.subject}. Please assist.`, t.createdAt]);
        }

        console.log("Seeded support tickets and conversation logs successfully.");
        console.log("Database now contains exact production-grade matching data!");

    } catch (err) {
        console.error("Error during seeding:", err);
    } finally {
        await client.end();
    }
}

seed();
