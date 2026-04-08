const { Client } = require('pg');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    // Use the error output itself to find columns or just select *
    try {
        const res = await client.query('SELECT * FROM "Report" LIMIT 1');
        fs.writeFileSync('tmp/current_report_data.json', JSON.stringify(res.fields.map(f => f.name), null, 2));
    } catch (e) {
        fs.writeFileSync('tmp/current_report_error.txt', e.message);
    }
    await client.end();
}
run();
