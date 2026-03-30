const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    try {
        const conn = await mysql.createConnection(process.env.DATABASE_URL);
        
        console.log("Adding requestedBy column to Workflow table...");
        await conn.execute("ALTER TABLE Workflow ADD COLUMN requestedBy varchar(191) DEFAULT 'Nikolass'");
        
        console.log("Success!");
        await conn.end();
    } catch (e) {
        console.error("Migration failed:", e.message);
        process.exit(1);
    }
}

run();
