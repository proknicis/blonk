const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const teamId = '5a148643-640a-40a0-9d82-f0a0d8706dfd';

async function seedData() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    try {
        console.log("Seeding realistic workflow logs for team:", teamId);
        
        // 1. Ensure a few workflows exist for this team
        const workflows = [
            { id: uuidv4(), name: 'Market Intelligence Sweep', sector: 'Finance' },
            { id: uuidv4(), name: 'Automated Document Review', sector: 'Law' },
            { id: uuidv4(), name: 'Strategic Fleet Optimization', sector: 'Operations' }
        ];

        for (const w of workflows) {
            await pool.query(
                'INSERT INTO "Workflow" (id, name, sector, status, "teamId", "tasksCount", progress) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
                [w.id, w.name, w.sector, 'Ready', teamId, 0, 100]
            );
        }

        // 2. Generate 50+ logs over the last 7 days
        for (let i = 0; i < 60; i++) {
            const w = workflows[Math.floor(Math.random() * workflows.length)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 7));
            
            const status = Math.random() > 0.05 ? 'success' : 'error';
            
            await pool.query(
                'INSERT INTO "WorkflowLog" (id, "workflowId", "workflowName", status, "teamId", "createdAt", result) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [
                    uuidv4(), 
                    w.id, 
                    w.name, 
                    status, 
                    teamId, 
                    date, 
                    JSON.stringify({ activity: { action: 'Automated Pulse' }, metrics: { duration: 1200 } })
                ]
            );
        }

        console.log("Seeding complete. Reports should now reflect this data.");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await pool.end();
    }
}

seedData();
