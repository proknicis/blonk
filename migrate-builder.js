const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        await connection.execute('ALTER TABLE WorkflowTemplate ADD COLUMN setupGuide TEXT');
        console.log('setupGuide added');
    } catch (e) { console.log(e.message); }

    try {
        await connection.execute('ALTER TABLE WorkflowTemplate ADD COLUMN webhookUrl VARCHAR(255)');
        console.log('webhookUrl added');
    } catch (e) { console.log(e.message); }

    try {
        await connection.execute('ALTER TABLE WorkflowTemplate ADD COLUMN status VARCHAR(50) DEFAULT "Draft"');
        console.log('status added');
    } catch (e) { console.log(e.message); }

    await connection.end();
}
run();
