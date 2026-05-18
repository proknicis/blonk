const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://myuser:mypassword@127.0.0.1:5432/mydb' });

async function query() {
    await client.connect();
    
    console.log("--- ClusterNodes ---");
    const nodes = await client.query('SELECT * FROM "ClusterNode"');
    console.log(nodes.rows);
    
    console.log("--- Workflows ---");
    const workflows = await client.query('SELECT * FROM "Workflow"');
    console.log(workflows.rows);
    
    await client.end();
}

query().catch(console.error);
