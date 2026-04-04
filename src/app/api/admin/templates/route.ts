import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    try {
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
        const { name, sector, description, savings, complexity, icon, color, featured, requirements, setupGuide, status } = body;

        await db.execute(
            'INSERT INTO "WorkflowTemplate" (id, name, sector, description, savings, complexity, icon, color, featured, requirements, "setupGuide", status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
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
                requirements || [], 
                setupGuide || [], 
                status || 'Draft'
            ]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating template:', error);
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
