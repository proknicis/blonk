require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function seedActiveData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });

    try {
        console.log('Fetching all active teams...');
        const teamsRes = await pool.query('SELECT DISTINCT "teamId" FROM "User" WHERE "teamId" IS NOT NULL');
        const teamIds = teamsRes.rows.map(r => r.teamId);

        if (teamIds.length === 0) {
            console.log('No teams found in User table. Skipping seeding.');
            return;
        }

        console.log(`Seeding data for ${teamIds.length} teams...`);

        for (const teamId of teamIds) {
            // 1. Create a few active workflows for each team
            const workflows = [
                { name: 'Lead Automation', sector: 'General', tasks: 124 },
                { name: 'Client Onboarding', sector: 'IT', tasks: 12 }
            ];

            for (const w of workflows) {
                const workflowId = uuidv4();
                await pool.query(
                    `INSERT INTO "Workflow" (id, "teamId", name, sector, status, performance, "tasksCount", inputs) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                     ON CONFLICT (name, "teamId") DO NOTHING`,
                    [workflowId, teamId, w.name, w.sector, 'Active', '98.5', w.tasks, '{}']
                );

                // 2. Create logs for these workflows
                console.log(`Creating logs for ${w.name} in team ${teamId}...`);
                for (let i = 0; i < 15; i++) {
                    const logId = uuidv4();
                    const status = Math.random() > 0.1 ? 'success' : 'error';
                    const time = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24)); // Random time in last 24h
                    
                    await pool.query(
                        `INSERT INTO "WorkflowLog" (id, "teamId", "workflowName", status, result, "createdAt") 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [logId, teamId, w.name, status, JSON.stringify({ message: status === 'success' ? 'Task processed successfully' : 'External API timeout' }), time]
                    );
                }
            }
        }

        console.log('Active data seeding complete.');
    } catch (err) {
        console.error('Error seeding active data:', err);
    } finally {
        await pool.end();
    }
}

seedActiveData();
