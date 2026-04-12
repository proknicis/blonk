require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function seedActiveWorkflows() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    // The team ID for proknicis@gmail.com
    const teamId = "5a148643-640a-40a0-9d82-f0a0d8706dfd";
    const userEmail = "proknicis@gmail.com";

    const workflows = [
        {
            name: "Lead Automation",
            sector: "General",
            status: "Active",
            performance: "98.5",
            tasksCount: 1248,
            inputs: JSON.stringify({ "CRM API Key": "sk_test_51Mz..." })
        },
        {
            name: "Invoice Processing",
            sector: "Accounting",
            status: "Running",
            performance: "99.2",
            tasksCount: 842,
            inputs: JSON.stringify({ "Accounting API Key": "api_882..." })
        }
    ];

    try {
        console.log('Seeding active workflows for team:', teamId);
        
        for (const w of workflows) {
            const workflowId = uuidv4();
            await pool.query(
                `INSERT INTO "Workflow" (id, "teamId", name, sector, status, performance, "tasksCount", inputs, "requestedBy", "createdAt") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
                 ON CONFLICT (name) DO NOTHING`,
                [workflowId, teamId, w.name, w.sector, w.status, w.performance, w.tasksCount, w.inputs, userEmail]
            );

            // Fetch the actual ID if it already existed, or just use our new one (though name link is weaker)
            // For now, let's just seed logs regardless of exact ID since they match by name in the summary API
            
            console.log(`Seeding logs for ${w.name}...`);
            for (let i = 0; i < 24; i++) {
                const hourAgo = new Date();
                hourAgo.setHours(hourAgo.getHours() - i);
                
                await pool.query(
                    `INSERT INTO "WorkflowLog" (id, "teamId", "workflowName", status, result, "createdAt") 
                     VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (id) DO NOTHING`,
                    [uuidv4(), teamId, w.name, 'success', JSON.stringify({ message: `Autonomous loop iteration ${24-i} completed successfully.` }), hourAgo]
                );
            }
        }
        
        console.log('Seeding complete.');
    } catch (err) {
        console.error('Error seeding active workflows:', err);
    } finally {
        await pool.end();
    }
}

seedActiveWorkflows();
