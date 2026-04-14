const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:', res.rows.map(r => r.table_name));
    
    const eventRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Event'
    `);
    if (eventRes.rows.length === 0) {
      console.log('Event table does NOT exist. Creating it...');
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "Event" (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" UUID,
          "visitorId" TEXT,
          "sessionId" TEXT,
          "eventType" TEXT NOT NULL,
          "source" TEXT,
          "metadata" JSONB DEFAULT '{}',
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('Event table created.');
    } else {
      console.log('Event table columns:', eventRes.rows);
    }
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkSchema();
