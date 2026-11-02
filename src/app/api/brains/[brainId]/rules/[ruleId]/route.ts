import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ brainId: string; ruleId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, ruleId } = await params;
    const body = await request.json();

    const allowedFields: Record<string, string> = {
      title: 'title',
      description: 'description',
      ruleCode: 'rule_code',
      priority: 'priority',
      isHardRule: 'is_hard_rule',
      status: 'status',
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

    if (body.condition !== undefined) {
      setClauses.push(`condition = $${idx++}`);
      values.push(JSON.stringify(body.condition));
    }

    if (body.action !== undefined) {
      setClauses.push(`action = $${idx++}`);
      values.push(JSON.stringify(body.action));
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(ruleId);
    values.push(brainId);
    values.push(company.id);

    const updated = await db.query(
      `UPDATE brain_rules br SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
       FROM brains b
       WHERE br.id = $${idx++} 
         AND br.brain_id = $${idx++} 
         AND b.id = br.brain_id 
         AND b.company_id = $${idx++}
       RETURNING br.*`,
      values
    );

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('[PATCH /api/brains/[brainId]/rules/[ruleId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ brainId: string; ruleId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, ruleId } = await params;

    const result = await db.query(
      `DELETE FROM brain_rules br
       USING brains b
       WHERE br.id = $1 
         AND br.brain_id = $2 
         AND b.id = br.brain_id 
         AND b.company_id = $3
       RETURNING br.id`,
      [ruleId, brainId, company.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: ruleId });
  } catch (error: any) {
    console.error('[DELETE /api/brains/[brainId]/rules/[ruleId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
