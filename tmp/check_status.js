const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT name, status FROM "WorkflowTemplate"').then(res => {
    console.log(res.rows);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
