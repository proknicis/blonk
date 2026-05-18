const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://myuser:mypassword@127.0.0.1:5432/mydb',
        ssl: false
    });

    try {
        console.log("Checking and altering 'ClusterNode' table...");
        
        // 1. Alter table
        await pool.query(`
            ALTER TABLE "ClusterNode" 
            ADD COLUMN IF NOT EXISTS "teamId" UUID REFERENCES "Team"(id);
        `);
        console.log("SUCCESS: 'teamId' column successfully added to 'ClusterNode' table!");
        
        // 2. Fetch and print the updated table schema
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'ClusterNode'
        `);
        console.log("\nUpdated ClusterNode columns:");
        res.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));
        
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
