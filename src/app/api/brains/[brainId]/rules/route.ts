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
      `SELECT br.* 
       FROM brain_rules br
       JOIN brains b ON b.id = br.brain_id
       WHERE br.brain_id = $1 AND b.company_id = $2
       ORDER BY br.priority ASC, br.created_at ASC`,
      [brainId, company.id]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/rules Error]', error);
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
      ruleCode,
      title,
      description = '',
      condition = {},
      action = { type: 'REQUIRE_APPROVAL' },
      priority = 100,
      isHardRule = true,
      status = 'ACTIVE',
      metadata = {},
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Rule title is required' }, { status: 400 });
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
      `INSERT INTO brain_rules (
         brain_id, rule_code, title, description, condition, action, 
         priority, is_hard_rule, status, source, metadata
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, 'MANUAL', $10
       ) RETURNING *`,
      [
        brainId,
        ruleCode || null,
        title,
        description,
        JSON.stringify(condition),
        JSON.stringify(action),
        priority,
        isHardRule,
        status,
        JSON.stringify(metadata),
      ]
    );

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/brains/[brainId]/rules Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
