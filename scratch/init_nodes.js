require('dotenv').config();
const { Client } = require('pg');

async function setup() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('Connected to DB...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS "ClusterNode" (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                url TEXT NOT NULL,
                api_key TEXT NOT NULL,
                status TEXT DEFAULT 'Unknown',
                last_check TIMESTAMP,
                cpu INTEGER DEFAULT 0,
                ram INTEGER DEFAULT 0,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('ClusterNode table created or already exists.');
        
        // Seed with the primary node from .env if it doesn't exist
        const primaryUrl = process.env.N8N_API_URL;
        if (primaryUrl) {
            const check = await client.query('SELECT id FROM "ClusterNode" WHERE url = $1', [primaryUrl]);
            if (check.rows.length === 0) {
                await client.query(
                    'INSERT INTO "ClusterNode" (name, url, api_key, status) VALUES ($1, $2, $3, $4)',
                    ['Primary n8n Node', primaryUrl, process.env.N8N_API_KEY, 'Active']
                );
                console.log('Seeded primary node.');
            }
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

setup();
