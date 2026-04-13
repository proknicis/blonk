const { Pool } = require('pg');
require('dotenv').config();

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
  });

  try {
    console.log('Verifying WorkflowTemplate schema...');
    
    // Check if workflow column exists
    const res = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'WorkflowTemplate' AND column_name = 'workflow'
    `);

    if (res.rows.length === 0) {
      console.log('Adding "workflow" column to "WorkflowTemplate"...');
      await pool.query('ALTER TABLE "WorkflowTemplate" ADD COLUMN workflow TEXT');
      console.log('Column added successfully.');
    } else {
      console.log('Column "workflow" already exists.');
    }

  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    await pool.end();
  }
}

migrate();
