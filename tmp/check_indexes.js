const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT indexname, indexdef FROM pg_indexes WHERE tablename = \'Workflow\'').then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
