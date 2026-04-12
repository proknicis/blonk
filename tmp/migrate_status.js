const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('UPDATE "WorkflowTemplate" SET status = \'Live\' WHERE status = \'Published\' OR status IS NULL').then(res => {
    console.log('Successfully Migrated', res.rowCount, 'templates to Live status.');
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
