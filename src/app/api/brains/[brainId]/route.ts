import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brainId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId } = await params;

    const rows = await db.query(
      `SELECT b.*,
              c.name as "companyName",
              (SELECT count(*)::int FROM brain_knowledge bk WHERE bk.brain_id = b.id) as "knowledgeCount",
              (SELECT count(*)::int FROM brain_rules br WHERE br.brain_id = b.id) as "rulesCount"
       FROM brains b
       JOIN companies c ON c.id = b.company_id
       WHERE b.id = $1 AND b.company_id = $2`,
      [brainId, company.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ brainId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId } = await params;
    const body = await request.json();

    const allowedFields: Record<string, string> = {
      name: 'name',
      description: 'description',
      status: 'status',
      systemPrompt: 'system_prompt',
      aiModel: 'ai_model',
      temperature: 'temperature',
    };

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, col] of Object.entries(allowedFields)) {
      if (body[key] !== undefined) {
        setClauses.push(`"${col}" = $${idx++}`);
        values.push(body[key]);
      }
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    values.push(brainId);
    values.push(company.id);

    const updated = await db.query(
      `UPDATE brains SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${idx++} AND company_id = $${idx++}
       RETURNING *`,
      values
    );

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('[PATCH /api/brains/[brainId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ brainId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId } = await params;

    const result = await db.query(
      `DELETE FROM brains WHERE id = $1 AND company_id = $2 RETURNING id`,
      [brainId, company.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: brainId });
  } catch (error: any) {
    console.error('[DELETE /api/brains/[brainId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
