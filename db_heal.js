const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

const client = new Client({ connectionString: 'postgresql://myuser:mypassword@127.0.0.1:5432/mydb' });

async function run() {
  try {
    await client.connect();
    
    // Find all users without a team
    const res = await client.query('SELECT id, email, name FROM "User" WHERE "teamId" IS NULL');
    console.log(`Found ${res.rows.length} zombie users without a team structure.`);
    
    for (const user of res.rows) {
      console.log(`Fixing user ${user.email}...`);
      const teamRes = await client.query(
        'INSERT INTO "Team" (name, "firmName", "ownerId") VALUES ($1, $2, $3) RETURNING id',
        [`${user.name || 'System'}'s Recovered Hub`, 'Blonk Institutional Hub', user.id]
      );
      const teamId = teamRes.rows[0].id;
      
      await client.query('UPDATE "User" SET "teamId" = $1 WHERE id = $2', [teamId, user.id]);
      console.log(`Successfully attached Team ID ${teamId} to user ${user.email}`);
    }
    
    await client.end();
  } catch (err) {
    console.error(err);
    await client.end();
  }
}

run().catch(console.dir);
