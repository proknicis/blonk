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
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

    let query = `
      SELECT at.id,
             at.automation_id as "automationId",
             a.name as "automationName",
             a.trigger_type as "triggerType",
             at.name,
             at.task_type as "taskType",
             at.status,
             at.sequence,
             at.config,
             at.metadata,
             at.created_at as "createdAt",
             at.updated_at as "updatedAt",
             (
               SELECT json_build_object(
                 'id', tr.id,
                 'status', tr.status,
                 'outputPayload', tr.output_payload,
                 'durationMs', tr.duration_ms,
                 'aiReflection', tr.ai_reflection,
                 'completedAt', tr.completed_at
               )
               FROM task_results tr
               WHERE tr.task_id = at.id
               ORDER BY tr.created_at DESC
               LIMIT 1
             ) as "result"
      FROM automation_tasks at
      JOIN automations a ON a.id = at.automation_id
      WHERE a.brain_id = $1 AND a.company_id = $2
    `;

    const values: any[] = [brainId, company.id];

    if (statusFilter && statusFilter !== 'ALL') {
      values.push(statusFilter);
      query += ` AND at.status = $3`;
    }

    query += ` ORDER BY at.created_at DESC`;

    const rows = await db.query(query, values);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/backlog Error]', error);
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
      automationId,
      name,
      priority = 'MEDIUM', // HIGH | MEDIUM | LOW
      inputPayload = {},
      config = {},
    } = body;

    if (!automationId || !name) {
      return NextResponse.json(
        { error: 'Source automation ID and task name are required.' },
        { status: 400 }
      );
    }

    // Verify automation belongs to brain & company
    const autoRows = await db.query(
      `SELECT * FROM automations WHERE id = $1 AND brain_id = $2 AND company_id = $3`,
      [automationId, brainId, company.id]
    );

    if (autoRows.length === 0) {
      return NextResponse.json({ error: 'Automation not found for this Brain' }, { status: 404 });
    }

    const automation = autoRows[0];
    const taskType = automation.metadata?.taskType || 'GENERIC_TASK';

    // Metadata payload
    const metadata = {
      priority,
      inputPayload,
      sourceAutomationName: automation.name,
      brainId,
      createdAt: new Date().toISOString(),
    };

    // Calculate sequence
    const seqRows = await db.query(
      `SELECT COALESCE(MAX(sequence), 0) + 1 as next_seq 
       FROM automation_tasks 
       WHERE automation_id = $1`,
      [automationId]
    );
    const nextSeq = seqRows[0]?.next_seq || 1;

    // Insert task into Backlog as PENDING
    const insertRes = await db.query(
      `INSERT INTO automation_tasks (
         automation_id, name, sequence, task_type, config, status, metadata
       ) VALUES (
         $1, $2, $3, $4, $5, 'PENDING', $6
       ) RETURNING *`,
      [
        automationId,
        name,
        nextSeq,
        taskType,
        JSON.stringify(config),
        JSON.stringify(metadata),
      ]
    );

    const task = insertRes[0];

    return NextResponse.json(
      {
        ...task,
        automationName: automation.name,
        priority,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[POST /api/brains/[brainId]/backlog Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
