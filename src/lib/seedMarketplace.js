require('dotenv').config();
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

async function seedTemplates() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false
    });

    const templates = [
        {
            name: "Lead Automation",
            description: "Automatically sync new leads from your website to CRM and trigger welcome sequences.",
            icon: "⚡",
            sector: "General",
            savings: "15h/week",
            status: "Live",
            featured: 1,
            requirements: JSON.stringify([{ name: "CRM API Key", required: true, help: "Found in your CRM settings under Integrations > API" }]),
            setupGuide: JSON.stringify([{ title: "Connect CRM", text: "Paste your API key in the configuration field below." }])
        },
        {
            name: "Client Onboarding",
            description: "Initialize client workspaces, Slack channels, and kick-off meetings upon contract signature.",
            icon: "🤝",
            sector: "IT",
            savings: "5h/week",
            status: "Live",
            featured: 0,
            requirements: JSON.stringify([{ name: "Slack Token", required: true }, { name: "Google Drive Folder ID", required: true }]),
            setupGuide: JSON.stringify([{ title: "Auth Slack", text: "Authorize the Blonk bot in your Slack workspace." }])
        },
        {
            name: "Invoice Processing",
            description: "OCR-powered invoice extraction and automatic drafting in your accounting software.",
            icon: "🧾",
            sector: "Accounting",
            savings: "20h/month",
            status: "Live",
            featured: 1,
            requirements: JSON.stringify([{ name: "Accounting API Key", required: true }]),
            setupGuide: JSON.stringify([{ title: "Connect Xero/QuickBooks", text: "Establish a secure bridge to your ledger." }])
        },
        {
            name: "Legal Discovery",
            description: "Autonomous document review and classification for high-volume litigation cases.",
            icon: "⚖️",
            sector: "Law",
            savings: "40h/case",
            status: "Live",
            featured: 0,
            requirements: JSON.stringify([{ name: "Document Store URL", required: true }]),
            setupGuide: JSON.stringify([{ title: "Point to Storage", text: "Provide the endpoint for your document repository." }])
        }
    ];

    try {
        console.log('Seeding templates...');
        for (const t of templates) {
            await pool.query(
                `INSERT INTO "WorkflowTemplate" (id, name, description, icon, sector, savings, status, featured, requirements, "setupGuide") 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (name) DO NOTHING`,
                [uuidv4(), t.name, t.description, t.icon, t.sector, t.savings, t.status, t.featured, t.requirements, t.setupGuide]
            );
        }
        console.log('Seeding complete.');
    } catch (err) {
        console.error('Error seeding:', err);
    } finally {
        await pool.end();
    }
}

seedTemplates();
