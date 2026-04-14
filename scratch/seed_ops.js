import { Pool } from 'pg';
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    const queries = [
        `INSERT INTO "OperationalSetting" (id, key, value) VALUES (gen_random_uuid(), 'residency', 'eu-cloud') ON CONFLICT DO NOTHING;`,
        `INSERT INTO "OperationalSetting" (id, key, value) VALUES (gen_random_uuid(), 'kill_switch_armed', 'false') ON CONFLICT DO NOTHING;`,
        `INSERT INTO "OperationalSetting" (id, key, value) VALUES (gen_random_uuid(), 'apikey_openai', 'sk-proj-db1920x....') ON CONFLICT DO NOTHING;`,
        `INSERT INTO "OperationalSetting" (id, key, value) VALUES (gen_random_uuid(), 'apikey_microsoft', 'ms-cred-202x....') ON CONFLICT DO NOTHING;`
    ];
    for (const q of queries) {
        try { await pool.query(q); } catch(e) { console.error(e.message); }
    }
    console.log("Seeded OperationalSetting");
    await pool.end();
}
run();
