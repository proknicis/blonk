const { db } = require('./src/lib/db');

async function check() {
    try {
        const nodes = await db.query('SELECT * FROM "ClusterNode"');
        console.log('--- CLUSTER NODES ---');
        console.log(JSON.stringify(nodes, null, 2));
        
        const workflows = await db.query('SELECT * FROM "Workflow"');
        console.log('\n--- WORKFLOWS ---');
        console.log(JSON.stringify(workflows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
