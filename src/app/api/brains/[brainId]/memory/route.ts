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
      `SELECT id, name, memory_context, updated_at 
       FROM brains 
       WHERE id = $1 AND company_id = $2`,
      [brainId, company.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    return NextResponse.json({
      brainId: rows[0].id,
      memoryContext: rows[0].memory_context || {},
      updatedAt: rows[0].updated_at,
    });
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/memory Error]', error);
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

    const { memoryContext } = body;

    if (typeof memoryContext !== 'object' || memoryContext === null) {
      return NextResponse.json({ error: 'memoryContext must be an object' }, { status: 400 });
    }

    const updated = await db.query(
      `UPDATE brains 
       SET memory_context = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3
       RETURNING id, memory_context, updated_at`,
      [JSON.stringify(memoryContext), brainId, company.id]
    );

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    return NextResponse.json({
      brainId: updated[0].id,
      memoryContext: updated[0].memory_context,
      updatedAt: updated[0].updated_at,
    });
  } catch (error: any) {
    console.error('[PATCH /api/brains/[brainId]/memory Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
