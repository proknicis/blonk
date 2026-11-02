import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCompanyForSession } from '@/lib/company-context';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brainId: string; taskId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, taskId } = await params;

    const rows = await db.query(
      `SELECT at.*,
              a.name as "automationName",
              a.trigger_type as "triggerType",
              (
                SELECT json_agg(json_build_object(
                  'id', tr.id,
                  'executionRunId', tr.execution_run_id,
                  'status', tr.status,
                  'inputPayload', tr.input_payload,
                  'outputPayload', tr.output_payload,
                  'durationMs', tr.duration_ms,
                  'aiReflection', tr.ai_reflection,
                  'startedAt', tr.started_at,
                  'completedAt', tr.completed_at
                ) ORDER BY tr.created_at DESC)
                FROM task_results tr
                WHERE tr.task_id = at.id
              ) as "resultsHistory"
       FROM automation_tasks at
       JOIN automations a ON a.id = at.automation_id
       WHERE at.id = $1 AND a.brain_id = $2 AND a.company_id = $3`,
      [taskId, brainId, company.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('[GET /api/brains/[brainId]/backlog/[taskId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ brainId: string; taskId: string }> }
) {
  try {
    const company = await getCompanyForSession();
    if (!company) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { brainId, taskId } = await params;

    const deleted = await db.query(
      `DELETE FROM automation_tasks at
       USING automations a
       WHERE at.id = $1 
         AND at.automation_id = a.id 
         AND a.brain_id = $2 
         AND a.company_id = $3
       RETURNING at.id`,
      [taskId, brainId, company.id]
    );

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: taskId });
  } catch (error: any) {
    console.error('[DELETE /api/brains/[brainId]/backlog/[taskId] Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
