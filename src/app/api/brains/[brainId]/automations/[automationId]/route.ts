import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brainId: string; automationId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, automationId } = await params;

    const rows = await db.query(
      `SELECT a.*,
              (SELECT json_agg(json_build_object(
                 'id', at.id,
                 'name', at.name,
                 'sequence', at.sequence,
                 'taskType', at.task_type,
                 'config', at.config,
                 'status', at.status,
                 'timeoutMs', at.timeout_ms,
                 'retryPolicy', at.retry_policy,
                 'metadata', at.metadata
               ) ORDER BY at.sequence ASC) FROM automation_tasks at WHERE at.automation_id = a.id) as tasks
       FROM automations a
       WHERE a.id = $1 AND a.brain_id = $2 AND a.company_id = $3`,
      [automationId, brainId, company.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/automations/[automationId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ brainId: string; automationId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, automationId } = await params;
    const body = await request.json();

    const allowedFields: Record<string, string> = {
      name: 'name',
      description: 'description',
      status: 'status',
      triggerType: 'trigger_type',
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

    if (body.triggerConfig !== undefined) {
      setClauses.push(`trigger_config = $${idx++}`);
      values.push(JSON.stringify(body.triggerConfig));
    }

    if (body.metadata !== undefined) {
      setClauses.push(`metadata = metadata || $${idx++}::jsonb`);
      values.push(JSON.stringify(body.metadata));
    }

    if (setClauses.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided for update' }, { status: 400 });
    }

    values.push(automationId);
    values.push(brainId);
    values.push(company.id);

    const updated = await db.query(
      `UPDATE automations SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${idx++} AND brain_id = $${idx++} AND company_id = $${idx++}
       RETURNING *`,
      values
    );

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (error: any) {
    console.error('[PATCH /api/brains/[brainId]/automations/[automationId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ brainId: string; automationId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, automationId } = await params;

    const result = await db.query(
      `DELETE FROM automations 
       WHERE id = $1 AND brain_id = $2 AND company_id = $3
       RETURNING id`,
      [automationId, brainId, company.id]
    );

    if (result.length === 0) {
      return NextResponse.json({ error: 'Automation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: automationId });
  } catch (error: any) {
    console.error('[DELETE /api/brains/[brainId]/automations/[automationId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
