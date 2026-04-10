import { NextResponse } from 'next/server';
import { db } from "@/lib/db";

export async function GET() {
    console.log('[DEBUG] GET /api/admin/workflows called');
    try {
        const rows = await db.query('SELECT id, name, sector, status, "n8nWebhookUrl", inputs, "requestedBy" FROM "Workflow"');
        return NextResponse.json(rows || []);
    } catch (error) {
        console.error('Error fetching admin workflows:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, n8nWebhookUrl } = body;

        await db.execute(
            'UPDATE "Workflow" SET "n8nWebhookUrl" = $1, status = $2 WHERE id = $3',
            [n8nWebhookUrl, n8nWebhookUrl ? 'Active' : 'Pending', id]
        );

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

        await db.execute('DELETE FROM "Workflow" WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting workflow instance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
