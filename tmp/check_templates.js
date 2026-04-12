const { db } = require('./src/lib/db');

async function checkData() {
    try {
        const countResult = await db.query('SELECT COUNT(*) FROM "WorkflowTemplate"');
        console.log('Count:', JSON.stringify(countResult));
        
        const dataResult = await db.query('SELECT * FROM "WorkflowTemplate" LIMIT 5');
        console.log('Sample Data:', JSON.stringify(dataResult));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

checkData();
