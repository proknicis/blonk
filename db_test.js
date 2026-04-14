const { Client } = require('pg');

const client = new Client({ connectionString: 'postgresql://myuser:mypassword@127.0.0.1:5432/mydb' });

async function run() {
  await client.connect();
  const res = await client.query('SELECT id, email, name, role, "teamId" FROM "User" ORDER BY email');
  console.log('USERS:');
  console.table(res.rows);
  
  const teams = await client.query('SELECT * FROM "Team"');
  console.log('TEAMS:');
  console.table(teams.rows);
  
  await client.end();
}

run().catch(console.dir);
