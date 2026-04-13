const { db } = require('./src/lib/db');

async function checkCols() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'WorkflowTemplate'");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  }
}

checkCols();
