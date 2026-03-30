import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute('SELECT * FROM WorkflowTemplate ORDER BY createdAt DESC');
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching admin templates:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, sector, description, savings, complexity, icon, color, featured, requirements, setupGuide, webhookUrl, status } = body;

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute(
            'INSERT INTO WorkflowTemplate (id, name, sector, description, savings, complexity, icon, color, featured, requirements, setupGuide, webhookUrl, status) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, sector, description, savings, complexity, icon, color, featured ? 1 : 0, JSON.stringify(requirements || []), setupGuide || '[]', webhookUrl || '', status || 'Draft']
        );
        await connection.end();

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

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute('DELETE FROM WorkflowTemplate WHERE id = ?', [id]);
        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
