const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false
});

async function testQuery() {
    const client = await pool.connect();
    try {
        const sql = `
            SELECT n.*, 
                   t.name as tenant_name,
                   t."firmName" as tenant_firm_name,
                   (SELECT COUNT(*) FROM "Workflow" w WHERE w."serverId" = n.id) as workflow_count
            FROM "ClusterNode" n
            LEFT JOIN "Team" t ON n."teamId" = t.id
            ORDER BY n."createdAt" DESC
        `;
        const res = await client.query(sql);
        console.log('Query successful, found nodes:', res.rows.length);
        if (res.rows.length > 0) {
            console.log('First node:', JSON.stringify(res.rows[0], null, 2));
        }
    } catch (error) {
        console.error('Query failed:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

testQuery().catch(console.error);
