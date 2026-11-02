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
      `SELECT bk.* 
       FROM brain_knowledge bk
       JOIN brains b ON b.id = bk.brain_id
       WHERE bk.brain_id = $1 AND b.company_id = $2
       ORDER BY bk.created_at DESC`,
      [brainId, company.id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/knowledge Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
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

    const {
      title,
      content,
      category = 'POLICY',
      source = 'MANUAL',
      confidenceScore = 1.0,
      metadata = {},
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Verify brain belongs to company
    const brainCheck = await db.query(
      `SELECT id FROM brains WHERE id = $1 AND company_id = $2`,
      [brainId, company.id]
    );

    if (brainCheck.length === 0) {
      return NextResponse.json({ error: 'Brain not found' }, { status: 404 });
    }

    const inserted = await db.query(
      `INSERT INTO brain_knowledge (
         brain_id, title, content, category, source, status, confidence_score, metadata
       ) VALUES (
         $1, $2, $3, $4, $5, 'ACTIVE', $6, $7
       ) RETURNING *`,
      [
        brainId,
        title,
        content,
        category,
        source,
        confidenceScore,
        JSON.stringify(metadata),
      ]
    );

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/brains/[brainId]/knowledge Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
