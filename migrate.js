const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        await connection.execute('ALTER TABLE WorkflowTemplate ADD COLUMN requirements TEXT');
        console.log('Migration successful');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error(e);
        }
    }
    
    // Also add input payload storage to user's workflow to support user filling out this data later:
    try {
        await connection.execute('ALTER TABLE Workflow ADD COLUMN inputs TEXT');
    } catch (e) {
        // ignore duplicate field
    }
    await connection.end();
}
run();
