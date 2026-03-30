import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        const [rows] = await connection.execute('SELECT id, name, sector, status, n8nWebhookUrl, inputs, requestedBy FROM Workflow');
        await connection.end();
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Error fetching admin workflows:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, n8nWebhookUrl } = body;

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute(
            'UPDATE Workflow SET n8nWebhookUrl = ?, status = ? WHERE id = ?',
            [n8nWebhookUrl, n8nWebhookUrl ? 'Active' : 'Pending', id]
        );
        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating n8n webhook:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const connection = await mysql.createConnection(process.env.DATABASE_URL!);
        await connection.execute('DELETE FROM Workflow WHERE id = ?', [id]);
        await connection.end();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting workflow instance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
