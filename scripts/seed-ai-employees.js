const { Client } = require('pg');
require('dotenv').config();

async function seed() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    
    await client.connect();

    console.log("🧹 Ingesting premium AI Employee templates into the library...");

    const templates = [
        {
            name: "Consulting Operations AI",
            sector: "Operations",
            description: "Timesheet Checker, Status Update Drafter, and Deadline Tracker. Monitors schedules, task outputs, and deliverables dates.",
            savings: "Save 12 hrs/wk",
            complexity: "Medium",
            icon: "👔",
            color: "#FFFBEB",
            featured: true,
            price: 49.00,
            requirements: [
                { name: "Slack", service: "slack", label: "Slack" },
                { name: "Gmail", service: "gmail", label: "Gmail" }
            ],
            productInfo: {
                name: "Consulting Operations AI",
                category: "Operations",
                shortDesc: "Timesheet Checker, Status Update Drafter, and Deadline Tracker.",
                longDesc: "The Timesheet Checker reviews submitted timesheets to verify entries and billing activities. The Status Update Drafter creates structured project milestones, and the Deadline Tracker tracks contract milestones.",
                monthlyPrice: 49,
                setupFee: 0,
                trialDays: 14,
                currency: "USD",
                discount: 0,
                popularBadge: false,
                featuredBadge: true,
                integrations: ["Slack", "Gmail"],
                aiEmployees: ["Timesheet Checker", "Status Update Drafter", "Deadline Tracker"],
                brainPermissions: ["Contracts", "CRM", "Email"],
                dockerImage: "blonk-ops-agent:latest",
                cpu: "1.0",
                ram: "2GB",
                disk: "10GB",
                region: "us-east-1",
                marketTitle: "Consulting Operations AI",
                marketSubtitle: "Keep projects tracking on time and within billing parameters.",
                features: "Automated timesheet audits\nDeadline escalation triggers",
                releaseNotes: "v1.0.0 - Premium release"
            }
        },
        {
            name: "Finance Admin AI",
            sector: "Accounting",
            description: "Invoice Reader, Invoice Drafter, and Payment Chaser. Extracts invoice metadata, checks bank logs, and runs collections.",
            savings: "Save 30 hrs/wk",
            complexity: "High",
            icon: "🧾",
            color: "#F0FDFA",
            featured: true,
            price: 79.00,
            requirements: [
                { name: "Stripe", service: "stripe", label: "Stripe" },
                { name: "Gmail", service: "gmail", label: "Gmail" }
            ],
            productInfo: {
                name: "Finance Admin AI",
                category: "Finance",
                shortDesc: "Invoice Reader, Invoice Drafter, and Payment Chaser.",
                longDesc: "The Invoice Reader parses invoice metadata (supplier, total, VAT). The Invoice Drafter automates draft billing preparation, and the Payment Chaser routes collection reminders based on account conditions.",
                monthlyPrice: 79,
                setupFee: 0,
                trialDays: 14,
                currency: "USD",
                discount: 0,
                popularBadge: true,
                featuredBadge: true,
                integrations: ["Stripe", "Gmail"],
                aiEmployees: ["Invoice Reader", "Invoice Drafter", "Payment Chaser"],
                brainPermissions: ["Invoices", "Contracts", "CRM", "Email"],
                dockerImage: "blonk-finance-agent:latest",
                cpu: "1.0",
                ram: "2GB",
                disk: "10GB",
                region: "us-east-1",
                marketTitle: "Finance Admin AI",
                marketSubtitle: "Reconcile invoices and run accounts receivable autonomously.",
                features: "Stripe ledger matching\nOCR invoice extraction",
                releaseNotes: "v1.0.0 - Stable invoice reader"
            }
        },
        {
            name: "Sales & Client Success AI",
            sector: "Sales",
            description: "Lead Intake, Follow-Up Drafter, and Client Summary Builder. Routes contacts, alerts updates, and summarizes CRM histories.",
            savings: "Save 20 hrs/wk",
            complexity: "Medium",
            icon: "🧲",
            color: "#EFF6FF",
            featured: true,
            price: 99.00,
            requirements: [
                { name: "HubSpot", service: "hubspot", label: "HubSpot" },
                { name: "Gmail", service: "gmail", label: "Gmail" }
            ],
            productInfo: {
                name: "Sales & Client Success AI",
                category: "Sales",
                shortDesc: "Lead Intake, Follow-Up Drafter, and Client Summary Builder.",
                longDesc: "Lead Intake structures incoming sales leads. The Follow-Up Drafter personalizes reminders, and the Client Summary Builder aggregates timeline logs for account manager review.",
                monthlyPrice: 99,
                setupFee: 0,
                trialDays: 14,
                currency: "USD",
                discount: 0,
                popularBadge: false,
                featuredBadge: true,
                integrations: ["HubSpot", "Gmail"],
                aiEmployees: ["Lead Intake", "Follow-Up Drafter", "Client Summary Builder"],
                brainPermissions: ["CRM", "Email", "Contracts"],
                dockerImage: "blonk-sales-agent:latest",
                cpu: "1.5",
                ram: "4GB",
                disk: "20GB",
                region: "us-east-1",
                marketTitle: "Sales & Client Success AI",
                marketSubtitle: "Close deals faster with automated lead intelligence.",
                features: "CRM duplicate checks\nCustom draft updates",
                releaseNotes: "v1.0.0 - Release template"
            }
        },
        {
            name: "Internal Admin Support AI",
            sector: "General",
            description: "Meeting Notes Summarizer, Email Triage Assistant, and Document Formatter. Sorts priorities and indexes corporate guides.",
            savings: "Save 8 hrs/wk",
            complexity: "Low",
            icon: "⚙️",
            color: "#F1F5F9",
            featured: false,
            price: 29.00,
            requirements: [
                { name: "Slack", service: "slack", label: "Slack" },
                { name: "Gmail", service: "gmail", label: "Gmail" },
                { name: "OpenAI", service: "openai", label: "OpenAI" }
            ],
            productInfo: {
                name: "Internal Admin Support AI",
                category: "General",
                shortDesc: "Meeting Notes Summarizer, Email Triage Assistant, and Document Formatter.",
                longDesc: "The Notes Summarizer lists decisions and action items. The Email Triage Assistant labels incoming folders, and the Document Formatter styles templates under brand guidelines.",
                monthlyPrice: 29,
                setupFee: 0,
                trialDays: 7,
                currency: "USD",
                discount: 0,
                popularBadge: false,
                featuredBadge: false,
                integrations: ["Slack", "Gmail", "OpenAI"],
                aiEmployees: ["Meeting Notes Summarizer", "Email Triage Assistant", "Document Formatter"],
                brainPermissions: ["Email", "CRM"],
                dockerImage: "blonk-admin-agent:latest",
                cpu: "1.0",
                ram: "2GB",
                disk: "10GB",
                region: "us-east-1",
                marketTitle: "Internal Admin Support AI",
                marketSubtitle: "Automate raw note formatting and triage daily inbox files.",
                features: "OpenAI meeting summaries\nEmail action indexing",
                releaseNotes: "v1.0.0 - Core admin tools"
            }
        }
    ];

    for (const t of templates) {
        // Delete if already exists to prevent duplicate key errors
        await client.query('DELETE FROM "WorkflowTemplate" WHERE name = $1', [t.name]);

        await client.query(`
            INSERT INTO "WorkflowTemplate" 
            (name, sector, description, savings, complexity, icon, color, featured, requirements, "productInfo", price, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11, 'Published')
        `, [
            t.name, 
            t.sector, 
            t.description, 
            t.savings, 
            t.complexity, 
            t.icon, 
            t.color, 
            t.featured, 
            JSON.stringify(t.requirements), 
            JSON.stringify(t.productInfo), 
            t.price
        ]);
        console.log("Successfully seeded automation product:", t.name);
    }

    await client.end();
    console.log("🎉 Seeding of AI Employee workflow templates completed successfully!");
}

seed().catch(console.error);
