const { Client } = require('pg');

async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/blonk',
    });
    
    await client.connect();

    console.log("Clearing old templates...");
    await client.query('DELETE FROM "WorkflowTemplate"');

    const templates = [
        {
            name: "Lead Automation",
            sector: "Marketing",
            description: "Automatically capture leads from your website form, sync them to your CRM, and send a personalized welcome email sequence.",
            savings: "15h/mo",
            complexity: "Low",
            icon: "🧲",
            color: "#EFF6FF",
            featured: true,
        },
        {
            name: "Invoice Processing",
            sector: "Accounting",
            description: "Extract data from incoming invoice emails using OCR, match against POs, and draft the payment in your accounting software.",
            savings: "30h/mo",
            complexity: "Medium",
            icon: "🧾",
            color: "#F0FDFA",
            featured: true,
        },
        {
            name: "Client Onboarding",
            sector: "Operations",
            description: "When a new contract is signed, automatically create project folders, invite the client to Slack, and schedule the kickoff meeting.",
            savings: "10h/mo",
            complexity: "Medium",
            icon: "🤝",
            color: "#FFFBEB",
             featured: false,
        }
    ];

    for (const t of templates) {
        await client.query(`
            INSERT INTO "WorkflowTemplate" 
            (name, sector, description, savings, complexity, icon, color, featured, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Published')
        `, [t.name, t.sector, t.description, t.savings, t.complexity, t.icon, t.color, t.featured]);
        console.log("Inserted:", t.name);
    }

    await client.end();
    console.log("Finished seeding templates.");
}

seed().catch(console.error);
