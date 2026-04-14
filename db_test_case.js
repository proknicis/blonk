const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://myuser:mypassword@127.0.0.1:5432/mydb' });
async function run() {
  await client.connect();
  const rows = await client.query('SELECT id, email, name, role, "teamId", password FROM "User" LIMIT 1');
  console.log("From DB:", rows.rows[0]);
  console.log("User teamId property:", rows.rows[0].teamId);
  console.log("Keys:", Object.keys(rows.rows[0]));
  await client.end();
}
run().catch(console.dir);
