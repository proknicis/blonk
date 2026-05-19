import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

const CATALOG = [
    { name: "AI Support Agent", description: "Automated customer support with OpenAI — triage tickets, draft replies, and escalate when needed.", sector: "IT", price: 149 },
    { name: "Discord Moderation Bot", description: "Moderate channels, welcome members, and enforce rules with configurable automations.", sector: "General", price: 99 },
    { name: "Etsy Auto Reply", description: "Reply to Etsy messages automatically using templates and order context.", sector: "General", price: 79 },
    { name: "TikTok Lead Scraper", description: "Capture leads from TikTok engagement and sync to your CRM or spreadsheet.", sector: "Marketing", price: 129 },
];

async function ensureCatalog() {
    for (const item of CATALOG) {
        const existing = await db.query('SELECT id FROM "WorkflowTemplate" WHERE name = $1', [item.name]) as any[];
        if (!existing.length) {
            await db.execute(
                `INSERT INTO "WorkflowTemplate" (id, name, description, sector, status, price, featured)
                 VALUES ($1, $2, $3, $4, 'Published', $5, true)`,
                [uuidv4(), item.name, item.description, item.sector, item.price]
            );
        }
    }
}

/**
 * Marketplace API — GET published templates (seeds catalog if empty)
 */

export async function GET(request: Request) {
    try {
        await ensureCatalog();
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');

        let query = 'SELECT * FROM "WorkflowTemplate" WHERE status = $1';
        const params: any[] = ['Published'];

        if (category && category !== 'All') {
            query += ' AND sector = $2';
            params.push(category);
        }

        if (featured === 'true') {
            query += ' AND featured = true';
        }

        query += ' ORDER BY "createdAt" DESC';

        const rows = await db.query(query, params);
        
        // Add computed fields
        const templates = rows.map((t: any) => {
            // Price can be in either direct price field or productInfo.price
            const directPrice = parseFloat(t.price || 0);
            const productInfoPrice = t.productInfo ? parseFloat(t.productInfo.price || 0) : 0;
            const finalPrice = productInfoPrice > 0 ? productInfoPrice : directPrice;
            
            return {
                ...t,
                price: finalPrice,
                purchases: t.purchases || 0,
                revenue: t.revenue || 0
            };
        });

        return NextResponse.json(templates || []);
    } catch (error) {
        console.error('Error fetching marketplace templates:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
