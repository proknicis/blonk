const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const sampleJson = JSON.stringify({
  nodes: [
    {
      parameters: { path: 'lead-webhook' },
      id: '1',
      name: 'Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 1,
      position: [250, 300]
    },
    {
      parameters: {
        resource: 'message',
        subject: 'New Lead Detected',
        text: 'A new lead has been processed via Blonk Orchestrator.'
      },
      id: '2',
      name: 'Gmail',
      type: 'n8n-nodes-base.gmail',
      typeVersion: 2,
      position: [500, 300],
      credentials: {
        gmailOAuth2Api: { id: 'TO_BE_REPLACED' }
      }
    }
  ],
  connections: {
    Webhook: {
      main: [
        [
          {
            node: 'Gmail',
            type: 'main',
            index: 0
          }
        ]
      ]
    }
  }
});

async function populate() {
  try {
    await pool.query('UPDATE "WorkflowTemplate" SET workflow = $1 WHERE name = \'Lead Automation\'', [sampleJson]);
    console.log('Successfully populated Lead Automation with sample JSON');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

populate();
