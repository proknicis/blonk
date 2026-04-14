const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrateUserNames() {
  try {
    console.log('Initiating Identity Migration...');
    
    // Find users with the placeholder name but who have a firmName set
    const res = await pool.query(`
      UPDATE "User"
      SET name = "firmName"
      WHERE (name = 'Institutional Operator' OR name IS NULL OR name = '')
      AND "firmName" IS NOT NULL
      AND "firmName" != ''
      RETURNING id, name, email
    `);
    
    if (res.rowCount > 0) {
      console.log(`Successfully migrated ${res.rowCount} identities:`);
      res.rows.forEach(user => {
        console.log(` - ${user.email} -> ${user.name}`);
      });
    } else {
      console.log('No placeholder identities found for migration.');
    }
  } catch (err) {
    console.error('Migration Failure:', err);
  } finally {
    await pool.end();
  }
}

migrateUserNames();
