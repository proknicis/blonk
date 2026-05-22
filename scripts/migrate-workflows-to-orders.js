require('dotenv').config();
const { Client } = require('pg');

async function main() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    console.log('🔄 Migrating old workflows to new WorkflowOrder table...');

    try {
        const workflows = await client.query('SELECT * FROM "Workflow"');
        console.log(`Found ${workflows.rows.length} workflows in total.`);

        for (const wf of workflows.rows) {
            // Check if order exists for this workflow
            const orderRes = await client.query('SELECT id FROM "WorkflowOrder" WHERE "workflowId" = $1', [wf.id]);
            
            if (orderRes.rows.length === 0) {
                console.log(`Creating order for workflow: ${wf.name} (ID: ${wf.id})`);
                
                // We'll set the status based on workflow status or default to PROVISIONING
                let status = wf.status === 'Active' ? 'COMPLETED' : 'PROVISIONING';
                
                await client.query(
                    `INSERT INTO "WorkflowOrder" 
                    ("teamId", "userId", "workflowName", status, amount, "serverId", "workflowId", "n8nWorkflowId", "createdAt", "updatedAt") 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        wf.teamId || '00000000-0000-0000-0000-000000000000', 
                        wf.userId || '00000000-0000-0000-0000-000000000000', 
                        wf.name || 'Legacy Workflow', 
                        status, 
                        0, 
                        wf.serverId || null, 
                        wf.id, 
                        null, 
                        wf.createdAt, 
                        wf.updatedAt
                    ]
                );
            } else {
                console.log(`Order already exists for workflow: ${wf.name}`);
            }
        }
        
        console.log('✅ Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

main();
