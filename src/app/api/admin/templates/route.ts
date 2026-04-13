import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (id) {
            const rows = await db.query('SELECT * FROM "WorkflowTemplate" WHERE id = $1', [id]);
            return NextResponse.json(rows?.[0] || { error: 'Not found' }, { status: rows?.[0] ? 200 : 404 });
        }

        const rows = await db.query('SELECT * FROM "WorkflowTemplate" ORDER BY "createdAt" DESC');
        return NextResponse.json(rows || []);
    } catch (error) {
        console.error('Error fetching admin templates:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, name, sector, description, savings, complexity, icon, color, featured, requirements, setupGuide, productInfo, status, price, purchases, revenue, conversionRate, workflow } = body;

        if (id) {
            // Update existing template
            await db.execute(
                'UPDATE "WorkflowTemplate" SET name = $1, sector = $2, description = $3, savings = $4, complexity = $5, icon = $6, color = $7, featured = $8, requirements = $9::jsonb, "setupGuide" = $10::jsonb, "productInfo" = $11::jsonb, status = $12, price = $13, purchases = $14, revenue = $15, "conversionRate" = $16, workflow = $17 WHERE id = $18',
                [
                    name, 
                    sector, 
                    description || '', 
                    savings || '', 
                    complexity || 'Low', 
                    icon || 'Zap', 
                    color || '#F1F5F9',
                    !!featured,
                    JSON.stringify(requirements || []), 
                    JSON.stringify(setupGuide || []), 
                    JSON.stringify(productInfo || {}),
                    status || 'Draft',
                    price || 0,
                    purchases || 0,
                    revenue || 0,
                    conversionRate || 0,
                    workflow || '',
                    id
                ]
            );
            return NextResponse.json({ success: true, updated: true });
        } else {
            // Create new template
            await db.execute(
                'INSERT INTO "WorkflowTemplate" (id, name, sector, description, savings, complexity, icon, color, featured, requirements, "setupGuide", "productInfo", status, price, purchases, revenue, "conversionRate", workflow) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb, $13, $14, $15, $16, $17, $18)',
                [
                    uuidv4(), 
                    name, 
                    sector, 
                    description || '', 
                    savings || '', 
                    complexity || 'Low', 
                    icon || 'Zap', 
                    color || '#F1F5F9',
                    !!featured,
                    JSON.stringify(requirements || []), 
                    JSON.stringify(setupGuide || []), 
                    JSON.stringify(productInfo || {}),
                    status || 'Draft',
                    price || 0,
                    purchases || 0,
                    revenue || 0,
                    conversionRate || 0,
                    workflow || ''
                ]
            );
            return NextResponse.json({ success: true });
        }
    } catch (error) {
        console.error('Error saving template:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        await db.execute('DELETE FROM "WorkflowTemplate" WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting template:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
